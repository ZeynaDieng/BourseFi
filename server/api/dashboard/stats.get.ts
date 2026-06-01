import { requireRole } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN', 'PARTNER'])

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  if (user.role === 'ADMIN') {
    const [
      candidatures,
      paiementsValides,
      enRevue,
      candidaturesThisWeek,
      candidaturesThisMonth,
      candidaturesPrevMonth,
      programmesCount,
      ecolesCount,
      partenairesCount
    ] = await Promise.all([
      prisma.candidature.count(),
      prisma.paiement.count({ where: { status: 'Valide' } }),
      prisma.candidature.count({
        where: {
          status: { in: ['EN_REVUE_PARTENAIRE', 'COMPLEMENT_DEMANDE', 'ACCEPTE'] }
        }
      }),
      prisma.candidature.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.candidature.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.candidature.count({
        where: { createdAt: { gte: prevMonthStart, lt: monthStart } }
      }),
      prisma.programme.count(),
      prisma.etablissement.count(),
      prisma.partner.count()
    ])

    const conversion =
      candidatures === 0 ? 0 : Number(((paiementsValides / candidatures) * 100).toFixed(1))

    let momentumVsPrevMonth: number | null = null
    if (candidaturesPrevMonth > 0) {
      momentumVsPrevMonth = Math.round(
        ((candidaturesThisMonth - candidaturesPrevMonth) / candidaturesPrevMonth) * 100
      )
    }

    return {
      candidatures,
      candidaturesThisWeek,
      candidaturesThisMonth,
      conversion,
      enRevue,
      programmesCount,
      ecolesCount,
      partenairesCount,
      momentumVsPrevMonth
    }
  }

  const candidatureWhere =
    user.role === 'STUDENT'
      ? { userId: user.id }
      : user.partnerId
        ? { partnerId: user.partnerId }
        : undefined

  if (user.role === 'PARTNER' && !user.partnerId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Compte partenaire sans structure liee.'
    })
  }

  const paiementWhere = user.role === 'STUDENT' ? { userId: user.id } : undefined

  const totalCandidatures = await prisma.candidature.count({ where: candidatureWhere })
  const paiementsValides = await prisma.paiement.count({
    where: { ...(paiementWhere || {}), status: 'Valide' }
  })
  const enRevue = await prisma.candidature.count({
    where: {
      ...(candidatureWhere || {}),
      status: { in: ['EN_REVUE_PARTENAIRE', 'COMPLEMENT_DEMANDE', 'ACCEPTE'] }
    }
  })
  const candidaturesThisWeek = await prisma.candidature.count({
    where: { ...(candidatureWhere || {}), createdAt: { gte: weekAgo } }
  })

  const conversion =
    totalCandidatures === 0 ? 0 : Number(((paiementsValides / totalCandidatures) * 100).toFixed(1))

  return {
    candidatures: totalCandidatures,
    candidaturesThisWeek,
    conversion,
    enRevue
  }
})
