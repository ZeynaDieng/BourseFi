import { createError } from 'h3'
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

  await prisma.bourse.delete({ where: { id } })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'BOURSE_DELETE',
    entityType: 'Bourse',
    entityId: id,
    metadata: { slug: existing.slug },
  })

  return { ok: true }
})
