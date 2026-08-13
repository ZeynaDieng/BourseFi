import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDuplicates() {
  console.log('=== NETTOYAGE RIGOUREUX ET NON-DESTRUCTIF DES DOUBLONS ENSUP AFRIQUE DAKAR ===\n')

  const programmes = await prisma.programme.findMany({
    where: { slug: { startsWith: 'ensup-afrique-dakar-' } },
    include: { bourses: true, candidatures: true },
    orderBy: { createdAt: 'asc' },
  })

  // Les 33 programmes officiels créés aujourd'hui avec le slug officiel "ensup-afrique-dakar-..."
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

  let deactivatedProgrammes = 0
  let deactivatedBourses = 0

  for (const p of programmes) {
    if (!official33Slugs.has(p.slug)) {
      // Si c'est un ancien doublon avec 0 candidatures, on le désactive proprement
      if (p.candidatures.length === 0) {
        await prisma.programme.update({
          where: { id: p.id },
          data: { status: 'INACTIVE' },
        })
        deactivatedProgrammes++
        for (const b of p.bourses) {
          await prisma.bourse.update({
            where: { id: b.id },
            data: { isActive: false, status: 'INACTIVE' },
          })
          deactivatedBourses++
        }
        console.log(`- Ancienne fiche doublon désactivée : [${p.niveau}] ${p.titre} (Slug: ${p.slug})`)
      } else {
        console.log(`- Ancienne fiche CONSERVÉE ACTIVE car elle contient ${p.candidatures.length} candidature(s) : [${p.niveau}] ${p.titre}`)
      }
    } else {
      // S'assurer que les 33 officielles sont bien ACTIVE
      await prisma.programme.update({
        where: { id: p.id },
        data: { status: 'ACTIVE' },
      })
      for (const b of p.bourses) {
        await prisma.bourse.update({
          where: { id: b.id },
          data: { isActive: true, status: 'ACTIVE' },
        })
      }
    }
  }

  // Vérification finale des bourses/programmes actifs pour ENSUP Dakar
  const activeProgrammesCount = await prisma.programme.count({
    where: { etablissement: { slug: 'ensup-afrique-dakar' }, status: 'ACTIVE' },
  })

  const activeBoursesCount = await prisma.bourse.count({
    where: { programme: { etablissement: { slug: 'ensup-afrique-dakar' }, status: 'ACTIVE' }, isActive: true, status: 'ACTIVE' },
  })

  console.log('\n==========================================')
  console.log(`- Ancien doublons désactivés : ${deactivatedProgrammes}`)
  console.log(`- Anciennes bourses désactivées : ${deactivatedBourses}`)
  console.log(`- NOUVEAU TOTAL PROGRAMMES ACTIFS ENSUP DAKAR : ${activeProgrammesCount}`)
  console.log(`- NOUVEAU TOTAL BOURSES ACTIVES ENSUP DAKAR : ${activeBoursesCount}`)
  console.log('==========================================')
}

cleanDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
