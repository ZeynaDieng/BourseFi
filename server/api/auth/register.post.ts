import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Informations d inscription invalides.' })
  }

  const { name, email, password } = parsed.data
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'Cet email est deja utilise.' })
  }

  const passwordHash = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'STUDENT'
    }
  })

  await createSession(event, user.id)
  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_REGISTER',
    entityType: 'User',
    entityId: user.id,
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
