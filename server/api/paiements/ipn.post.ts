import { prisma } from '../../utils/prisma'
import { verifyIpn } from '../../utils/paytech'
import { finalizePaiement } from '../../utils/paiement-finalize'

/**
 * Endpoint public appelé par PayTech (Instant Payment Notification).
 * Aucune authentification cookie : la légitimité est vérifiée via HMAC/SHA256.
 */
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Record<string, unknown>

  const refCommand = typeof body.ref_command === 'string' ? body.ref_command : ''
  const typeEvent = typeof body.type_event === 'string' ? body.type_event : ''
  const paymentMethod = typeof body.payment_method === 'string' ? body.payment_method : undefined
  const token = typeof body.token === 'string' ? body.token : undefined

  console.log('[paytech][ipn] reçu', { refCommand, typeEvent, paymentMethod })

  if (!verifyIpn(body)) {
    console.warn('[paytech][ipn] signature invalide -> rejet', { refCommand })
    setResponseStatus(event, 403)
    return 'IPN KO'
  }

  if (!refCommand) {
    console.warn('[paytech][ipn] ref_command manquant')
    return 'OK'
  }

  const paiement = await prisma.paiement.findUnique({ where: { refCommand } })
  if (!paiement) {
    console.warn('[paytech][ipn] paiement introuvable', { refCommand })
    return 'OK'
  }

  if (typeEvent === 'sale_complete') {
    console.log('[paytech][ipn] sale_complete -> finalisation', { refCommand, paiementId: paiement.id })
    await finalizePaiement(paiement.id, {
      method: paymentMethod || paiement.method,
      token,
      actorRole: 'SYSTEM'
    })
  } else if (typeEvent === 'sale_canceled') {
    console.log('[paytech][ipn] sale_canceled -> annulation', { refCommand, paiementId: paiement.id })
    if (paiement.status !== 'Valide') {
      await prisma.paiement.update({ where: { id: paiement.id }, data: { status: 'Annule' } })
    }
  } else {
    console.log('[paytech][ipn] type_event ignoré', { refCommand, typeEvent })
  }

  return 'OK'
})
