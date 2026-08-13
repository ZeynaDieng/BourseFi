import { PrismaClient } from '@prisma/client'
import { ipgBrochureCatalogue } from './inventory-ipg-isti.mjs'

const prisma = new PrismaClient()

async function migrateIpgCandidatures() {
  console.log('=== MIGRATION SÉCURISÉE DES CANDIDATURES ET NETTOYAGE STRICT IPG-ISTI ===\n')

  const targetOfficialProg = await prisma.programme.findFirst({
    where: { slug: 'ipg-isti-dakar-licence-administration-des-affaires' },
    include: { bourses: true },
  })

  if (!targetOfficialProg) {
    throw new Error('Programme officiel cible introuvable.')
  }

  const targetBourse = targetOfficialProg.bourses[0]
  const officialSlugs = new Set(ipgBrochureCatalogue.map((i) => i.slug))

  // Trouver tous les programmes rattachés à IPG-ISTI
  const allProgs = await prisma.programme.findMany({
    where: { etablissement: { slug: 'ipg-isti-dakar' } },
    include: { bourses: true, tarifs: true, candidatures: true },
  })

  let migratedCount = 0
  let deletedCount = 0

  for (const p of allProgs) {
    if (!officialSlugs.has(p.slug)) {
      // S'il y a des candidatures rattachées à cette ancienne fiche, on les migre vers le programme officiel
      if (p.candidatures.length > 0) {
        console.log(`Transfert des ${p.candidatures.length} candidature(s) de "${p.titre}" (${p.slug})...`)
        for (const c of p.candidatures) {
          await prisma.candidature.update({
            where: { id: c.id },
            data: {
              programmeId: targetOfficialProg.id,
              bourseId: targetBourse ? targetBourse.id : c.bourseId,
              targetProgram: targetOfficialProg.titre,
            },
          })
          migratedCount++
          console.log(`  ✔ Candidature ${c.id} (${c.fullName}) transférée avec succès.`)
        }
      }

      // Supprimer l'ancienne fiche et ses dépendances
      for (const b of p.bourses) await prisma.bourse.delete({ where: { id: b.id } })
      for (const t of p.tarifs) await prisma.tarif.delete({ where: { id: t.id } })
      await prisma.programme.delete({ where: { id: p.id } })
      deletedCount++
      console.log(`  ✔ Ancienne fiche supprimée : [${p.niveau}] ${p.titre} (${p.slug})`)
    }
  }

  const totalProgrammes = await prisma.programme.count({
    where: { etablissement: { slug: 'ipg-isti-dakar' } },
  })
  const totalBourses = await prisma.bourse.count({
    where: { programme: { etablissement: { slug: 'ipg-isti-dakar' } } },
  })

  console.log('\n==========================================')
  console.log(`- Total candidatures migré(e)s            : ${migratedCount}`)
  console.log(`- Total anciennes fiches supprimées      : ${deletedCount}`)
  console.log(`- NOMBRE FINAL DE PROGRAMMES IPG-ISTI EN BDD : ${totalProgrammes}`)
  console.log(`- NOMBRE FINAL DE BOURSES IPG-ISTI EN BDD     : ${totalBourses}`)
  console.log('==========================================')
}

migrateIpgCandidatures()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
