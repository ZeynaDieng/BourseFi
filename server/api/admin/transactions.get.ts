import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const rows = await prisma.paiement.findMany({
    include: {
      user: { select: { name: true, email: true } },
      candidature: {
        select: {
          targetProgram: true,
          partner: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const totals = await prisma.paiement.aggregate({
    _sum: { amount: true, amountPartner: true, amountPlatform: true },
    _count: true,
  })

  return {
    totals: {
      count: totals._count,
      amount: totals._sum.amount ?? 0,
      amountPartner: totals._sum.amountPartner ?? 0,
      amountPlatform: totals._sum.amountPlatform ?? 0,
    },
    items: rows.map((p) => ({
      id: p.id,
      fullName: p.fullName,
      email: p.email,
      amount: p.amount,
      amountPartner: p.amountPartner,
      amountPlatform: p.amountPlatform,
      currency: p.currency,
      method: p.method,
      status: p.status,
      programme: p.candidature?.targetProgram ?? null,
      partnerName: p.candidature?.partner?.name ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  }
})
