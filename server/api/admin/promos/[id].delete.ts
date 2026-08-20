import { requireRole } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Identifiant requis.' })

  const existing = await prisma.promoCode.findUnique({
    where: { id },
    include: { candidatures: true }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Code promo introuvable.' })
  }

  // Si le code a déjà été utilisé par des candidatures, on le désactive au lieu de le supprimer pour conserver l'historique
  if (existing.candidatures.length > 0) {
    await prisma.promoCode.update({
      where: { id },
      data: { isActive: false }
    })
    return { ok: true, status: 'DEACTIVATED', message: 'Le code promo comportait des candidatures liées et a été désactivé.' }
  }

  await prisma.promoCode.delete({
    where: { id }
  })

  return { ok: true, status: 'DELETED', message: 'Code promo supprimé avec succès.' }
})
