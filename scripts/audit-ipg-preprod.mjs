import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditPreprod() {
  console.log('=== AUDIT DIAGNOSTIQUE NON-MUTATIF IPG-ISTI ===\n')

  const etab = await prisma.etablissement.findFirst({
    where: { slug: 'ipg-isti-dakar' },
    include: {
      programmes: {
        include: {
          bourses: true,
          tarifs: true,
          candidatures: true,
        },
        orderBy: { titre: 'asc' },
      },
    },
  })

  if (!etab) {
    console.log('Établissement IPG-ISTI non trouvé.')
    return
  }

  const progs = etab.programmes

  console.log(`Total programmes trouvés pour IPG-ISTI : ${progs.length}\n`)

  // 1 & 2. Tableau des 72 formations avec calcul de l'économie réelle
  const matrix = progs.map((p, idx) => {
    const bourse = p.bourses[0]
    const tarif = p.tarifs[0]

    const tarifNormal = tarif?.montant ?? null
    const tarifBoursier = tarif?.montantBourse ?? null

    let economie = null
    let economiePercent = null

    if (tarifNormal && tarifBoursier && tarifNormal >= tarifBoursier) {
      economie = tarifNormal - tarifBoursier
      economiePercent = ((economie / tarifNormal) * 100).toFixed(2)
    }

    return {
      index: idx + 1,
      programmeId: p.id,
      nom: p.titre,
      niveau: p.niveau,
      diplome: p.description.split('proposée')[0]?.replace('Formation diplômante en ', '').trim() || p.niveau,
      tarifNormal: tarifNormal ? `${tarifNormal.toLocaleString('fr-FR')} FCFA` : 'À confirmer',
      tarifBoursier: tarifBoursier ? `${tarifBoursier.toLocaleString('fr-FR')} FCFA` : 'À confirmer',
      typeBourse: `Demi-bourse (${bourse?.coveragePercent || 50}%)`,
      coveragePercent: `${bourse?.coveragePercent || 50}%`,
      economie: economie !== null ? `${economie.toLocaleString('fr-FR')} FCFA` : 'Non calculable',
      economiePercent: economiePercent !== null ? `${economiePercent} %` : 'N/A',
      source: p.sourceType || 'BROCHURE_IPG_ISTI',
      statut: p.status,
    }
  })

  console.log('--- EXTRIT DU TABLEAU (PREMIERS ET DERNIERS ÉLÉMENTS) ---')
  console.table(matrix.slice(0, 10))
  console.table(matrix.slice(-10))

  // 6. Snapshot des 5 candidatures
  const candidatures = await prisma.candidature.findMany({
    include: {
      programme: { include: { etablissement: true } },
      bourse: true,
      user: true,
      paiement: true,
    },
  })

  console.log('\n=== SNAPSHOT SÉCURITÉ : LES 5 CANDIDATURES BDD ===')
  candidatures.forEach((c, idx) => {
    console.log(`\nCandidature #${idx + 1} (ID: ${c.id})`)
    console.log(`- Candidat : ${c.fullName} (${c.email})`)
    console.log(`- Programme : ${c.targetProgram} (ID: ${c.programmeId})`)
    console.log(`- Établissement : ${c.programme?.etablissement?.nom || 'N/A'}`)
    console.log(`- Bourse : ${c.bourse?.titre || 'Aucune'}`)
    console.log(`- Frais dossier payés/dus : ${c.fraisDossierAmount} FCFA (Statut: ${c.status})`)
    console.log(`- Paiement rattaché : ${c.paiement ? `${c.paiement.id} (${c.paiement.status})` : 'Aucun'}`)
    console.log(`- Date création : ${c.createdAt.toISOString()}`)
  })
}

auditPreprod()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
