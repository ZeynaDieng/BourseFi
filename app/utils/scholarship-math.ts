export type ScholarshipEconomy = {
  referentiel: number
  montantBourse: number
  resteACharge: number
  coveragePercent: number
  economiePercent: number
  devise: string
}

export function computeScholarshipEconomy(
  fraisDossier: number,
  coveragePercent: number,
  montantMax?: number | null,
  devise = 'FCFA',
): ScholarshipEconomy {
  const pct = Math.min(100, Math.max(0, coveragePercent))
  
  // Les frais de dossier ne sont pas financés par la bourse
  // Ils restent fixes : 20000 FCFA (local) ou 30000 FCFA (étranger)
  const montantBourse = 0
  const resteACharge = fraisDossier
  const economiePercent = 0

  return {
    referentiel: fraisDossier,
    montantBourse,
    resteACharge,
    coveragePercent: pct,
    economiePercent,
    devise,
  }
}

export function formatFcfa(amount: number, devise = 'FCFA'): string {
  return `${amount.toLocaleString('fr-FR')} ${devise}`
}
