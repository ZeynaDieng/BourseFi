import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const bourses = await prisma.bourse.findMany({
    include: {
      programme: {
        include: {
          etablissement: true
        }
      }
    }
  })

  let to50Count = 0
  let to25Count = 0
  let manualCheckCount = 0

  const manualLevelsMap = {}
  const to50LevelsMap = {}
  const to25LevelsMap = {}

  for (const b of bourses) {
    const rawLevel = (b.programme.niveau || '').trim()
    const lvlLower = rawLevel.toLowerCase()

    const isAmbiguous = 
      lvlLower.includes('/') || 
      lvlLower.includes('bts') || 
      lvlLower.includes('dts') || 
      lvlLower.includes('dt') || 
      lvlLower.includes('bep') || 
      lvlLower.includes('dep') || 
      lvlLower.includes('certificat') || 
      lvlLower.includes('santé') || 
      lvlLower.includes('spécialisation') || 
      lvlLower.includes('qualification') || 
      lvlLower.includes('école') || 
      lvlLower.includes('état')

    if (isAmbiguous) {
      manualCheckCount++
      manualLevelsMap[rawLevel] = (manualLevelsMap[rawLevel] || 0) + 1
    } else if (lvlLower === 'licence' || lvlLower === 'licence professionnelle') {
      to50Count++
      to50LevelsMap[rawLevel] = (to50LevelsMap[rawLevel] || 0) + 1
    } else if (lvlLower === 'master' || lvlLower === 'master professionnel') {
      to25Count++
      to25LevelsMap[rawLevel] = (to25LevelsMap[rawLevel] || 0) + 1
    } else {
      manualCheckCount++
      manualLevelsMap[rawLevel] = (manualLevelsMap[rawLevel] || 0) + 1
    }
  }

  console.log('=== STATISTIQUES GLOBALES DE MIGRATION COVERAGEPERCENT ===')
  console.log(`Total Bourses : ${bourses.length}`)
  console.log(`Bourses à modifier vers 50% (Licence pur) : ${to50Count}`)
  console.log(`Bourses à modifier vers 25% (Master pur)  : ${to25Count}`)
  console.log(`Bourses placées en MANUAL CHECK (Ambiguës) : ${manualCheckCount}`)
  console.log(`Bourses inchangées                         : 0`)

  console.log('\n=== DÉTAILS LICENCE (UPDATE VERS 50%) ===')
  console.log(JSON.stringify(to50LevelsMap, null, 2))

  console.log('\n=== DÉTAILS MASTER (UPDATE VERS 25%) ===')
  console.log(JSON.stringify(to25LevelsMap, null, 2))

  console.log('\n=== DÉTAILS NIVEAUX AMBIGUS (MANUAL CHECK) ===')
  console.log(JSON.stringify(manualLevelsMap, null, 2))
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err)
    prisma.$disconnect()
  })
