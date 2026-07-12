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
  coveragePercent: number
  montantMax: number | null
  montantBourse: number
  resteACharge: number
  fraisDossier: number
  fraisDossierEtranger: number
  devise: string
  quota: number
  dateLimite: string
  conditions: string | null
  documentsRequis: string | null
  isActive: boolean
}
