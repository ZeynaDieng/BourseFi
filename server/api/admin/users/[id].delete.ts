import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  if (id === admin.id) {
    throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas supprimer votre propre compte.' })
  }

  const target = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { candidatures: true, paiements: true } } },
  })

  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  if (target.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) {
      throw createError({ statusCode: 409, statusMessage: 'Impossible de supprimer le dernier administrateur.' })
    }
  }

  await prisma.user.delete({ where: { id } })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'USER_DELETED',
    entityType: 'User',
    entityId: id,
    metadata: {
      email: target.email,
      name: target.name,
      candidatures: target._count.candidatures,
      paiements: target._count.paiements,
    },
  })

  return { ok: true }
})
