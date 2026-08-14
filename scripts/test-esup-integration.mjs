import { PrismaClient } from '@prisma/client'
import { serializeBourse, bourseInclude } from '../server/utils/bourse-serialize.ts'

const prisma = new PrismaClient()

async function testEsupIntegration() {
  console.log('==================================================')
  console.log('TESTS AUTOMATIQUES D INTÉGRATION ESUP')
  console.log('==================================================\n')

  // 1. Établissements ESUP
  const etabs = await prisma.etablissement.findMany({
    where: { slug: { in: ['esup-dakar', 'esup-dakar-tech', 'esup-dakar-sante'] } },
    include: { programmes: { include: { bourses: true, tarifs: true, candidatures: true } } },
  })

  console.log(`[TEST 1] Établissements ESUP trouvés : ${etabs.length} / 3`)
  if (etabs.length !== 3) throw new Error('Échec TEST 1: Le nombre d établissements ESUP doit être de 3.')

  // 2. Nombre de programmes
  const totalProgrammes = etabs.reduce((acc, e) => acc + e.programmes.length, 0)
  console.log(`[TEST 2] Total programmes ESUP en BDD : ${totalProgrammes} (Attendu: 41)`)
  if (totalProgrammes !== 41) throw new Error(`Échec TEST 2: Attendu 41 programmes, trouvé ${totalProgrammes}`)

  // 3. Doublons
  const allSlugs = etabs.flatMap((e) => e.programmes.map((p) => p.slug))
  const duplicates = allSlugs.filter((s, idx) => allSlugs.indexOf(s) !== idx)
  console.log(`[TEST 3] Doublons trouvés : ${duplicates.length}`)
  if (duplicates.length > 0) throw new Error(`Échec TEST 3: Doublons détectés: ${duplicates.join(', ')}`)

  // 4. Programmes sans source
  const allProgs = etabs.flatMap((e) => e.programmes)
  const missingSource = allProgs.filter((p) => !p.sourceType)
  console.log(`[TEST 4] Programmes sans source : ${missingSource.length}`)
  if (missingSource.length > 0) throw new Error('Échec TEST 4: Des programmes n ont pas de source.')

  // 5. Programmes sans niveau
  const missingNiveau = allProgs.filter((p) => !p.niveau)
  console.log(`[TEST 5] Programmes sans niveau : ${missingNiveau.length}`)
  if (missingNiveau.length > 0) throw new Error('Échec TEST 5: Des programmes n ont pas de niveau.')

  // 6. Programmes sans tarif
  const missingTarif = allProgs.filter((p) => p.tarifs.length === 0)
  console.log(`[TEST 6] Programmes sans tarif : ${missingTarif.length}`)
  if (missingTarif.length > 0) throw new Error('Échec TEST 6: Des programmes n ont pas de tarif.')

  // 7. Incohérences tarifaires (tarifBoursier > tarifNormal)
  const invalidTarifs = allProgs.filter((p) => {
    const t = p.tarifs[0]
    return t && t.montantBourse && t.montant && t.montantBourse > t.montant
  })
  console.log(`[TEST 7] Tarifs avec montantBourse > montantNormal : ${invalidTarifs.length}`)
  if (invalidTarifs.length > 0) throw new Error('Échec TEST 7: Incohérence tarifaire détectée.')

  // 8. Test de sérialisation API et de non-exposition des commissions
  const sampleBourse = await prisma.bourse.findFirst({
    where: { programme: { etablissement: { slug: 'esup-dakar' } } },
    include: bourseInclude,
  })

  if (sampleBourse) {
    const serialized = serializeBourse(sampleBourse)
    const jsonStr = JSON.stringify(serialized)
    const hasCommissionExposed = jsonStr.includes('partnerSharePercent') || jsonStr.includes('amountPartner')
    console.log(`[TEST 8] Sécurité API (Exposition commission partenaire) : ${hasCommissionExposed ? 'EXPOSÉE (ÉCHEC)' : 'INTACTE (REJETÉE OK)'}`)
    if (hasCommissionExposed) throw new Error('Échec TEST 8: La commission partenaire est exposée.')
  }

  // 9. Snapshot de sécurité des données globales BDD
  const candidaturesCount = await prisma.candidature.count()
  const paiementsCount = await prisma.paiement.count()
  const usersCount = await prisma.user.count()

  console.log(`\n[TEST 9] Audit des données historiques BDD :`)
  console.log(`- Candidatures : ${candidaturesCount} (Attendu: 5)`)
  console.log(`- Paiements    : ${paiementsCount} (Attendu: 5)`)
  console.log(`- Utilisateurs : ${usersCount} (Attendu: 17)`)

  if (candidaturesCount !== 5 || paiementsCount !== 5 || usersCount !== 17) {
    throw new Error('Échec TEST 9: Les données historiques ont été modifiées !')
  }

  console.log('\n==========================================')
  console.log('RÉSULTAT DES TESTS : TOUS LES TESTS SONT VALIDÉS AVEC SUCCÈS !')
  console.log('==========================================')
}

testEsupIntegration()
  .catch((e) => {
    console.error('ÉCHEC DU TEST ESUP :', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
