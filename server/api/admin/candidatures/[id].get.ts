import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { statusLabel } from '../../../utils/candidature-status'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  const c = await prisma.candidature.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      programme: {
        include: {
          etablissement: { select: { nom: true, slug: true } },
          partner: { select: { name: true, slug: true } },
        },
      },
      partner: { select: { id: true, name: true, slug: true } },
      bourse: { select: { titre: true, slug: true } },
      paiement: {
        select: {
          id: true,
          amount: true,
          status: true,
          method: true,
          refCommand: true,
          createdAt: true,
        },
      },
      crmNotes: {
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
      },
    },
  })

  if (!c) {
    throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })
  }

  return {
    id: c.id,
    userId: c.userId,
    firstName: c.firstName,
    lastName: c.lastName,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    address: c.address,
    institution: c.institution,
    field: c.field,
    level: c.level,
    lastEducationLevel: c.lastEducationLevel,
    lastDiploma: c.lastDiploma,
    graduationDate: c.graduationDate,
    gpa: c.gpa,
    targetProgram: c.targetProgram,
    status: c.status,
    statusLabel: statusLabel(c.status),
    attestationNumber: c.attestationNumber,
    documentUrl: c.documentUrl,
    documentIssuedAt: c.documentIssuedAt?.toISOString() ?? null,
    identityCardRectoUrl: c.identityCardRectoUrl,
    identityCardVersoUrl: c.identityCardVersoUrl,
    createdAt: c.createdAt.toISOString(),
    montantInitial: c.montantInitial,
    montantReduction: c.montantReduction,
    montantFinal: c.montantFinal,
    interestLevel: c.interestLevel ?? 'HOT_MED',
    blockingReason: c.blockingReason ?? null,
    relanceCount: c.relanceCount ?? 0,
    lastRelanceAt: c.lastRelanceAt?.toISOString() ?? null,
    lastChannelUsed: c.lastChannelUsed ?? null,
    nextRelanceAt: c.nextRelanceAt?.toISOString() ?? null,
    conversionScore: c.conversionScore ?? 75,
    crmNotes: c.crmNotes || [],
    programme: {
      titre: c.programme.titre,
      slug: c.programme.slug,
      ville: c.programme.ville,
      fraisDossier: c.programme.fraisDossier,
      devise: c.programme.devise,
      etablissement: c.programme.etablissement,
    },
    partner: c.partner,
    bourse: c.bourse,
    user: c.user,
    paiement: c.paiement
      ? {
          id: c.paiement.id,
          amount: c.paiement.amount,
          status: c.paiement.status,
          method: c.paiement.method,
          refCommand: c.paiement.refCommand,
          createdAt: c.paiement.createdAt.toISOString(),
        }
      : null,
  }
})
