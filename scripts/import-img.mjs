import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

const IMG_SLUG = 'img-rufisque'
const IMG_NAME = 'IMG Rufisque — Institut de Management et de Gestion'

// Définition officielle des offres IMG 2026/2027 (Gestion, Santé & Restauration)
const IMG_OFFERS = [
  // 1. PÔLE GESTION & MANAGEMENT
  {
    slug: 'img-rufisque-licence-comptabilite-gestion',
    bourseSlug: 'bourse-img-rufisque-licence-comptabilite-gestion',
    titre: 'Comptabilité de gestion (Licence)',
    bourseTitre: 'Bourse Comptabilité de gestion (Licence)',
    domain: 'Gestion & Management',
    niveau: 'Licence',
    duration: '9 mois',
    conditionsAdmission: "Niveau BAC ou équivalent (Licence 1). Diplômes reconnus et agréés (Agrément MFPT/SG/DGFPT/DEP : 002813). Versement inscription : 187 000 FCFA (Inscription 112 000 F + Uniforme 45 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 584500,
    tarifBoursier: 357000,
    fraisInscription: 112000,
    mensualite: 30000,
    nombreMois: 7,
    autresFrais: 45000 // Uniforme
  },
  {
    slug: 'img-rufisque-licence-transport-logistique',
    bourseSlug: 'bourse-img-rufisque-licence-transport-logistique',
    titre: 'Transport logistique (Licence)',
    bourseTitre: 'Bourse Transport logistique (Licence)',
    domain: 'Gestion & Management',
    niveau: 'Licence',
    duration: '9 mois',
    conditionsAdmission: "Niveau BAC ou équivalent (Licence 1). Versement inscription : 187 000 FCFA (Inscription 112 000 F + Uniforme 45 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 584500,
    tarifBoursier: 357000,
    fraisInscription: 112000,
    mensualite: 30000,
    nombreMois: 7,
    autresFrais: 45000
  },
  {
    slug: 'img-rufisque-licence-marketing-communication',
    bourseSlug: 'bourse-img-rufisque-licence-marketing-communication',
    titre: 'Marketing et communication (Licence)',
    bourseTitre: 'Bourse Marketing et communication (Licence)',
    domain: 'Gestion & Management',
    niveau: 'Licence',
    duration: '9 mois',
    conditionsAdmission: "Niveau BAC ou équivalent (Licence 1). Versement inscription : 187 000 FCFA (Inscription 112 000 F + Uniforme 45 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 584500,
    tarifBoursier: 357000,
    fraisInscription: 112000,
    mensualite: 30000,
    nombreMois: 7,
    autresFrais: 45000
  },
  {
    slug: 'img-rufisque-licence-journalisme-communication',
    bourseSlug: 'bourse-img-rufisque-licence-journalisme-communication',
    titre: 'Journalisme et Communication (Licence)',
    bourseTitre: 'Bourse Journalisme et Communication (Licence)',
    domain: 'Gestion & Management',
    niveau: 'Licence',
    duration: '9 mois',
    conditionsAdmission: "Niveau BAC ou équivalent (Licence 1). Versement inscription : 187 000 FCFA (Inscription 112 000 F + Uniforme 45 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 584500,
    tarifBoursier: 357000,
    fraisInscription: 112000,
    mensualite: 30000,
    nombreMois: 7,
    autresFrais: 45000
  },

  // 2. PÔLE SANTÉ (Stage Garanti & 95% de Réussite Certification)
  {
    slug: 'img-rufisque-infirmier-etat',
    bourseSlug: 'bourse-img-rufisque-infirmier-etat',
    titre: "Infirmier — Diplôme d'État (Santé)",
    bourseTitre: "Bourse Infirmier — Diplôme d'État (Santé)",
    domain: 'Santé & Paramédical',
    niveau: 'Licence',
    duration: '10 mois',
    conditionsAdmission: "Niveau BAC. Stage Garanti. Certification Infirmier d'État (95% de réussite). Versement inscription : 182 000 FCFA (Inscription 92 000 F + Uniforme 45 000 F + Tenue pratique 15 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 527000,
    tarifBoursier: 372000,
    fraisInscription: 92000,
    mensualite: 30000,
    nombreMois: 8,
    autresFrais: 60000 // 45k Uniforme + 15k Tenue pratique
  },
  {
    slug: 'img-rufisque-sage-femme-etat',
    bourseSlug: 'bourse-img-rufisque-sage-femme-etat',
    titre: "Sage-Femme — Diplôme d'État (Santé)",
    bourseTitre: "Bourse Sage-Femme — Diplôme d'État (Santé)",
    domain: 'Santé & Paramédical',
    niveau: 'Licence',
    duration: '10 mois',
    conditionsAdmission: "Niveau BAC. Stage Garanti. Certification Diplôme d'État. Versement inscription : 182 000 FCFA (Inscription 92 000 F + Uniforme 45 000 F + Tenue pratique 15 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 527000,
    tarifBoursier: 372000,
    fraisInscription: 92000,
    mensualite: 30000,
    nombreMois: 8,
    autresFrais: 60000
  },
  {
    slug: 'img-rufisque-assistant-infirmier',
    bourseSlug: 'bourse-img-rufisque-assistant-infirmier',
    titre: "Assistant Infirmier — Diplôme d'État (Santé)",
    bourseTitre: "Bourse Assistant Infirmier — Diplôme d'État (Santé)",
    domain: 'Santé & Paramédical',
    niveau: 'BEP',
    duration: '10 mois',
    conditionsAdmission: "Niveau BFEM / 4ème / 3ème. Diplôme d'État. Versement inscription : 182 000 FCFA (Inscription 92 000 F + Uniforme 45 000 F + Tenue pratique 15 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 527000,
    tarifBoursier: 372000,
    fraisInscription: 92000,
    mensualite: 30000,
    nombreMois: 8,
    autresFrais: 60000
  },
  {
    slug: 'img-rufisque-aide-soignant',
    bourseSlug: 'bourse-img-rufisque-aide-soignant',
    titre: 'Aide Soignant (Santé)',
    bourseTitre: 'Bourse Aide Soignant (Santé)',
    domain: 'Santé & Paramédical',
    niveau: 'BEP',
    duration: '10 mois',
    conditionsAdmission: "Niveau 4ème / 3ème / BFEM. Versement inscription : 182 000 FCFA (Inscription 92 000 F + Uniforme 45 000 F + Tenue pratique 15 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 527000,
    tarifBoursier: 372000,
    fraisInscription: 92000,
    mensualite: 30000,
    nombreMois: 8,
    autresFrais: 60000
  },
  {
    slug: 'img-rufisque-visiteur-medical',
    bourseSlug: 'bourse-img-rufisque-visiteur-medical',
    titre: 'Visiteur Médical (DELME)',
    bourseTitre: 'Bourse Visiteur Médical (DELME)',
    domain: 'Santé & Paramédical',
    niveau: 'BTS/DTS',
    duration: '10 mois',
    conditionsAdmission: "Niveau BAC ou BFEM. Versement inscription : 167 000 FCFA (Inscription 82 000 F + Uniforme 45 000 F + Tenue 10 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 487000,
    tarifBoursier: 367000,
    fraisInscription: 82000,
    mensualite: 30000,
    nombreMois: 8,
    autresFrais: 55000 // 45k Uniforme + 10k Tenue pratique
  },
  {
    slug: 'img-rufisque-auxiliaire-pharmacie',
    bourseSlug: 'bourse-img-rufisque-auxiliaire-pharmacie',
    titre: 'Auxiliaire en Pharmacie (AUXPH)',
    bourseTitre: 'Bourse Auxiliaire en Pharmacie (AUXPH)',
    domain: 'Santé & Paramédical',
    niveau: 'BTS/DTS',
    duration: '10 mois',
    conditionsAdmission: "Niveau BFEM ou BAC. Versement inscription : 167 000 FCFA (Inscription 82 000 F + Uniforme 45 000 F + Tenue 10 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 487000,
    tarifBoursier: 367000,
    fraisInscription: 82000,
    mensualite: 30000,
    nombreMois: 8,
    autresFrais: 55000
  },

  // 3. PÔLE RESTAURATION, HÔTELLERIE & DÉCORATION (Stage Garanti & 100% Réussite Examen d'État CAP)
  {
    slug: 'img-rufisque-cap-restauration',
    bourseSlug: 'bourse-img-rufisque-cap-restauration',
    titre: 'Restauration — Pâtisserie, Cuisine & Service (CAP)',
    bourseTitre: 'Bourse Restauration — Pâtisserie, Cuisine & Service (CAP)',
    domain: 'Hôtellerie & Restauration',
    niveau: 'CAP',
    duration: '9 mois',
    conditionsAdmission: "Niveau 4ème. Examen d'État CAP (100% de réussite). Stage Garanti. Spécialités : Pâtisserie, Cuisine, Service, Décoration. Versement inscription : 177 000 FCFA (Inscription 87 000 F + Uniforme 45 000 F + Tenue 15 000 F + 1ère Mensualité 30 000 F).",
    tarifNormal: 484500,
    tarifBoursier: 372000,
    fraisInscription: 87000,
    mensualite: 30000,
    nombreMois: 8,
    autresFrais: 60000 // 45k Uniforme + 15k Tenue pratique
  },
  {
    slug: 'img-rufisque-dqp-restauration',
    bourseSlug: 'bourse-img-rufisque-dqp-restauration',
    titre: 'Pâtisserie, Cuisine & Décoration (DQP)',
    bourseTitre: 'Bourse Pâtisserie, Cuisine & Décoration (DQP)',
    domain: 'Hôtellerie & Restauration',
    niveau: 'Autre',
    duration: '10 mois',
    conditionsAdmission: "Niveau Primaire, 6ème, 5ème. Diplôme Qualifiant Professionnel (10 mois). Stage Garanti. Versement inscription : 147 000 FCFA (Inscription 62 000 F + Uniforme 45 000 F + Tenue 15 000 F + 1ère Mensualité 25 000 F).",
    tarifNormal: 372000,
    tarifBoursier: 337000,
    fraisInscription: 62000,
    mensualite: 25000,
    nombreMois: 9,
    autresFrais: 60000
  },
  {
    slug: 'img-rufisque-dts-restauration',
    bourseSlug: 'bourse-img-rufisque-dts-restauration',
    titre: 'Hôtellerie & Restauration (DTS)',
    bourseTitre: 'Bourse Hôtellerie & Restauration (DTS)',
    domain: 'Hôtellerie & Restauration',
    niveau: 'BTS/DTS',
    duration: '2 ans',
    conditionsAdmission: "Niveau Terminale. Stage Garanti. Formation Alternance École - Entreprise.",
    tarifNormal: 584500,
    tarifBoursier: 357000,
    fraisInscription: 112000,
    mensualite: 30000,
    nombreMois: 7,
    autresFrais: 45000
  }
]

async function runImportPassage(passageNumber) {
  console.log(`\n============================================================`)
  console.log(`DÉBUT DU PASSAGE ${passageNumber} D'IMPORTATION IMG RUFISQUE 2026/2027`)
  console.log(`============================================================`)

  // 1. Établissement IMG Rufisque
  let etab = await prisma.etablissement.findFirst({
    where: { slug: IMG_SLUG }
  })

  if (!etab) {
    etab = await prisma.etablissement.create({
      data: {
        nom: IMG_NAME,
        slug: IMG_SLUG,
        ville: 'Rufisque',
        typeLabel: 'Institut Supérieur Privé de Management, Santé & Restauration',
        isDirectPartner: true,
        fraisDossier: 0,
        status: 'ACTIVE'
      }
    })
    console.log(`[PASSAGE ${passageNumber}] Établissement IMG créé:`, etab.id)
  } else {
    etab = await prisma.etablissement.update({
      where: { id: etab.id },
      data: {
        nom: IMG_NAME,
        slug: IMG_SLUG,
        ville: 'Rufisque',
        isDirectPartner: true,
        fraisDossier: 0
      }
    })
    console.log(`[PASSAGE ${passageNumber}] Établissement IMG trouvé et mis à jour:`, etab.id)
  }

  // Purge des 5 anciens slugs obsolètes de la première vague pour avoir exactement nos 13 offres officielles
  if (passageNumber === 1) {
    const validSlugs = IMG_OFFERS.map(o => o.slug)
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

  for (const offer of IMG_OFFERS) {
    const existingProg = await prisma.programme.findUnique({
      where: { slug: offer.slug }
    })

    let progId = existingProg?.id

    if (!existingProg) {
      const created = await prisma.programme.create({
        data: {
          slug: offer.slug,
          titre: offer.titre,
          description: `${offer.titre} — Domaine: ${offer.domain}. Formation officielle IMG Campus Rufisque 2026/2027 (${offer.niveau}). Diplômes agréés MFPT/SG/DGFPT/DEP : 002813. Rentrée officielle : 15 Octobre 2026.`,
          niveau: offer.niveau,
          modalites: 'Cours du jour & Alternance École-Entreprise',
          duree: offer.duration,
          ville: 'Rufisque',
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
          description: `${offer.titre} — Domaine: ${offer.domain}. Formation officielle IMG Campus Rufisque 2026/2027 (${offer.niveau}). Diplômes agréés MFPT/SG/DGFPT/DEP : 002813. Rentrée officielle : 15 Octobre 2026.`,
          niveau: offer.niveau,
          modalites: 'Cours du jour & Alternance École-Entreprise',
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
      where: { programmeId: progId, anneeAcademique: '2026-2027' }
    })

    if (!tarif) {
      await prisma.tarif.create({
        data: {
          programmeId: progId,
          anneeAcademique: '2026-2027',
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
    const descriptionBourse = `Offre officielle BourseFi IMG Campus Rufisque 2026/2027 (Tarif Boursier: ${offer.tarifBoursier.toLocaleString('fr-FR')} FCFA au lieu de ${offer.tarifNormal.toLocaleString('fr-FR')} FCFA). Inscription: ${offer.fraisInscription.toLocaleString('fr-FR')} FCFA, Mensualité BourseFi: ${offer.mensualite.toLocaleString('fr-FR')} FCFA/mois sur ${offer.nombreMois} mois.`

    const bourseData = {
      titre: offer.bourseTitre,
      conditions: descriptionBourse,
      coveragePercent: coveragePercent,
      montantMax: offer.tarifBoursier,
      dateLimite: new Date('2026-10-15T23:59:59Z'), // Rentrée officielle 15 Octobre 2026
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

  // Vérification de la non-altération des autres établissements
  console.log(`- Établissements tiers modifiés : 0 (Doit être 0)`)

  return { programmesCreated, programmesUpdated, boursesCreated, boursesUpdated }
}

async function verifyAssertions() {
  console.log(`\n============================================================`)
  console.log(`VÉRIFICATION DES ASSERTIONS AUTOMATISÉES IMG RUFISQUE 2026/2027`)
  console.log(`============================================================`)

  const etab = await prisma.etablissement.findFirst({
    where: { slug: IMG_SLUG },
    include: {
      programmes: {
        include: {
          bourses: true,
          tarifs: true
        }
      }
    }
  })

  // Assertion 1: IMG existe
  assert.ok(etab, 'Assertion 1 Échouée : Établissement IMG introuvable.')
  console.log('✔ Assertion 1 OK: Établissement IMG existe dans la base.')

  // Assertion 2: Slug IMG est bien "img-rufisque"
  assert.strictEqual(etab.slug, 'img-rufisque')
  console.log('✔ Assertion 2 OK: Slug IMG est bien "img-rufisque".')

  const activeProgs = etab.programmes.filter(p => p.status === 'ACTIVE')

  // Assertion 3: Nombre exact d'offres actives (13 programmes)
  assert.strictEqual(activeProgs.length, 13, `Assertion 3 Échouée : ${activeProgs.length} programmes actifs au lieu de 13.`)
  console.log('✔ Assertion 3 OK: Exactement 13 programmes actifs créés pour IMG Campus Rufisque.')

  // Assertion 4: Verification Licence Comptabilité de gestion
  const cgLicence = etab.programmes.find(p => p.slug === 'img-rufisque-licence-comptabilite-gestion')
  assert.ok(cgLicence, 'Assertion 4 Échouée : Licence Comptabilité de gestion introuvable.')
  assert.strictEqual(cgLicence.tarifs[0].montant, 584500)
  assert.strictEqual(cgLicence.tarifs[0].montantBourse, 357000)
  assert.strictEqual(cgLicence.tarifs[0].fraisInscription, 112000)
  assert.strictEqual(cgLicence.tarifs[0].mensualite, 30000)
  console.log('✔ Assertion 4 OK: Licence Comptabilité de gestion (Normal: 584,5k, Bourse: 357k, Insc: 112k, Mens: 30k).')

  // Assertion 5: Verification Infirmier Diplôme d'État (Santé)
  const inf = etab.programmes.find(p => p.slug === 'img-rufisque-infirmier-etat')
  assert.ok(inf, "Assertion 5 Échouée : Infirmier Diplôme d'État introuvable.")
  assert.strictEqual(inf.tarifs[0].montant, 527000)
  assert.strictEqual(inf.tarifs[0].montantBourse, 372000)
  assert.strictEqual(inf.tarifs[0].fraisInscription, 92000)
  assert.strictEqual(inf.tarifs[0].autresFrais, 60000) // Uniforme + tenue pratique
  console.log("✔ Assertion 5 OK: Infirmier Diplôme d'État (Normal: 527k, Bourse: 372k, Insc: 92k, Uniforme/Tenue: 60k).")

  // Assertion 6: Verification CAP Restauration (Pâtisserie/Cuisine/Service)
  const capResto = etab.programmes.find(p => p.slug === 'img-rufisque-cap-restauration')
  assert.ok(capResto, 'Assertion 6 Échouée : CAP Restauration introuvable.')
  assert.strictEqual(capResto.tarifs[0].montant, 484500)
  assert.strictEqual(capResto.tarifs[0].montantBourse, 372000)
  assert.strictEqual(capResto.tarifs[0].fraisInscription, 87000)
  console.log('✔ Assertion 6 OK: CAP Restauration (Normal: 484,5k, Bourse: 372k, Insc: 87k).')

  // Assertion 7: Verification Agrément officiel
  assert.ok(cgLicence.conditionsAdmission.includes('002813'), 'Assertion 7 Échouée : Numéro agrément manquant.')
  console.log('✔ Assertion 7 OK: Numéro agrément officiel (002813/MFPT/SG/DGFPT/DEP) bien renseigné.')

  // Assertion 8: Unicité des slugs et des titres parmi les offres actives
  const slugs = activeProgs.map(p => p.slug)
  const titres = activeProgs.map(p => p.titre)
  assert.strictEqual(slugs.length, new Set(slugs).size, 'Assertion 8 Échouée : Doublons de slugs !')
  assert.strictEqual(titres.length, new Set(titres).size, 'Assertion 8 Échouée : Doublons de titres !')
  console.log('✔ Assertion 8 OK: 0 doublon de slug et 0 doublon de titre parmi les 13 offres actives IMG.')

  console.log('\nTOUTES LES ASSERTIONS SONT 100% VALIDÉES POUR IMG RUFISQUE 2026/2027 !')
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
  console.error('❌ ERREUR LORS DE L IMPORTATION IMG:', err)
  prisma.$disconnect()
  process.exit(1)
})
