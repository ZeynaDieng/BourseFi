import { requireRole } from '../utils/auth'
import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN', 'PARTNER'])

  if (user.role === 'STUDENT') {
    return prisma.paiement.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
  }

  return prisma.paiement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200
  })
})
