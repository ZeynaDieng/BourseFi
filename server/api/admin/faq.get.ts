import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  return prisma.faqItem.findMany({ orderBy: { sortOrder: 'asc' } })
})
