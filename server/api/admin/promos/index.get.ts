import { requireRole } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return promos
})
