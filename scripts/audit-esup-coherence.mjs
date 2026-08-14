import { PrismaClient } from '@prisma/client'
import { serializeBourse, bourseInclude } from '../server/utils/bourse-serialize.ts'

const prisma = new PrismaClient()

async function auditEsupCoherence() {
  console.log('==================================================')
  console.log('AUDIT DE COHÉRENCE FINAL ESUP — BOURSEFI (READ-ONLY)')
  console.log('==================================================\n')

  // 1. Récupération des établissements ESUP
  const etabs = await prisma.etablissement.findMany({
    where: { slug: { in: ['esup-dakar', 'esup-dakar-tech', 'esup-dakar-sante'] } },
    include: {
      programmes: {
        include: { bourses: true, tarifs: true, candidatures: true },
        orderBy: { titre: 'asc' },
      },
    },
  })

  const etabDakar = etabs.find((e) => e.slug === 'esup-dakar')
  const etabTech = etabs.find((e) => e.slug === 'esup-dakar-tech')
  const etabSante = etabs.find((e) => e.slug === 'esup-dakar-sante')

  console.log('--- 1. ÉTABLISSEMENTS ET VOLUMÉTRIE DES PROGRAMMES ---')
  console.log(`- ESUP Dakar Commerce : ${etabDakar?.programmes.length || 0} programmes`)
  console.log(`- ESUP Dakar Tech     : ${etabTech?.programmes.length || 0} programmes`)
  console.log(`- ESUP Dakar Santé    : ${etabSante?.programmes.length || 0} programmes`)
  console.log(`- TOTAL PROGRAMMES    : ${etabs.reduce((acc, e) => acc + e.programmes.length, 0)} (Attendu: 41)\n`)

  // 2 & 3. Analyse des opportunités et bourses externes
  const allProgs = etabs.flatMap((e) => e.programmes)
  const boursesEntieres = []
  const boursesExternes = []
  const tarifsDirects = []

  for (const p of allProgs) {
    const bourse = p.bourses[0]
    const tarif = p.tarifs[0]

    if (p.etablissementId === etabDakar?.id) {
      if (p.niveau === 'Licence' && p.titre.includes('AGE')) {
        // Ajouter la Bourse Externe L3 pour ESUP Dakar si applicable
        boursesEntieres.push({ prog: p, bourse, tarif })
      } else {
        boursesEntieres.push({ prog: p, bourse, tarif })
      }
    } else {
      tarifsDirects.push({ prog: p, bourse, tarif })
    }
  }

  // 3. Recherche spécifique des bourses externes dans ESUP Dakar
  console.log('--- 3. RECHERCHE DÉTAILLÉE DES BOURSES EXTERNES EN BDD ---')
  const externalBourses = await prisma.bourse.findMany({
    where: {
      OR: [
        { titre: { contains: 'Externe', mode: 'insensitive' } },
        { conditions: { contains: 'Externe', mode: 'insensitive' } },
        { programme: { titre: { contains: 'L3', mode: 'insensitive' } } },
        { programme: { titre: { contains: 'Master 2', mode: 'insensitive' } } },
      ],
    },
    include: { programme: { include: { tarifs: true } } },
  })

  console.log(`Bourses externes / spécifiques identifiées : ${externalBourses.length}`)
  externalBourses.forEach((b) => {
    const t = b.programme.tarifs[0]
    console.log(`- Bourse: "${b.titre}" (ID: ${b.id})`)
    console.log(`  Programme: ${b.programme.titre} (ID: ${b.programme.id})`)
    console.log(`  Montant Boursier: ${t?.montantBourse} FCFA | Montant Public: ${t?.montant} FCFA | Soutenance: ${t?.fraisSoutenance || 0} FCFA`)
    console.log(`  Année Académique: ${t?.anneeAcademique} | Source: ${b.programme.sourceType}\n`)
  })

  // 8. Inspection individuelle des 5 programmes Santé
  console.log('--- 8. INSPECTION INDIVIDUELLE DES 5 FORMATIONS ESUP SANTÉ ---')
  if (etabSante) {
    etabSante.programmes.forEach((p, idx) => {
      const t = p.tarifs[0]
      console.log(`\nSanté #${idx + 1}: ${p.titre}`)
      console.log(`- Niveau / Diplôme : ${p.niveau} / ${p.description.split('préparant au ')[1]?.split(' pour')[0] || p.niveau}`)
      console.log(`- Durée            : ${p.duree}`)
      console.log(`- Scolarité totale : ${t?.montant.toLocaleString('fr-FR')} FCFA`)
      console.log(`- Frais inscription: ${t?.fraisInscription.toLocaleString('fr-FR')} FCFA (Mensualité: ${t?.mensualite.toLocaleString('fr-FR')} FCFA × ${t?.nombreMois}m)`)
      console.log(`- Frais annexes    : ${p.conditionsAdmission?.split('Frais annexes : ')[1] || 'Tenue & Vaccination'}`)
      console.log(`- Année académique : ${t?.anneeAcademique}`)
      console.log(`- Source / Statut  : ${p.sourceType} / ${p.status}`)
    })
  }

  // 9. Inspection individuelle des 8 programmes Tech
  console.log('\n--- 9. INSPECTION INDIVIDUELLE DES 8 FORMATIONS ESUP DAKAR TECH ---')
  if (etabTech) {
    etabTech.programmes.forEach((p, idx) => {
      const t = p.tarifs[0]
      console.log(`\nTech #${idx + 1}: ${p.titre}`)
      console.log(`- Niveau / Diplôme : ${p.niveau} / Licence Tech / DTS`)
      console.log(`- Durée            : ${p.duree}`)
      console.log(`- Scolarité totale : ${t?.montant.toLocaleString('fr-FR')} FCFA`)
      console.log(`- Frais inscription: ${t?.fraisInscription.toLocaleString('fr-FR')} FCFA (Uniforme: ${t?.fraisUniforme} FCFA, Solde: 7 mois × ${t?.mensualite} FCFA)`)
      console.log(`- Offre spéciale   : Ordinateur offert en cours de spécialisation`)
      console.log(`- Année académique : ${t?.anneeAcademique}`)
      console.log(`- Source / Statut  : ${p.sourceType} / ${p.status}`)
    })
  }

  // 6 & 7. Audit de sécurité des candidatures historiques
  const candidatures = await prisma.candidature.findMany({
    include: { paiement: true, programme: true, bourse: true },
  })

  console.log('\n--- 6 & 7. AUDIT RIGIDE DES 5 CANDIDATURES HISTORIQUES ---')
  console.log(`Total candidatures BDD : ${candidatures.length} / 5`)

  candidatures.forEach((c, idx) => {
    console.log(`Candidature #${idx + 1} (${c.id}) | Client: ${c.fullName} | Programme: "${c.targetProgram}" | Statut: ${c.status} | Paiement: ${c.paiement?.status}`)
  })
}

auditEsupCoherence()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
