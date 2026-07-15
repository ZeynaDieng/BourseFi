import { hash } from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit } from '../../utils/rate-limit'
import { sendEmail, renderEmail } from '../../utils/email'

const passwordSchema = z.string()
  .min(4, 'Le mot de passe doit contenir au moins 4 caractères')

const registerSchema = z
  .object({
    name: z.string().min(2).optional(),
    firstName: z.string().min(1).max(80).optional(),
    lastName: z.string().min(1).max(80).optional(),
    email: z.email(),
    phone: z.string().min(7, 'Le numéro de téléphone doit contenir au moins 7 chiffres'),
    password: passwordSchema,
    acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation et la politique de confidentialité'),
    acceptMarketing: z.boolean().optional(),
  })
  .refine((data) => data.name || (data.firstName && data.lastName), {
    message: 'Indiquez votre prénom et nom, ou un nom complet.',
  })

export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-register', 10, 60 * 60 * 1000)
  const body = await readBody(event)
  console.log("BODY:", body)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
  console.log("ZOD ISSUES:", parsed.error.issues);

  throw createError({
    statusCode: 400,
    data: parsed.error.issues,
    statusMessage: parsed.error.issues
      .map(issue => `${issue.path.join(".")} : ${issue.message}`)
      .join(" | "),
  });
}

  const { email, password, phone, acceptMarketing } = parsed.data
  const firstName = parsed.data.firstName?.trim() ?? ''
  const lastName = parsed.data.lastName?.trim() ?? ''
  const name =
    parsed.data.name?.trim() ||
    `${firstName} ${lastName}`.trim()
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'Cet email est deja utilise.' })
  }

  const passwordHash = await hash(password, 10)
  const emailVerificationToken = randomBytes(32).toString('hex')

  const user = await prisma.user.create({
    data: {
      name,
      firstName: firstName || null,
      lastName: lastName || null,
      email,
      phone: phone || null,
      passwordHash,
      emailVerificationToken,
      emailVerified: false,
      role: 'STUDENT',
    },
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_REGISTER',
    entityType: 'User',
    entityId: user.id,
    metadata: {
      email: user.email,
      acceptMarketing: acceptMarketing || false
    }
  })

  const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
  const verificationUrl = `${siteUrl}/auth/verify-email?token=${emailVerificationToken}`

const emailSent = await sendEmail({
  to: { email: user.email, name: user.name },
  subject: 'Vérifiez votre email - BourseFi 🎓',
  html: renderEmail({
    title: `Bienvenue ${user.name} !`,
    bodyHtml: `
      <p>Votre compte BourseFi a bien été créé.</p>
      <p>Pour renforcer la sécurité de votre compte, nous vous invitons à vérifier votre adresse email en cliquant sur le bouton ci-dessous.</p>
    `,
    ctaLabel: 'Vérifier mon email',
    ctaUrl: verificationUrl
  })
})

if (!emailSent) {
  // En cas d'échec d'envoi d'email, on valide l'utilisateur automatiquement pour ne pas le bloquer
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null
    }
  })
}

// Se connecter automatiquement en créant une session pour ne pas bloquer l'utilisateur dans son tunnel d'inscription/candidature
await createSession(event, user.id)

  return {
  ok: true,
  email: user.email,
  emailSent,
  message: emailSent
    ? 'Compte créé avec succès. Un email de vérification vous a été envoyé.'
    : 'Compte créé avec succès. Vous pouvez poursuivre votre candidature.'
}
})
