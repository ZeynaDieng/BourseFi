import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const candidatures = await prisma.candidature.findMany({
    where: {
      status: { in: ['EN_ATTENTE_PAIEMENT', 'SOUMIS'] },
      paiement: null,
      isLost: false,
    },
    orderBy: [{ interestLevel: 'asc' }, { createdAt: 'desc' }],
    take: 30,
    include: {
      programme: {
        select: {
          titre: true,
          fraisDossier: true,
          devise: true,
          etablissement: { select: { nom: true, fraisDossier: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, phone: true } },
      crmNotes: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  const scored = candidatures.map((c) => {
    const frais = c.montantFinal ?? c.programme.fraisDossier ?? c.programme.etablissement?.fraisDossier ?? 20000
    const lastActivity = c.crmNotes[0]?.createdAt || c.lastRelanceAt || c.createdAt

    let priorityGroup: 'HIGH' | 'MED' | 'LOW' = 'MED'
    let score = c.conversionScore || 75
    let reason = 'Dossier en attente'

    if (c.interestLevel === 'HOT_HIGH' || c.relanceCount > 0) {
      priorityGroup = 'HIGH'
      score = Math.min(95, score + 15)
      reason = 'Initiation paiement / Intérêt élevé 🔥'
    } else if (c.interestLevel === 'HOT_MED' || c.interestLevel === 'WARM') {
      priorityGroup = 'MED'
      score = 75
      reason = 'Dossier complet, attente retour'
    } else if (c.interestLevel === 'COLD' || c.interestLevel === 'NOT_INTERESTED') {
      priorityGroup = 'LOW'
      score = 35
      reason = 'Aucun accès depuis plusieurs jours'
    }

    return {
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone || c.user.phone || '',
      ecole: c.programme.etablissement.nom,
      formation: c.programme.titre,
      montantRestant: frais,
      devise: c.programme.devise || 'FCFA',
      lastActivity,
      conversionProbability: score,
      priorityGroup,
      priorityReason: reason,
      interestLevel: c.interestLevel || 'HOT_MED',
      blockingReason: c.blockingReason,
    }
  })

  // Trier par probabilité de conversion décroissante
  scored.sort((a, b) => b.conversionProbability - a.conversionProbability)

  return { ok: true, candidates: scored }
})
