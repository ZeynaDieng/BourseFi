import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditAcademicCompleteness() {
  console.log('=== AUDIT DE COMPLÉTUDE ACADÉMIQUE DES 33 PROGRAMMES ENSUP ===')

  const programmes = await prisma.programme.findMany({
    where: {
      slug: { startsWith: 'ensup-afrique-dakar-' },
    },
    include: {
      tarifs: true,
      bourses: true,
    },
  })

  console.log(`Total programmes ENSUP Dakar trouvés : ${programmes.length}`)

  const fields = [
    'description',
    'objectifs',
    'competences',
    'debouches',
    'secteurs',
    'conditionsAdmission',
    'documentsRequis',
    'modalites',
    'stage',
    'examens',
    'poursuiteEtudes',
    'sourceUrl',
  ]

  const stats = {}
  for (const f of fields) stats[f] = 0

  for (const p of programmes) {
    for (const f of fields) {
      if (p[f] && String(p[f]).trim().length > 0) {
        stats[f]++
      }
    }
  }

  console.log('\nRÉSULTATS DE COMPLÉTUDE PAR CHAMP :')
  for (const f of fields) {
    const count = stats[f]
    const percent = Math.round((count / programmes.length) * 100)
    console.log(`- ${f} : ${count}/${programmes.length} (${percent}%)`)
  }

  const globalTotalPossible = fields.length * programmes.length
  const globalFilled = Object.values(stats).reduce((a, b) => a + b, 0)
  const globalPercent = Math.round((globalFilled / globalTotalPossible) * 100)

  console.log(`\nPOURCENTAGE DE COMPLÉTUDE GLOBALE : ${globalFilled}/${globalTotalPossible} (${globalPercent}%)`)
}

auditAcademicCompleteness()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
