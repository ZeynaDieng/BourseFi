import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { z } from 'zod'
import { renderEmail, sendEmail } from '../../../utils/email'

const massSendSchema = z.object({
  niveau: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  hasCandidature: z.boolean().optional(),
  subject: z.string().min(1),
  bodyHtml: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])

  const body = await readBody(event)
  const parsed = massSendSchema.safeParse(body || {})
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Données invalides' })
  }

  const { niveau, status, hasCandidature, subject, bodyHtml } = parsed.data

  const whereClause: any = { role: 'STUDENT' }

  const candidatureFilters: any = {}
  let useCandidatureFilter = false

  if (niveau && niveau.length > 0) {
    candidatureFilters.level = { in: niveau }
    useCandidatureFilter = true
  }

  if (status && status.length > 0) {
    candidatureFilters.status = { in: status }
    useCandidatureFilter = true
  }

  if (hasCandidature || useCandidatureFilter) {
    whereClause.candidatures = { some: candidatureFilters }
  }

  // Get users
  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true
    }
  })

  if (users.length === 0) {
    return { success: true, count: 0, message: 'Aucun utilisateur trouvé' }
  }

  // Fire and forget email sending to avoid blocking the request
  // (Assuming we are on a long-running Node.js process)
  ;(async () => {
    let sent = 0
    let failed = 0
    
    // Process in batches of 50 to avoid rate limits
    const batchSize = 50
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      const promises = batch.map(async (u) => {
        const prenom = u.firstName || u.name.split(' ')[0] || ''
        const nom = u.lastName || u.name.split(' ').slice(1).join(' ') || ''
        
        // Personnalisation des variables
        let personalizedBody = bodyHtml.replace(/{{prenom}}/g, prenom)
        personalizedBody = personalizedBody.replace(/{{nom}}/g, nom)

        const finalHtml = renderEmail({
          title: subject,
          bodyHtml: personalizedBody
        })

        try {
          const ok = await sendEmail({
            to: { email: u.email, name: `${prenom} ${nom}`.trim() },
            subject: subject,
            html: finalHtml
          })
          if (ok) sent++
          else failed++
        } catch (e) {
          failed++
        }
      })
      
      await Promise.allSettled(promises)
      
      // Petite pause entre les lots pour soulager le SMTP/API
      if (i + batchSize < users.length) {
        await new Promise(r => setTimeout(r, 1000))
      }
    }
    
    // Tracer l'envoi dans le journal d'audit
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorRole: user.role,
          action: 'CAMPAGNE_EMAIL_SENT',
          entityType: 'System',
          metadata: JSON.stringify({ 
            subject, 
            totalCible: users.length,
            envoyes: sent, 
            echoues: failed 
          })
        }
      })
    } catch (e) {
      console.error("[Campagne Email] Erreur lors de l'enregistrement de l'audit", e)
    }

    console.log(`[Campagne Email] Terminée: ${sent} envoyés, ${failed} échoués.`)
  })()

  return { 
    success: true, 
    count: users.length, 
    message: `Envoi en cours à ${users.length} utilisateurs` 
  }
})
