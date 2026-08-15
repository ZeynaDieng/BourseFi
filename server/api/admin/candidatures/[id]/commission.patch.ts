import { requireRole } from '../../../../utils/auth'
import { prisma } from '../../../../utils/prisma'
import { writeAuditLog } from '../../../../utils/audit'
import { z } from 'zod'

const schema = z.object({
  commissionStatus: z.enum(['EN_ATTENTE', 'VALIDE', 'ANNULE']),
  commissionRef: z.string().optional(),
  commissionNotes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])

  const candidatureId = getRouterParam(event, 'id')
  if (!candidatureId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de candidature manquant.' })
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Données invalides.', data: parsed.error.format() })
  }

  const candidature = await prisma.candidature.findUnique({
    where: { id: candidatureId },
    include: { programme: { include: { etablissement: true } } }
  })

  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }

  const { commissionStatus, commissionRef, commissionNotes } = parsed.data
  const paidAt = commissionStatus === 'VALIDE' ? new Date() : null

  const updated = await prisma.candidature.update({
    where: { id: candidatureId },
    data: {
      commissionStatus,
      commissionPaidAt: paidAt,
      commissionRef: commissionRef || null,
      commissionNotes: commissionNotes || null
    }
  })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'CANDIDATURE_COMMISSION_STATUS_UPDATED',
    entityType: 'Candidature',
    entityId: candidatureId,
    metadata: {
      candidat: candidature.fullName,
      school: candidature.programme.etablissement.nom,
      oldStatus: candidature.commissionStatus,
      newStatus: commissionStatus,
      commissionRef
    }
  })

  return {
    success: true,
    candidature: updated
  }
})
