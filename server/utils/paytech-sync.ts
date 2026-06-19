import { prisma } from './prisma'
import { finalizePaiement } from './paiement-finalize'
import { getPaymentStatus, isPaytechConfigured } from './paytech'

/**
 * Synchronise un paiement local avec PayTech (get-status) si encore en attente.
 * Idempotent : ne modifie rien si déjà validé ou annulé.
 */
export async function syncPaytechPaymentIfPending(paiementId: string): Promise<{
  synced: boolean
  status: string
}> {
  const paiement = await prisma.paiement.findUnique({ where: { id: paiementId } })
  if (!paiement) {
    throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable.' })
  }

  if (paiement.status === 'Valide' || paiement.status === 'Annule' || paiement.status === 'Echec') {
    return { synced: false, status: paiement.status }
  }

  if (!isPaytechConfigured() || !paiement.token) {
    return { synced: false, status: paiement.status }
  }

  const remote = await getPaymentStatus(paiement.token)

  if (remote.isComplete) {
    await finalizePaiement(paiement.id, {
      method: remote.paymentMethod || paiement.method,
      token: paiement.token,
      actorRole: 'SYSTEM',
    })
    return { synced: true, status: 'Valide' }
  }

  if (remote.isCanceled) {
    await prisma.paiement.update({ where: { id: paiement.id }, data: { status: 'Annule' } })
    return { synced: true, status: 'Annule' }
  }

  return { synced: false, status: paiement.status }
}
