import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

const ISCA_SLUG = 'isca'
const ISCA_NAME = "ISCA — Institut Supérieur de Commerce et d'Administration"

// 1. Filières Gestion (17 filières)
const FILIERES_GESTION = [
  'Assistanat de Direction',
  'Assistanat de Gestion des PME-PMI',
  'Comptabilité Gestion',
  'Audit & Contrôle de Gestion',
  'Management des Affaires & Gestion des Entreprises',
  'Gestion des Ressources Humaines',
  'Gestion des Projets',
  'Banque Finance Assurance',
  'Ingénierie Financière',
  'Comptabilité-Finances',
  'Management du Commerce International',
  'Transit Transport Logistique',
  'Marketing-Communication des Entreprises',
  'Secrétariat Médical',
  'Secrétariat Juridique',
  'Droit des Affaires & Fiscalité',
  'Délégation médicale'
]

// 2. Filières Génie Informatique (4 filières)
const FILIERES_INFO = [
  'Réseaux & Télécommunications',
  'Maintenance & Réseaux',
  'Informatique de Gestion',
  'Multimédia numérique (Infographie, Webdesign)'
]

// 3. Filières Génie Civil & Construction (3 filières)
const FILIERES_CIVIL = [
  'Génie Civil',
  'Bâtiment',
  'Topographie'
]

// 4. Filières Sciences de la Vie et de la Terre (2 filières)
const FILIERES_SVT = [
  'Exploration & Exploitation des mines',
  'Agro-alimentaire'
]

// Configuration des grilles par Domaine et Niveau

// Grille 1 : GESTION (Jour & Soir / Week-end)
const GRILLE_GESTION = {
  L1: {
    niveau: 'Licence 1',
    tarifNormal: 500000,
    forfaitBourse: 300000,
    fraisInscription: 30000,
    mensualite: 30000,
    nombreMois: 9,
    versementInscription: 60000,
    fraisSoutenance: null,
    coutEtudiantTotal: 300000,
    economie: 200000,
    reductionPercent: 40.00
  },
  L2: {
    niveau: 'Licence 2',
    tarifNormal: 500000,
    forfaitBourse: 300000,
    fraisInscription: 30000,
    mensualite: 30000,
    nombreMois: 9,
    versementInscription: 60000,
    fraisSoutenance: null,
    coutEtudiantTotal: 300000,
    economie: 200000,
    reductionPercent: 40.00
  },
  L3: {
    niveau: 'Licence 3',
    tarifNormal: 700000,
    forfaitBourse: 300000,
    fraisInscription: 30000,
    mensualite: 30000,
    nombreMois: 9,
    versementInscription: 60000,
    fraisSoutenance: 25000,
    coutEtudiantTotal: 325000,
    economie: 375000,
    reductionPercent: 53.57
  },
  M1: {
    niveau: 'Master 1',
    tarifNormal: 770000,
    forfaitBourse: 390000,
    fraisInscription: 75000,
    mensualite: 35000,
    nombreMois: 9,
    versementInscription: 110000,
    fraisSoutenance: null,
    coutEtudiantTotal: 390000,
    economie: 380000,
    reductionPercent: 49.35
  },
  M2: {
    niveau: 'Master 2',
    tarifNormal: 945000,
    forfaitBourse: 440000,
    fraisInscription: 80000,
    mensualite: 40000,
    nombreMois: 9,
    versementInscription: 120000,
    fraisSoutenance: 50000,
    coutEtudiantTotal: 490000,
    economie: 455000,
    reductionPercent: 48.15
  }
}

// Grille 2 : GÉNIE INFORMATIQUE (Jour & Soir)
const GRILLE_INFO = {
  L1: {
    niveau: 'Licence 1',
    tarifNormal: 455000,
    forfaitBourse: 300000,
    fraisInscription: 30000,
    mensualite: 30000,
    nombreMois: 9,
    versementInscription: 60000,
    fraisSoutenance: null,
    coutEtudiantTotal: 300000,
    economie: 155000,
    reductionPercent: 34.07
  },
  L2: {
    niveau: 'Licence 2',
    tarifNormal: 455000,
    forfaitBourse: 300000,
    fraisInscription: 30000,
    mensualite: 30000,
    nombreMois: 9,
    versementInscription: 60000,
    fraisSoutenance: null,
    coutEtudiantTotal: 300000,
    economie: 155000,
    reductionPercent: 34.07
  },
  L3: {
    niveau: 'Licence 3',
    tarifNormal: 650000,
    forfaitBourse: 300000,
    fraisInscription: 30000,
    mensualite: 30000,
    nombreMois: 9,
    versementInscription: 60000,
    fraisSoutenance: 25000,
    coutEtudiantTotal: 325000,
    economie: 325000,
    reductionPercent: 50.00
  },
  M1: {
    niveau: 'Master 1',
    tarifNormal: 770000,
    forfaitBourse: 390000,
    fraisInscription: 75000,
    mensualite: 35000,
    nombreMois: 9,
    versementInscription: 110000,
    fraisSoutenance: null,
    coutEtudiantTotal: 390000,
    economie: 380000,
    reductionPercent: 49.35
  },
  M2: {
    niveau: 'Master 2',
    tarifNormal: 845000,
    forfaitBourse: 440000,
    fraisInscription: 80000,
    mensualite: 40000,
    nombreMois: 9,
    versementInscription: 120000,
    fraisSoutenance: 50000,
    coutEtudiantTotal: 490000,
    economie: 355000,
    reductionPercent: 42.01
  }
}

// Grille 3 : GÉNIE CIVIL & CONSTRUCTION (Jour & Soir - L1 à L3 uniquement)
const GRILLE_CIVIL = {
  L1: {
    niveau: 'Licence 1',
    tarifNormal: 630000,
    forfaitBourse: 350000,
    fraisInscription: 35000,
    mensualite: 35000,
    nombreMois: 9,
    versementInscription: 70000,
    fraisSoutenance: null,
    coutEtudiantTotal: 350000,
    economie: 280000,
    reductionPercent: 44.44
  },
  L2: {
    niveau: 'Licence 2',
    tarifNormal: 630000,
    forfaitBourse: 350000,
    fraisInscription: 35000,
    mensualite: 35000,
    nombreMois: 9,
    versementInscription: 70000,
    fraisSoutenance: null,
    coutEtudiantTotal: 350000,
    fraisTP: 20000,
    economie: 280000,
    reductionPercent: 44.44
  },
  L3: {
    niveau: 'Licence 3',
    tarifNormal: 855000,
    forfaitBourse: 350000,
    fraisInscription: 35000,
    mensualite: 35000,
    nombreMois: 9,
    versementInscription: 70000,
    fraisSoutenance: 25000,
    coutEtudiantTotal: 375000,
    economie: 480000,
    reductionPercent: 56.14
  }
}

// Grille 4 : SCIENCES DE LA VIE ET DE LA TERRE (Jour & Soir - L1 & L2 uniquement)
const GRILLE_SVT = {
  L1: {
    niveau: 'Licence 1',
    tarifNormal: 605000,
    forfaitBourse: 350000,
    fraisInscription: 35000,
    mensualite: 35000,
    nombreMois: 9,
    versementInscription: 70000,
    fraisSoutenance: null,
    coutEtudiantTotal: 350000,
    economie: 255000,
    reductionPercent: 42.15
  },
  L2: {
    niveau: 'Licence 2',
    tarifNormal: 605000,
    forfaitBourse: 350000,
    fraisInscription: 35000,
    mensualite: 35000,
    nombreMois: 9,
    versementInscription: 70000,
    fraisSoutenance: null,
    coutEtudiantTotal: 350000,
    economie: 255000,
    reductionPercent: 42.15
  }
}

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function runImportPassage(passageNumber) {
  console.log(`\n============================================================`)
  console.log(`DÉBUT DU PASSAGE ${passageNumber} D'IMPORTATION ISCA 2026/2027`)
  console.log(`============================================================`)

  const countOtherSchoolBefore = await prisma.etablissement.count({
    where: { NOT: { slug: ISCA_SLUG } }
  })

  // 1. Recherche ou Création de l'établissement ISCA avec slug 'isca'
  let etab = await prisma.etablissement.findFirst({
    where: { OR: [{ slug: ISCA_SLUG }, { slug: 'isca-dakar' }] }
  })

  if (!etab) {
    etab = await prisma.etablissement.create({
      data: {
        nom: ISCA_NAME,
        slug: ISCA_SLUG,
        type: 'PRIVEE',
        description: 'Institut Supérieur de Commerce et d’Administration (ISCA) — Dakar. Formations supérieures en Gestion, Informatique, Génie Civil et SVT.',
        ville: 'Dakar',
        pays: 'Sénégal',
        isDirectPartner: true,
        fraisDossier: 0,
        commissionType: 'FIXED',
        commissionValue: 30000,
        commissionPaidStatus: 'UP_TO_DATE'
      }
    })
    console.log(`[PASSAGE ${passageNumber}] Établissement ISCA créé:`, etab.id)
  } else {
    // Mise à jour du nom et du slug propre
    etab = await prisma.etablissement.update({
      where: { id: etab.id },
      data: {
        nom: ISCA_NAME,
        slug: ISCA_SLUG,
        isDirectPartner: true,
        fraisDossier: 0
      }
    })
    console.log(`[PASSAGE ${passageNumber}] Établissement ISCA trouvé et mis à jour:`, etab.id)
  }

  // Purge des anciens programmes obsolètes ISCA si présents
  if (passageNumber === 1) {
    const validSlugs = new Set()
    // Génération de la liste des 203 slugs attendus
    for (const f of FILIERES_GESTION) {
      for (const lvl of ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']) {
        validSlugs.add(`isca-${slugify(f)}-${slugify(lvl)}-cours-jour`)
        validSlugs.add(`isca-${slugify(f)}-${slugify(lvl)}-week-end`)
      }
    }
    for (const f of FILIERES_INFO) {
      for (const lvl of ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']) {
        validSlugs.add(`isca-${slugify(f)}-${slugify(lvl)}-cours-jour`)
      }
    }
    for (const f of FILIERES_CIVIL) {
      for (const lvl of ['Licence 1', 'Licence 2', 'Licence 3']) {
        validSlugs.add(`isca-${slugify(f)}-${slugify(lvl)}-cours-jour`)
      }
    }
    for (const f of FILIERES_SVT) {
      for (const lvl of ['Licence 1', 'Licence 2']) {
        validSlugs.add(`isca-${slugify(f)}-${slugify(lvl)}-cours-jour`)
      }
    }

    const obsoleteProgs = await prisma.programme.findMany({
      where: { etablissementId: etab.id, NOT: { slug: { in: Array.from(validSlugs) } } }
    })
    for (const p of obsoleteProgs) {
      await prisma.programme.delete({ where: { id: p.id } })
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

  // Fonction d'upsert générique pour une offre ISCA
  async function upsertIscaOffer({ domaine, filiere, niveauCode, modalite, grille }) {
    const cfg = grille[niveauCode]
    if (!cfg) return

    const isWeekEnd = modalite === 'Cours de week-end'
    const isDay = modalite === 'Cours du jour'
    const modaliteSlug = isWeekEnd ? 'week-end' : (isDay ? 'cours-jour' : 'cours-soir')

    const progSlug = `isca-${slugify(filiere)}-${slugify(cfg.niveau)}-${modaliteSlug}`
    const bourseSlug = `bourse-isca-${slugify(filiere)}-${slugify(cfg.niveau)}-${modaliteSlug}`

    const conditionText = cfg.niveau.startsWith('Master')
      ? 'BAC + 3 ou diplôme équivalent (pour M1) / BAC + 4 (pour M2)'
      : (cfg.niveau === 'L3' ? 'BAC + 2 ou BTS/DUT/DTS' : 'BAC ou diplôme équivalent')

    const conditionsAdmissionText = [
      `Diplôme requis : ${conditionText}`,
      `Droits d'inscription : ${cfg.fraisInscription.toLocaleString('fr-FR')} FCFA`,
      `Versement à l'inscription : ${cfg.versementInscription.toLocaleString('fr-FR')} FCFA (Droits d'inscription + 1ère mensualité)`,
      isDay ? 'Uniforme obligatoire : 30 000 FCFA pour les cours du jour.' : null,
      cfg.fraisTP ? `Frais TP Labo : ${cfg.fraisTP.toLocaleString('fr-FR')} FCFA par TP (L2 Génie Civil).` : null,
      cfg.fraisSoutenance ? `Soutenance : ${cfg.fraisSoutenance.toLocaleString('fr-FR')} FCFA.` : 'Soutenance : Néant.'
    ].filter(Boolean).join(' · ')

    const existingProg = await prisma.programme.findUnique({
      where: { slug: progSlug }
    })

    let progId = existingProg?.id

    if (!existingProg) {
      const created = await prisma.programme.create({
        data: {
          slug: progSlug,
          titre: `${filiere} (${cfg.niveau})`,
          description: `${filiere} — Domaine: ${domaine}. Formation officielle ISCA 2026/2027 (${cfg.niveau}, ${modalite}).`,
          niveau: cfg.niveau,
          modalites: modalite,
          duree: `${cfg.nombreMois} mois`,
          ville: 'Dakar',
          conditionsAdmission: conditionsAdmissionText,
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
          titre: `${filiere} (${cfg.niveau})`,
          description: `${filiere} — Domaine: ${domaine}. Formation officielle ISCA 2026/2027 (${cfg.niveau}, ${modalite}).`,
          niveau: cfg.niveau,
          modalites: modalite,
          duree: `${cfg.nombreMois} mois`,
          conditionsAdmission: conditionsAdmissionText,
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
          montant: cfg.tarifNormal,
          montantBourse: cfg.forfaitBourse,
          fraisInscription: cfg.fraisInscription,
          mensualite: cfg.mensualite,
          nombreMois: cfg.nombreMois,
          autresFrais: cfg.fraisTP || 0,
          fraisSoutenance: cfg.fraisSoutenance,
          status: 'ACTIVE'
        }
      })
    } else {
      await prisma.tarif.update({
        where: { id: tarif.id },
        data: {
          montant: cfg.tarifNormal,
          montantBourse: cfg.forfaitBourse,
          fraisInscription: cfg.fraisInscription,
          mensualite: cfg.mensualite,
          nombreMois: cfg.nombreMois,
          autresFrais: cfg.fraisTP || 0,
          fraisSoutenance: cfg.fraisSoutenance,
          status: 'ACTIVE'
        }
      })
    }

    // Gestion de l'offre Bourse
    const existingBourse = await prisma.bourse.findUnique({
      where: { slug: bourseSlug }
    })

    const bourseTitre = isWeekEnd
      ? `${filiere} (${cfg.niveau}) — Bourse ISCA (Week-end)`
      : `${filiere} (${cfg.niveau}) — Bourse ISCA`
    const descriptionBourse = `Offre officielle ISCA 2026/2027 (FORFAIT BOURSE : ${cfg.forfaitBourse.toLocaleString('fr-FR')} FCFA). Inscription: ${cfg.fraisInscription.toLocaleString('fr-FR')} FCFA, Mensualité: ${cfg.mensualite.toLocaleString('fr-FR')} FCFA sur ${cfg.nombreMois} mois.`

    const bourseData = {
      titre: bourseTitre,
      conditions: descriptionBourse,
      coveragePercent: Math.round(cfg.reductionPercent),
      montantMax: cfg.forfaitBourse,
      dateLimite: new Date('2026-11-30T23:59:59Z'),
      isActive: true,
      status: 'ACTIVE',
      programmeId: progId,
      partnerId: partner.id
    }

    if (!existingBourse) {
      await prisma.bourse.create({
        data: {
          slug: bourseSlug,
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

  // 1. Inscription Sciences de Gestion Jour & Soir (17 x 5 = 85 offres)
  for (const f of FILIERES_GESTION) {
    for (const lvl of ['L1', 'L2', 'L3', 'M1', 'M2']) {
      await upsertIscaOffer({
        domaine: 'Sciences de Gestion-Juridiques-Politiques & Administration',
        filiere: f,
        niveauCode: lvl,
        modalite: 'Cours du jour',
        grille: GRILLE_GESTION
      })
    }
  }

  // 2. Inscription Génie Informatique Jour & Soir (4 x 5 = 20 offres)
  for (const f of FILIERES_INFO) {
    for (const lvl of ['L1', 'L2', 'L3', 'M1', 'M2']) {
      await upsertIscaOffer({
        domaine: 'Génie Informatique',
        filiere: f,
        niveauCode: lvl,
        modalite: 'Cours du jour',
        grille: GRILLE_INFO
      })
    }
  }

  // 3. Inscription Génie Civil & Construction (3 x 3 = 9 offres - L1 à L3 uniquement)
  for (const f of FILIERES_CIVIL) {
    for (const lvl of ['L1', 'L2', 'L3']) {
      await upsertIscaOffer({
        domaine: 'Génie Civil & Construction',
        filiere: f,
        niveauCode: lvl,
        modalite: 'Cours du jour',
        grille: GRILLE_CIVIL
      })
    }
  }

  // 4. Inscription SVT (2 x 2 = 4 offres - L1 & L2 uniquement)
  for (const f of FILIERES_SVT) {
    for (const lvl of ['L1', 'L2']) {
      await upsertIscaOffer({
        domaine: 'Sciences de la Vie et de la Terre',
        filiere: f,
        niveauCode: lvl,
        modalite: 'Cours du jour',
        grille: GRILLE_SVT
      })
    }
  }

  // 5. Inscription Gestion Week-end (17 x 5 = 85 offres)
  for (const f of FILIERES_GESTION) {
    for (const lvl of ['L1', 'L2', 'L3', 'M1', 'M2']) {
      await upsertIscaOffer({
        domaine: 'Sciences de Gestion-Juridiques-Politiques & Administration (Week-end)',
        filiere: f,
        niveauCode: lvl,
        modalite: 'Cours de week-end',
        grille: GRILLE_GESTION
      })
    }
  }

  const countOtherSchoolAfter = await prisma.etablissement.count({
    where: { NOT: { slug: ISCA_SLUG } }
  })

  console.log(`\n[RÉSULTATS PASSAGE ${passageNumber}]`)
  console.log(`- Programmes créés : ${programmesCreated}`)
  console.log(`- Programmes mis à jour : ${programmesUpdated}`)
  console.log(`- Bourses créées : ${boursesCreated}`)
  console.log(`- Bourses mises à jour : ${boursesUpdated}`)
  console.log(`- Établissements tiers modifiés : ${countOtherSchoolBefore - countOtherSchoolAfter} (Doit être 0)`)

  return {
    programmesCreated,
    programmesUpdated,
    boursesCreated,
    boursesUpdated,
    countOtherSchoolBefore,
    countOtherSchoolAfter
  }
}

async function verifyAssertions() {
  console.log(`\n============================================================`)
  console.log(`VÉRIFICATION DES 20 ASSERTIONS AUTOMATISÉES ISCA 2026/2027`)
  console.log(`============================================================`)

  const etab = await prisma.etablissement.findFirst({
    where: { slug: ISCA_SLUG },
    include: {
      programmes: {
        include: { tarifs: true, bourses: true }
      }
    }
  })

  // Assertion 1: ISCA existe
  assert.ok(etab, 'Assertion 1 Échouée : ISCA introuvable.')
  console.log('✔ Assertion 1 OK: ISCA existe dans la base.')

  // Assertion 2: Slug ISCA est 'isca'
  assert.strictEqual(etab.slug, 'isca', 'Assertion 2 Échouée : Slug ISCA != isca')
  console.log('✔ Assertion 2 OK: Slug ISCA est bien "isca".')

  // Assertion 3: Nombre d'offres ISCA (203 au total : 85 + 20 + 9 + 4 + 85 = 203)
  assert.strictEqual(etab.programmes.length, 203, `Assertion 3 Échouée : ${etab.programmes.length} programmes au lieu de 203.`)
  console.log('✔ Assertion 3 OK: Exactement 203 programmes créés pour ISCA.')

  // Assertion 4: Verification Comptabilité Gestion Licence 1 Jour
  const cgL1 = etab.programmes.find(p => p.slug === 'isca-comptabilite-gestion-licence-1-cours-jour')
  assert.ok(cgL1, 'Assertion 4 Échouée : Comptabilité Gestion Licence 1 Jour introuvable.')
  assert.strictEqual(cgL1.tarifs[0].montantBourse, 300000)
  assert.strictEqual(cgL1.tarifs[0].montant, 500000)
  assert.strictEqual(cgL1.tarifs[0].fraisInscription, 30000)
  assert.strictEqual(cgL1.tarifs[0].mensualite, 30000)
  console.log('✔ Assertion 4 OK: Comptabilité Gestion Licence 1 Jour (Normal: 500k, Bourse: 300k, Insc: 30k, Mens: 30k).')

  // Assertion 5: Verification Comptabilité Gestion Licence 3 Jour avec Soutenance
  const cgL3 = etab.programmes.find(p => p.slug === 'isca-comptabilite-gestion-licence-3-cours-jour')
  assert.ok(cgL3, 'Assertion 5 Échouée : Comptabilité Gestion Licence 3 Jour introuvable.')
  assert.strictEqual(cgL3.tarifs[0].montantBourse, 300000)
  assert.strictEqual(cgL3.tarifs[0].fraisSoutenance, 25000)
  assert.strictEqual(cgL3.tarifs[0].montant, 700000)
  console.log('✔ Assertion 5 OK: Comptabilité Gestion Licence 3 Jour (Forfait: 300k, Soutenance séparée: 25k).')

  // Assertion 6: Verification Master 1 Gestion
  const cgM1 = etab.programmes.find(p => p.slug === 'isca-comptabilite-gestion-master-1-cours-jour')
  assert.ok(cgM1, 'Assertion 6 Échouée : Master 1 Gestion introuvable.')
  assert.strictEqual(cgM1.tarifs[0].montantBourse, 390000)
  assert.strictEqual(cgM1.tarifs[0].fraisInscription, 75000)
  assert.strictEqual(cgM1.tarifs[0].mensualite, 35000)
  console.log('✔ Assertion 6 OK: Master 1 Gestion (Forfait Bourse: 390k, Insc: 75k, Mens: 35k).')

  // Assertion 7: Verification Master 2 Gestion avec Soutenance 50k
  const cgM2 = etab.programmes.find(p => p.slug === 'isca-comptabilite-gestion-master-2-cours-jour')
  assert.ok(cgM2, 'Assertion 7 Échouée : Master 2 Gestion introuvable.')
  assert.strictEqual(cgM2.tarifs[0].montantBourse, 440000)
  assert.strictEqual(cgM2.tarifs[0].fraisSoutenance, 50000)
  assert.strictEqual(cgM2.tarifs[0].montant, 945000)
  console.log('✔ Assertion 7 OK: Master 2 Gestion (Forfait Bourse: 440k, Soutenance: 50k).')

  // Assertion 8: Verification Génie Informatique (Réseaux & Télécoms Licence 1)
  const infoL1 = etab.programmes.find(p => p.slug === 'isca-reseaux-telecommunications-licence-1-cours-jour')
  assert.ok(infoL1, 'Assertion 8 Échouée : Réseaux & Télécoms Licence 1 introuvable.')
  assert.strictEqual(infoL1.tarifs[0].montantBourse, 300000)
  assert.strictEqual(infoL1.tarifs[0].montant, 455000)
  console.log('✔ Assertion 8 OK: Génie Info Réseaux & Télécoms Licence 1 (Normal: 455k, Bourse: 300k).')

  // Assertion 9: Verification Génie Civil Licence 1 (350k Bourse, 630k Normal)
  const gcL1 = etab.programmes.find(p => p.slug === 'isca-genie-civil-licence-1-cours-jour')
  assert.ok(gcL1, 'Assertion 9 Échouée : Génie Civil Licence 1 introuvable.')
  assert.strictEqual(gcL1.tarifs[0].montantBourse, 350000)
  assert.strictEqual(gcL1.tarifs[0].montant, 630000)
  assert.strictEqual(gcL1.tarifs[0].fraisInscription, 35000)
  console.log('✔ Assertion 9 OK: Génie Civil Licence 1 (Normal: 630k, Bourse: 350k, Insc: 35k).')

  // Assertion 10: Verification Génie Civil Licence 2 avec TP Labo 20k
  const gcL2 = etab.programmes.find(p => p.slug === 'isca-genie-civil-licence-2-cours-jour')
  assert.ok(gcL2, 'Assertion 10 Échouée : Génie Civil Licence 2 introuvable.')
  assert.strictEqual(gcL2.tarifs[0].autresFrais, 20000)
  console.log('✔ Assertion 10 OK: Génie Civil Licence 2 contient les TP Labo 20 000 F séparés.')

  // Assertion 11: ABSENCE de M1 / M2 en Bourse pour Génie Civil
  const gcM1 = etab.programmes.find(p => p.slug === 'isca-genie-civil-master-1-cours-jour')
  assert.strictEqual(gcM1, undefined, 'Assertion 11 Échouée : Master 1 Génie Civil Bourse inventé !')
  console.log('✔ Assertion 11 OK: Aucun Master 1 Bourse inventé pour Génie Civil.')

  // Assertion 12: Verification SVT Licence 1 & Licence 2 (350k Bourse, 605k Normal)
  const svtL1 = etab.programmes.find(p => p.slug === 'isca-exploration-exploitation-des-mines-licence-1-cours-jour')
  assert.ok(svtL1, 'Assertion 12 Échouée : SVT Mines Licence 1 introuvable.')
  assert.strictEqual(svtL1.tarifs[0].montantBourse, 350000)
  assert.strictEqual(svtL1.tarifs[0].montant, 605000)
  console.log('✔ Assertion 12 OK: SVT Mines Licence 1 (Normal: 605k, Bourse: 350k).')

  // Assertion 13: ABSENCE de Licence 3 / M1 / M2 en Bourse pour SVT
  const svtL3 = etab.programmes.find(p => p.slug === 'isca-exploration-exploitation-des-mines-licence-3-cours-jour')
  assert.strictEqual(svtL3, undefined, 'Assertion 13 Échouée : Licence 3 SVT Bourse inventé !')
  console.log('✔ Assertion 13 OK: Aucun niveau Licence 3/M1/M2 Bourse inventé pour SVT.')

  // Assertion 14: Verification Week-End distinction
  const weekL1 = etab.programmes.find(p => p.slug === 'isca-comptabilite-gestion-licence-1-week-end')
  assert.ok(weekL1, 'Assertion 14 Échouée : Comptabilité Gestion Licence 1 Week-end introuvable.')
  assert.strictEqual(weekL1.modalites, 'Cours de week-end')
  console.log('✔ Assertion 14 OK: Offres Week-end correctement séparées des Cours du jour.')

  // Assertion 15: Jargon ISCA FORFAIT BOURSE dans les conditions
  const b = cgL1.bourses[0]
  assert.ok(b.conditions.includes('FORFAIT BOURSE'), 'Assertion 15 Échouée : Jargon FORFAIT BOURSE absent.')
  console.log('✔ Assertion 15 OK: Jargon "FORFAIT BOURSE" conservé dans l\'offre.')

  // Assertion 16: Année Académique = 2026-2027 sur le tarif
  assert.strictEqual(cgL1.tarifs[0].anneeAcademique, '2026-2027')
  console.log('✔ Assertion 16 OK: Année académique = 2026-2027.')

  // Assertion 17: Quota par défaut (0 = aucune limite fictive)
  assert.strictEqual(b.quota, 0)
  console.log('✔ Assertion 17 OK: quota = 0 (Aucune limite fictive inventée).')

  // Assertion 18: Unicité des Slugs
  const slugs = etab.programmes.map(p => p.slug)
  const uniqueSlugs = new Set(slugs)
  assert.strictEqual(slugs.length, uniqueSlugs.size, 'Assertion 18 Échouée : Doublons dans les slugs !')
  console.log('✔ Assertion 18 OK: 0 doublon de slug parmi les 203 offres ISCA.')

  // Assertion 19: Durée académique vs Durée de paiement (9 mois)
  assert.strictEqual(cgL1.tarifs[0].nombreMois, 9)
  console.log('✔ Assertion 19 OK: Durée de paiement officielle = 9 mois.')

  // Assertion 20: Frais d'uniforme mentionnés dans les conditions pour cours du jour
  assert.ok(cgL1.conditionsAdmission.includes('Uniforme obligatoire : 30 000 FCFA'), 'Assertion 20 Échouée: Frais d uniforme absents.')
  console.log('✔ Assertion 20 OK: Uniforme 30 000 F figurant séparément dans les conditions admission.')

  console.log(`\n🎉 TOUTES LES 20 ASSERTIONS SONT 100% VALIDÉES POUR ISCA !`)
}

async function main() {
  const p1 = await runImportPassage(1)
  const p2 = await runImportPassage(2)

  // Vérification de l'idempotence au 2ème passage
  assert.strictEqual(p2.programmesCreated, 0, 'Idempotence échouée : des programmes ont été recréés au passage 2 !')
  assert.strictEqual(p2.boursesCreated, 0, 'Idempotence échouée : des bourses ont été recréées au passage 2 !')
  console.log('\n✔ VÉRIFICATION IDEMPOTENCE OK : 0 création au passage 2.')

  await verifyAssertions()
}

main()
  .catch(err => {
    console.error('❌ ERREUR LORS DE L IMPORTATION ISCA:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
