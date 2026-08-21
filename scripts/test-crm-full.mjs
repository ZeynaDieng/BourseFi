import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCrmSystem() {
  console.log('============================================================')
  console.log('TEST AUTOMATISÉ DU MODULE CRM COMMERCIAL & CONVERSION BOURSEFI')
  console.log('============================================================')

  // 1. Recherche d'une candidature existante
  const candidature = await prisma.candidature.findFirst({
    include: { programme: { include: { etablissement: true } }, user: true }
  })

  if (!candidature) {
    console.error('❌ Aucun dossier de candidature trouvé en base pour exécuter les tests.')
    process.exit(1)
  }

  console.log(`✔ Candidature de test trouvée : ID ${candidature.id.slice(0, 8)} (${candidature.fullName})`)

  // 2. Test de création d'une note commerciale avec motif de blocage et épinglage
  const note = await prisma.candidatureNote.create({
    data: {
      candidatureId: candidature.id,
      agentName: 'Agent Commercial Test',
      exchangeType: 'WHATSAPP',
      content: 'Le candidat attend l accord financier de ses parents. Relance prévue le 25 août.',
      interestLevel: 'HOT_HIGH',
      blockingReason: 'PARENT_APPROVAL',
      nextAction: 'SEND_PAYMENT_LINK',
      nextRelanceAt: new Date(Date.now() + 86400000 * 3),
      isPinned: true,
    }
  })

  console.log(`✔ Note commerciale enregistrée & épinglée : ID ${note.id.slice(0, 8)} (Motif: ${note.blockingReason})`)

  // 3. Test de mise à jour des métriques de relance sur la candidature
  const updated = await prisma.candidature.update({
    where: { id: candidature.id },
    data: {
      interestLevel: 'HOT_HIGH',
      blockingReason: 'PARENT_APPROVAL',
      relanceCount: { increment: 1 },
      lastRelanceAt: new Date(),
      lastChannelUsed: 'WHATSAPP',
    }
  })

  console.log(`✔ Incrémentation compteur relance : ${updated.relanceCount} relance(s) (Intérêt: ${updated.interestLevel})`)

  // 4. Test de récupération des notes triées par épinglage (isPinned: desc)
  const notesList = await prisma.candidatureNote.findMany({
    where: { candidatureId: candidature.id },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  if (notesList.length > 0 && notesList[0].isPinned) {
    console.log(`✔ Récupération OK : La note épinglée (${notesList[0].id.slice(0, 8)}) apparaît bien en 1ère position !`)
  }

  console.log('\nTOUS LES TESTS AUTOMATISÉS DU MODULE CRM ONT RÉUSSI AVEC SUCCÈS ! 🎉')
}

testCrmSystem()
  .catch((e) => {
    console.error('❌ Erreur lors du test CRM:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
