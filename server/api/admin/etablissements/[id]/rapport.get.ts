import { requireRole } from '../../../../utils/auth'
import { prisma } from '../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const etablissementId = getRouterParam(event, 'id')
  if (!etablissementId) {
    throw createError({ statusCode: 400, statusMessage: 'ID d\'établissement manquant.' })
  }

  const etablissement = await prisma.etablissement.findUnique({
    where: { id: etablissementId },
    include: {
      programmes: {
        include: {
          tarifs: true,
          _count: {
            select: { candidatures: true },
          },
        },
      },
    },
  })

  if (!etablissement) {
    throw createError({ statusCode: 404, statusMessage: 'Établissement introuvable.' })
  }

  // Récupérer toutes les candidatures de cet établissement
  const candidatures = await prisma.candidature.findMany({
    where: {
      programme: {
        etablissementId: etablissementId,
      },
    },
    include: {
      programme: true,
      paiement: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Statuts considérés comme "orientés / validés"
  const isOriented = (c: typeof candidatures[0]) =>
    ['VALIDE', 'PAYE', 'EN_REVUE_PARTENAIRE', 'SOUMIS'].includes(c.status) || Boolean(c.paiement && c.paiement.status === 'Valide')

  const orientedStudents = candidatures.filter(isOriented)

  const totalOriented = orientedStudents.length
  const totalPaidCount = candidatures.filter(c => c.paiement && c.paiement.status === 'Valide').length

  // Calcul du montant des frais de dossier collectés
  const totalFraisDossierCollectes = candidatures.reduce((acc, c) => {
    if (c.paiement && c.paiement.status === 'Valide') {
      return acc + (c.paiement.amount || 0)
    }
    return acc
  }, 0)

  // Helper pour calculer la commission d'une candidature
  const getCandidatureCommission = (c: typeof candidatures[0]) => {
    if (c.commissionAmount && c.commissionAmount > 0) return c.commissionAmount
    if (etablissement.commissionValue > 0) {
      if (etablissement.commissionType === 'PERCENTAGE') {
        const tuition = c.programme.tarifs?.[0]?.montant || 0
        return Math.round(tuition * (etablissement.commissionValue / 100))
      }
      return etablissement.commissionValue
    }
    return 0
  }

  // Calcul de la commission totale due par l'école à BourseFi
  const totalCommissionsDues = orientedStudents.reduce((acc, c) => acc + getCandidatureCommission(c), 0)

  const totalCommissionsPayees = orientedStudents.reduce((acc, c) => {
    if (c.commissionStatus === 'VALIDE') return acc + getCandidatureCommission(c)
    return acc
  }, 0)

  const totalCommissionsEnAttente = totalCommissionsDues - totalCommissionsPayees

  // Ventilation par programme / formation
  const programmesBreakdown = etablissement.programmes.map((prog) => {
    const progOriented = orientedStudents.filter((c) => c.programmeId === prog.id)
    const count = progOriented.length
    const tuition = prog.tarifs?.[0]?.montant || null
    let comm = 0

    if (etablissement.commissionValue > 0) {
      if (etablissement.commissionType === 'PERCENTAGE' && tuition) {
        comm = Math.round(tuition * (etablissement.commissionValue / 100)) * count
      } else {
        comm = etablissement.commissionValue * count
      }
    }

    return {
      id: prog.id,
      slug: prog.slug,
      titre: prog.titre,
      niveau: prog.niveau,
      duree: prog.duree,
      tuitionFee: tuition,
      orientedCount: count,
      totalCommission: comm,
    }
  })

  // Liste formatée des étudiants orientés avec traçabilité commission
  const studentList = orientedStudents.map((c) => ({
    id: c.id,
    fullName: c.fullName || `${c.firstName} ${c.lastName}`,
    email: c.email,
    phone: c.phone || c.user?.phone || 'N/A',
    formation: c.programme.titre,
    niveau: c.programme.niveau,
    status: c.status,
    hasPaid: Boolean(c.paiement && c.paiement.status === 'Valide'),
    fraisDossierPayes: c.paiement?.amount || 0,
    attestationNumber: c.attestationNumber || null,
    commissionAmount: getCandidatureCommission(c),
    commissionStatus: c.commissionStatus || 'EN_ATTENTE',
    commissionPaidAt: c.commissionPaidAt ? c.commissionPaidAt.toISOString() : null,
    commissionRef: c.commissionRef || null,
    commissionNotes: c.commissionNotes || null,
    createdAt: c.createdAt,
  }))

  return {
    etablissement: {
      id: etablissement.id,
      nom: etablissement.nom,
      slug: etablissement.slug,
      ville: etablissement.ville,
      logoUrl: etablissement.logoUrl,
      isDirectPartner: etablissement.isDirectPartner,
      fraisDossier: etablissement.fraisDossier,
      autoIssueAttestation: etablissement.autoIssueAttestation,
      commissionType: etablissement.commissionType,
      commissionValue: etablissement.commissionValue,
      commissionPaidStatus: etablissement.commissionPaidStatus,
    },
    metrics: {
      totalOriented,
      totalPaidCount,
      totalFraisDossierCollectes,
      totalCommissionsDues,
      totalCommissionsPayees,
      totalCommissionsEnAttente,
    },
    programmesBreakdown,
    studentList,
  }
})
