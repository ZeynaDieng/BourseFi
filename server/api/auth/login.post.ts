import { compare } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession, DEACTIVATED_MESSAGE } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit, rateLimitKey } from '../../utils/rate-limit'
import { PARTNER_PORTAL_ENABLED } from '../../utils/product-config'
import { requireCsrf } from '../../utils/csrf'
import { linkStudentCandidatures } from '../../utils/student-candidatures'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  requireCsrf(event)
  rateLimit(event, 'auth-login', 10, 15 * 60 * 1000)
  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiants invalides.' })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const { password } = parsed.data
  rateLimitKey('auth-login', email, 10, 15 * 60 * 1000)
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })

  if (!user) {
    // Comparaison factice : même coût bcrypt que pour un compte existant.
    await compare(password, '$2b$10$CwTycUXWue0Thq9StjUM0uJ8DPLKXt1FYlwYpQW2G3cAwjKoh2WZu')
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect.' })
  }

  const isPasswordValid = await compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect.' })
  }

  // Indiqué seulement avec le bon mot de passe : ne révèle rien à un tiers
  if (user.deactivatedAt) {
    throw createError({ statusCode: 403, statusMessage: DEACTIVATED_MESSAGE })
  }

  if (user.role === 'PARTNER' && !PARTNER_PORTAL_ENABLED) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Les comptes partenaires ne sont pas disponibles pour le moment. Contactez BourseFi.',
    })
  }

  await linkStudentCandidatures(user)

  await createSession(event, user.id)
  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_LOGIN',
    entityType: 'Session',
    metadata: { email: user.email }
  })

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
})
