import { compare } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit, rateLimitKey } from '../../utils/rate-limit'
import { PARTNER_PORTAL_ENABLED } from '../../utils/product-config'
import { requireCsrf } from '../../utils/csrf'

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

  if (!user.emailVerified) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Veuillez vérifier votre email avant de vous connecter. Un lien de vérification a été envoyé lors de votre inscription.'
    })
  }

  if (user.role === 'PARTNER' && !PARTNER_PORTAL_ENABLED) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Les comptes partenaires ne sont pas disponibles pour le moment. Contactez BourseFi.',
    })
  }

  if (user.role === 'STUDENT' && user.email) {
    try {
      await prisma.candidature.updateMany({
        where: {
          email: { equals: user.email.trim(), mode: 'insensitive' },
          userId: { not: user.id },
        },
        data: { userId: user.id },
      })
    } catch (e) {
      console.warn('[AUTH_LOGIN] Auto-sync candidatures:', e)
    }
  }

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
