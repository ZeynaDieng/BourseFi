import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateIpgCandidatures() {
  console.log('=== MIGRATION SÉCURISÉE DE LA CANDIDATURE HISTORIQUE IPG-ISTI ===\n')

  const targetOfficialProg = await prisma.programme.findFirst({
    where: { slug: 'ipg-isti-dakar-licence-administration-des-affaires' },
    include: { bourses: true },
  })

  if (!targetOfficialProg) {
    throw new Error('Programme officiel cible introuvable.')
  }

  const targetBourse = targetOfficialProg.bourses[0]

  const oldProg = await prisma.programme.findFirst({
    where: { slug: 'ipg-isti-dakar-licence-affaires' },
    include: { candidatures: true, bourses: true, tarifs: true },
  })

  if (oldProg && oldProg.candidatures.length > 0) {
    console.log(`Transfert de la candidature de "${oldProg.titre}" vers "${targetOfficialProg.titre}"...`)
    for (const c of oldProg.candidatures) {
      await prisma.candidature.update({
        where: { id: c.id },
        data: {
          programmeId: targetOfficialProg.id,
          bourseId: targetBourse ? targetBourse.id : c.bourseId,
          targetProgram: targetOfficialProg.titre,
        },
      })
      console.log(`  ✔ Candidature ${c.id} (${c.fullName}) transférée avec succès.`)
    }

    // Supprimer l'ancienne fiche générique
    for (const b of oldProg.bourses) await prisma.bourse.delete({ where: { id: b.id } })
    for (const t of oldProg.tarifs) await prisma.tarif.delete({ where: { id: t.id } })
    await prisma.programme.delete({ where: { id: oldProg.id } })
    console.log(`  ✔ Ancienne fiche "Licence Affaires" supprimée de PostgreSQL.`)
  }

  const totalProgrammes = await prisma.programme.count({
    where: { etablissement: { slug: 'ipg-isti-dakar' } },
  })
  const totalBourses = await prisma.bourse.count({
    where: { programme: { etablissement: { slug: 'ipg-isti-dakar' } } },
  })

  console.log('\n==========================================')
  console.log(`- NOMBRE FINAL DE PROGRAMMES IPG-ISTI DAKAR EN BDD : ${totalProgrammes}`)
  console.log(`- NOMBRE FINAL DE BOURSES IPG-ISTI DAKAR EN BDD     : ${totalBourses}`)
  console.log('==========================================')
}

migrateIpgCandidatures()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
