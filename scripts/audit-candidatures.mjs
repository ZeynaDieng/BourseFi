import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditCandidatures() {
  console.log('=== AUDIT DES CANDIDATURES EXISTANTES ===')

  const candidatures = await prisma.candidature.findMany({
    include: {
      programme: {
        include: {
          etablissement: true,
          tarifs: true,
        },
      },
      bourse: true,
      user: true,
      paiement: true,
    },
  })

  console.log(`Nombre total de candidatures en BDD : ${candidatures.length}`)

  for (const c of candidatures) {
    console.log(`\nCandidature ID: ${c.id}`)
    console.log(`- Candidat: ${c.fullName} (${c.email})`)
    console.log(`- Programme ciblé: ${c.targetProgram} (ID: ${c.programmeId})`)
    console.log(`- Établissement: ${c.programme?.etablissement?.nom || 'N/A'}`)
    console.log(`- Bourse rattachée: ${c.bourse?.titre || 'Aucune'}`)
    console.log(`- Statut candidature: ${c.status}`)
    console.log(`- Statut paiement: ${c.paiement ? c.paiement.status : 'Aucun paiement'}`)
    console.log(`- Fichiers: CNI Recto (${Boolean(c.identityCardRectoUrl)}), CNI Verso (${Boolean(c.identityCardVersoUrl)})`)
  }
}

auditCandidatures()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
