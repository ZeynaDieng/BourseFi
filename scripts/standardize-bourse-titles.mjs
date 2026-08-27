import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Standardisation des titres de bourses selon le modèle ENSUP ("Bourse [Nom du programme]")...')

  const bourses = await prisma.bourse.findMany({
    include: {
      programme: true
    }
  })

  let updatedCount = 0

  for (const bourse of bourses) {
    let cleanProg = bourse.programme.titre.trim()

    // Si le titre du programme commence déjà par "Bourse ", on enlève le préfixe
    if (cleanProg.startsWith('Bourse ')) {
      cleanProg = cleanProg.substring(7).trim()
    }

    // Titre standardisé modèle ENSUP : "Bourse [Titre du programme]"
    const targetTitre = `Bourse ${cleanProg}`

    if (bourse.titre !== targetTitre) {
      await prisma.bourse.update({
        where: { id: bourse.id },
        data: { titre: targetTitre }
      })
      updatedCount++
      console.log(`✅ [${bourse.id}] Mis à jour: "${bourse.titre}"  =>  "${targetTitre}"`)
    }
  }

  console.log(`\n🎉 Terminé ! ${updatedCount} bourses sur ${bourses.length} ont été mises à jour avec succès.`)
}

main()
  .catch((err) => {
    console.error('❌ Erreur lors de la mise à jour des titres :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
