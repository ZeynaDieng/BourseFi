import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const etablissements = await prisma.etablissement.findMany({
    where: { isDirectPartner: true },
    include: {
      contacts: { where: { isActive: true } },
      programmes: {
        select: {
          id: true,
          status: true,
          tarifs: { where: { status: 'ACTIVE' }, select: { montant: true } },
          _count: { select: { candidatures: true } }
        }
      }
    },
    orderBy: { nom: 'asc' }
  })

  // Récupérer toutes les candidatures pour les écoles partenaires directes
  const candidatures = await prisma.candidature.findMany({
    where: {
      programme: {
        etablissement: { isDirectPartner: true }
      }
    },
    include: {
      programme: { select: { etablissementId: true, tarifs: true } },
      paiement: true
    }
  })

  return etablissements.map((e) => {
    const schoolCandidatures = candidatures.filter(c => c.programme.etablissementId === e.id)
    
    // Candidatures orientées / validées
    const orientedStudents = schoolCandidatures.filter(c =>
      ['VALIDE', 'PAYE', 'EN_REVUE_PARTENAIRE', 'SOUMIS'].includes(c.status) || Boolean(c.paiement && c.paiement.status === 'Valide')
    )

    const totalOriented = orientedStudents.length

    // Calcul de la commission par candidature
    const getComm = (c: typeof candidatures[0]) => {
      if (c.commissionAmount && c.commissionAmount > 0) return c.commissionAmount
      if (e.commissionValue > 0) {
        if (e.commissionType === 'PERCENTAGE') {
          const tuition = c.programme.tarifs?.[0]?.montant || 0
          return Math.round(tuition * (e.commissionValue / 100))
        }
        return e.commissionValue
      }
      return 0
    }

    const totalCommissionsDues = orientedStudents.reduce((acc, c) => acc + getComm(c), 0)
    const totalCommissionsPayees = orientedStudents.reduce((acc, c) => {
      if (c.commissionStatus === 'VALIDE') return acc + getComm(c)
      return acc
    }, 0)

    const soldeRestantDu = totalCommissionsDues - totalCommissionsPayees

    return {
      id: e.id,
      slug: e.slug,
      nom: e.nom,
      ville: e.ville,
      logoUrl: e.logoUrl,
      coverImageUrl: e.coverImageUrl,
      phone: e.phone || e.contacts[0]?.valeur || null,
      email: e.email,
      site: e.site,
      status: e.status,
      isDirectPartner: e.isDirectPartner,
      commissionType: e.commissionType || 'FIXED_AMOUNT',
      commissionValue: e.commissionValue || 0,
      commissionPaidStatus: e.commissionPaidStatus || 'PENDING',
      programmesCount: e.programmes.length,
      activeProgrammesCount: e.programmes.filter(p => p.status === 'ACTIVE').length,
      totalOriented,
      totalCommissionsDues,
      totalCommissionsPayees,
      soldeRestantDu
    }
  })
})
