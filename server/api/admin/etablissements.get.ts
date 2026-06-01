import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  return prisma.etablissement.findMany({
    include: {
      _count: { select: { programmes: true } }
    },
    orderBy: { nom: 'asc' }
  })
})
