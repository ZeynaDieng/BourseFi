import { computeScholarshipEconomy } from '../app/utils/scholarship-math.ts'

console.log('==================================================')
console.log('TESTS UNITAIRES OBLIGATOIRES — ÉTAPE 1B (MATH ÉCONOMIE)')
console.log('==================================================\n')

const testCases = [
  {
    id: 1,
    normal: 750000,
    boursier: 600000,
    expectedEco: 150000,
    expectedPct: 20,
    expectedStatus: 'VALID',
  },
  {
    id: 2,
    normal: 595000,
    boursier: 450000,
    expectedEco: 145000,
    expectedPct: 24.37,
    expectedStatus: 'VALID',
  },
  {
    id: 3,
    normal: 685000,
    boursier: 500000,
    expectedEco: 185000,
    expectedPct: 27.01,
    expectedStatus: 'VALID',
  },
  {
    id: 4,
    normal: 850000,
    boursier: 625000,
    expectedEco: 225000,
    expectedPct: 26.47,
    expectedStatus: 'VALID',
  },
  {
    id: 5,
    normal: 850000,
    boursier: 750000,
    expectedEco: 100000,
    expectedPct: 11.76,
    expectedStatus: 'VALID',
  },
  {
    id: 6,
    normal: 700000,
    boursier: null,
    expectedEco: null,
    expectedPct: null,
    expectedStatus: 'NO_COMPARISON',
  },
  {
    id: 7,
    normal: 700000,
    boursier: 700000,
    expectedEco: 0,
    expectedPct: 0,
    expectedStatus: 'TARIF_DIRECT',
  },
  {
    id: 8,
    normal: 600000,
    boursier: 700000,
    expectedEco: null,
    expectedPct: null,
    expectedStatus: 'INVALID_PRICING',
  },
]

let passed = 0
let failed = 0

for (const t of testCases) {
  const result = computeScholarshipEconomy(20000, 0, t.normal, '2026-2027', t.boursier)

  const ecoOk = result.economie === t.expectedEco
  const pctOk = t.expectedPct === null ? result.economiePercent === null : Math.abs((result.economiePercent || 0) - t.expectedPct) < 0.05
  const statusOk = result.pricingStatus === t.expectedStatus

  if (ecoOk && pctOk && statusOk) {
    passed++
    console.log(`[TEST ${t.id}] PASSED: ${t.normal} -> ${t.boursier} => Eco: ${result.economie} FCFA (${result.economiePercent}%) | Status: ${result.pricingStatus}`)
  } else {
    failed++
    console.error(`[TEST ${t.id}] FAILED: ${t.normal} -> ${t.boursier}`)
    console.error(`  Attendu: Eco=${t.expectedEco}, Pct=${t.expectedPct}, Status=${t.expectedStatus}`)
    console.error(`  Obtenu : Eco=${result.economie}, Pct=${result.economiePercent}, Status=${result.pricingStatus}`)
  }
}

console.log('\n==========================================')
console.log(`TESTS REUSSIS : ${passed} / ${testCases.length}`)
if (failed > 0) {
  console.error(`TESTS EN ECHEC : ${failed}`)
  process.exit(1)
} else {
  console.log('TOUS LES TESTS OBLIGATOIRES DE L ETAPE 1 SONT VALIDES !')
  console.log('==========================================')
}
