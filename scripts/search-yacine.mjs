import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function searchBroad() {
  console.log('=== TOUS LES PRENOMS & NOMS CONTENANT YAC / YAS / INE ===')
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'yac', mode: 'insensitive' } },
        { name: { contains: 'yas', mode: 'insensitive' } },
        { firstName: { contains: 'yac', mode: 'insensitive' } },
        { firstName: { contains: 'yas', mode: 'insensitive' } },
        { email: { contains: 'yac', mode: 'insensitive' } },
        { email: { contains: 'yas', mode: 'insensitive' } },
      ]
    }
  })
  console.log('Utilisateurs trouvés:', JSON.stringify(users.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt })), null, 2))

  const candidatures = await prisma.candidature.findMany({
    where: {
      OR: [
        { fullName: { contains: 'yac', mode: 'insensitive' } },
        { fullName: { contains: 'yas', mode: 'insensitive' } },
        { email: { contains: 'yac', mode: 'insensitive' } },
        { email: { contains: 'yas', mode: 'insensitive' } },
      ]
    },
    include: { paiement: true }
  })
  console.log('Candidatures trouvées:', JSON.stringify(candidatures.map(c => ({
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    status: c.status,
    createdAt: c.createdAt,
    paiement: c.paiement
  })), null, 2))
}

searchBroad()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
