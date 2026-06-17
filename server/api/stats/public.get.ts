import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const [
    boursesActives,
    ecoles,
    partenaires,
    candidaturesValidees,
    montantDistribue,
  ] = await Promise.all([
    prisma.bourse.count({ where: { isActive: true } }),
    prisma.etablissement.count(),
    prisma.partner.count(),
    prisma.candidature.count({
      where: {
        status: { in: ['ACCEPTE', 'DOCUMENT_EMIS', 'TERMINE'] },
      },
    }),
    prisma.paiement.aggregate({ _sum: { amountPartner: true } }),
  ])

  const montant = montantDistribue._sum.amountPartner ?? 0

  return {
    boursesActives,
    ecoles,
    partenaires,
    candidaturesValidees,
    montantDistribue: montant,
    heroStats: [
      { value: String(boursesActives), label: 'Bourses disponibles' },
      { value: String(ecoles), label: 'Écoles partenaires' },
      { value: String(partenaires), label: 'Partenaires financeurs' },
      { value: String(candidaturesValidees), label: 'Candidatures validées' },
    ],
    socialProof: {
      montantDistribue: montant,
      dossiersValides: candidaturesValidees,
      etudiantsFinances: candidaturesValidees,
    },
  }
})
