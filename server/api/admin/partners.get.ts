import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const rows = await prisma.partner.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
      contactEmail: true,
      partnerSharePercent: true,
      _count: { select: { programmes: true, users: true } }
    },
    orderBy: { name: 'asc' }
  })
  return rows.map(({ _count, ...rest }) => ({
    ...rest,
    programmesCount: _count.programmes,
    usersCount: _count.users
  }))
})
