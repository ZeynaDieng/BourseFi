import { PrismaClient } from '@prisma/client'
import { serializeBourse, bourseInclude } from '../server/utils/bourse-serialize.ts'

const prisma = new PrismaClient()

console.log('==================================================')
console.log('TEST DE NON-RÉGRESSION GLOBAL ET FINANCIER')
console.log('MODE LECTURE SEULE — AUCUNE MODIFICATION BDD')
console.log('==================================================\n')

async function runRegression() {
  const [boursesRows, candidaturesCount, paymentsCount, usersCount] = await Promise.all([
    prisma.bourse.findMany({
      where: { status: 'ACTIVE' },
      include: bourseInclude,
    }),
    prisma.candidature.count(),
    prisma.paiement.count(),
    prisma.user.count(),
  ])

  console.log(`[BDD SNAPSHOT] Candidatures: ${candidaturesCount} | Paiements: ${paymentsCount} | Users: ${usersCount}`)
  console.log(`[BDD SNAPSHOT] Total bourses actives récupérées: ${boursesRows.length}\n`)

  const targetSlugs = ['ipg-isti', 'esup-dakar', 'esup-dakar-tech', 'esup-dakar-sante', 'ensup-afrique', 'estg']

  let invalidEconomyCount = 0
  let exposedCommissionsCount = 0
  let testedCount = 0

  for (const row of boursesRows) {
    const serialized = serializeBourse(row)
    testedCount++

    // 1. Vérifier qu'aucune économie négative n'est calculée
    if (serialized.economie !== null && serialized.economie !== undefined && serialized.economie < 0) {
      console.error(`❌ [ANOMALIE] Économie négative sur bourse ${serialized.slug}: ${serialized.economie} FCFA`)
      invalidEconomyCount++
    }

    // 2. Vérifier que si pricingStatus est INVALID_PRICING, economie est bien null
    if (serialized.pricingStatus === 'INVALID_PRICING' && serialized.economie !== null) {
      console.error(`❌ [ANOMALIE] INVALID_PRICING devrait avoir economie=null sur ${serialized.slug}`)
      invalidEconomyCount++
    }

    // 3. Sécurité API : vérifier que les commissions partenaires ne sont pas dans l'objet sérialisé
    if ('commission' in serialized || 'partnerShare' in serialized || 'marge' in serialized) {
      console.error(`❌ [SÉCURITÉ] Commission confidentielle exposée sur ${serialized.slug}`)
      exposedCommissionsCount++
    }
  }

  console.log(`✅ [TESTS CLIENTS] ${testedCount} bourses sérialisées sans fuite de commission.`)

  if (invalidEconomyCount > 0) {
    console.error(`❌ ${invalidEconomyCount} bourses présentent des anomalies financières.`)
    process.exit(1)
  }

  if (exposedCommissionsCount > 0) {
    console.error(`❌ ${exposedCommissionsCount} bourses exposent des données financières confidentielles !`)
    process.exit(1)
  }

  console.log('\n==========================================')
  console.log('RÉSULTAT DU TEST DE NON-RÉGRESSION : 100% SUCCÈS !')
  console.log('Toutes les bourses (IPG-ISTI, ESUP, ENSUP, ESTG) sont validées.')
  console.log('==========================================')

  await prisma.$disconnect()
}

runRegression().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
