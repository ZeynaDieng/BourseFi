import { prisma } from '../../utils/prisma'
import { bourseInclude, serializeBourse } from '../../utils/bourse-serialize'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const rows = await prisma.bourse.findMany({
    include: {
      ...bourseInclude,
      _count: { select: { candidatures: true } },
    },
    orderBy: [{ dateLimite: 'asc' }, { titre: 'asc' }],
  })

  return rows.map((b) => ({
    ...serializeBourse(b),
    candidaturesCount: b._count.candidatures,
  }))
})
