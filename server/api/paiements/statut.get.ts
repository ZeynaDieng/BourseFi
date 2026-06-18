import { requireRole } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

/**
 * Renvoie le statut du paiement d'une candidature, pour la page de retour
 * qui attend la confirmation IPN après redirection depuis PayTech.
 */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN'])
  const query = getQuery(event)
  const candidatureId = typeof query.candidatureId === 'string' ? query.candidatureId : ''

  if (!candidatureId) {
    throw createError({ statusCode: 400, statusMessage: 'candidatureId requis.' })
  }

  const paiement = await prisma.paiement.findUnique({
    where: { candidatureId },
    include: { candidature: { select: { userId: true, status: true } } }
  })

  if (!paiement) {
    return { found: false, status: null, candidatureStatus: null }
  }

  if (paiement.userId !== user.id && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Ce dossier ne vous appartient pas.' })
  }

  return {
    found: true,
    status: paiement.status,
    candidatureStatus: paiement.candidature?.status ?? null
  }
})
