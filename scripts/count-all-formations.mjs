import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function countAllFormations() {
  console.log('=== COMPTAGE GLOBAL DES FORMATIONS PAR ÉTABLISSEMENT DANS BOURSEFI ===\n')

  const etablissements = await prisma.etablissement.findMany({
    where: { status: 'ACTIVE' },
    include: {
      programmes: {
        where: { status: 'ACTIVE' },
      },
    },
    orderBy: { nom: 'asc' },
  })

  let grandTotalFormations = 0
  let grandTotalBourses = 0

  const summary = []

  for (const e of etablissements) {
    const boursesCount = await prisma.bourse.count({
      where: { programme: { etablissementId: e.id, status: 'ACTIVE' }, status: 'ACTIVE', isActive: true },
    })

    grandTotalFormations += e.programmes.length
    grandTotalBourses += boursesCount

    summary.push({
      Établissement: e.nom,
      Slug: e.slug,
      Ville: e.ville,
      Formations: e.programmes.length,
      'Bourses disponibles': boursesCount,
    })
  }

  console.table(summary)

  console.log('\n==========================================')
  console.log(`TOTAL ÉTABLISSEMENTS ACTIFS : ${etablissements.length}`)
  console.log(`TOTAL GLOBAL DES FORMATIONS  : ${grandTotalFormations}`)
  console.log(`TOTAL GLOBAL DES BOURSES     : ${grandTotalBourses}`)
  console.log('==========================================')
}

countAllFormations()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
