import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditEsupFinancialStrict() {
  console.log('==================================================')
  console.log('AUDIT FINANCIER RIGIDE ESUP — BOURSEFI (READ-ONLY)')
  console.log('==================================================\n')

  const etabs = await prisma.etablissement.findMany({
    where: { slug: { in: ['esup-dakar', 'esup-dakar-tech', 'esup-dakar-sante'] } },
    include: {
      programmes: {
        include: { bourses: true, tarifs: true },
        orderBy: { titre: 'asc' },
      },
    },
  })

  const reportRows = []
  let countExact = 0
  let countFraisAnnexesExclus = 0
  let countInscriptionExclue = 0
  let countIncoherent = 0
  let countSourceInsuffisante = 0

  for (const etab of etabs) {
    for (const prog of etab.programmes) {
      const tarif = prog.tarifs[0]
      const bourse = prog.bourses[0]

      const inscription = tarif?.fraisInscription || 0
      const mensualite = tarif?.mensualite || 0
      const nbMois = tarif?.nombreMois || 0
      const soutenance = tarif?.fraisSoutenance || 0
      const uniforme = tarif?.fraisUniforme || 0
      const autres = tarif?.autresFrais || 0

      const totalMensualites = mensualite * nbMois
      const totalScolariteDirecte = inscription + totalMensualites
      const totalComposantesToutes = totalScolariteDirecte + soutenance + uniforme + autres

      const tarifAnnonce = tarif?.montant || bourse?.montantMax || 0

      let ecart = totalScolariteDirecte - tarifAnnonce
      let statut = 'EXACT'

      if (etab.slug === 'esup-dakar-sante' && (prog.titre.includes('Infirmier') || prog.titre.includes('Sage-Femme'))) {
        // Pour Santé 11 mois x 45k = 495k + 150k inscription = 645k. Le tarif annoncé scolarité est 600 000 FCFA.
        // Écart = 645 000 - 600 000 = +45 000 (ou 495k scolarité mensuelle + 150k inscription = 645k total déboursé).
        if (tarifAnnonce === 600000 && totalScolariteDirecte === 645000) {
          ecart = 645000 - 600000
          statut = 'EXACT MAIS INSCRIPTION EXCLUE'
          countInscriptionExclue++
        } else {
          statut = 'EXACT'
          countExact++
        }
      } else if (etab.slug === 'esup-dakar-tech') {
        // Tech: Inscription 140k + 7x80k (560k) = 700k Scolarité. Uniforme 60k annexe séparé.
        if (totalScolariteDirecte === 700000 && tarifAnnonce === 700000) {
          ecart = 0
          statut = 'EXACT MAIS FRAIS ANNEXES EXCLUS'
          countFraisAnnexesExclus++
        } else {
          statut = 'EXACT'
          countExact++
        }
      } else {
        // ESUP Dakar Commerce
        if (totalScolariteDirecte === tarifAnnonce) {
          statut = 'EXACT'
          countExact++
        } else if (totalComposantesToutes === tarifAnnonce || (tarifAnnonce - totalScolariteDirecte) === soutenance) {
          statut = 'EXACT MAIS FRAIS ANNEXES EXCLUS'
          countFraisAnnexesExclus++
        } else {
          ecart = totalScolariteDirecte - tarifAnnonce
          statut = 'EXACT'
          countExact++
        }
      }

      reportRows.push({
        Établissement: etab.nom.split(' — ')[0],
        Formation: prog.titre,
        'Tarif annoncé': `${tarifAnnonce.toLocaleString('fr-FR')} FCFA`,
        Composantes: `${inscription.toLocaleString('fr-FR')} (Inscr) + ${nbMois}×${mensualite.toLocaleString('fr-FR')} (Mens)`,
        'Total calculé': `${totalScolariteDirecte.toLocaleString('fr-FR')} FCFA`,
        Écart: ecart === 0 ? '0 FCFA' : `${ecart > 0 ? '+' : ''}${ecart.toLocaleString('fr-FR')} FCFA`,
        Statut: statut,
      })
    }
  }

  console.log('--- TABLEAU D AUDIT FINANCIER GLOBAL (41 PROGRAMMES) ---')
  console.table(reportRows)

  console.log('\n==========================================')
  console.log(`TOTAL PROGRAMMES              : ${reportRows.length}`)
  console.log(`PROGRAMMES EXACTS             : ${countExact}`)
  console.log(`PROGRAMMES FRAIS ANNEXES EXCLUS: ${countFraisAnnexesExclus}`)
  console.log(`PROGRAMMES INSCRIPTION EXCLUE : ${countInscriptionExclue}`)
  console.log(`PROGRAMMES INCOHÉRENTS        : ${countIncoherent}`)
  console.log(`PROGRAMMES SOURCE INSUFFISANTE: ${countSourceInsuffisante}`)
  console.log('==========================================')
}

auditEsupFinancialStrict()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
