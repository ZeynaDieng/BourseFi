import { createError, getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })

  const existing = await prisma.etablissement.findUnique({
    where: { id },
    select: { id: true, slug: true, nom: true },
  })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Établissement introuvable.' })
  }

  // Archivage logique non-destructif pour préserver l'historique
  const row = await prisma.etablissement.update({
    where: { id },
    data: { status: 'ARCHIVED', updatedBy: user.email },
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'ETABLISSEMENT_ARCHIVE',
    entityType: 'Etablissement',
    entityId: id,
    metadata: { slug: existing.slug, nom: existing.nom },
  })

  return { ok: true, status: row.status }
})
