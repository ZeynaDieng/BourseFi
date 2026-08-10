import { computeScholarshipEconomy } from '../../app/utils/scholarship-math'

type TarifItem = {
  id: string
  anneeAcademique: string
  montant: number
  frequence: string
  devise: string
  label: string | null
  isDefault: boolean
  isVerified: boolean
  status: string
}

type ContactItem = {
  id: string
  type: string
  valeur: string
  label: string | null
  isPrincipal: boolean
  isWhatsapp: boolean
  status: string
  source: string | null
  isActive: boolean
}

type BourseRow = {
  id: string
  slug: string
  titre: string
  programmeId: string
  partnerId: string
  coveragePercent: number
  montantMax: number | null
  quota: number
  placesRestantes: number
  dateLimite: Date
  conditions: string | null
  documentsRequis: string | null
  isActive: boolean
  status: string
  programme: {
    slug: string
    titre: string
    ville: string
    duree: string
    niveau: string
    placement: string | null
    description: string
    eligibilite: string | null
    brochureUrl: string | null
    perspectives: string | null
    fraisDossier: number
    fraisDossierEtranger: number | null
    devise: string
    status: string
    tarifs?: TarifItem[]
    etablissement: {
      slug: string
      nom: string
      logoUrl: string | null
      coverImageUrl: string | null
      site: string | null
      phone: string | null
      phoneSecondary: string | null
      whatsapp: string | null
      email: string | null
      contactStatus: string
      contactVerifiedAt: Date | null
      status: string
      contacts?: ContactItem[]
    }
  }
  partner: { name: string; slug: string; logoUrl: string | null }
}

export function serializeBourse(b: BourseRow) {
  // Sélectionner le tarif par défaut / actif le plus récent
  const activeTarifs = (b.programme.tarifs || []).filter((t) => t.status === 'ACTIVE')
  const currentTarif = activeTarifs.find((t) => t.isDefault) || activeTarifs[0] || null

  const economy = computeScholarshipEconomy(
    b.programme.fraisDossier,
    b.coveragePercent,
    currentTarif ? currentTarif.montant : null,
    currentTarif ? currentTarif.anneeAcademique : null,
    b.montantMax,
    b.programme.devise,
  )

  const etab = b.programme.etablissement

  return {
    id: b.id,
    slug: b.slug,
    titre: b.titre,
    programmeId: b.programmeId,
    partnerId: b.partnerId,
    programmeSlug: b.programme.slug,
    programmeTitre: b.programme.titre,
    etablissement: etab.nom,
    etablissementSlug: etab.slug,
    etablissementLogoUrl: etab.logoUrl,
    etablissementCoverImageUrl: etab.coverImageUrl,
    etablissementPhone: etab.phone,
    etablissementPhoneSecondary: etab.phoneSecondary,
    etablissementWhatsapp: etab.whatsapp,
    etablissementEmail: etab.email,
    etablissementSite: etab.site,
    etablissementContactStatus: etab.contactStatus,
    etablissementContactVerifiedAt: etab.contactVerifiedAt ? etab.contactVerifiedAt.toISOString() : null,
    etablissementContacts: (etab.contacts || []).filter((c) => c.isActive),
    partnerName: b.partner.name,
    partnerSlug: b.partner.slug,
    partnerLogoUrl: b.partner.logoUrl,
    ville: b.programme.ville,
    programmeNiveau: b.programme.niveau,
    programmeDuree: b.programme.duree,
    programmeDescription: b.programme.description,
    programmePlacement: b.programme.placement,
    programmePerspectives: b.programme.perspectives,
    programmeEligibilite: b.programme.eligibilite,
    programmeBrochureUrl: b.programme.brochureUrl,
    coveragePercent: b.coveragePercent,
    montantMax: b.montantMax,
    hasTuitionFee: economy.hasTuitionFee,
    tuitionFee: economy.tuitionFee,
    anneeAcademique: economy.anneeAcademique,
    montantBourse: economy.montantBourse,
    resteACharge: economy.resteACharge,
    fraisDossier: b.programme.fraisDossier,
    fraisDossierEtranger: b.programme.fraisDossierEtranger ?? b.programme.fraisDossier,
    devise: b.programme.devise,
    quota: b.quota,
    dateLimite: b.dateLimite.toISOString(),
    conditions: b.conditions,
    documentsRequis: b.documentsRequis,
    isActive: b.isActive && b.status === 'ACTIVE' && b.programme.status === 'ACTIVE' && etab.status === 'ACTIVE',
    status: b.status,
    tarifs: activeTarifs,
  }
}

export const bourseInclude = {
  programme: {
    include: {
      etablissement: {
        include: {
          contacts: {
            where: { isActive: true },
          },
        },
      },
      tarifs: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
    },
  },
  partner: true,
} as const
