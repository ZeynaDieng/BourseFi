import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  const paiement = await prisma.paiement.findUnique({
    where: { id },
    include: { candidature: true }
  })

  if (!paiement) {
    throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable.' })
  }

  // Empêcher la suppression si le paiement est validé et lié à une candidature
  if (paiement.status === 'Valide' && paiement.candidatureId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Impossible de supprimer un paiement validé lié à une candidature.'
    })
  }

  await prisma.paiement.delete({ where: { id } })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'TRANSACTION_DELETED',
    entityType: 'Paiement',
    entityId: id,
    metadata: {
      fullName: paiement.fullName,
      email: paiement.email,
      amount: paiement.amount,
      currency: paiement.currency,
      status: paiement.status,
      method: paiement.method,
      candidatureId: paiement.candidatureId,
    },
  })

  return { ok: true }
})
