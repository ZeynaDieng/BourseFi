import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit, rateLimitKey } from '../../utils/rate-limit'
import { requireCsrf } from '../../utils/csrf'
import { EMAIL_CODE_MAX_ATTEMPTS, loginCodeMatches } from '../../utils/email-code'
import { linkStudentCandidatures } from '../../utils/student-candidatures'

const bodySchema = z.object({
  email: z.email().max(254),
  code: z.string().trim().regex(/^\d{6}$/),
})

/** Réponse unique pour tout échec : ne révèle ni l'existence du compte ni la raison du refus. */
const INVALID = { statusCode: 400, statusMessage: 'Code invalide ou expiré. Vérifiez-le ou demandez-en un nouveau.' }

/** Connexion sans mot de passe : vérifie le code reçu par email et ouvre la session. */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-login-code-verify', 30, 60 * 60 * 1000)
  // Ouvre une session, comme la connexion : même protection CSRF
  requireCsrf(event)
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError(INVALID)

  const email = parsed.data.email.trim().toLowerCase()
  rateLimitKey('auth-login-code-verify', email, 10, 60 * 60 * 1000)

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  if (
    !user ||
    user.role !== 'STUDENT' ||
    !user.loginCodeHash ||
    !user.loginCodeExpires ||
    user.loginCodeExpires <= new Date()
  ) {
    throw createError(INVALID)
  }

  if (!loginCodeMatches(user.id, parsed.data.code, user.loginCodeHash)) {
    const attempts = user.loginCodeAttempts + 1
    await prisma.user.update({
      where: { id: user.id },
      // Trop d'essais : le code est détruit, il faudra en redemander un
      data: attempts >= EMAIL_CODE_MAX_ATTEMPTS
        ? { loginCodeHash: null, loginCodeExpires: null, loginCodeAttempts: 0 }
        : { loginCodeAttempts: attempts },
    })
    throw createError(INVALID)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      loginCodeHash: null,
      loginCodeExpires: null,
      loginCodeAttempts: 0,
      // Le code reçu par email prouve la possession de l'adresse
      emailVerified: true,
      emailVerificationCodeHash: null,
      emailVerificationCodeExpires: null,
      emailVerificationCodeAttempts: 0,
    },
  })

  // Refuse un compte désactivé (403)
  await createSession(event, user.id)
  await linkStudentCandidatures(user)

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_LOGIN',
    entityType: 'Session',
    entityId: user.id,
    metadata: { method: 'email-code' },
  })

  return { ok: true, user: { role: user.role } }
})
