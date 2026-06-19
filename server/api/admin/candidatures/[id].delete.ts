import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  const dossier = await prisma.candidature.findUnique({
    where: { id },
    include: {
      programme: { select: { titre: true } },
      user: { select: { email: true } },
      paiement: { select: { id: true } },
    },
  })

  if (!dossier) {
    throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })
  }

  if (dossier.paiement) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Impossible de supprimer : un paiement est lié à ce dossier. Contactez le support si nécessaire.',
    })
  }

  await prisma.candidature.delete({ where: { id } })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'CANDIDATURE_DELETED',
    entityType: 'Candidature',
    entityId: id,
    metadata: {
      fullName: dossier.fullName,
      email: dossier.email,
      programme: dossier.programme.titre,
      status: dossier.status,
    },
  })

  return { ok: true }
})
