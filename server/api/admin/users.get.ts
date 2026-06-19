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
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      identityCardRectoUrl: true,
      identityCardVersoUrl: true,
      createdAt: true,
      partner: { select: { name: true } },
      _count: { select: { candidatures: true, paiements: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    address: u.address,
    partnerName: u.partner?.name ?? null,
    candidaturesCount: u._count.candidatures,
    paiementsCount: u._count.paiements,
    hasIdentity: Boolean(u.identityCardRectoUrl && u.identityCardVersoUrl),
    profileComplete: Boolean(
      u.firstName && u.lastName && u.phone && u.address && u.identityCardRectoUrl && u.identityCardVersoUrl
    ),
    createdAt: u.createdAt.toISOString(),
  }))
})
