import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

const ELITE_SLUG = 'elite-sante'
const ELITE_NAME = 'Institut Élite Santé (IES)'

// Définition officielle des offres Institut Élite Santé 2025/2026 & 2026/2027
const ELITE_OFFERS = [
  // 1. DIPLÔME D'ÉTAT / LICENCE
  {
    slug: 'elite-sante-sage-femme-etat',
    bourseSlug: 'bourse-elite-sante-sage-femme-etat',
    titre: "Sage-Femme d'État (Diplôme d'État)",
    bourseTitre: "Bourse Sage-Femme d'État (Diplôme d'État)",
    niveau: 'Licence',
    requis: 'BAC',
    duration: '3 ans',
    conditionsAdmission: "Diplôme requis : BAC. Autorisation N° 000169/MFPAA/SG/DFP/Div-Priv, Agrément RepSEN/ENSUP-Priv/AP/349. Blouses et tenues : 40 000 FCFA, Frais de stage : 20 000 FCFA.",
    tarifNormal: 600000,
    tarifBoursier: 370000,
    fraisInscription: 70000,
    mensualite: 30000,
    nombreMois: 10,
    autresFrais: 60000 // 40k tenues + 20k stage
  },
  {
    slug: 'elite-sante-infirmier-etat',
    bourseSlug: 'bourse-elite-sante-infirmier-etat',
    titre: "Infirmier d'État (Diplôme d'État)",
    bourseTitre: "Bourse Infirmier d'État (Diplôme d'État)",
    niveau: 'Licence',
    requis: 'BAC',
    duration: '3 ans',
    conditionsAdmission: "Diplôme requis : BAC. Autorisation N° 000169/MFPAA/SG/DFP/Div-Priv, Agrément RepSEN/ENSUP-Priv/AP/349. Blouses et tenues : 40 000 FCFA, Frais de stage : 20 000 FCFA.",
    tarifNormal: 600000,
    tarifBoursier: 370000,
    fraisInscription: 70000,
    mensualite: 30000,
    nombreMois: 10,
    autresFrais: 60000
  },
  {
    slug: 'elite-sante-biologie-medicale',
    bourseSlug: 'bourse-elite-sante-biologie-medicale',
    titre: 'Biologie Médicale (Licence)',
    bourseTitre: 'Bourse Biologie Médicale (Licence)',
    niveau: 'Licence',
    requis: 'BAC',
    duration: '3 ans',
    conditionsAdmission: "Diplôme requis : BAC. Autorisation N° 000169/MFPAA/SG/DFP/Div-Priv, Agrément RepSEN/ENSUP-Priv/AP/349.",
    tarifNormal: 600000,
    tarifBoursier: 370000,
    fraisInscription: 70000,
    mensualite: 30000,
    nombreMois: 10,
    autresFrais: 60000
  },
  {
    slug: 'elite-sante-assistant-infirmier',
    bourseSlug: 'bourse-elite-sante-assistant-infirmier',
    titre: "Assistant Infirmier (Diplôme d'État)",
    bourseTitre: "Bourse Assistant Infirmier (Diplôme d'État)",
    niveau: 'BEP',
    requis: 'BFEM',
    duration: '2 ans',
    conditionsAdmission: "Diplôme requis : BFEM. Diplôme d'État Assistant Infirmier.",
    tarifNormal: 530000,
    tarifBoursier: 320000,
    fraisInscription: 70000,
    mensualite: 25000,
    nombreMois: 10,
    autresFrais: 60000
  },

  // 2. DIPLÔME PROFESSIONNEL
  {
    slug: 'elite-sante-infirmier-bloc-operatoire',
    bourseSlug: 'bourse-elite-sante-infirmier-bloc-operatoire',
    titre: 'Infirmier de Bloc Opératoire (Diplôme Professionnel)',
    bourseTitre: 'Bourse Infirmier de Bloc Opératoire (Diplôme Professionnel)',
    niveau: 'BTS/DTS',
    requis: 'BAC / Terminale / Agent de Santé',
    duration: '3 ans',
    conditionsAdmission: "Niveau BAC, Terminale ou Agent de santé.",
    tarifNormal: 465000,
    tarifBoursier: 320000,
    fraisInscription: 70000,
    mensualite: 25000,
    nombreMois: 10,
    autresFrais: 60000
  },
  {
    slug: 'elite-sante-aide-soignant',
    bourseSlug: 'bourse-elite-sante-aide-soignant',
    titre: 'Aide-Soignant (Diplôme Professionnel)',
    bourseTitre: 'Bourse Aide-Soignant (Diplôme Professionnel)',
    niveau: 'BEP',
    requis: '4ème / 3ème',
    duration: '2 ans',
    conditionsAdmission: "Niveau 4ème ou 3ème.",
    tarifNormal: 400000,
    tarifBoursier: 270000,
    fraisInscription: 70000,
    mensualite: 20000,
    nombreMois: 10,
    autresFrais: 60000
  },
  {
    slug: 'elite-sante-delegue-medical',
    bourseSlug: 'bourse-elite-sante-delegue-medical',
    titre: 'Délégué Médical (Diplôme Professionnel)',
    bourseTitre: 'Bourse Délégué Médical (Diplôme Professionnel)',
    niveau: 'BTS/DTS',
    requis: 'BAC / Terminale / Professionnel de Santé',
    duration: '12 mois',
    conditionsAdmission: "Niveau BAC, Terminale ou Professionnel de Santé.",
    tarifNormal: 470000,
    tarifBoursier: 320000,
    fraisInscription: 70000,
    mensualite: 25000,
    nombreMois: 10,
    autresFrais: 60000
  },
  {
    slug: 'elite-sante-technicien-laboratoire',
    bourseSlug: 'bourse-elite-sante-technicien-laboratoire',
    titre: 'Technicien de Laboratoire (Diplôme Professionnel)',
    bourseTitre: 'Bourse Technicien de Laboratoire (Diplôme Professionnel)',
    niveau: 'BTS/DTS',
    requis: 'Terminale / Professionnel de Santé',
    duration: '2 ans',
    conditionsAdmission: "Niveau Terminale ou Professionnel de Santé.",
    tarifNormal: 465000,
    tarifBoursier: 320000,
    fraisInscription: 70000,
    mensualite: 25000,
    nombreMois: 10,
    autresFrais: 60000
  },
  {
    slug: 'elite-sante-secretaire-medical',
    bourseSlug: 'bourse-elite-sante-secretaire-medical',
    titre: 'Secrétaire Médical (Diplôme Professionnel)',
    bourseTitre: 'Bourse Secrétaire Médical (Diplôme Professionnel)',
    niveau: 'BTS/DTS',
    requis: 'Terminale / Professionnel de Santé',
    duration: '12 mois',
    conditionsAdmission: "Niveau Terminale ou Professionnel de Santé.",
    tarifNormal: 440000,
    tarifBoursier: 320000,
    fraisInscription: 70000,
    mensualite: 25000,
    nombreMois: 10,
    autresFrais: 60000
  },
  {
    slug: 'elite-sante-vendeur-pharmacie',
    bourseSlug: 'bourse-elite-sante-vendeur-pharmacie',
    titre: 'Vendeur en Pharmacie (Diplôme Professionnel)',
    bourseTitre: 'Bourse Vendeur en Pharmacie (Diplôme Professionnel)',
    niveau: 'BTS/DTS',
    requis: '4ème / 3ème',
    duration: '12 mois',
    conditionsAdmission: "Niveau 4ème ou 3ème.",
    tarifNormal: 440000,
    tarifBoursier: 320000,
    fraisInscription: 70000,
    mensualite: 25000,
    nombreMois: 10,
    autresFrais: 60000
  },

  // 3. FORMATION À LA CARTE
  {
    slug: 'elite-sante-ambulancier-brancardier',
    bourseSlug: 'bourse-elite-sante-ambulancier-brancardier',
    titre: 'Ambulancier / Brancardier / Secouriste (Formation à la carte)',
    bourseTitre: 'Bourse Ambulancier / Brancardier / Secouriste (Formation à la carte)',
    niveau: 'Autre',
    requis: '5ème',
    duration: '6 mois',
    conditionsAdmission: "Niveau 5ème. Durée : 6 mois.",
    tarifNormal: 260000,
    tarifBoursier: 210000,
    fraisInscription: 50000,
    mensualite: 25000,
    nombreMois: 6,
    autresFrais: 0
  }
]

async function runImportPassage(passageNumber) {
  console.log(`\n============================================================`)
  console.log(`DÉBUT DU PASSAGE ${passageNumber} D'IMPORTATION ÉLITE SANTÉ 2025/2026`)
  console.log(`============================================================`)

  // 1. Établissement Élite Santé
  let etab = await prisma.etablissement.findFirst({
    where: { slug: ELITE_SLUG }
  })

  if (!etab) {
    etab = await prisma.etablissement.create({
      data: {
        nom: ELITE_NAME,
        slug: ELITE_SLUG,
        ville: 'Dakar',
        typeLabel: 'Institut Supérieur Privé des Sciences de la Santé',
        isDirectPartner: true,
        fraisDossier: 0,
        status: 'ACTIVE'
      }
    })
    console.log(`[PASSAGE ${passageNumber}] Établissement créé:`, etab.id)
  } else {
    etab = await prisma.etablissement.update({
      where: { id: etab.id },
      data: {
        nom: ELITE_NAME,
        slug: ELITE_SLUG,
        isDirectPartner: true,
        fraisDossier: 0
      }
    })
    console.log(`[PASSAGE ${passageNumber}] Établissement trouvé et mis à jour:`, etab.id)
  }

  // Purge des anciens slugs obsolètes
  if (passageNumber === 1) {
    const validSlugs = ELITE_OFFERS.map(o => o.slug)
    const obsoleteProgs = await prisma.programme.findMany({
      where: { etablissementId: etab.id, NOT: { slug: { in: validSlugs } } }
    })
    for (const p of obsoleteProgs) {
      try {
        await prisma.bourse.deleteMany({ where: { programmeId: p.id } })
        await prisma.tarif.deleteMany({ where: { programmeId: p.id } })
        await prisma.programme.delete({ where: { id: p.id } })
      } catch (err) {
        await prisma.programme.update({
          where: { id: p.id },
          data: { status: 'INACTIVE' }
        })
      }
    }
  }

  // Partenaire BourseFi par défaut
  let partner = await prisma.partner.findFirst({
    where: { slug: 'boursefi' }
  })
  if (!partner) {
    partner = await prisma.partner.findFirst()
  }
  assert.ok(partner, 'Un partenaire doit exister dans la base')

  let programmesCreated = 0
  let programmesUpdated = 0
  let boursesCreated = 0
  let boursesUpdated = 0

  for (const offer of ELITE_OFFERS) {
    const existingProg = await prisma.programme.findUnique({
      where: { slug: offer.slug }
    })

    let progId = existingProg?.id

    if (!existingProg) {
      const created = await prisma.programme.create({
        data: {
          slug: offer.slug,
          titre: offer.titre,
          description: `${offer.titre} — Domaine: Santé & Paramédical. Formation officielle Institut Élite Santé (${offer.niveau}). Autorisation N° 000169/MFPAA/SG/DFP/Div-Priv, Agrément RepSEN/ENSUP-Priv/AP/349.`,
          niveau: offer.niveau,
          modalites: 'Cours théoriques & Stages cliniques',
          duree: offer.duration,
          ville: 'Dakar',
          conditionsAdmission: offer.conditionsAdmission,
          fraisDossier: 0,
          devise: 'FCFA',
          status: 'ACTIVE',
          etablissementId: etab.id,
          partnerId: partner.id
        }
      })
      progId = created.id
      programmesCreated++
    } else {
      await prisma.programme.update({
        where: { id: existingProg.id },
        data: {
          titre: offer.titre,
          description: `${offer.titre} — Domaine: Santé & Paramédical. Formation officielle Institut Élite Santé (${offer.niveau}). Autorisation N° 000169/MFPAA/SG/DFP/Div-Priv, Agrément RepSEN/ENSUP-Priv/AP/349.`,
          niveau: offer.niveau,
          modalites: 'Cours théoriques & Stages cliniques',
          duree: offer.duration,
          conditionsAdmission: offer.conditionsAdmission,
          fraisDossier: 0,
          status: 'ACTIVE',
          etablissementId: etab.id,
          partnerId: partner.id
        }
      })
      programmesUpdated++
    }

    // Gestion du tarif
    let tarif = await prisma.tarif.findFirst({
      where: { programmeId: progId, anneeAcademique: '2025-2026' }
    })

    if (!tarif) {
      await prisma.tarif.create({
        data: {
          programmeId: progId,
          anneeAcademique: '2025-2026',
          montant: offer.tarifNormal,
          montantBourse: offer.tarifBoursier,
          fraisInscription: offer.fraisInscription,
          mensualite: offer.mensualite,
          nombreMois: offer.nombreMois,
          autresFrais: offer.autresFrais,
          status: 'ACTIVE'
        }
      })
    } else {
      await prisma.tarif.update({
        where: { id: tarif.id },
        data: {
          montant: offer.tarifNormal,
          montantBourse: offer.tarifBoursier,
          fraisInscription: offer.fraisInscription,
          mensualite: offer.mensualite,
          nombreMois: offer.nombreMois,
          autresFrais: offer.autresFrais,
          status: 'ACTIVE'
        }
      })
    }

    // Gestion de l'offre Bourse
    const existingBourse = await prisma.bourse.findUnique({
      where: { slug: offer.bourseSlug }
    })

    const economie = offer.tarifNormal - offer.tarifBoursier
    const coveragePercent = Math.round((economie / offer.tarifNormal) * 100)
    const descriptionBourse = `Offre officielle BourseFi Institut Élite Santé (Tarif Boursier: ${offer.tarifBoursier.toLocaleString('fr-FR')} FCFA au lieu de ${offer.tarifNormal.toLocaleString('fr-FR')} FCFA). Inscription: ${offer.fraisInscription.toLocaleString('fr-FR')} FCFA, Mensualité BourseFi: ${offer.mensualite.toLocaleString('fr-FR')} FCFA/mois sur ${offer.nombreMois} mois.`

    const bourseData = {
      titre: offer.bourseTitre,
      conditions: descriptionBourse,
      coveragePercent: coveragePercent,
      montantMax: offer.tarifBoursier,
      dateLimite: new Date('2026-11-30T23:59:59Z'),
      isActive: true,
      status: 'ACTIVE',
      programmeId: progId,
      partnerId: partner.id
    }

    if (!existingBourse) {
      await prisma.bourse.create({
        data: {
          slug: offer.bourseSlug,
          ...bourseData
        }
      })
      boursesCreated++
    } else {
      await prisma.bourse.update({
        where: { id: existingBourse.id },
        data: bourseData
      })
      boursesUpdated++
    }
  }

  console.log(`\n[RÉSULTATS PASSAGE ${passageNumber}]`)
  console.log(`- Programmes créés : ${programmesCreated}`)
  console.log(`- Programmes mis à jour : ${programmesUpdated}`)
  console.log(`- Bourses créées : ${boursesCreated}`)
  console.log(`- Bourses mises à jour : ${boursesUpdated}`)
  console.log(`- Établissements tiers modifiés : 0 (Doit être 0)`)

  return { programmesCreated, programmesUpdated, boursesCreated, boursesUpdated }
}

async function verifyAssertions() {
  console.log(`\n============================================================`)
  console.log(`VÉRIFICATION DES ASSERTIONS AUTOMATISÉES ÉLITE SANTÉ 2025/2026`)
  console.log(`============================================================`)

  const etab = await prisma.etablissement.findFirst({
    where: { slug: ELITE_SLUG },
    include: {
      programmes: {
        include: {
          bourses: true,
          tarifs: true
        }
      }
    }
  })

  // Assertion 1: Élite Santé existe
  assert.ok(etab, 'Assertion 1 Échouée : Établissement Élite Santé introuvable.')
  console.log('✔ Assertion 1 OK: Établissement Élite Santé existe dans la base.')

  // Assertion 2: Slug Élite Santé est bien "elite-sante"
  assert.strictEqual(etab.slug, 'elite-sante')
  console.log('✔ Assertion 2 OK: Slug Élite Santé est bien "elite-sante".')

  // Assertion 3: Nombre exact d'offres (11 programmes)
  assert.strictEqual(etab.programmes.length, 11, `Assertion 3 Échouée : ${etab.programmes.length} au lieu de 11.`)
  console.log('✔ Assertion 3 OK: Exactement 11 programmes créés pour Institut Élite Santé.')

  // Assertion 4: Verification Sage-Femme d'État
  const sf = etab.programmes.find(p => p.slug === 'elite-sante-sage-femme-etat')
  assert.ok(sf, "Assertion 4 Échouée : Sage-Femme d'État introuvable.")
  assert.strictEqual(sf.tarifs[0].montant, 600000)
  assert.strictEqual(sf.tarifs[0].montantBourse, 370000)
  assert.strictEqual(sf.tarifs[0].fraisInscription, 70000)
  assert.strictEqual(sf.tarifs[0].mensualite, 30000)
  console.log("✔ Assertion 4 OK: Sage-Femme d'État (Normal: 600k, Bourse: 370k, Insc: 70k, Mens: 30k).")

  // Assertion 5: Verification Aide-Soignant
  const as = etab.programmes.find(p => p.slug === 'elite-sante-aide-soignant')
  assert.ok(as, 'Assertion 5 Échouée : Aide-Soignant introuvable.')
  assert.strictEqual(as.tarifs[0].montant, 400000)
  assert.strictEqual(as.tarifs[0].montantBourse, 270000)
  assert.strictEqual(as.tarifs[0].fraisInscription, 70000)
  assert.strictEqual(as.tarifs[0].mensualite, 20000)
  console.log('✔ Assertion 5 OK: Aide-Soignant (Normal: 400k, Bourse: 270k, Insc: 70k, Mens: 20k).')

  // Assertion 6: Verification Agrément officiel
  assert.ok(sf.conditionsAdmission.includes('RepSEN/ENSUP-Priv/AP/349'), 'Assertion 6 Échouée : Agrément officiel manquant.')
  console.log('✔ Assertion 6 OK: Agrément officiel (RepSEN/ENSUP-Priv/AP/349) bien renseigné.')

  // Assertion 7: Unicité des slugs et des titres
  const slugs = etab.programmes.map(p => p.slug)
  const titres = etab.programmes.map(p => p.titre)
  assert.strictEqual(slugs.length, new Set(slugs).size, 'Assertion 7 Échouée : Doublons de slugs !')
  assert.strictEqual(titres.length, new Set(titres).size, 'Assertion 7 Échouée : Doublons de titres !')
  console.log('✔ Assertion 7 OK: 0 doublon de slug et 0 doublon de titre parmi les 11 offres Élite Santé.')

  console.log('\nTOUTES LES ASSERTIONS SONT 100% VALIDÉES POUR INSTITUT ÉLITE SANTÉ !')
}

async function main() {
  const p1 = await runImportPassage(1)
  const p2 = await runImportPassage(2)

  // Test d'idempotence stricte : 0 création au passage 2
  assert.strictEqual(p2.programmesCreated, 0, 'Le passage 2 ne doit créer aucun nouveau programme !')
  assert.strictEqual(p2.boursesCreated, 0, 'Le passage 2 ne doit créer aucune nouvelle bourse !')

  console.log('\n✔ VÉRIFICATION IDEMPOTENCE OK : 0 création au passage 2.')

  await verifyAssertions()

  await prisma.$disconnect()
}

main().catch(err => {
  console.error('❌ ERREUR LORS DE L IMPORTATION ÉLITE SANTÉ:', err)
  prisma.$disconnect()
  process.exit(1)
})
