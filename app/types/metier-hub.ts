/** Fiche métier exposée au front (API `/api/site/public` · `/api/metiers-hub/...`). */
export type MetierHubEntry = {
  slug: string
  label: string
  shortDescription: string
  salary: string
  employability: string
  missions: string[]
  skills: string[]
  career: { level: string; text: string }[]
  salaryNote: string
  coverImageUrl?: string | null
}
