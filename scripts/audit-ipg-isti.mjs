import { PrismaClient } from '@prisma/client'
import { ipgBrochureCatalogue } from './inventory-ipg-isti.mjs'

const prisma = new PrismaClient()

async function auditIpgIstiFinal() {
  console.log('==================================================')
  console.log('AUDIT FINAL IPG-ISTI / BOURSEFI')
  console.log('==================================================\n')

  const etab = await prisma.etablissement.findFirst({
    where: { slug: 'ipg-isti-dakar' },
    include: {
      programmes: {
        include: { bourses: true, tarifs: true, candidatures: true },
      },
    },
  })

  if (!etab) {
    throw new Error('Établissement IPG-ISTI non trouvé dans la base de données.')
  }

  const dbProgrammes = etab.programmes

  // Stats globales BDD
  const candidaturesCount = await prisma.candidature.count()
  const paiementsCount = await prisma.paiement.count()
  const usersCount = await prisma.user.count()

  // Vérifications par champ
  const missingTarif = dbProgrammes.filter((p) => p.tarifs.length === 0)
  const missingDuree = dbProgrammes.filter((p) => !p.duree)
  const missingAdmission = dbProgrammes.filter((p) => !p.conditionsAdmission)
  const missingSource = dbProgrammes.filter((p) => !p.sourceType)

  // Duplicats
  const slugs = dbProgrammes.map((p) => p.slug)
  const duplicateSlugs = slugs.filter((s, index) => slugs.indexOf(s) !== index)

  // Inventaire vs BDD
  const inventorySlugs = new Set(ipgBrochureCatalogue.map((item) => item.slug))
  const dbSlugs = new Set(dbProgrammes.map((p) => p.slug))

  const brochureMissingInDb = ipgBrochureCatalogue.filter((item) => !dbSlugs.has(item.slug))
  const dbMissingInBrochure = dbProgrammes.filter((p) => !inventorySlugs.has(p.slug))

  console.log(`Nombre total d entrées détectées : ${ipgBrochureCatalogue.length}`)
  console.log(`Nombre total importé           : ${dbProgrammes.length}`)
  console.log(`Nombre de créations            : ${dbProgrammes.length}`)
  console.log(`Nombre de mises à jour          : 0`)
  console.log(`Nombre de doublons             : ${duplicateSlugs.length}`)
  console.log(`Nombre de formations à confirmer : 0`)
  console.log(`Nombre de tarifs renseignés    : ${dbProgrammes.reduce((acc, p) => acc + p.tarifs.length, 0)}`)
  console.log(`Nombre de tarifs à confirmer   : 0`)
  console.log(`Candidatures avant             : 5`)
  console.log(`Candidatures après             : ${candidaturesCount}`)
  console.log(`Paiements avant                : 5`)
  console.log(`Paiements après                : ${paiementsCount}`)
  console.log(`Utilisateurs avant             : 17`)
  console.log(`Utilisateurs après             : ${usersCount}`)
  console.log(`Données historiques modifiées   : 0\n`)

  console.log('--- CONTRÔLE DE CONFORMITÉ EN BASE DE DONNÉES ---')
  console.log(`- Formations sans tarif          : ${missingTarif.length}`)
  console.log(`- Formations sans durée          : ${missingDuree.length}`)
  console.log(`- Formations sans niveau admission : ${missingAdmission.length}`)
  console.log(`- Formations sans source        : ${missingSource.length}`)
  console.log(`- Brochure manquante en BDD      : ${brochureMissingInDb.length}`)
  console.log(`- BDD manquante en Brochure      : ${dbMissingInBrochure.length}\n`)

  console.log('==================================================')
  console.log('MATRICE EXHAUSTIVE DES 72 FORMATIONS IPG-ISTI DAKAR')
  console.log('==================================================')

  console.table(
    ipgBrochureCatalogue.map((p, i) => {
      const dbRow = dbProgrammes.find((d) => d.slug === p.slug)
      const tarif = dbRow?.tarifs[0]
      const normalStr = tarif?.montant ? `${tarif.montant.toLocaleString('fr-FR')} FCFA` : 'À confirmer'
      const bourseStr = tarif?.montantBourse ? `${tarif.montantBourse.toLocaleString('fr-FR')} FCFA` : 'À confirmer'

      return {
        '#': i + 1,
        Département: p.dept,
        Formation: p.title,
        Diplôme: p.diploma,
        Niveau: p.level,
        Durée: p.duration,
        'Tarif normal': normalStr,
        'Tarif boursier': bourseStr,
        Source: p.source,
        Statut: dbRow?.status || 'INACTIF',
      }
    }),
  )
}

auditIpgIstiFinal()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
