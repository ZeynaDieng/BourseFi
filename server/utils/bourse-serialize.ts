import { computeScholarshipEconomy } from '../../app/utils/scholarship-math'

type BourseRow = {
  id: string
  slug: string
  titre: string
  programmeId: string
  coveragePercent: number
  montantMax: number | null
  quota: number
  placesRestantes: number
  dateLimite: Date
  conditions: string | null
  documentsRequis: string | null
  isActive: boolean
  programme: {
    slug: string
    titre: string
    ville: string
    fraisDossier: number
    fraisScolarite: number
    devise: string
    etablissement: { slug: string; nom: string }
  }
  partner: { name: string; slug: string; logoUrl: string | null }
}

export function serializeBourse(b: BourseRow) {
  const economy = computeScholarshipEconomy(
    b.programme.fraisScolarite,
    b.coveragePercent,
    b.montantMax,
    b.programme.devise,
  )

  return {
    id: b.id,
    slug: b.slug,
    titre: b.titre,
    programmeId: b.programmeId,
    programmeSlug: b.programme.slug,
    programmeTitre: b.programme.titre,
    etablissement: b.programme.etablissement.nom,
    etablissementSlug: b.programme.etablissement.slug,
    partnerName: b.partner.name,
    partnerSlug: b.partner.slug,
    partnerLogoUrl: b.partner.logoUrl,
    ville: b.programme.ville,
    coveragePercent: b.coveragePercent,
    montantMax: b.montantMax,
    montantBourse: economy.montantBourse,
    resteACharge: economy.resteACharge,
    fraisScolarite: b.programme.fraisScolarite,
    fraisDossier: b.programme.fraisDossier,
    devise: b.programme.devise,
    quota: b.quota,
    placesRestantes: b.placesRestantes,
    dateLimite: b.dateLimite.toISOString(),
    conditions: b.conditions,
    documentsRequis: b.documentsRequis,
    isActive: b.isActive,
  }
}

export const bourseInclude = {
  programme: {
    include: {
      etablissement: true,
    },
  },
  partner: true,
} as const
