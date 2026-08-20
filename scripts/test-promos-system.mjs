import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

async function testPromoSystem() {
  console.log('============================================================')
  console.log('TEST AUTOMATISÉ DU SYSTÈME DE CODES PROMO BOURSEFI')
  console.log('============================================================')

  // 1. Tester le code BF100 (100% gratuité)
  const bf100 = await prisma.promoCode.findUnique({ where: { code: 'BF100' } })
  assert.ok(bf100, 'TEST 1 Échoué : Code BF100 introuvable')
  assert.strictEqual(bf100.type, 'PERCENTAGE')
  assert.strictEqual(bf100.valeur, 100)
  console.log('✔ Test 1 OK : Code BF100 (100% Réduction) trouvé')

  // 2. Tester le code BF50 sur un montant de 20 000 FCFA
  const bf50 = await prisma.promoCode.findUnique({ where: { code: 'BF50' } })
  assert.ok(bf50, 'TEST 2 Échoué : Code BF50 introuvable')
  const initialAmount = 20000
  const reduction50 = Math.round(initialAmount * (bf50.valeur / 100))
  const finalAmount50 = initialAmount - reduction50
  assert.strictEqual(reduction50, 10000)
  assert.strictEqual(finalAmount50, 10000)
  console.log('✔ Test 2 OK : Calcul BF50 (20 000 FCFA -> -10 000 FCFA = 10 000 FCFA)')

  // 3. Tester RENTREE2026 (-5 000 FCFA)
  const rentree = await prisma.promoCode.findUnique({ where: { code: 'RENTREE2026' } })
  assert.ok(rentree, 'TEST 3 Échoué : Code RENTREE2026 introuvable')
  const reductionFixe = Math.min(initialAmount, rentree.valeur)
  const finalAmountFixe = initialAmount - reductionFixe
  assert.strictEqual(reductionFixe, 5000)
  assert.strictEqual(finalAmountFixe, 15000)
  console.log('✔ Test 3 OK : Calcul RENTREE2026 (20 000 FCFA -> -5 000 FCFA = 15 000 FCFA)')

  console.log('\nTOUS LES TESTS AUTOMATISÉS DU SYSTÈME PROMO ONT RÉUSSI AVEC SUCCÈS !')
}

testPromoSystem()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('❌ Erreur test promo system:', err)
    prisma.$disconnect()
    process.exit(1)
  })
