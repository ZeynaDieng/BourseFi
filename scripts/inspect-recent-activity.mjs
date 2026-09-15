import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function inspectRecent() {
  console.log('=== DERNIÈRES INSCRIPTIONS UTILISATEURS / CANDIDATS ===')
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email, name: u.fullName, role: u.role, createdAt: u.createdAt })), null, 2))

  console.log('\n=== DERNIÈRES CANDIDATURES ===')
  const candidatures = await prisma.candidature.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: true,
      programme: { include: { etablissement: true } },
      paiement: true
    }
  })
  console.log(JSON.stringify(candidatures.map(c => ({
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    status: c.status,
    createdAt: c.createdAt,
    programme: c.programme?.name,
    etablissement: c.programme?.etablissement?.name,
    paiement: c.paiement
  })), null, 2))

  console.log('\n=== DERNIERS PAIEMENTS (PAIEMENT LOGS) ===')
  const paiements = await prisma.paiement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { candidature: true }
  })
  console.log(JSON.stringify(paiements, null, 2))
}

inspectRecent()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
