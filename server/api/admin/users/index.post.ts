import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'
import { sendEmail, renderEmail } from '../../../utils/email'

const userCreateSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  name: z.string().trim().optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  role: z.enum(['STUDENT', 'PARTNER', 'ADMIN']).default('STUDENT'),
  password: z.string().min(4).optional(),
  emailVerified: z.boolean().default(true),
  sendWelcomeEmail: z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const body = await readBody(event)

  const parsed = userCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Données invalides : ' + parsed.error.issues.map((i) => i.message).join(', '),
    })
  }

  const cleanEmail = parsed.data.email.toLowerCase()
  const cleanFirstName = parsed.data.firstName || ''
  const cleanLastName = parsed.data.lastName || ''
  let finalName = parsed.data.name || `${cleanFirstName} ${cleanLastName}`.trim()
  if (!finalName) finalName = cleanEmail.split('@')[0] || 'Utilisateur'

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } })
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Un compte existe déjà avec l'adresse email ${cleanEmail}.`,
    })
  }

  const finalPassword = parsed.data.password?.trim() || `BourseFi${Math.floor(1000 + Math.random() * 9000)}!`
  const passwordHash = await bcrypt.hash(finalPassword, 10)

  const user = await prisma.user.create({
    data: {
      name: finalName,
      firstName: cleanFirstName || null,
      lastName: cleanLastName || null,
      email: cleanEmail,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      passwordHash,
      role: parsed.data.role,
      emailVerified: parsed.data.emailVerified,
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  })

  // Rapprochement automatique des éventuelles candidatures existantes avec cet email (insensible à la casse)
  await prisma.candidature.updateMany({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } },
    data: { userId: user.id },
  })

  // Envoi optionnel du courriel de bienvenue avec identifiants
  if (parsed.data.sendWelcomeEmail) {
    const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
    try {
      await sendEmail({
        to: { email: cleanEmail, name: finalName },
        subject: 'Vos accès à votre espace BourseFi',
        html: renderEmail({
          title: 'Bienvenue sur BourseFi',
          bodyHtml: `<p>Bonjour ${cleanFirstName || finalName},</p>
            <p>Votre compte <strong>${user.role === 'STUDENT' ? 'étudiant' : user.role}</strong> a été créé et activé par notre équipe.</p>
            <p>Vous pouvez dès maintenant vous connecter sur la plateforme pour retrouver vos candidatures, vos documents et télécharger vos attestations officielles :</p>
            <div style="background:#f1f5f9;padding:14px 18px;border-radius:10px;margin:18px 0;border-left:4px solid #0b1b3a;font-family:Arial,sans-serif;">
              <p style="margin:4px 0;font-size:13px;"><strong>Identifiant (Email) :</strong> ${cleanEmail}</p>
              <p style="margin:4px 0;font-size:13px;"><strong>Mot de passe :</strong> <code>${finalPassword}</code></p>
            </div>
            <p style="color:#64748b;font-size:12px;">Vous pourrez changer votre mot de passe à tout moment depuis votre profil.</p>`,
          ctaLabel: 'Se connecter à mon espace',
          ctaUrl: `${siteUrl}/login`,
        }),
      })
    } catch (mailErr) {
      console.warn('Erreur lors de l\'envoi de l\'email de bienvenue:', mailErr)
    }
  }

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'USER_CREATED_BY_ADMIN',
    entityType: 'User',
    entityId: user.id,
    metadata: {
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  })

  return {
    ok: true,
    user,
    generatedPassword: finalPassword,
  }
})
