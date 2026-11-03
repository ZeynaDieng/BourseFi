import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit, rateLimitKey } from '../../utils/rate-limit'
import { sendEmail, renderEmail } from '../../utils/email'
import { siteUrl } from '../../utils/one-time-token'
import { checkPassword } from '../../../shared/password-policy'
import { bourseSlugSchema, buildApplicationDraft, findActiveBourseForDraft } from '../../utils/application-draft'
import { createSession } from '../../utils/auth'
import { requireCsrf } from '../../utils/csrf'

const registerSchema = z
  .object({
    name: z.string().min(2).optional(),
    firstName: z.string().min(1).max(80).optional(),
    lastName: z.string().min(1).max(80).optional(),
    email: z.email().max(254),
    phone: z.string().min(7, 'Le numéro de téléphone doit contenir au moins 7 chiffres').max(32),
    password: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation et la politique de confidentialité'),
    acceptMarketing: z.boolean().optional(),
    // Bourse depuis laquelle l'étudiant s'inscrit : sa candidature y est préparée (brouillon)
    bourseSlug: bourseSlugSchema.optional(),
  })
  .refine((data) => data.name || (data.firstName && data.lastName), {
    message: 'Indiquez votre prénom et nom, ou un nom complet.',
  })

/** Adresse déjà utilisée : l'étudiant est invité à se connecter (avec son mot de passe ou un code par email). */
const EMAIL_TAKEN = 'Un compte existe déjà avec cette adresse. Connectez-vous, ou choisissez « Se connecter sans mot de passe ».'

/** Email de bienvenue : aucune vérification demandée, il sert de repère pour revenir terminer la candidature. */
function sendWelcomeEmail(user: { email: string; name: string; firstName: string | null }, resumeUrl: string) {
  void sendEmail({
    to: { email: user.email, name: user.name },
    subject: 'Bienvenue sur BourseFi',
    html: renderEmail({
      title: `Bienvenue ${user.firstName || user.name} !`,
      bodyHtml: `
        <p>Votre espace étudiant BourseFi est créé.</p>
        <p>Vous pouvez reprendre votre demande de bourse à tout moment depuis le bouton ci-dessous.</p>
      `,
      ctaLabel: 'Reprendre ma candidature',
      ctaUrl: resumeUrl,
    }),
  }).catch(() => false)
}

/**
 * Inscription étudiante : le compte est utilisable immédiatement (pas de vérification de l'email),
 * pour ne pas faire quitter la candidature à l'étudiant. La session est ouverte dans la foulée.
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-register', 10, 60 * 60 * 1000)
  // Ouvre une session, comme la connexion : même protection CSRF
  requireCsrf(event)
  const body = await readBody(event).catch(() => null)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      data: parsed.error.issues.map(i => ({ path: i.path, message: i.message })),
      statusMessage: parsed.error.issues
        .map(issue => `${issue.path.join('.')} : ${issue.message}`)
        .join(' | '),
    })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const { password, phone, acceptMarketing } = parsed.data

  const policy = checkPassword(password, { email })
  if (!policy.ok) {
    throw createError({ statusCode: 400, statusMessage: `password : ${policy.message}` })
  }

  rateLimitKey('auth-register', email, 5, 60 * 60 * 1000)

  const firstName = parsed.data.firstName?.trim() ?? ''
  const lastName = parsed.data.lastName?.trim() ?? ''
  const name = parsed.data.name?.trim() || `${firstName} ${lastName}`.trim()

  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: EMAIL_TAKEN })
  }

  const passwordHash = await hash(password, 10)
  const draftBourse = parsed.data.bourseSlug ? await findActiveBourseForDraft(parsed.data.bourseSlug) : null

  let user
  try {
    user = await prisma.user.create({
      data: {
        name,
        firstName: firstName || null,
        lastName: lastName || null,
        email,
        phone: phone || null,
        passwordHash,
        emailVerified: false,
        role: 'STUDENT',
        ...(draftBourse ? { applicationDraft: buildApplicationDraft(draftBourse.slug, { phone }) } : {}),
      },
    })
  } catch (e: any) {
    // Course entre deux inscriptions simultanées avec la même adresse
    if (e?.code === 'P2002') throw createError({ statusCode: 409, statusMessage: EMAIL_TAKEN })
    throw e
  }

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_REGISTER',
    entityType: 'User',
    entityId: user.id,
    metadata: { email: user.email, acceptMarketing: acceptMarketing || false },
  })

  await createSession(event, user.id)

  const resumePath = draftBourse ? `/postuler/${draftBourse.slug}` : '/bourses'
  sendWelcomeEmail(user, `${siteUrl()}${resumePath}`)

  return { ok: true, user: { role: user.role }, resumeUrl: draftBourse ? resumePath : null }
})
