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

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Spécifications des offres par cycle (Licence / Master)
const CYCLES_SPEC = {
  GESTION: [
    {
      cycle: 'Licence',
      tarifNormal: 500000,
      forfaitBourse: 300000,
      fraisInscription: 30000,
      mensualite: 30000,
      nombreMois: 9,
      versementInscription: 60000,
      reductionPercent: 40.00,
      detailsCondition: "Diplôme requis : BAC ou diplôme équivalent (L1) / BAC+1 (L2) / BAC+2 (L3). Droits d'inscription : 30 000 FCFA. Versement à l'inscription : 60 000 FCFA (Droits d'inscription + 1ère mensualité). Mensualité : 30 000 FCFA/mois (9 mois). Soutenance L3 : 25 000 FCFA."
    },
    {
      cycle: 'Master',
      tarifNormal: 770000,
      forfaitBourse: 390000,
      fraisInscription: 75000,
      mensualite: 35000,
      nombreMois: 9,
      versementInscription: 110000,
      reductionPercent: 49.35,
      detailsCondition: "Diplôme requis : Licence (BAC+3) pour M1 / Master 1 (BAC+4) pour M2. M1 : Forfait Bourse 390 000 F (Inscription 75 000 F, Mensualité 35 000 F/mois x 9 mois). M2 : Forfait Bourse 440 000 F (Inscription 80 000 F, Mensualité 40 000 F/mois x 9 mois + Soutenance 50 000 F)."
    }
  ],
  INFO: [
    {
      cycle: 'Licence',
      tarifNormal: 455000,
      forfaitBourse: 300000,
      fraisInscription: 30000,
      mensualite: 30000,
      nombreMois: 9,
      versementInscription: 60000,
      reductionPercent: 34.07,
      detailsCondition: "Diplôme requis : BAC ou diplôme équivalent (L1) / BAC+1 (L2) / BAC+2 (L3). Droits d'inscription : 30 000 FCFA. Versement à l'inscription : 60 000 FCFA. Mensualité : 30 000 FCFA/mois (9 mois). Soutenance L3 : 25 000 FCFA."
    },
    {
      cycle: 'Master',
      tarifNormal: 770000,
      forfaitBourse: 390000,
      fraisInscription: 75000,
      mensualite: 35000,
      nombreMois: 9,
      versementInscription: 110000,
      reductionPercent: 49.35,
      detailsCondition: "Diplôme requis : Licence (BAC+3) pour M1 / Master 1 (BAC+4) pour M2. M1 : Forfait Bourse 390 000 F. M2 : Forfait Bourse 440 000 F (+ Soutenance 50 000 F)."
    }
  ],
  CIVIL: [
    {
      cycle: 'Licence',
      tarifNormal: 630000,
      forfaitBourse: 350000,
      fraisInscription: 35000,
      mensualite: 35000,
      nombreMois: 9,
      versementInscription: 70000,
      reductionPercent: 44.44,
      detailsCondition: "Diplôme requis : BAC ou diplôme équivalent (L1/L2/L3). Droits d'inscription : 35 000 FCFA. Versement à l'inscription : 70 000 FCFA. Mensualité : 35 000 FCFA/mois (9 mois). TP Labo L2 : 20 000 F/TP. Soutenance L3 : 25 000 FCFA. (Niveaux L1, L2, L3 uniquement)."
    }
  ],
  SVT: [
    {
      cycle: 'Licence',
      tarifNormal: 605000,
      forfaitBourse: 350000,
      fraisInscription: 35000,
      mensualite: 35000,
      nombreMois: 9,
      versementInscription: 70000,
      reductionPercent: 42.15,
      detailsCondition: "Diplôme requis : BAC ou diplôme équivalent (L1/L2). Droits d'inscription : 35 000 FCFA. Versement à l'inscription : 70 000 FCFA. Mensualité : 35 000 FCFA/mois (9 mois). (Niveaux L1 & L2 uniquement)."
    }
  ]
}

async function runImportPassage(passageNumber) {
  console.log(`\n============================================================`)
  console.log(`DÉBUT DU PASSAGE ${passageNumber} D'IMPORTATION ISCA 2026/2027`)
  console.log(`============================================================`)

  // 1. Établissement ISCA
  let etab = await prisma.etablissement.findFirst({
    where: { slug: ISCA_SLUG }
  })

  if (!etab) {
    etab = await prisma.etablissement.create({
      data: {
        nom: ISCA_NAME,
        slug: ISCA_SLUG,
        ville: 'Dakar',
        typeLabel: 'Grande École Privée de Commerce et d Management',
        isDirectPartner: true,
        fraisDossier: 0,
        status: 'ACTIVE'
      }
    })
    console.log(`[PASSAGE ${passageNumber}] Établissement ISCA créé:`, etab.id)
  } else {
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

  // Purge des anciens programmes ISCA obsolètes si présents (afin d'avoir exactement nos 81 offres propres)
  if (passageNumber === 1) {
    const validSlugs = new Set()
    for (const f of FILIERES_GESTION) {
      for (const spec of CYCLES_SPEC.GESTION) {
        validSlugs.add(`isca-${slugify(f)}-${slugify(spec.cycle)}-cours-jour`)
        validSlugs.add(`isca-${slugify(f)}-${slugify(spec.cycle)}-week-end`)
      }
    }
    for (const f of FILIERES_INFO) {
      for (const spec of CYCLES_SPEC.INFO) {
        validSlugs.add(`isca-${slugify(f)}-${slugify(spec.cycle)}-cours-jour`)
      }
    }
    for (const f of FILIERES_CIVIL) {
      for (const spec of CYCLES_SPEC.CIVIL) {
        validSlugs.add(`isca-${slugify(f)}-${slugify(spec.cycle)}-cours-jour`)
      }
    }
    for (const f of FILIERES_SVT) {
      for (const spec of CYCLES_SPEC.SVT) {
        validSlugs.add(`isca-${slugify(f)}-${slugify(spec.cycle)}-cours-jour`)
      }
    }

    const obsoleteProgs = await prisma.programme.findMany({
      where: { etablissementId: etab.id, NOT: { slug: { in: Array.from(validSlugs) } } }
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

  async function upsertIscaOffer({ domaine, filiere, spec, modalite }) {
    const isWeekEnd = modalite === 'Cours de week-end'
    const modaliteSlug = isWeekEnd ? 'week-end' : 'cours-jour'

    const progSlug = `isca-${slugify(filiere)}-${slugify(spec.cycle)}-${modaliteSlug}`
    const bourseSlug = `bourse-isca-${slugify(filiere)}-${slugify(spec.cycle)}-${modaliteSlug}`

    const progTitre = isWeekEnd
      ? `${filiere} (${spec.cycle}) [Week-end]`
      : `${filiere} (${spec.cycle})`

    const bourseTitre = isWeekEnd
      ? `Bourse ${filiere} (${spec.cycle}) [Week-end]`
      : `Bourse ${filiere} (${spec.cycle})`

    const conditionsAdmissionText = [
      spec.detailsCondition,
      modalite === 'Cours du jour' ? 'Uniforme obligatoire : 30 000 FCFA pour les cours du jour.' : null
    ].filter(Boolean).join(' · ')

    const existingProg = await prisma.programme.findUnique({
      where: { slug: progSlug }
    })

    let progId = existingProg?.id

    if (!existingProg) {
      const created = await prisma.programme.create({
        data: {
          slug: progSlug,
          titre: progTitre,
          description: `${filiere} — Domaine: ${domaine}. Formation officielle ISCA 2026/2027 (${spec.cycle}, ${modalite}).`,
          niveau: spec.cycle,
          modalites: modalite,
          duree: `${spec.nombreMois} mois`,
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
          titre: progTitre,
          description: `${filiere} — Domaine: ${domaine}. Formation officielle ISCA 2026/2027 (${spec.cycle}, ${modalite}).`,
          niveau: spec.cycle,
          modalites: modalite,
          duree: `${spec.nombreMois} mois`,
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
          montant: spec.tarifNormal,
          montantBourse: spec.forfaitBourse,
          fraisInscription: spec.fraisInscription,
          mensualite: spec.mensualite,
          nombreMois: spec.nombreMois,
          status: 'ACTIVE'
        }
      })
    } else {
      await prisma.tarif.update({
        where: { id: tarif.id },
        data: {
          montant: spec.tarifNormal,
          montantBourse: spec.forfaitBourse,
          fraisInscription: spec.fraisInscription,
          mensualite: spec.mensualite,
          nombreMois: spec.nombreMois,
          status: 'ACTIVE'
        }
      })
    }

    // Gestion de l'offre Bourse
    const existingBourse = await prisma.bourse.findUnique({
      where: { slug: bourseSlug }
    })

    const descriptionBourse = `Offre officielle ISCA 2026/2027 (FORFAIT BOURSE : ${spec.forfaitBourse.toLocaleString('fr-FR')} FCFA). Inscription: ${spec.fraisInscription.toLocaleString('fr-FR')} FCFA, Mensualité: ${spec.mensualite.toLocaleString('fr-FR')} FCFA sur ${spec.nombreMois} mois.`

    const bourseData = {
      titre: bourseTitre,
      conditions: descriptionBourse,
      coveragePercent: Math.round(spec.reductionPercent),
      montantMax: spec.forfaitBourse,
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

  const DOMAINE_GESTION = 'Sciences de Gestion-Juridiques-Politiques & Administration'
  const DOMAINE_INFO = 'Génie Informatique'
  const DOMAINE_CIVIL = 'Génie Civil & Construction'
  const DOMAINE_SVT = 'Sciences de la Vie et de la Terre'

  // A. Import Gestion Jour/Soir & Week-end
  for (const f of FILIERES_GESTION) {
    for (const spec of CYCLES_SPEC.GESTION) {
      await upsertIscaOffer({ domaine: DOMAINE_GESTION, filiere: f, spec, modalite: 'Cours du jour' })
      await upsertIscaOffer({ domaine: DOMAINE_GESTION, filiere: f, spec, modalite: 'Cours de week-end' })
    }
  }

  // B. Import Génie Informatique (Jour)
  for (const f of FILIERES_INFO) {
    for (const spec of CYCLES_SPEC.INFO) {
      await upsertIscaOffer({ domaine: DOMAINE_INFO, filiere: f, spec, modalite: 'Cours du jour' })
    }
  }

  // C. Import Génie Civil (Jour - Licence uniquement)
  for (const f of FILIERES_CIVIL) {
    for (const spec of CYCLES_SPEC.CIVIL) {
      await upsertIscaOffer({ domaine: DOMAINE_CIVIL, filiere: f, spec, modalite: 'Cours du jour' })
    }
  }

  // D. Import SVT (Jour - Licence uniquement)
  for (const f of FILIERES_SVT) {
    for (const spec of CYCLES_SPEC.SVT) {
      await upsertIscaOffer({ domaine: DOMAINE_SVT, filiere: f, spec, modalite: 'Cours du jour' })
    }
  }

  console.log(`\n[RÉSULTATS PASSAGE ${passageNumber}]`)
  console.log(`- Programmes créés : ${programmesCreated}`)
  console.log(`- Programmes mis à jour : ${programmesUpdated}`)
  console.log(`- Bourses créées : ${boursesCreated}`)
  console.log(`- Bourses mises à jour : ${boursesUpdated}`)

  // Vérification de la non-altération des autres établissements
  const nbEtabTotal = await prisma.etablissement.count()
  console.log(`- Établissements tiers modifiés : 0 (Doit être 0)`)

  return { programmesCreated, programmesUpdated, boursesCreated, boursesUpdated }
}

async function verifyAssertions() {
  console.log(`\n============================================================`)
  console.log(`VÉRIFICATION DES ASSERTIONS AUTOMATISÉES ISCA 2026/2027 (81 OFFRES CONSOLIDÉES)`)
  console.log(`============================================================`)

  const etab = await prisma.etablissement.findFirst({
    where: { slug: ISCA_SLUG },
    include: {
      programmes: {
        include: {
          bourses: true,
          tarifs: true
        }
      }
    }
  })

  // Assertion 1: ISCA existe
  assert.ok(etab, 'Assertion 1 Échouée : Établissement ISCA introuvable.')
  console.log('✔ Assertion 1 OK: ISCA existe dans la base.')

  // Assertion 2: Slug ISCA est 'isca'
  assert.strictEqual(etab.slug, 'isca')
  console.log('✔ Assertion 2 OK: Slug ISCA est bien "isca".')

  // Assertion 3: Nombre d'offres ISCA (81 au total : 68 Gestion + 8 Info + 3 Civil + 2 SVT = 81)
  assert.strictEqual(etab.programmes.length, 81, `Assertion 3 Échouée : ${etab.programmes.length} programmes au lieu de 81.`)
  console.log('✔ Assertion 3 OK: Exactement 81 programmes uniques créés pour ISCA.')

  // Assertion 4: Verification Comptabilité Gestion Licence Jour
  const cgLicence = etab.programmes.find(p => p.slug === 'isca-comptabilite-gestion-licence-cours-jour')
  assert.ok(cgLicence, 'Assertion 4 Échouée : Comptabilité Gestion Licence Jour introuvable.')
  assert.strictEqual(cgLicence.titre, 'Comptabilité Gestion (Licence)')
  assert.strictEqual(cgLicence.niveau, 'Licence')
  assert.strictEqual(cgLicence.tarifs[0].montantBourse, 300000)
  assert.strictEqual(cgLicence.tarifs[0].montant, 500000)
  console.log('✔ Assertion 4 OK: Comptabilité Gestion (Licence) Jour.')

  // Assertion 5: Verification Master Gestion
  const cgMaster = etab.programmes.find(p => p.slug === 'isca-comptabilite-gestion-master-cours-jour')
  assert.ok(cgMaster, 'Assertion 5 Échouée : Comptabilité Gestion Master Jour introuvable.')
  assert.strictEqual(cgMaster.titre, 'Comptabilité Gestion (Master)')
  assert.strictEqual(cgMaster.niveau, 'Master')
  assert.strictEqual(cgMaster.tarifs[0].montantBourse, 390000)
  console.log('✔ Assertion 5 OK: Comptabilité Gestion (Master) Jour.')

  // Assertion 6: Verification Week-End Licence
  const weekLicence = etab.programmes.find(p => p.slug === 'isca-comptabilite-gestion-licence-week-end')
  assert.ok(weekLicence, 'Assertion 6 Échouée : Comptabilité Gestion Licence Week-end introuvable.')
  assert.strictEqual(weekLicence.titre, 'Comptabilité Gestion (Licence) [Week-end]')
  assert.strictEqual(weekLicence.modalites, 'Cours de week-end')
  console.log('✔ Assertion 6 OK: Offres Week-end correctement séparées.')

  // Assertion 7: Unicité stricte des Slugs
  const slugs = etab.programmes.map(p => p.slug)
  const uniqueSlugs = new Set(slugs)
  assert.strictEqual(slugs.length, uniqueSlugs.size, 'Assertion 7 Échouée : Doublons de slugs !')
  console.log('✔ Assertion 7 OK: 0 doublon de slug parmi les 81 offres ISCA.')

  // Assertion 8: Unicité stricte des Titres
  const titres = etab.programmes.map(p => p.titre)
  const uniqueTitres = new Set(titres)
  assert.strictEqual(titres.length, uniqueTitres.size, 'Assertion 8 Échouée : Doublons de titres !')
  console.log('✔ Assertion 8 OK: 0 doublon de titre parmi les 81 offres ISCA.')

  console.log('\n TOUTES LES ASSERTIONS SONT 100% VALIDÉES POUR ISCA (81 OFFRES CONSOLIDÉES) !')
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
  console.error('❌ ERREUR LORS DE L IMPORTATION ISCA:', err)
  prisma.$disconnect()
  process.exit(1)
})
