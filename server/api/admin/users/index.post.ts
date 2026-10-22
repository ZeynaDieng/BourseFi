import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'
import { sendEmail, renderEmail } from '../../../utils/email'
import {
  ACTIVATION_TOKEN_TTL_MS, activationUrl, generateOneTimeToken, unusablePasswordHash,
} from '../../../utils/one-time-token'

const userCreateSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  name: z.string().trim().optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  role: z.enum(['STUDENT', 'PARTNER', 'ADMIN']).default('STUDENT'),
  // Pas de champ `password` : le titulaire choisit lui-même son mot de passe via un lien d'activation.
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

  const { token, tokenHash } = generateOneTimeToken()

  const user = await prisma.user.create({
    data: {
      name: finalName,
      firstName: cleanFirstName || null,
      lastName: cleanLastName || null,
      email: cleanEmail,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      passwordHash: await unusablePasswordHash(),
      resetPasswordToken: tokenHash,
      resetPasswordExpires: new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS),
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

  // Envoi du lien d'activation (aucun mot de passe transmis)
  let activationEmailSent = false
  if (parsed.data.sendWelcomeEmail) {
    activationEmailSent = await sendEmail({
      to: { email: cleanEmail, name: finalName },
      subject: 'Activez votre espace BourseFi',
      html: renderEmail({
        title: 'Bienvenue sur BourseFi',
        bodyHtml: `<p>Bonjour ${cleanFirstName || finalName},</p>
          <p>Votre compte <strong>${user.role === 'STUDENT' ? 'étudiant' : user.role}</strong> (identifiant : <strong>${cleanEmail}</strong>) a été créé par notre équipe.</p>
          <p>Pour y accéder, choisissez votre mot de passe personnel via le bouton ci-dessous. Ce lien est valable <strong>72 heures</strong> et utilisable <strong>une seule fois</strong>.</p>
          <p style="color:#64748b;font-size:12px;">Lien expiré ? Utilisez « Mot de passe oublié » sur la page de connexion.</p>`,
        ctaLabel: 'Choisir mon mot de passe',
        ctaUrl: activationUrl(token),
      }),
    }).catch((mailErr) => {
      console.warn('Erreur lors de l\'envoi de l\'email d\'activation:', mailErr)
      return false
    })
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
      activationEmailSent,
    },
  })

  return {
    ok: true,
    user,
    activationEmailSent,
  }
})
