import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function list46Formations() {
  const etablissement = await prisma.etablissement.findFirst({
    where: { slug: 'ensup-afrique-dakar' },
    include: {
      programmes: {
        include: {
          bourses: true,
          candidatures: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!etablissement) {
    console.log('Établissement ensup-afrique-dakar non trouvé.')
    return
  }

  console.log(`=== ÉTABLISSEMENT : ${etablissement.nom} ===`)
  console.log(`Total programmes attachés à cet établissement : ${etablissement.programmes.length}\n`)

  etablissement.programmes.forEach((p, index) => {
    console.log(
      `${index + 1}. [${p.niveau}] ${p.titre} | Slug: ${p.slug} | Date création: ${p.createdAt.toISOString().slice(0, 10)} | Bourses: ${p.bourses.length} | Candidatures: ${p.candidatures.length}`,
    )
  })
}

list46Formations()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
