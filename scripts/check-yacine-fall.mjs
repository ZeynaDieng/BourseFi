import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkYacineFall() {
  const email = 'fallyacine973@gmail.com'
  console.log(`=== RECHERCHE POUR : ${email} ===`)

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: { candidatures: { include: { programme: true, partner: true, paiement: true } }, paiements: true }
  })
  console.log('Utilisateur:', JSON.stringify(user, null, 2))

  const candidature = await prisma.candidature.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: { programme: true, partner: true, paiement: true, user: true }
  })
  console.log('Candidature:', JSON.stringify(candidature, null, 2))

  const paiement = await prisma.paiement.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: { candidature: true, user: true }
  })
  console.log('Paiement:', JSON.stringify(paiement, null, 2))
}

checkYacineFall()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
