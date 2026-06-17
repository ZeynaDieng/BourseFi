import { prisma } from '../utils/prisma'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  })

  return { items: rows, unreadCount }
})
