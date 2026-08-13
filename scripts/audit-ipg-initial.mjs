import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditIpgInitial() {
  console.log('=== INSPECTION INITIALE IPG-ISTI DANS BOURSEFI ===\n')

  const etablissements = await prisma.etablissement.findMany({
    where: {
      OR: [
        { nom: { contains: 'IPG', mode: 'insensitive' } },
        { nom: { contains: 'ISTI', mode: 'insensitive' } },
        { slug: { contains: 'ipg', mode: 'insensitive' } },
      ],
    },
    include: {
      programmes: {
        include: {
          bourses: true,
          tarifs: true,
          candidatures: true,
        },
      },
    },
  })

  console.log(`Nombre d établissements trouvés pour IPG/ISTI : ${etablissements.length}`)

  for (const etab of etablissements) {
    console.log(`\nÉtablissement: "${etab.nom}" (Slug: ${etab.slug}, ID: ${etab.id})`)
    console.log(`Total programmes: ${etab.programmes.length}`)
    for (const p of etab.programmes) {
      console.log(`  - [${p.niveau}] ${p.titre} (Slug: ${p.slug}, Candidatures: ${p.candidatures.length}, Tarifs: ${p.tarifs.length})`)
    }
  }

  const candidaturesCount = await prisma.candidature.count()
  const paiementsCount = await prisma.paiement.count()
  const usersCount = await prisma.user.count()

  console.log('\n=== STATISTIQUES GLOBALES DE SÉCURITÉ ===')
  console.log(`- Total Candidatures en BDD : ${candidaturesCount}`)
  console.log(`- Total Paiements en BDD    : ${paiementsCount}`)
  console.log(`- Total Utilisateurs en BDD : ${usersCount}`)
}

auditIpgInitial()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
