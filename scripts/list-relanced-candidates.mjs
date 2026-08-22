import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const candidatures = await prisma.candidature.findMany({
    where: {
      OR: [
        { relanceCount: { gt: 0 } },
        { autoRelanceStep: { gt: 0 } },
        { emailRelanceStep: { gt: 0 } },
        { lastRelanceAt: { not: null } },
      ],
    },
    include: {
      programme: { include: { etablissement: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  console.log(`TOTAL_RELANCED: ${candidatures.length}`)
  for (const c of candidatures) {
    console.log(`- ${c.fullName} (${c.email}) | Tel: ${c.phone || 'N/A'} | Formation: ${c.programme?.titre || 'N/A'} (${c.programme?.etablissement?.nom || 'N/A'}) | Relances: ${c.relanceCount}`)
  }
}

main().finally(() => prisma.$disconnect())
