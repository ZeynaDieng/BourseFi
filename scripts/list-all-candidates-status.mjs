import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const candidatures = await prisma.candidature.findMany({
    include: {
      programme: { include: { etablissement: true } },
      paiement: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log(`TOTAL_CANDIDATURES: ${candidatures.length}\n`)

  for (const c of candidatures) {
    const isPaid = !!c.paiement
    console.log(`• ${c.fullName} (${c.email})`)
    console.log(`  📞 Téléphone : ${c.phone || 'N/A'}`)
    console.log(`  🎓 Formation : ${c.programme?.titre || 'N/A'} — ${c.programme?.etablissement?.nom || 'N/A'}`)
    console.log(`  📌 Statut : ${c.status} | 💳 Payé : ${isPaid ? 'OUI' : 'NON'} | 📧 Relances effectuées : ${c.relanceCount || 0}`)
    console.log(`  -------------------------------------------------------------`)
  }
}

main().finally(() => prisma.$disconnect())
