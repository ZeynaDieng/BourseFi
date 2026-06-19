import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { auditActionLabel } from '../audit-logs.get'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: { actor: { select: { id: true, name: true, email: true, role: true } } },
  })

  if (!log) {
    throw createError({ statusCode: 404, statusMessage: 'Événement introuvable.' })
  }

  let metadata: Record<string, unknown> | null = null
  if (log.metadata) {
    try {
      metadata = JSON.parse(log.metadata) as Record<string, unknown>
    } catch {
      metadata = null
    }
  }

  return {
    id: log.id,
    actorId: log.actorId,
    actor: log.actor,
    actorRole: log.actorRole,
    action: log.action,
    actionLabel: auditActionLabel(log.action),
    entityType: log.entityType,
    entityId: log.entityId,
    metadata,
    createdAt: log.createdAt.toISOString(),
  }
})
