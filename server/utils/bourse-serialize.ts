import { computeScholarshipEconomy } from '../../app/utils/scholarship-math'

type TarifItem = {
  id: string
  anneeAcademique: string
  montant: number
  montantBourse?: number | null
  fraisInscription?: number | null
  mensualite?: number | null
  nombreMois?: number | null
  fraisSoutenance?: number | null
  fraisUniforme?: number | null
  autresFrais?: number | null
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
  dateDebut?: Date | null
  dateLimite: Date
  conditions: string | null
  documentsRequis: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  ogImageUrl?: string | null
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
    objectifs?: string | null
    competences?: string | null
    programmePedagogique?: string | null
    debouches?: string | null
    secteurs?: string | null
    conditionsAdmission?: string | null
    documentsRequis?: string | null
    modalites?: string | null
    stage?: string | null
    examens?: string | null
    poursuiteEtudes?: string | null
    sourceType?: string | null
    sourceUrl?: string | null
    verifiedAt?: Date | null
    metaTitle?: string | null
    metaDescription?: string | null
    ogImageUrl?: string | null
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
      isDirectPartner?: boolean
      fraisDossier?: number
      contacts?: ContactItem[]
    }
  }
  partner: { name: string; slug: string; logoUrl: string | null }
}

export function serializeBourse(b: BourseRow) {
  // Sélectionner le tarif par défaut / actif le plus récent
  const activeTarifs = (b.programme.tarifs || []).filter((t) => t.status === 'ACTIVE')
  const currentTarif = activeTarifs.find((t) => t.isDefault) || activeTarifs[0] || null

  const etab = b.programme.etablissement

  const effectiveFraisDossier =
    b.programme.fraisDossier !== undefined && b.programme.fraisDossier !== null
      ? b.programme.fraisDossier
      : (etab.fraisDossier ?? 20000)

  const economy = computeScholarshipEconomy(
    effectiveFraisDossier,
    b.coveragePercent,
    currentTarif ? currentTarif.montant : null,
    currentTarif ? currentTarif.anneeAcademique : null,
    currentTarif ? currentTarif.montantBourse : b.montantMax,
    b.programme.devise,
  )

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
    isDirectPartner: etab.isDirectPartner ?? false,
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
    programmeObjectifs: b.programme.objectifs,
    programmeCompetences: b.programme.competences,
    programmePedagogique: b.programme.programmePedagogique,
    programmeDebouches: b.programme.debouches,
    programmeSecteurs: b.programme.secteurs,
    programmeConditionsAdmission: b.programme.conditionsAdmission,
    programmeDocumentsRequis: b.programme.documentsRequis,
    programmeModalites: b.programme.modalites,
    programmeStage: b.programme.stage,
    programmeExamens: b.programme.examens,
    programmePoursuiteEtudes: b.programme.poursuiteEtudes,
    programmeSourceType: b.programme.sourceType,
    programmeSourceUrl: b.programme.sourceUrl,
    coveragePercent: b.coveragePercent,
    montantMax: b.montantMax,
    hasTuitionFee: economy.hasTuitionFee,
    tuitionFee: currentTarif?.montant ?? economy.tuitionFee,
    anneeAcademique: economy.anneeAcademique,
    montantBourse: currentTarif?.montantBourse ?? economy.montantBourse,
    resteACharge: currentTarif?.montantBourse ?? economy.resteACharge,
    economie: economy.economie,
    economiePercent: economy.economiePercent,
    pricingStatus: economy.pricingStatus,
    isTarifDirect: economy.isTarifDirect,
    fraisDossier: effectiveFraisDossier,
    fraisDossierEtranger: b.programme.fraisDossierEtranger ?? effectiveFraisDossier,
    devise: b.programme.devise,
    quota: b.quota,
    dateDebut: b.dateDebut ? b.dateDebut.toISOString() : null,
    dateLimite: b.dateLimite.toISOString(),
    conditions: b.conditions,
    documentsRequis: b.documentsRequis || b.programme.documentsRequis,
    metaTitle: b.metaTitle || b.programme.metaTitle,
    metaDescription: b.metaDescription || b.programme.metaDescription,
    ogImageUrl: b.ogImageUrl || b.programme.ogImageUrl || etab.coverImageUrl,
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
