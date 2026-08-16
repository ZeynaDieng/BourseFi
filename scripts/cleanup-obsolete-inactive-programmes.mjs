import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

async function cleanupObsoleteProgrammes() {
  console.log('🚀 Début du nettoyage sécurisé des programmes obsolètes...')

  // Récupérer tous les programmes INACTIVE sans aucune candidature rattachée
  const obsoleteProgs = await prisma.programme.findMany({
    where: {
      status: 'INACTIVE',
      candidatures: { none: {} } // Sécurité absolue : 0 candidature liée !
    },
    include: {
      etablissement: { select: { nom: true } },
      bourses: true,
      tarifs: true,
    }
  })

  console.log(`🧹 ${obsoleteProgs.length} programmes inactifs obsolètes (0 candidature) identifiés pour suppression.`)

  let deletedCount = 0

  await prisma.$transaction(async (tx) => {
    for (const prog of obsoleteProgs) {
      // 1. Supprimer les bourses inactives rattachées
      await tx.bourse.deleteMany({
        where: { programmeId: prog.id }
      })

      // 2. Supprimer les tarifs rattachés
      await tx.tarif.deleteMany({
        where: { programmeId: prog.id }
      })

      // 3. Supprimer le programme obsolète
      await tx.programme.delete({
        where: { id: prog.id }
      })

      deletedCount++
      console.log(`  [${deletedCount}/${obsoleteProgs.length}] Supprimé : ${prog.titre} (${prog.etablissement?.nom})`)
    }
  })

  // Vérification de la sanctuarisation du programme historique ESTG avec candidature
  const historicalProg = await prisma.programme.findUnique({
    where: { id: 'cmrghucg8002dgny41r771w7u' },
    include: { candidatures: true }
  })

  if (historicalProg) {
    console.log(`✅ SANCTUARISATION CONFIRMÉE : Programme historique "${historicalProg.titre}" toujours intact avec ${historicalProg.candidatures.length} candidature.`)
  }

  console.log(`\n🎉 NETTOYAGE RÉUSSI ! ${deletedCount} programmes obsolètes supprimés avec succès.`)
}

cleanupObsoleteProgrammes()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('❌ Erreur lors du nettoyage :', err)
    prisma.$disconnect()
    process.exit(1)
  })
