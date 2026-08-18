import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { requireRole } from '../../../../utils/auth'
import { writeAuditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const etablissementId = getRouterParam(event, 'id')
  if (!etablissementId) throw createError({ statusCode: 400, statusMessage: 'ID d\'établissement manquant.' })

  const body = await readBody<{
    action: 'PAY_ALL' | 'RESET' | 'PARTIAL_PAYMENT'
    amountPaid?: number
    paymentRef?: string
    notes?: string
  }>(event)

  const etab = await prisma.etablissement.findUnique({
    where: { id: etablissementId }
  })
  if (!etab) throw createError({ statusCode: 404, statusMessage: 'Établissement introuvable.' })

  const orientedCandidatures = await prisma.candidature.findMany({
    where: {
      programme: { etablissementId },
      status: { in: ['VALIDE', 'PAYE', 'EN_REVUE_PARTENAIRE', 'SOUMIS'] }
    }
  })

  if (body.action === 'PAY_ALL' || body.action === 'RESET') {
    const isPayAll = body.action === 'PAY_ALL'
    await prisma.candidature.updateMany({
      where: {
        programme: { etablissementId },
        status: { in: ['VALIDE', 'PAYE', 'EN_REVUE_PARTENAIRE', 'SOUMIS'] }
      },
      data: {
        commissionStatus: isPayAll ? 'VALIDE' : 'EN_ATTENTE',
        commissionPaidAt: isPayAll ? new Date() : null,
        commissionRef: body.paymentRef || (isPayAll ? `REGLEMENT-REGROUPE-${Date.now()}` : null),
        commissionNotes: body.notes || (isPayAll ? 'Règlement global effectué' : 'Compte réinitialisé par admin')
      }
    })

    await prisma.etablissement.update({
      where: { id: etablissementId },
      data: {
        commissionPaidStatus: isPayAll ? 'UP_TO_DATE' : 'PENDING'
      }
    })

    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: isPayAll ? 'COMMISSION_PAY_ALL' : 'COMMISSION_RESET',
      entityType: 'Etablissement',
      entityId: etab.id,
      metadata: { nom: etab.nom, action: body.action, ref: body.paymentRef }
    })
  }

  return { success: true, count: orientedCandidatures.length }
})
