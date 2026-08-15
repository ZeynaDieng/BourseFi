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
  })

  if (!etablissement) {
    throw createError({ statusCode: 404, statusMessage: 'Établissement introuvable.' })
  }

  const candidatures = await prisma.candidature.findMany({
    where: {
      programme: {
        etablissementId: etablissementId,
      },
    },
    include: {
      programme: {
        include: { tarifs: true }
      },
      paiement: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Format CSV
  const filename = `orientations_${etablissement.slug}_${new Date().toISOString().slice(0, 10)}.csv`

  setResponseHeaders(event, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
  })

  // BOM pour compatibilité Excel FR
  const bom = '\uFEFF'
  const headers = [
    'N° Attestation',
    'Date Orientation',
    'Nom & Prénom',
    'Email',
    'Téléphone',
    'Formation',
    'Niveau',
    'Statut Dossier',
    'Frais Dossier Payés (FCFA)',
    'Commission Dûe (FCFA)'
  ].join(';')

  const rows = candidatures.map((c) => {
    const attNum = c.attestationNumber || 'N/A'
    const dateStr = new Date(c.createdAt).toLocaleDateString('fr-FR')
    const fullName = (c.fullName || `${c.firstName} ${c.lastName}`).replace(/;/g, ',')
    const email = c.email
    const phone = c.phone || c.user?.phone || 'N/A'
    const formation = c.programme.titre.replace(/;/g, ',')
    const niveau = c.programme.niveau
    const status = c.status
    const paidAmount = c.paiement?.amount || 0

    let comm = c.commissionAmount || 0
    if (!comm && etablissement.commissionValue > 0) {
      if (etablissement.commissionType === 'PERCENTAGE') {
        const tuition = c.programme.tarifs?.[0]?.montant || 0
        comm = Math.round(tuition * (etablissement.commissionValue / 100))
      } else {
        comm = etablissement.commissionValue
      }
    }

    return [
      `"${attNum}"`,
      `"${dateStr}"`,
      `"${fullName}"`,
      `"${email}"`,
      `"${phone}"`,
      `"${formation}"`,
      `"${niveau}"`,
      `"${status}"`,
      paidAmount,
      comm
    ].join(';')
  })

  const csvContent = bom + headers + '\n' + rows.join('\n')
  return csvContent
})
