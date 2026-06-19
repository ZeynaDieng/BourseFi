import { getQuery } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

const ACTION_LABELS: Record<string, string> = {
  USER_REGISTERED: 'Inscription',
  USER_LOGIN: 'Connexion',
  USER_LOGOUT: 'Déconnexion',
  USER_ROLE_UPDATED: 'Rôle modifié',
  PROFILE_UPDATED: 'Profil mis à jour',
  CANDIDATURE_CREATED: 'Candidature créée',
  CANDIDATURE_STATUS_UPDATED: 'Statut candidature',
  PAIEMENT_COMPLETED: 'Paiement validé',
  PROGRAMME_CREATED: 'Programme créé',
  PROGRAMME_UPDATED: 'Programme modifié',
  PROGRAMME_DELETED: 'Programme supprimé',
  BOURSE_CREATED: 'Bourse créée',
  BOURSE_UPDATED: 'Bourse modifiée',
  BOURSE_DELETED: 'Bourse supprimée',
  PARTNER_CREATED: 'Partenaire créé',
  PARTNER_UPDATED: 'Partenaire modifié',
  PARTNER_DELETED: 'Partenaire supprimé',
  ETABLISSEMENT_CREATED: 'École créée',
  ETABLISSEMENT_UPDATED: 'École modifiée',
  ETABLISSEMENT_DELETED: 'École supprimée',
}

export function auditActionLabel(action: string) {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase()
}

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const query = getQuery(event)
  const limit = Math.min(500, Math.max(1, Number(query.limit || 100)))
  const offset = Math.max(0, Number(query.offset || 0))
  const action = query.action ? String(query.action) : undefined
  const entityType = query.entityType ? String(query.entityType) : undefined
  const actorRole = query.actorRole ? String(query.actorRole) : undefined
  const search = query.search ? String(query.search).trim() : undefined

  const where: Record<string, unknown> = {}
  if (action) where.action = action
  if (entityType) where.entityType = entityType
  if (actorRole) where.actorRole = actorRole
  if (search) {
    where.OR = [
      { action: { contains: search, mode: 'insensitive' } },
      { entityType: { contains: search, mode: 'insensitive' } },
      { entityId: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [logs, total, actionGroups, entityGroups] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ['action'], _count: true, orderBy: { _count: { action: 'desc' } }, take: 12 }),
    prisma.auditLog.groupBy({ by: ['entityType'], _count: true, orderBy: { _count: { entityType: 'desc' } }, take: 8 }),
  ])

  return {
    total,
    limit,
    offset,
    stats: {
      topActions: actionGroups.map((g) => ({
        action: g.action,
        label: auditActionLabel(g.action),
        count: g._count,
      })),
      topEntities: entityGroups.map((g) => ({ entityType: g.entityType, count: g._count })),
    },
    items: logs.map((log) => {
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
        actorName: log.actor?.name ?? null,
        actorEmail: log.actor?.email ?? null,
        actorRole: log.actorRole,
        action: log.action,
        actionLabel: auditActionLabel(log.action),
        entityType: log.entityType,
        entityId: log.entityId,
        metadata,
        createdAt: log.createdAt.toISOString(),
      }
    }),
  }
})
