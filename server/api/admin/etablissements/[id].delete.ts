import { Prisma } from '@prisma/client'
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
    select: { id: true, slug: true, nom: true }
  })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Établissement introuvable.' })
  }

  try {
    await prisma.etablissement.delete({ where: { id } })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === 'P2003' || e.code === 'P2014')) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Impossible de supprimer : des programmes liés ont des candidatures. Supprimez ou réaffectez les candidatures d’abord.'
      })
    }
    throw e
  }

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'ETABLISSEMENT_DELETE',
    entityType: 'Etablissement',
    entityId: id,
    metadata: { slug: existing.slug, nom: existing.nom }
  })

  return { ok: true }
})
