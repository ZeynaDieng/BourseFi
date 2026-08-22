import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit } from '../../utils/rate-limit'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token de réinitialisation manquant'),
  password: z.string().min(4, 'Le mot de passe doit contenir au moins 4 caractères'),
})

export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-reset-password', 10, 60 * 60 * 1000)
  const body = await readBody(event)
  const parsed = resetPasswordSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map(i => i.message).join(', '),
    })
  }

  const { token, password } = parsed.data

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.',
    })
  }

  const passwordHash = await hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  })

  // Invalider les sessions existantes par sécurité
  await prisma.session.deleteMany({
    where: { userId: user.id },
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_PASSWORD_RESET',
    entityType: 'User',
    entityId: user.id,
  })

  return {
    ok: true,
    message: 'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
  }
})
