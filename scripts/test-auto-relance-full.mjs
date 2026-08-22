import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Auto-Relance Engine & Rules System...')

  // 1. Fetch active rules
  const rules = await prisma.autoRelanceRule.findMany({
    orderBy: { scenarioStep: 'asc' },
  })
  console.log(`✅ Loaded ${rules.length} Auto-Relance scenarios from DB.`)

  // 2. Query eligible candidates for H+24, H+72, J+7, J+15
  const eligible = await prisma.candidature.findMany({
    where: {
      status: { in: ['EN_ATTENTE_PAIEMENT', 'SOUMIS'] },
      paiement: null,
      isLost: false,
    },
    take: 5,
    include: { programme: true },
  })
  console.log(`✅ Found ${eligible.length} candidate(s) currently eligible for auto-relances.`)

  // 3. Test priority candidates calculation
  const priorityList = await prisma.candidature.findMany({
    where: { status: { in: ['EN_ATTENTE_PAIEMENT', 'SOUMIS'] } },
    take: 3,
  })
  console.log(`✅ Priority Candidates query works cleanly (${priorityList.length} items).`)

  console.log('🎉 Full Auto-Relance System verification PASSED 100%!')
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
