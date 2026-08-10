import { createError, getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis.' })

  const existing = await prisma.bourse.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Bourse introuvable.' })
  }

  // Archivage non-destructif pour préserver l'historique
  const row = await prisma.bourse.update({
    where: { id },
    data: {
      status: 'ARCHIVED',
      isActive: false,
    },
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'BOURSE_ARCHIVE',
    entityType: 'Bourse',
    entityId: id,
    metadata: { slug: existing.slug },
  })

  return { ok: true, status: row.status }
})
