import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { rateLimit, rateLimitKey } from '../../utils/rate-limit'
import { generateLoginCode, sendLoginCodeEmail } from '../../utils/email-code'

const bodySchema = z.object({ email: z.email().max(254) })

/** Même réponse que le compte existe ou non (anti-énumération). */
const PUBLIC_RESPONSE = { ok: true, message: 'Si un compte étudiant existe pour cette adresse, un code de connexion vient d’être envoyé.' }

/**
 * Connexion sans mot de passe : envoie un code à 6 chiffres par email.
 * Réservé aux étudiants ; les comptes de l'équipe se connectent uniquement par mot de passe.
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-login-code', 10, 60 * 60 * 1000)
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Adresse email invalide.' })

  const email = parsed.data.email.trim().toLowerCase()
  rateLimitKey('auth-login-code', email, 5, 60 * 60 * 1000)

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  if (!user || user.role !== 'STUDENT' || user.deactivatedAt) return PUBLIC_RESPONSE

  const { code, data } = generateLoginCode(user.id)
  await prisma.user.update({ where: { id: user.id }, data })
  const sent = await sendLoginCodeEmail({ email: user.email, name: user.firstName || user.name }, code)
  if (!sent) console.warn('[AUTH_LOGIN_CODE] Échec d’envoi du code de connexion', { userId: user.id })
  return PUBLIC_RESPONSE
})
