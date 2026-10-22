import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit } from '../../utils/rate-limit'
import { hashToken } from '../../utils/one-time-token'
import { checkPassword } from '../../../shared/password-policy'

/**
 * Sert à la fois à la réinitialisation (mot de passe oublié) et à l'activation
 * d'un compte créé par l'équipe : même jeton à usage unique, mêmes règles.
 */
const resetPasswordSchema = z.object({
  token: z.string().trim().min(20, 'Lien invalide ou expiré.').max(200),
  password: z.string(),
})

const INVALID_LINK = 'Le lien est invalide ou a expiré. Veuillez refaire une demande.'

export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-reset-password', 10, 60 * 60 * 1000)
  const body = await readBody(event).catch(() => null)
  const parsed = resetPasswordSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map(i => i.message).join(', '),
    })
  }

  const { token, password } = parsed.data
  const tokenHash = hashToken(token)

  // Recherche par hash : un hash dérobé en base ne peut pas servir de jeton.
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { gt: new Date() },
    },
  })

  if (!user) {
    throw createError({ statusCode: 400, statusMessage: INVALID_LINK })
  }

  const policy = checkPassword(password, { email: user.email })
  if (!policy.ok) {
    // Le jeton reste valide : l'utilisateur peut corriger sa saisie.
    throw createError({ statusCode: 400, statusMessage: policy.message })
  }

  const passwordHash = await hash(password, 10)

  // Consommation atomique : seule la requête qui invalide le jeton l'emporte
  // (empêche le rejeu concurrent). La mise à jour est bornée à CET utilisateur.
  const consumed = await prisma.user.updateMany({
    where: { id: user.id, resetPasswordToken: tokenHash },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      // Le lien reçu par email prouve la possession de l'adresse.
      emailVerified: true,
    },
  })
  if (consumed.count !== 1) {
    throw createError({ statusCode: 400, statusMessage: INVALID_LINK })
  }

  // Invalider les sessions existantes par sécurité
  await prisma.session.deleteMany({ where: { userId: user.id } })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_PASSWORD_RESET',
    entityType: 'User',
    entityId: user.id,
  })

  return {
    ok: true,
    message: 'Votre mot de passe a été enregistré avec succès ! Vous pouvez maintenant vous connecter.',
  }
})
