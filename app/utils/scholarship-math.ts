export type ScholarshipEconomy = {
  hasTuitionFee: boolean
  tuitionFee: number | null
  anneeAcademique?: string | null
  montantBourse: number | null
  resteACharge: number | null
  fraisDossier: number
  coveragePercent: number
  devise: string
}

export function computeScholarshipEconomy(
  fraisDossier: number,
  coveragePercent: number,
  tuitionFee?: number | null,
  anneeAcademique?: string | null,
  montantMax?: number | null,
  devise = 'FCFA',
): ScholarshipEconomy {
  const pct = Math.min(100, Math.max(0, coveragePercent))

  if (tuitionFee !== undefined && tuitionFee !== null && tuitionFee > 0) {
    let montantBourse = Math.round((tuitionFee * pct) / 100)
    if (montantMax && montantMax > 0 && montantBourse > montantMax) {
      montantBourse = montantMax
    }
    const resteACharge = Math.max(0, tuitionFee - montantBourse)

    return {
      hasTuitionFee: true,
      tuitionFee,
      anneeAcademique: anneeAcademique || null,
      montantBourse,
      resteACharge,
      fraisDossier,
      coveragePercent: pct,
      devise,
    }
  }

  return {
    hasTuitionFee: false,
    tuitionFee: null,
    anneeAcademique: anneeAcademique || null,
    montantBourse: null,
    resteACharge: null,
    fraisDossier,
    coveragePercent: pct,
    devise,
  }
}

export function formatFcfa(amount: number | null | undefined, devise = 'FCFA'): string {
  if (amount === null || amount === undefined) {
    return 'À confirmer auprès de l\'établissement'
  }
  return `${amount.toLocaleString('fr-FR')} ${devise}`
}
