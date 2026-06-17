export type BourseDto = {
  id: string
  slug: string
  titre: string
  programmeId: string
  programmeSlug: string
  programmeTitre: string
  etablissement: string
  etablissementSlug: string
  partnerName: string
  partnerSlug: string
  partnerLogoUrl: string | null
  ville: string
  coveragePercent: number
  montantMax: number | null
  montantBourse: number
  resteACharge: number
  fraisScolarite: number
  fraisDossier: number
  devise: string
  quota: number
  placesRestantes: number
  dateLimite: string
  conditions: string | null
  documentsRequis: string | null
  isActive: boolean
}
