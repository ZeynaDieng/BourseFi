import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession, getSessionUser } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit } from '../../utils/rate-limit'
import { requireCsrf } from '../../utils/csrf'
import { hashToken } from '../../utils/one-time-token'

const bodySchema = z.object({ token: z.string().trim().min(20).max(200) })

const INVALID = { statusCode: 400, statusMessage: 'Lien expiré ou déjà utilisé. Connectez-vous pour retrouver votre attestation.' }

/**
 * Reconnexion par lien à usage unique après un paiement (retour PayTech ou email de confirmation).
 * Tant que le paiement n'est pas validé, le lien n'est pas consommé : la page réessaie quelques secondes.
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-login-link', 60, 60 * 60 * 1000)
  // Ouvre une session, comme la connexion : même protection CSRF
  requireCsrf(event)
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError(INVALID)

  const link = await prisma.loginLink.findFirst({
    where: { tokenHash: hashToken(parsed.data.token), usedAt: null, expiresAt: { gt: new Date() } },
  })
  if (!link) throw createError(INVALID)

  const candidature = await prisma.candidature.findUnique({
    where: { id: link.candidatureId },
    select: { id: true, userId: true, paiement: { select: { status: true } } },
  })
  if (!candidature || candidature.userId !== link.userId) throw createError(INVALID)

  const redirect = `/paiement?candidatureId=${candidature.id}&status=success`

  // Déjà connecté sur ce compte : rien à faire
  const current = await getSessionUser(event)
  if (current?.id === link.userId) return { ok: true, redirect }

  if (candidature.paiement?.status !== 'Valide') return { pending: true }

  const user = await prisma.user.findUnique({ where: { id: link.userId } })
  // Jamais pour un compte de l'équipe : leur accès reste limité à la connexion par mot de passe
  if (!user || user.role !== 'STUDENT') throw createError(INVALID)

  // Consommation atomique : un seul usage, même en cas de requêtes simultanées
  const consumed = await prisma.loginLink.updateMany({
    where: { id: link.id, usedAt: null },
    data: { usedAt: new Date() },
  })
  if (consumed.count !== 1) throw createError(INVALID)

  await createSession(event, user.id)

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_LOGIN_LINK',
    entityType: 'User',
    entityId: user.id,
    metadata: { purpose: link.purpose, candidatureId: candidature.id },
  })

  return { ok: true, redirect }
})
