import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  return prisma.metierPage.findMany({ orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }] })
})
