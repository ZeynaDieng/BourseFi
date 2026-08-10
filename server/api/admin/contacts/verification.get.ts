import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const query = getQuery(event)
  const statusFilter = typeof query.status === 'string' ? query.status : undefined

  const etabs = await prisma.etablissement.findMany({
    where: {
      ...(statusFilter ? { contactStatus: statusFilter as any } : {}),
    },
    include: {
      contacts: {
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { programmes: true } },
    },
    orderBy: [{ contactStatus: 'desc' }, { nom: 'asc' }],
  })

  return etabs
})
