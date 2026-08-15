import { requireRole } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const candidatures = await prisma.candidature.findMany({
    where: {
      OR: [
        { status: { in: ['ACCEPTE', 'DOCUMENT_EMIS', 'TERMINE', 'EN_REVUE_PARTENAIRE', 'SOUMIS'] } },
        { paiement: { status: 'Valide' } }
      ]
    },
    include: {
      programme: {
        include: {
          etablissement: {
            select: { id: true, nom: true, slug: true, isDirectPartner: true, commissionValue: true, commissionType: true }
          },
          partner: { select: { id: true, name: true, slug: true } }
        }
      },
      paiement: true,
      user: { select: { name: true, email: true, phone: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 300
  })

  return candidatures.map((c) => {
    let comm = c.commissionAmount || 0
    if (!comm) {
      const etab = c.programme.etablissement
      if (etab.isDirectPartner) {
        comm = etab.commissionValue || c.paiement?.amount || 0
      } else {
        comm = c.paiement?.amountPlatform || 5000
      }
    }

    return {
      id: c.id,
      studentName: c.fullName || `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phone || c.user?.phone || 'N/A',
      schoolId: c.programme.etablissement.id,
      schoolName: c.programme.etablissement.nom,
      isDirectPartner: c.programme.etablissement.isDirectPartner,
      programmeTitre: c.programme.titre,
      attestationNumber: c.attestationNumber || null,
      fraisDossierPayes: c.paiement?.amount || 0,
      commissionAmount: comm,
      commissionStatus: c.commissionStatus || 'EN_ATTENTE',
      commissionPaidAt: c.commissionPaidAt?.toISOString() || null,
      commissionRef: c.commissionRef || null,
      commissionNotes: c.commissionNotes || null,
      createdAt: c.createdAt.toISOString()
    }
  })
})
