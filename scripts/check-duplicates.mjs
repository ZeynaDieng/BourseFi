import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDuplicates() {
  const programmes = await prisma.programme.findMany({
    where: { slug: { startsWith: 'ensup-afrique-dakar-' } },
    include: { bourses: true, candidatures: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log('=== ANALYSE DE CORRESPONDANCE DES 13 ANCIENNES FICHES VERS LES 33 NOUVELLES ===\n')

  const old13 = programmes.filter((p) => p.createdAt < new Date('2026-08-11'))
  const new33 = programmes.filter((p) => p.createdAt >= new Date('2026-08-11'))

  console.log(`Anciennes fiches (créées le 10 août) : ${old13.length}`)
  console.log(`Nouvelles fiches officielles (créées le 13 août) : ${new33.length}\n`)

  for (const oldP of old13) {
    const match = new33.find(
      (n) =>
        n.niveau.toLowerCase() === oldP.niveau.toLowerCase() &&
        (n.titre.toLowerCase().includes(oldP.titre.toLowerCase().replace(/\(.*\)/, '').trim()) ||
          oldP.titre.toLowerCase().includes(n.titre.toLowerCase().replace(/\(.*\)/, '').trim())),
    )

    console.log(`Ancienne fiche : [${oldP.niveau}] "${oldP.titre}" (ID: ${oldP.id}, Candidatures: ${oldP.candidatures.length})`)
    if (match) {
      console.log(`  └─> DOUBLON DE : [${match.niveau}] "${match.titre}" (ID: ${match.id})`)
    } else {
      console.log(`  └─> AUCUN DOUBLON DIRECT TROUVÉ (Ex: ${oldP.titre})`)
    }
  }
}

checkDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
