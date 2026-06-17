import { createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

import { assertPartnerPortalEnabled } from '../../utils/product-config'

export default defineEventHandler(async (event) => {
  assertPartnerPortalEnabled()
  const user = await requireRole(event, ['PARTNER'])
  if (!user.partnerId) {
    throw createError({ statusCode: 403, statusMessage: 'Compte partenaire non rattaché.' })
  }

  const partnerId = user.partnerId
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    candidaturesTotal,
    candidaturesMonth,
    candidaturesWeek,
    boursesActives,
    paiements,
    acceptees,
    enRevue,
    complementDemande,
    acceptesSansDoc,
  ] = await Promise.all([
    prisma.candidature.count({ where: { partnerId } }),
    prisma.candidature.count({
      where: { partnerId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.candidature.count({
      where: { partnerId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.bourse.count({ where: { partnerId, isActive: true } }),
    prisma.paiement.aggregate({
      where: { candidature: { partnerId } },
      _sum: { amountPartner: true },
      _count: true,
    }),
    prisma.candidature.count({
      where: { partnerId, status: { in: ['ACCEPTE', 'DOCUMENT_EMIS', 'TERMINE'] } },
    }),
    prisma.candidature.count({
      where: { partnerId, status: 'EN_REVUE_PARTENAIRE' },
    }),
    prisma.candidature.count({
      where: { partnerId, status: 'COMPLEMENT_DEMANDE' },
    }),
    prisma.candidature.count({
      where: { partnerId, status: 'ACCEPTE', documentUrl: null },
    }),
  ])

  const pendingCount = enRevue + complementDemande + acceptesSansDoc
  const tauxAcceptation =
    candidaturesTotal > 0 ? Math.round((acceptees / candidaturesTotal) * 100) : null

  return {
    candidaturesTotal,
    candidaturesMonth,
    candidaturesWeek,
    boursesActives,
    paiementsCount: paiements._count,
    montantRecu: paiements._sum.amountPartner ?? 0,
    dossiersAcceptes: acceptees,
    pendingCount,
    tauxAcceptation,
    statusBreakdown: {
      enRevue,
      complementDemande,
      acceptesSansDoc,
    },
  }
})
