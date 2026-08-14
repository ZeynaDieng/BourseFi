export type PricingStatus = 'VALID' | 'TARIF_DIRECT' | 'NO_COMPARISON' | 'INVALID_PRICING'

export type ScholarshipEconomy = {
  hasTuitionFee: boolean
  tuitionFee: number | null
  anneeAcademique: string | null
  montantBourse: number | null
  resteACharge: number | null
  fraisDossier: number
  coveragePercent: number
  devise: string
  economie: number | null
  economiePercent: number | null
  pricingStatus: PricingStatus
  isTarifDirect: boolean
}

export function computeScholarshipEconomy(
  fraisDossier: number,
  coveragePercent: number,
  tuitionFee?: number | null,
  anneeAcademique?: string | null,
  montantBourseInput?: number | null,
  devise = 'FCFA',
): ScholarshipEconomy {
  const pct = Math.min(100, Math.max(0, coveragePercent))
  const tarifNormal = tuitionFee && tuitionFee > 0 ? tuitionFee : null
  const tarifBoursier = montantBourseInput && montantBourseInput > 0 ? montantBourseInput : null

  let economie: number | null = null
  let economiePercent: number | null = null
  let pricingStatus: PricingStatus = 'NO_COMPARISON'
  let isTarifDirect = false

  if (tarifNormal !== null && tarifBoursier !== null) {
    if (tarifNormal > tarifBoursier) {
      economie = tarifNormal - tarifBoursier
      economiePercent = Math.round(((tarifNormal - tarifBoursier) / tarifNormal) * 10000) / 100
      pricingStatus = 'VALID'
    } else if (tarifNormal === tarifBoursier) {
      economie = 0
      economiePercent = 0
      pricingStatus = 'TARIF_DIRECT'
      isTarifDirect = true
    } else {
      // tarifBoursier > tarifNormal -> Anomalie de données
      economie = null
      economiePercent = null
      pricingStatus = 'INVALID_PRICING'
    }
  } else if (tarifNormal !== null && tarifBoursier === null) {
    pricingStatus = 'NO_COMPARISON'
  }

  return {
    hasTuitionFee: tarifNormal !== null,
    tuitionFee: tarifNormal,
    anneeAcademique: anneeAcademique || null,
    montantBourse: tarifBoursier,
    resteACharge: tarifBoursier,
    fraisDossier,
    coveragePercent: pct,
    devise,
    economie,
    economiePercent,
    pricingStatus,
    isTarifDirect,
  }
}

export function formatFcfa(amount: number | null | undefined, devise = 'FCFA'): string {
  if (amount === null || amount === undefined) {
    return 'À confirmer'
  }
  return `${amount.toLocaleString('fr-FR')} ${devise}`
}
