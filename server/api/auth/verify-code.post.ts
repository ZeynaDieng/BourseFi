import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit, rateLimitKey } from '../../utils/rate-limit'
import { requireCsrf } from '../../utils/csrf'
import { parseApplicationDraft } from '../../utils/application-draft'
import { EMAIL_CODE_MAX_ATTEMPTS, emailCodeMatches } from '../../utils/email-code'

const bodySchema = z.object({
  email: z.email().max(254),
  code: z.string().trim().regex(/^\d{6}$/),
})

/** Réponse unique pour tout échec : ne révèle ni l'existence du compte ni la raison du refus. */
const INVALID = { statusCode: 400, statusMessage: 'Code invalide ou expiré. Vérifiez-le ou demandez-en un nouveau.' }

/**
 * Vérifie l'email avec le code à 6 chiffres et ouvre la session : l'étudiant continue
 * sa candidature sans quitter la page. Le lien de l'email reste valable en parallèle.
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-verify-code', 30, 60 * 60 * 1000)
  // Ouvre une session, comme la connexion : même protection CSRF
  requireCsrf(event)
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError(INVALID)

  const email = parsed.data.email.trim().toLowerCase()
  rateLimitKey('auth-verify-code', email, 10, 60 * 60 * 1000)

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  if (
    !user ||
    user.emailVerified ||
    !user.emailVerificationCodeHash ||
    !user.emailVerificationCodeExpires ||
    user.emailVerificationCodeExpires <= new Date()
  ) {
    throw createError(INVALID)
  }

  if (!emailCodeMatches(user.id, parsed.data.code, user.emailVerificationCodeHash)) {
    const attempts = user.emailVerificationCodeAttempts + 1
    await prisma.user.update({
      where: { id: user.id },
      // Trop d'essais : le code est détruit, il faudra en redemander un
      data: attempts >= EMAIL_CODE_MAX_ATTEMPTS
        ? { emailVerificationCodeHash: null, emailVerificationCodeExpires: null, emailVerificationCodeAttempts: 0 }
        : { emailVerificationCodeAttempts: attempts },
    })
    throw createError(INVALID)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationCodeHash: null,
      emailVerificationCodeExpires: null,
      emailVerificationCodeAttempts: 0,
    },
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'EMAIL_VERIFIED',
    entityType: 'User',
    entityId: user.id,
    metadata: { email: user.email, method: 'code' },
  })

  await createSession(event, user.id)

  const draft = parseApplicationDraft(user.applicationDraft)
  return { ok: true, resumeUrl: draft ? `/postuler/${draft.bourseSlug}` : null }
})
