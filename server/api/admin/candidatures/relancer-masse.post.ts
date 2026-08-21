import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

const bulkRelancerSchema = z.object({
  candidatureIds: z.array(z.string()).min(1, 'Sélectionnez au moins une candidature.'),
  channel: z.enum(['WHATSAPP', 'EMAIL', 'SMS']).default('WHATSAPP'),
  codePromo: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const admin = await requireAdminSession(event)
  const body = await readBody(event)
  const parsed = bulkRelancerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Données invalides : ' + parsed.error.issues.map((i) => i.message).join(', '),
    })
  }

  const candidatures = await prisma.candidature.findMany({
    where: { id: { in: parsed.data.candidatureIds } },
    include: { programme: { include: { etablissement: true } }, user: true },
  })

  const results: { id: string; name: string; whatsappUrl: string | null }[] = []
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn'

  for (const c of candidatures) {
    const paymentUrl = `${baseUrl}/paiement?candidatureId=${c.id}`
    const prenom = c.firstName || c.fullName.split(' ')[0] || 'Étudiant'
    const formation = c.targetProgram
    const ecole = c.programme.etablissement.nom

    let cleanPhone = (c.phone || c.user.phone || '').replace(/\D/g, '')
    if (cleanPhone.startsWith('7') || cleanPhone.startsWith('77') || cleanPhone.startsWith('78') || cleanPhone.startsWith('76') || cleanPhone.startsWith('70') || cleanPhone.startsWith('75')) {
      if (cleanPhone.length === 9) cleanPhone = '221' + cleanPhone
    }

    let msg = `Bonjour ${prenom} 👋\n\nVotre demande de bourse pour ${formation} à ${ecole} est presque enregistrée.`
    if (parsed.data.codePromo) {
      msg += `\n\n🎁 Profitez du code promo *${parsed.data.codePromo}* pour finaliser votre dossier.\n👉 ${paymentUrl}`
    } else {
      msg += `\n\nFinalisez votre paiement pour obtenir votre attestation officielle BourseFi :\n👉 ${paymentUrl}`
    }

    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}` : null

    await prisma.candidature.update({
      where: { id: c.id },
      data: {
        relanceCount: { increment: 1 },
        lastRelanceAt: new Date(),
        lastChannelUsed: parsed.data.channel,
      },
    })

    await prisma.candidatureNote.create({
      data: {
        candidatureId: c.id,
        agentName: admin.name || admin.email || 'Admin BourseFi',
        exchangeType: parsed.data.channel === 'WHATSAPP' ? 'WHATSAPP' : 'EMAIL',
        content: `Relance en masse (${parsed.data.channel}) effectuée.${parsed.data.codePromo ? ` Code promo: ${parsed.data.codePromo}.` : ''}`,
        interestLevel: c.interestLevel || 'HOT_MED',
      },
    })

    results.push({
      id: c.id,
      name: c.fullName,
      whatsappUrl: waUrl,
    })
  }

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'CRM_BULK_RELANCE_EXECUTED',
    entityType: 'Candidature',
    entityId: parsed.data.candidatureIds.join(','),
    metadata: {
      count: candidatures.length,
      channel: parsed.data.channel,
      codePromo: parsed.data.codePromo || null,
    },
  })

  return {
    ok: true,
    count: candidatures.length,
    channel: parsed.data.channel,
    results,
  }
})
