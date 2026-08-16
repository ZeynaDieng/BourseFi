import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDefaultProgrammeFees() {
  console.log('🚀 Début du nettoyage des frais de dossier hardcodés sur les programmes...')

  const progs = await prisma.programme.findMany({
    include: { etablissement: true }
  })

  let updatedCount = 0

  await prisma.$transaction(async (tx) => {
    for (const p of progs) {
      const isAMDI15kException =
        p.etablissement?.slug === 'amdi-afrique' &&
        p.fraisDossier === 15000 &&
        (p.titre.includes('Génie Civil') || p.titre.includes('Analyse Biologique') || p.titre.includes('Agroalimentaire'))

      if (isAMDI15kException) {
        // Conserver la commission spécifique Article 11 de 15 000 FCFA
        console.log(`  [EXCEPTION CONSERVÉE] : ${p.titre} -> 15 000 FCFA`)
        continue
      }

      // Si le programme avait 20000 ou égal à son établissement, le mettre à NULL
      // pour qu'il hérite automatiquement de la configuration de l'école !
      if (p.fraisDossier !== null) {
        await tx.programme.update({
          where: { id: p.id },
          data: { fraisDossier: null }
        })
        updatedCount++
      }
    }
  })

  console.log(`\n🎉 SUCCÈS ! ${updatedCount} programmes ont été nettoyés pour hériter automatiquement des frais de leur école.`)
}

cleanDefaultProgrammeFees()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('❌ Erreur :', err)
    prisma.$disconnect()
    process.exit(1)
  })
