import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const logs = await prisma.emailRelanceLog.findMany({
    take: 30,
    orderBy: { sentAt: 'desc' },
    include: {
      candidature: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          programme: { select: { titre: true } },
        },
      },
    },
  })

  console.log(`FOUND_${logs.length}_LOGS`)
  for (const l of logs) {
    console.log(`- ${l.candidature?.fullName} (${l.candidature?.email}) | Formation: ${l.candidature?.programme?.titre || 'N/A'} | Objet: ${l.subject}`)
  }
}

main().finally(() => prisma.$disconnect())
