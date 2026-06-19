import { requireRole } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { syncPaytechPaymentIfPending } from '../../utils/paytech-sync'

/**
 * Renvoie le statut du paiement d'une candidature, pour la page de retour
 * qui attend la confirmation IPN après redirection depuis PayTech.
 * ?sync=1 interroge PayTech si le paiement est encore en attente (repli IPN).
 */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN'])
  const query = getQuery(event)
  const candidatureId = typeof query.candidatureId === 'string' ? query.candidatureId : ''
  const shouldSync = query.sync === '1' || query.sync === 'true'

  if (!candidatureId) {
    throw createError({ statusCode: 400, statusMessage: 'candidatureId requis.' })
  }

  let paiement = await prisma.paiement.findUnique({
    where: { candidatureId },
    include: { candidature: { select: { userId: true, status: true } } },
  })

  if (!paiement) {
    return { found: false, status: null, candidatureStatus: null }
  }

  if (paiement.userId !== user.id && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Ce dossier ne vous appartient pas.' })
  }

  if (shouldSync && paiement.status === 'EN_ATTENTE') {
    await syncPaytechPaymentIfPending(paiement.id)
    paiement = await prisma.paiement.findUnique({
      where: { candidatureId },
      include: { candidature: { select: { userId: true, status: true } } },
    })
    if (!paiement) {
      return { found: false, status: null, candidatureStatus: null }
    }
  }

  return {
    found: true,
    status: paiement.status,
    candidatureStatus: paiement.candidature?.status ?? null,
  }
})
