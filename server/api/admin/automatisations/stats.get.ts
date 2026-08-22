import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Logs aujourd'hui
  const logsToday = await prisma.autoRelanceLog.findMany({
    where: { sentAt: { gte: startOfDay } },
  })

  // Logs ce mois-ci
  const logsMonth = await prisma.autoRelanceLog.findMany({
    where: { sentAt: { gte: startOfMonth } },
  })

  // Calculations Aujourd'hui
  const relancesToday = logsToday.length
  const whatsappToday = logsToday.filter((l) => l.channel === 'WHATSAPP' || l.channel === 'BOTH').length
  const emailsToday = logsToday.filter((l) => l.channel === 'EMAIL' || l.channel === 'BOTH').length
  const convertedTodayLogs = logsToday.filter((l) => l.status === 'CONVERTED')
  const paiementsRecuperesToday = convertedTodayLogs.length
  const revenusRecuperesToday = convertedTodayLogs.reduce((acc, curr) => acc + (curr.recoveredAmount || 20000), 0)
  const conversionRateToday = relancesToday > 0 ? Math.round((paiementsRecuperesToday / relancesToday) * 100) : 0

  // Calculations Ce Mois
  const relancesMonth = logsMonth.length
  const convertedMonthLogs = logsMonth.filter((l) => l.status === 'CONVERTED')
  const paiementsRecuperesMonth = convertedMonthLogs.length
  const revenusRecuperesMonth = convertedMonthLogs.reduce((acc, curr) => acc + (curr.recoveredAmount || 20000), 0)
  const conversionRateMonth = relancesMonth > 0 ? Math.round((paiementsRecuperesMonth / relancesMonth) * 100) : 0
  const hoursSavedEstimate = Math.round((relancesMonth * 4) / 60) // 4 min saved per automated relance

  // Statistiques du jour globales (Rapport quotidien)
  const newCandidaturesToday = await prisma.candidature.count({
    where: { createdAt: { gte: startOfDay } },
  })

  const paiementsValidatedToday = await prisma.paiement.findMany({
    where: { createdAt: { gte: startOfDay }, status: 'SUCCESS' },
  })
  const montantEncaisseToday = paiementsValidatedToday.reduce((acc, curr) => acc + curr.amount, 0)

  return {
    ok: true,
    today: {
      relancesSent: relancesToday,
      whatsappSent: whatsappToday,
      emailsSent: emailsToday,
      paiementsRecuperes: paiementsRecuperesToday,
      revenusRecuperes: revenusRecuperesToday,
      conversionRate: conversionRateToday,
      newCandidatures: newCandidaturesToday,
      paiementsValidated: paiementsValidatedToday.length,
      montantEncaisse: montantEncaisseToday,
    },
    month: {
      relancesSent: relancesMonth,
      paiementsRecuperes: paiementsRecuperesMonth,
      revenusRecuperes: revenusRecuperesMonth,
      conversionRate: conversionRateMonth,
      hoursSaved: hoursSavedEstimate,
    },
  }
})
