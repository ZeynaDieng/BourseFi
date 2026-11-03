import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { rateLimit, rateLimitKey } from '../../utils/rate-limit'
import { generateEmailCode, sendVerificationEmail } from '../../utils/email-code'

const bodySchema = z.object({ email: z.email().max(254) })

/** Même réponse que le compte existe ou non (anti-énumération). */
const PUBLIC_RESPONSE = { ok: true, message: 'Si un compte en attente de vérification existe pour cette adresse, un nouveau code vient d’être envoyé.' }

/** Renvoie un code (et un lien) de vérification à un compte pas encore vérifié. */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-resend-code', 10, 60 * 60 * 1000)
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Adresse email invalide.' })

  const email = parsed.data.email.trim().toLowerCase()
  rateLimitKey('auth-resend-code', email, 3, 60 * 60 * 1000)

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  if (!user || user.emailVerified) return PUBLIC_RESPONSE

  const { code, data } = generateEmailCode(user.id)
  const token = user.emailVerificationToken ?? randomBytes(32).toString('hex')
  await prisma.user.update({ where: { id: user.id }, data: { ...data, emailVerificationToken: token } })
  const sent = await sendVerificationEmail(user, token, code)
  if (!sent) console.warn('[AUTH_RESEND_CODE] Échec d’envoi du code de vérification', { userId: user.id })
  return PUBLIC_RESPONSE
})
