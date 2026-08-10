import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== RAPPORT DES ANCIENNES VALEURS COVERAGEPERCENT ===')
  const bourses = await prisma.bourse.findMany({
    include: {
      programme: {
        include: {
          etablissement: true
        }
      }
    }
  })

  console.log(`\nTotal de bourses en base de données : ${bourses.length}`)

  const coverageDistribution = {}
  const levelDistribution = {}
  const etabDistribution = {}
  const levelByCoverage = {}

  for (const b of bourses) {
    const cov = b.coveragePercent
    coverageDistribution[cov] = (coverageDistribution[cov] || 0) + 1

    const level = b.programme.niveau || 'INCONNU'
    levelDistribution[level] = (levelDistribution[level] || 0) + 1

    if (!levelByCoverage[cov]) levelByCoverage[cov] = {}
    levelByCoverage[cov][level] = (levelByCoverage[cov][level] || 0) + 1

    const etabName = b.programme.etablissement.nom
    if (!etabDistribution[etabName]) etabDistribution[etabName] = {}
    etabDistribution[etabName][cov] = (etabDistribution[etabName][cov] || 0) + 1
  }

  console.log('\n--- 1. Répartition par valeur de coveragePercent ---')
  console.log(`- 100% : ${coverageDistribution[100] || 0} bourses`)
  console.log(`- 50%  : ${coverageDistribution[50] || 0} bourses`)
  console.log(`- 25%  : ${coverageDistribution[25] || 0} bourses`)
  for (const key of Object.keys(coverageDistribution)) {
    if (!['100', '50', '25'].includes(key)) {
      console.log(`- ${key}%  : ${coverageDistribution[key]} bourses`)
    }
  }

  console.log('\n--- 2. Répartition par Niveau de Formation et coveragePercent ---')
  console.table(levelByCoverage)

  console.log('\n--- 3. Extrait par Établissement (nombre de bourses et % actuels) ---')
  const etabSummary = Object.entries(etabDistribution).slice(0, 10).map(([nom, covs]) => ({
    Établissement: nom.substring(0, 35),
    '100%': covs[100] || 0,
    '50%': covs[50] || 0,
    '25%': covs[25] || 0,
  }))
  console.table(etabSummary)
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err)
    prisma.$disconnect()
  })
