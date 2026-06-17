import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      partner: { select: { name: true } },
      _count: { select: { candidatures: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    partnerName: u.partner?.name ?? null,
    candidaturesCount: u._count.candidatures,
    createdAt: u.createdAt.toISOString(),
  }))
})
