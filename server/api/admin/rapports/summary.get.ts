import { getQuery } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { statusLabel } from '../../../utils/candidature-status'
import type { CandidatureStatus } from '../../../utils/candidature-types'

function periodStart(period: string): Date | null {
  const now = new Date()
  if (period === '7d') return new Date(now.getTime() - 7 * 86400000)
  if (period === '30d') return new Date(now.getTime() - 30 * 86400000)
  if (period === '90d') return new Date(now.getTime() - 90 * 86400000)
  if (period === 'year') return new Date(now.getFullYear(), 0, 1)
  return null
}

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const query = getQuery(event)
  const period = String(query.period || '30d')
  const since = periodStart(period)

  const dateFilter = since ? { createdAt: { gte: since } } : {}

  const [
    dashboard,
    usersByRole,
    statusGroups,
    paiementAgg,
    topProgrammes,
    topPartners,
    monthlyCandidatures,
    monthlyPaiements,
    boursesActives,
  ] = await Promise.all([
    prisma.candidature.count(),
    prisma.user.groupBy({ by: ['role'], _count: true }),
    prisma.candidature.groupBy({ by: ['status'], _count: true, where: dateFilter }),
    prisma.paiement.aggregate({
      where: dateFilter,
      _sum: { amount: true, amountPartner: true, amountPlatform: true },
      _count: true,
    }),
    prisma.candidature.groupBy({
      by: ['programmeId'],
      where: dateFilter,
      _count: true,
      orderBy: { _count: { programmeId: 'desc' } },
      take: 8,
    }),
    prisma.candidature.groupBy({
      by: ['partnerId'],
      where: dateFilter,
      _count: true,
      orderBy: { _count: { partnerId: 'desc' } },
      take: 8,
    }),
    monthlyTrendCandidatures(),
    monthlyTrendPaiements(),
    prisma.bourse.count({ where: { isActive: true } }),
  ])

  const programmeIds = topProgrammes.map((p) => p.programmeId)
  const partnerIds = topPartners.map((p) => p.partnerId)
  const [programmes, partners] = await Promise.all([
    prisma.programme.findMany({
      where: { id: { in: programmeIds } },
      select: { id: true, titre: true, slug: true },
    }),
    prisma.partner.findMany({
      where: { id: { in: partnerIds } },
      select: { id: true, name: true, slug: true },
    }),
  ])

  const progMap = Object.fromEntries(programmes.map((p) => [p.id, p]))
  const partMap = Object.fromEntries(partners.map((p) => [p.id, p]))

  const candidaturesInPeriod = statusGroups.reduce((s, g) => s + g._count, 0)
  const paiementsValides = await prisma.paiement.count({
    where: { ...dateFilter, status: 'Valide' },
  })

  return {
    period,
    generatedAt: new Date().toISOString(),
    overview: {
      candidaturesTotal: dashboard,
      candidaturesInPeriod,
      boursesActives,
      usersTotal: usersByRole.reduce((s, r) => s + r._count, 0),
      conversion:
        candidaturesInPeriod === 0
          ? 0
          : Number(((paiementsValides / candidaturesInPeriod) * 100).toFixed(1)),
    },
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count })),
    candidaturesByStatus: statusGroups.map((g) => ({
      status: g.status,
      label: statusLabel(g.status as CandidatureStatus),
      count: g._count,
    })),
    finances: {
      paiementsCount: paiementAgg._count,
      amountTotal: paiementAgg._sum.amount ?? 0,
      amountPartner: paiementAgg._sum.amountPartner ?? 0,
      amountPlatform: paiementAgg._sum.amountPlatform ?? 0,
    },
    topProgrammes: topProgrammes.map((p) => ({
      programmeId: p.programmeId,
      titre: progMap[p.programmeId]?.titre ?? '—',
      slug: progMap[p.programmeId]?.slug ?? '',
      count: p._count,
    })),
    topPartners: topPartners.map((p) => ({
      partnerId: p.partnerId,
      name: partMap[p.partnerId]?.name ?? '—',
      slug: partMap[p.partnerId]?.slug ?? '',
      count: p._count,
    })),
    trends: {
      candidatures: monthlyCandidatures,
      paiements: monthlyPaiements,
    },
  }
})

async function monthlyTrendCandidatures() {
  const months: { month: string; count: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const count = await prisma.candidature.count({
      where: { createdAt: { gte: start, lt: end } },
    })
    months.push({
      month: start.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      count,
    })
  }
  return months
}

async function monthlyTrendPaiements() {
  const months: { month: string; amount: number; count: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const agg = await prisma.paiement.aggregate({
      where: { createdAt: { gte: start, lt: end }, status: 'Valide' },
      _sum: { amount: true },
      _count: true,
    })
    months.push({
      month: start.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      amount: agg._sum.amount ?? 0,
      count: agg._count,
    })
  }
  return months
}
