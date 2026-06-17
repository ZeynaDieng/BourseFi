import { requireRole } from '../utils/auth'
import { prisma } from '../utils/prisma'
import { statusLabel } from '../utils/candidature-status'
import type { CandidatureStatus } from '../utils/candidature-types'

const includeRelations = {
  programme: {
    include: {
      etablissement: true,
      partner: true
    }
  },
  partner: true,
  bourse: { select: { slug: true, titre: true } }
} as const

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN', 'PARTNER'])

  if (user.role === 'STUDENT') {
    const list = await prisma.candidature.findMany({
      where: { userId: user.id },
      include: includeRelations,
      orderBy: { createdAt: 'desc' }
    })
    return list.map(formatCandidature)
  }

  if (user.role === 'PARTNER') {
    if (!user.partnerId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Compte partenaire sans structure liee.'
      })
    }
    const list = await prisma.candidature.findMany({
      where: { partnerId: user.partnerId },
      include: includeRelations,
      orderBy: { createdAt: 'desc' }
    })
    return list.map(formatCandidature)
  }

  const list = await prisma.candidature.findMany({
    include: includeRelations,
    orderBy: { createdAt: 'desc' },
    take: 200
  })
  return list.map(formatCandidature)
})

function formatCandidature(raw: {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  address: string
  institution: string
  field: string
  level: string
  lastEducationLevel: string
  lastDiploma: string
  graduationDate: string
  gpa: string
  status: CandidatureStatus
  targetProgram: string
  documentUrl: string | null
  documentIssuedAt: Date | null
  identityCardRectoUrl: string | null
  identityCardVersoUrl: string | null
  createdAt: Date
  programme: {
    titre: string
    slug: string
    ville: string
    fraisDossier: number
    devise: string
    etablissement: { nom: string; slug: string }
    partner: { name: string; slug: string }
  }
  partner: { id: string; name: string; slug: string }
  bourse: { slug: string; titre: string } | null
}) {
  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    fullName: raw.fullName,
    email: raw.email,
    phone: raw.phone,
    address: raw.address,
    institution: raw.institution,
    field: raw.field,
    level: raw.level,
    lastEducationLevel: raw.lastEducationLevel,
    lastDiploma: raw.lastDiploma,
    graduationDate: raw.graduationDate,
    gpa: raw.gpa,
    identityCardRectoUrl: raw.identityCardRectoUrl,
    identityCardVersoUrl: raw.identityCardVersoUrl,
    status: raw.status,
    statusLabel: statusLabel(raw.status),
    targetProgram: raw.targetProgram,
    documentUrl: raw.documentUrl,
    documentIssuedAt: raw.documentIssuedAt,
    createdAt: raw.createdAt,
    programmeSlug: raw.programme.slug,
    programmeTitre: raw.programme.titre,
    bourseSlug: raw.bourse?.slug ?? null,
    bourseTitre: raw.bourse?.titre ?? null,
    programmeVille: raw.programme.ville,
    etablissementNom: raw.programme.etablissement.nom,
    etablissementSlug: raw.programme.etablissement.slug,
    partnerName: raw.partner.name,
    partnerSlug: raw.partner.slug,
    fraisDossier: raw.programme.fraisDossier,
    devise: raw.programme.devise
  }
}
