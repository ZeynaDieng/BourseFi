import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== MIGRATION CONTRÔLÉE COVERAGEPERCENT ===\n')

  const bourses = await prisma.bourse.findMany({
    include: {
      programme: {
        include: {
          etablissement: true
        }
      }
    }
  })

  let updatedTo50 = 0
  let updatedTo25 = 0
  let manualCheckCount = 0
  let anomalyCount = 0

  const report = []

  for (const b of bourses) {
    const rawLevel = (b.programme.niveau || '').trim()
    const lvlLower = rawLevel.toLowerCase()
    const oldVal = b.coveragePercent

    if (lvlLower === 'licence' || lvlLower === 'licence professionnelle') {
      if (oldVal === 100) {
        await prisma.bourse.update({
          where: { id: b.id },
          data: { coveragePercent: 50 }
        })
        updatedTo50++
        report.push({ id: b.id, titre: b.titre, etablissement: b.programme.etablissement.nom, niveau: rawLevel, avant: 100, apres: 50, statut: 'UPDATED_TO_50' })
      } else {
        anomalyCount++
        report.push({ id: b.id, titre: b.titre, etablissement: b.programme.etablissement.nom, niveau: rawLevel, avant: oldVal, apres: oldVal, statut: 'ANOMALY_NOT_100' })
      }
    } else if (lvlLower === 'master' || lvlLower === 'master professionnel') {
      if (oldVal === 50) {
        await prisma.bourse.update({
          where: { id: b.id },
          data: { coveragePercent: 25 }
        })
        updatedTo25++
        report.push({ id: b.id, titre: b.titre, etablissement: b.programme.etablissement.nom, niveau: rawLevel, avant: 50, apres: 25, statut: 'UPDATED_TO_25' })
      } else {
        anomalyCount++
        report.push({ id: b.id, titre: b.titre, etablissement: b.programme.etablissement.nom, niveau: rawLevel, avant: oldVal, apres: oldVal, statut: 'ANOMALY_NOT_50' })
      }
    } else {
      manualCheckCount++
      report.push({ id: b.id, titre: b.titre, etablissement: b.programme.etablissement.nom, niveau: rawLevel, avant: oldVal, apres: oldVal, statut: 'MANUAL_CHECK_PRESERVED' })
    }
  }

  console.log('=== BILAN MIGRATION COVERAGEPERCENT ===')
  console.log(`- Bourses Licence modifiées 100% -> 50%  : ${updatedTo50} (Attendu: 114)`)
  console.log(`- Bourses Master modifiées 50% -> 25%    : ${updatedTo25} (Attendu: 52)`)
  console.log(`- Bourses préservées (MANUAL CHECK)      : ${manualCheckCount} (Attendu: 120)`)
  console.log(`- Anomalies détectées (non écrasées)     : ${anomalyCount} (Attendu: 0)`)
  console.log(`- Total bourses en base                  : ${bourses.length}`)

  return {
    total: bourses.length,
    updatedTo50,
    updatedTo25,
    manualCheckCount,
    anomalyCount,
    report
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err)
    prisma.$disconnect()
  })
