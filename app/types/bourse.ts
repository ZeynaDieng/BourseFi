export type TarifDto = {
  id: string
  anneeAcademique: string
  montant: number
  fraisInscription?: number | null
  mensualite?: number | null
  nombreMois?: number | null
  frequence: string
  devise: string
  label?: string | null
  isDefault: boolean
  isVerified: boolean
  status: string
}

export type BourseDto = {
  id: string
  slug: string
  titre: string
  programmeId: string
  programmeSlug: string
  programmeTitre: string
  programmeNiveau: string
  programmeDuree: string
  programmeDescription: string
  programmePlacement: string | null
  programmePerspectives: string | null
  programmeEligibilite: string | null
  programmeBrochureUrl: string | null
  etablissement: string
  etablissementSlug: string
  etablissementLogoUrl: string | null
  etablissementCoverImageUrl: string | null
  partnerName: string
  partnerSlug: string
  partnerLogoUrl: string | null
  ville: string
  hasTuitionFee?: boolean
  tuitionFee?: number | null
  anneeAcademique?: string | null
  coveragePercent: number
  montantMax: number | null
  montantBourse: number | null
  resteACharge: number | null
  economie?: number | null
  economiePercent?: number | null
  pricingStatus?: 'VALID' | 'TARIF_DIRECT' | 'NO_COMPARISON' | 'INVALID_PRICING'
  isTarifDirect?: boolean
  isBestEconomy?: boolean
  fraisDossier: number
  fraisDossierEtranger: number
  devise: string
  quota: number
  dateLimite: string
  conditions: string | null
  documentsRequis: string | null
  isActive: boolean
  tarifs?: TarifDto[]
}
