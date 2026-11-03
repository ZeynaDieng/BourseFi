import { hash } from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit, rateLimitKey } from '../../utils/rate-limit'
import { sendEmail, renderEmail } from '../../utils/email'
import { siteUrl } from '../../utils/one-time-token'
import { checkPassword } from '../../../shared/password-policy'
import { bourseSlugSchema, buildApplicationDraft, findActiveBourseForDraft } from '../../utils/application-draft'
import { generateEmailCode, sendVerificationEmail } from '../../utils/email-code'

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
    // Bourse depuis laquelle l'étudiant s'inscrit : il y sera ramené après la vérification de son email
    bourseSlug: bourseSlugSchema.optional(),
  })
  .refine((data) => data.name || (data.firstName && data.lastName), {
    message: 'Indiquez votre prénom et nom, ou un nom complet.',
  })

/**
 * Réponse publique UNIQUE, que l'adresse soit nouvelle ou déjà enregistrée :
 * même statut, même corps, aucun cookie de session (anti-énumération).
 */
const PUBLIC_RESPONSE = {
  ok: true,
  message: 'Si cette adresse peut être utilisée, un email vient de vous être envoyé. Cliquez sur le lien qu’il contient pour activer votre compte.',
}

export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-register', 10, 60 * 60 * 1000)
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

  // Hash calculé dans tous les cas pour homogénéiser le temps de réponse.
  const passwordHash = await hash(password, 10)
  const draftBourse = parsed.data.bourseSlug ? await findActiveBourseForDraft(parsed.data.bourseSlug) : null

  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })

  if (existingUser) {
    // Le propriétaire légitime est prévenu ; aucun jeton, aucune modification du compte.
    await sendEmail({
      to: { email: existingUser.email, name: existingUser.name },
      subject: 'Tentative d’inscription avec votre adresse - BourseFi',
      html: renderEmail({
        title: 'Vous avez déjà un compte BourseFi',
        bodyHtml: `
          <p>Une demande de création de compte vient d’être effectuée avec votre adresse email, qui est déjà associée à un compte BourseFi.</p>
          <p>Si c’est vous, connectez-vous simplement. En cas d’oubli, utilisez « Mot de passe oublié ».</p>
          <p>Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email : votre compte n’a pas été modifié.</p>
        `,
        ctaLabel: 'Se connecter',
        ctaUrl: `${siteUrl()}/auth/login`,
      }),
    }).catch(() => false)
    return PUBLIC_RESPONSE
  }

  const emailVerificationToken = randomBytes(32).toString('hex')

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
        emailVerificationToken,
        emailVerified: false,
        role: 'STUDENT',
        ...(draftBourse ? { applicationDraft: buildApplicationDraft(draftBourse.slug, { phone }) } : {}),
      },
    })
  } catch (e: any) {
    // Course entre deux inscriptions simultanées : même réponse générique.
    if (e?.code === 'P2002') return PUBLIC_RESPONSE
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

  // Code à 6 chiffres (saisi sur la page de candidature) en plus du lien ; seul son hash est stocké
  const { code, data: codeData } = generateEmailCode(user.id)
  await prisma.user.update({ where: { id: user.id }, data: codeData })

  // L'échec d'envoi n'active JAMAIS le compte automatiquement (l'utilisateur
  // pourra redemander un code) et n'est pas reflété dans la réponse publique.
  const sent = await sendVerificationEmail(user, emailVerificationToken, code)
  if (!sent) console.warn('[AUTH_REGISTER] Échec d’envoi de l’email de vérification', { userId: user.id })

  return PUBLIC_RESPONSE
})
