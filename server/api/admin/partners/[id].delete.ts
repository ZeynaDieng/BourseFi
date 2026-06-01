import { createError, getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })

  const existing = await prisma.partner.findUnique({
    where: { id },
    include: {
      _count: { select: { programmes: true, users: true } }
    }
  })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Partenaire introuvable.' })
  }

  if (existing._count.programmes > 0 || existing._count.users > 0) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Impossible de supprimer : ce partenaire a des programmes ou des comptes utilisateurs liés. Réaffectez-les d’abord.'
    })
  }

  await prisma.partner.delete({ where: { id } })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'PARTNER_DELETE',
    entityType: 'Partner',
    entityId: id,
    metadata: { slug: existing.slug, name: existing.name }
  })

  return { ok: true }
})
