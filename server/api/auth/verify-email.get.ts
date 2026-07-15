import { createError, getQuery } from 'h3'
import { prisma } from '../../utils/prisma'
import { createSession } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = typeof query.token === 'string' ? query.token : ''

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token de vérification manquant.' })
  }

  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token }
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Token invalide ou expiré.' })
  }

  if (user.emailVerified) {
    throw createError({ statusCode: 400, statusMessage: 'Email déjà vérifié.' })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null
    }
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'EMAIL_VERIFIED',
    entityType: 'User',
    entityId: user.id,
    metadata: { email: user.email }
  })

  await createSession(event, user.id)

  return { ok: true, email: user.email }
})