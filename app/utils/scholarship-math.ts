export type ScholarshipEconomy = {
  referentiel: number
  montantBourse: number
  resteACharge: number
  coveragePercent: number
  economiePercent: number
  devise: string
}

export function computeScholarshipEconomy(
  fraisScolarite: number,
  coveragePercent: number,
  montantMax?: number | null,
  devise = 'FCFA',
): ScholarshipEconomy {
  const pct = Math.min(100, Math.max(0, coveragePercent))
  let montantBourse = Math.round((fraisScolarite * pct) / 100)
  if (montantMax != null && montantMax > 0) {
    montantBourse = Math.min(montantBourse, montantMax)
  }
  const resteACharge = Math.max(0, fraisScolarite - montantBourse)
  const economiePercent =
    fraisScolarite > 0 ? Math.round((montantBourse / fraisScolarite) * 100) : 0

  return {
    referentiel: fraisScolarite,
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
