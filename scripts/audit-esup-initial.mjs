import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditEsupInitial() {
  console.log('=== AUDIT DIAGNOSTIQUE INITIAL : ESUP DANS BOURSEFI ===\n')

  const esupEtablissements = await prisma.etablissement.findMany({
    where: {
      OR: [
        { nom: { contains: 'ESUP', mode: 'insensitive' } },
        { slug: { contains: 'esup', mode: 'insensitive' } },
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

  console.log(`Nombre d établissements ESUP trouvés en BDD : ${esupEtablissements.length}`)

  for (const etab of esupEtablissements) {
    console.log(`\nÉtablissement: "${etab.nom}" (Slug: ${etab.slug}, ID: ${etab.id})`)
    console.log(`- Total programmes rattachés: ${etab.programmes.length}`)
    for (const p of etab.programmes) {
      console.log(`  └─> [${p.niveau}] ${p.titre} (Slug: ${p.slug}, Candidatures: ${p.candidatures.length}, Tarifs: ${p.tarifs.length}, Bourses: ${p.bourses.length})`)
    }
  }

  // Vérifier s'il y a des candidatures liées à des programmes contenant "ESUP" dans le titre
  const esupCandidatures = await prisma.candidature.findMany({
    where: {
      OR: [
        { targetProgram: { contains: 'ESUP', mode: 'insensitive' } },
        { programme: { etablissement: { nom: { contains: 'ESUP', mode: 'insensitive' } } } },
      ],
    },
    include: {
      programme: { include: { etablissement: true } },
      paiement: true,
      user: true,
    },
  })

  console.log(`\nTotal candidatures actuellement liées à ESUP : ${esupCandidatures.length}`)

  // Statistiques de sécurité globale
  const totalCandidatures = await prisma.candidature.count()
  const totalPaiements = await prisma.paiement.count()
  const totalUsers = await prisma.user.count()

  console.log('\n=== STATISTIQUES DE SÉCURITÉ GLOBALE EN BDD ===')
  console.log(`- Total candidatures BDD : ${totalCandidatures}`)
  console.log(`- Total paiements BDD    : ${totalPaiements}`)
  console.log(`- Total utilisateurs BDD : ${totalUsers}`)
}

auditEsupInitial()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
