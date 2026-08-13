import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateAndDeleteOldEnsup() {
  console.log('=== MIGRATION SÉCURISÉE DES CANDIDATURES & SUPPRESSION DES ANCIENNES FORMATIONS ENSUP ===\n')

  // 1. Trouver le programme officiel cible pour les 3 candidatures
  const targetOfficialProg = await prisma.programme.findFirst({
    where: { slug: 'ensup-afrique-dakar-licence-administration-des-entreprises' },
    include: { bourses: true },
  })

  if (!targetOfficialProg) {
    throw new Error('Programme officiel cible non trouvé.')
  }

  const targetOfficialBourse = targetOfficialProg.bourses[0]

  console.log(`[1] Programme officiel cible : "${targetOfficialProg.titre}" (ID: ${targetOfficialProg.id})`)
  console.log(`    Bourse officielle cible : "${targetOfficialBourse?.titre}" (ID: ${targetOfficialBourse?.id})`)

  // 2. Transférer les candidatures rattachées aux anciennes fiches vers le programme officiel
  const oldProgWithCandidatures = await prisma.programme.findFirst({
    where: { slug: 'ensup-afrique-dakar-licence-administration-des-biens-et-ge' },
    include: { candidatures: true },
  })

  if (oldProgWithCandidatures && oldProgWithCandidatures.candidatures.length > 0) {
    console.log(`\n[2] Transfert des ${oldProgWithCandidatures.candidatures.length} candidatures historiques...`)
    for (const c of oldProgWithCandidatures.candidatures) {
      await prisma.candidature.update({
        where: { id: c.id },
        data: {
          programmeId: targetOfficialProg.id,
          bourseId: targetOfficialBourse ? targetOfficialBourse.id : c.bourseId,
          targetProgram: targetOfficialProg.titre,
        },
      })
      console.log(`  └─> Candidature ${c.id} de ${c.fullName} transférée avec succès sur "${targetOfficialProg.titre}"`)
    }
  }

  // 3. Identifier toutes les anciennes fiches créées le 10 août
  const official33Slugs = new Set([
    'ensup-afrique-dakar-bts-transports-logistique',
    'ensup-afrique-dakar-bts-comptabilite-gestion',
    'ensup-afrique-dakar-bts-commerce-international',
    'ensup-afrique-dakar-bts-marketing-communication',
    'ensup-afrique-dakar-licence-audit-control-de-gestion',
    'ensup-afrique-dakar-licence-administration-des-entreprises',
    'ensup-afrique-dakar-licence-banque-finance-assurance',
    'ensup-afrique-dakar-licence-comptabilite-de-gestion',
    'ensup-afrique-dakar-licence-communication-journalisme',
    'ensup-afrique-dakar-licence-commerce-international',
    'ensup-afrique-dakar-licence-droit-des-affaires-et-fiscalite',
    'ensup-afrique-dakar-licence-gestion-des-ressources-humaines',
    'ensup-afrique-dakar-licence-hotellerie-tourisme',
    'ensup-afrique-dakar-licence-informatique-de-gestion',
    'ensup-afrique-dakar-licence-marketing-communication',
    'ensup-afrique-dakar-licence-management',
    'ensup-afrique-dakar-licence-management-de-la-qualite',
    'ensup-afrique-dakar-licence-management-de-projets',
    'ensup-afrique-dakar-licence-transports-logistique',
    'ensup-afrique-dakar-master-audit-control-de-gestion',
    'ensup-afrique-dakar-master-administration-des-entreprises',
    'ensup-afrique-dakar-master-banque-finance-assurance',
    'ensup-afrique-dakar-master-comptabilite-de-gestion',
    'ensup-afrique-dakar-master-commerce-international',
    'ensup-afrique-dakar-master-communication-journalisme',
    'ensup-afrique-dakar-master-droit-des-affaires-et-fiscalite',
    'ensup-afrique-dakar-master-gestion-des-ressources-humaines',
    'ensup-afrique-dakar-master-marketing-communication',
    'ensup-afrique-dakar-master-management',
    'ensup-afrique-dakar-master-management-de-la-qualite',
    'ensup-afrique-dakar-master-management-de-projets',
    'ensup-afrique-dakar-master-passation-de-marches',
    'ensup-afrique-dakar-master-transports-logistique',
  ])

  const allEnsupProgs = await prisma.programme.findMany({
    where: { etablissement: { slug: 'ensup-afrique-dakar' } },
    include: { bourses: true, tarifs: true, candidatures: true },
  })

  let deletedCount = 0

  console.log('\n[3] Suppression propre des anciennes formations doublons...')
  for (const p of allEnsupProgs) {
    if (!official33Slugs.has(p.slug)) {
      if (p.candidatures.length > 0) {
        console.log(`⚠️ ATTENTION : Le programme ${p.slug} a encore des candidatures. Ignoré.`)
        continue
      }
      // Supprimer bourses
      for (const b of p.bourses) {
        await prisma.bourse.delete({ where: { id: b.id } })
      }
      // Supprimer tarifs
      for (const t of p.tarifs) {
        await prisma.tarif.delete({ where: { id: t.id } })
      }
      // Supprimer le programme
      await prisma.programme.delete({ where: { id: p.id } })
      deletedCount++
      console.log(`  ✔ Ancienne formation supprimée : [${p.niveau}] ${p.titre} (${p.slug})`)
    }
  }

  // Vérification du nombre final
  const finalProgCount = await prisma.programme.count({
    where: { etablissement: { slug: 'ensup-afrique-dakar' } },
  })
  const finalBourseCount = await prisma.bourse.count({
    where: { programme: { etablissement: { slug: 'ensup-afrique-dakar' } } },
  })

  console.log('\n==========================================')
  console.log(`- Nombre d anciennes formations supprimées : ${deletedCount}`)
  console.log(`- NOMBRE FINAL DE PROGRAMMES ENSUP DAKAR EN BDD : ${finalProgCount}`)
  console.log(`- NOMBRE FINAL DE BOURSES ENSUP DAKAR EN BDD : ${finalBourseCount}`)
  console.log('==========================================')
}

migrateAndDeleteOldEnsup()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
