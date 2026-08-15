import { requireRole } from '../../../../utils/auth'
import { prisma } from '../../../../utils/prisma'
import { writeAuditLog } from '../../../../utils/audit'
import { z } from 'zod'

const schema = z.object({
  status: z.enum(['UP_TO_DATE', 'PENDING', 'PARTIAL']),
  commissionPaidAt: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  markCandidaturesAsPaid: z.boolean().optional().default(true),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])

  const etablissementId = getRouterParam(event, 'id')
  if (!etablissementId) {
    throw createError({ statusCode: 400, statusMessage: 'ID d\'établissement manquant.' })
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Données invalides.', data: parsed.error.format() })
  }

  const etablissement = await prisma.etablissement.findUnique({
    where: { id: etablissementId }
  })

  if (!etablissement) {
    throw createError({ statusCode: 404, statusMessage: 'Établissement introuvable.' })
  }

  const { status, reference, notes, markCandidaturesAsPaid } = parsed.data
  const paidDate = parsed.data.commissionPaidAt ? new Date(parsed.data.commissionPaidAt) : new Date()

  // 1. Mettre à jour l'établissement
  const updatedEtablissement = await prisma.etablissement.update({
    where: { id: etablissementId },
    data: {
      commissionPaidStatus: status,
    }
  })

  // 2. Si l'admin coche "marquer les candidatures comme payées", on met à jour les candidatures de l'école
  let updatedCandidaturesCount = 0
  if (markCandidaturesAsPaid && status === 'UP_TO_DATE') {
    const res = await prisma.candidature.updateMany({
      where: {
        programme: { etablissementId },
        commissionStatus: { not: 'VALIDE' }
      },
      data: {
        commissionStatus: 'VALIDE',
        commissionPaidAt: paidDate,
        commissionRef: reference || null,
        commissionNotes: notes || null
      }
    })
    updatedCandidaturesCount = res.count
  }

  // 3. Tracer dans l'audit log
  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'COMMISSION_PAYOUT_VALIDATED',
    entityType: 'Etablissement',
    entityId: etablissementId,
    metadata: {
      etablissementNom: etablissement.nom,
      status,
      reference,
      notes,
      updatedCandidaturesCount
    }
  })

  return {
    success: true,
    etablissement: updatedEtablissement,
    updatedCandidaturesCount
  }
})
