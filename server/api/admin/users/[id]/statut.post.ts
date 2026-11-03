import { z } from 'zod'
import { prisma } from '../../../../utils/prisma'
import { requireRole } from '../../../../utils/auth'
import { writeAuditLog } from '../../../../utils/audit'

const bodySchema = z.object({
  active: z.boolean(),
  reason: z.string().trim().max(300).optional(),
})

/**
 * Désactive ou réactive un compte depuis le backoffice. Désactiver : plus de connexion,
 * toutes les sessions sont révoquées, plus de relances. Les données (candidatures, paiements) sont conservées.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!id || !parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Requête invalide.' })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  if (!parsed.data.active) {
    if (target.id === admin.id) {
      throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas désactiver votre propre compte.' })
    }
    if (target.role === 'ADMIN') {
      const activeAdmins = await prisma.user.count({ where: { role: 'ADMIN', deactivatedAt: null } })
      if (activeAdmins <= 1) {
        throw createError({ statusCode: 409, statusMessage: 'Impossible de désactiver le dernier administrateur actif.' })
      }
    }
  }

  const deactivatedAt = parsed.data.active ? null : (target.deactivatedAt ?? new Date())
  const deactivationReason = parsed.data.active ? null : (parsed.data.reason || null)

  await prisma.user.update({ where: { id }, data: { deactivatedAt, deactivationReason } })
  // Déconnexion immédiate sur tous les appareils
  if (!parsed.data.active) await prisma.session.deleteMany({ where: { userId: id } })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: parsed.data.active ? 'USER_REACTIVATED' : 'USER_DEACTIVATED',
    entityType: 'User',
    entityId: id,
    metadata: { email: target.email, ...(deactivationReason ? { reason: deactivationReason } : {}) },
  })

  return { ok: true, deactivatedAt: deactivatedAt?.toISOString() ?? null, deactivationReason }
})
