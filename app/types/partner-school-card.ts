/** Aligné sur la réponse GET `/api/etablissements` (cartes partenaires). */
export type PartnerSchoolCardEcole = {
  slug: string
  nom: string
  ville: string
  resume?: string | null
  accreditation?: string | null
  coverImageUrl?: string | null
  logoUrl?: string | null
  typeLabel?: string | null
  formationsCount?: number
  boursesCount?: number
  tauxInsertion?: string | null
  partenairePrincipal?: string | null
  programmes?: unknown[]
}
