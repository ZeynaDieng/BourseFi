import { compare } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { PARTNER_PORTAL_ENABLED } from '../../utils/product-config'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiants invalides.' })
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect.' })
  }

  const isPasswordValid = await compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect.' })
  }

  if (user.role === 'PARTNER' && !PARTNER_PORTAL_ENABLED) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Les comptes partenaires ne sont pas disponibles pour le moment. Contactez BourseFi.',
    })
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
