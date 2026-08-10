import { createError, getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID contact manquant.' })

  // Soft-deactivation non-destructive pour préserver l'historique
  const updated = await prisma.etablissementContact.update({
    where: { id },
    data: { isActive: false },
  })

  return { ok: true, contact: updated }
})
