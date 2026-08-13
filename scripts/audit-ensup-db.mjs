import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== AUDIT ENSUP AFRIQUE DANS BOURSEFI ===')

  // Search Etablissements
  const etablissements = await prisma.etablissement.findMany({
    where: {
      OR: [
        { nom: { contains: 'ENSUP', mode: 'insensitive' } },
        { slug: { contains: 'ensup', mode: 'insensitive' } },
      ],
    },
    include: {
      programmes: {
        include: {
          bourses: true,
          candidatures: true,
          tarifs: true,
        },
      },
    },
  })

  console.log(`\nÉtablissements trouvés (${etablissements.length}) :`)
  for (const e of etablissements) {
    console.log(`- ID: ${e.id} | Nom: "${e.nom}" | Slug: "${e.slug}" | Ville: ${e.ville}`)
    console.log(`  Programmes associés (${e.programmes.length})`)
    for (const p of e.programmes) {
      console.log(`    * [${p.niveau}] ${p.titre} (ID: ${p.id}, Slug: ${p.slug})`)
      console.log(`      - Bourses (${p.bourses.length}): ${p.bourses.map((b) => b.titre).join(', ')}`)
      console.log(`      - Tarifs (${p.tarifs.length})`)
      console.log(`      - Candidatures: ${p.candidatures.length}`)
    }
  }

  // Search Programmes with ENSUP in title or description or slug
  const programmes = await prisma.programme.findMany({
    where: {
      OR: [
        { titre: { contains: 'ENSUP', mode: 'insensitive' } },
        { description: { contains: 'ENSUP', mode: 'insensitive' } },
        { slug: { contains: 'ensup', mode: 'insensitive' } },
      ],
    },
    include: {
      etablissement: true,
      bourses: true,
      candidatures: true,
      tarifs: true,
    },
  })

  console.log(`\nProgrammes globaux identifiés avec ENSUP (${programmes.length}) :`)
  let totalBourses = 0
  let totalCandidatures = 0
  for (const p of programmes) {
    totalBourses += p.bourses.length
    totalCandidatures += p.candidatures.length
    console.log(`- [${p.niveau}] ${p.titre} | Établissement: "${p.etablissement.nom}" (ID: ${p.id})`)
  }

  // Search candidatures linked to ENSUP bourses
  const candidatures = await prisma.candidature.findMany({
    where: {
      OR: [
        { targetProgram: { contains: 'ENSUP', mode: 'insensitive' } },
        { programme: { slug: { contains: 'ensup', mode: 'insensitive' } } },
      ],
    },
  })

  console.log(`\nCandidatures totales associées à ENSUP: ${candidatures.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
