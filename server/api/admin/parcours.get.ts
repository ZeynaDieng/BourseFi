import { Prisma } from '@prisma/client'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

const PERIODES = [7, 30, 90] as const

/**
 * Parcours des étudiants inscrits sur la période : combien atteignent chaque étape,
 * de la création du compte au paiement. Sert à repérer où ils abandonnent.
 */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const asked = Number(getQuery(event).jours)
  const jours = (PERIODES as readonly number[]).includes(asked) ? asked : 30
  const since = new Date(Date.now() - jours * 24 * 60 * 60 * 1000)

  const cohort: Prisma.UserWhereInput = { role: 'STUDENT', createdAt: { gte: since } }
  const [comptes, verifies, commences, envoyees, payees, blocages] = await Promise.all([
    prisma.user.count({ where: cohort }),
    prisma.user.count({ where: { ...cohort, emailVerified: true } }),
    prisma.user.count({
      where: { ...cohort, OR: [{ applicationDraft: { not: Prisma.DbNull } }, { candidatures: { some: {} } }] },
    }),
    prisma.user.count({ where: { ...cohort, candidatures: { some: {} } } }),
    prisma.user.count({ where: { ...cohort, candidatures: { some: { paiement: { status: 'Valide' } } } } }),
    // Motifs donnés par les étudiants eux-mêmes (« Je ne peux pas payer maintenant »)
    prisma.candidatureNote.groupBy({
      by: ['blockingReason'],
      where: { agentName: 'Étudiant (page de paiement)', createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ])

  return {
    ok: true,
    jours,
    etapes: [
      { key: 'comptes', label: 'Comptes créés', count: comptes },
      { key: 'verifies', label: 'Email vérifié', count: verifies },
      { key: 'commences', label: 'Candidature commencée', count: commences },
      { key: 'envoyees', label: 'Candidature envoyée', count: envoyees },
      { key: 'payees', label: 'Paiement validé', count: payees },
    ],
    blocages: blocages
      .filter((b) => b.blockingReason)
      .map((b) => ({ reason: b.blockingReason!, count: b._count._all })),
  }
})
