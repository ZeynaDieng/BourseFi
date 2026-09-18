import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

const EHES_ETAB_SLUG = 'ehes-dakar'
const EHES_ETAB_NAME = 'École des Hautes Études en Sciences (EHES)'

const EHES_ADVANTAGES = [
  'Stages professionnels',
  'Programme d\'anglais intensif',
  'Intégration de l\'intelligence artificielle dans les formations',
  'Accompagnement à l\'insertion professionnelle',
  'Diplômes reconnus',
  'Partenariats internationaux',
  'Formations professionnalisantes'
].join(' · ')

// 9 Domaines de formation officiels EHES
const DOMAINES_EHES = [
  {
    baseSlug: 'ehes-gestion-des-entreprises-et-des-administrations',
    titre: 'Gestion des Entreprises et des Administrations (GEA)',
    code: 'GEA',
    domaine: 'Management et Administration',
    description: 'La formation GEA prépare les étudiants aux métiers de la gestion, de l\'administration, du management, de la comptabilité, des ressources humaines, du marketing et de la finance.',
    debouches: [
      'Responsable administratif',
      'Assistant comptable',
      'Responsable financier',
      'Responsable marketing',
      'Responsable RH',
      'Gestionnaire de projet',
      'Entrepreneur',
      'Cadre d\'entreprise'
    ],
    fraisInscription: 282500,
    mensualiteNormale: 85000,
    mensualiteBourseFi: 59500,
    coveragePercent: 30,
    diplomesDetail: [
      { diplome: 'Licence', niveau: 'Licence', slugSuffix: 'licence', duree: '3 ans (L1, L2, L3)' },
      { diplome: 'Bachelor', niveau: 'Bachelor', slugSuffix: 'bachelor', duree: '3 ans' },
      { diplome: 'Master', niveau: 'Master', slugSuffix: 'master', duree: '2 ans (M1, M2)' }
    ]
  },
  {
    baseSlug: 'ehes-transport-et-logistique',
    titre: 'Transport et Logistique',
    domaine: 'Transport et Supply Chain',
    description: 'Formation spécialisée dans la gestion des flux, de la chaîne logistique, du transport national et international ainsi que de la supply chain.',
    debouches: [
      'Responsable logistique',
      'Responsable supply chain',
      'Gestionnaire de stock',
      'Agent de transit',
      'Responsable transport',
      'Responsable import-export'
    ],
    fraisInscription: 282500,
    mensualiteNormale: 85000,
    mensualiteBourseFi: 59500,
    coveragePercent: 30,
    diplomesDetail: [
      { diplome: 'Licence', niveau: 'Licence', slugSuffix: 'licence', duree: '3 ans (L1, L2, L3)' },
      { diplome: 'Bachelor', niveau: 'Bachelor', slugSuffix: 'bachelor', duree: '3 ans' },
      { diplome: 'Master', niveau: 'Master', slugSuffix: 'master', duree: '2 ans (M1, M2)' }
    ]
  },
  {
    baseSlug: 'ehes-logistique-petroliere-et-gaziere',
    titre: 'Logistique Pétrolière et Gazière',
    domaine: 'Pétrole, Gaz et Logistique',
    description: 'Formation orientée vers la gestion logistique des activités pétrolières et gazières, le transport des hydrocarbures et la supply chain énergétique.',
    debouches: [
      'Logisticien pétrolier',
      'Responsable approvisionnement',
      'Responsable transport hydrocarbures',
      'Coordinateur logistique'
    ],
    fraisInscription: 282500,
    mensualiteNormale: 85000,
    mensualiteBourseFi: 59500,
    coveragePercent: 30,
    diplomesDetail: [
      { diplome: 'Licence', niveau: 'Licence', slugSuffix: 'licence', duree: '3 ans (L1, L2, L3)' },
      { diplome: 'Bachelor', niveau: 'Bachelor', slugSuffix: 'bachelor', duree: '3 ans' },
      { diplome: 'Master', niveau: 'Master', slugSuffix: 'master', duree: '2 ans (M1, M2)' }
    ]
  },
  {
    baseSlug: 'ehes-marketing-vente-et-commerce',
    titre: 'Marketing Vente et Commerce',
    domaine: 'Commerce et Marketing',
    description: 'Formation spécialisée dans les techniques commerciales, la négociation, la relation client, le marketing et le développement des ventes.',
    debouches: [
      'Responsable commercial',
      'Chef de produit',
      'Responsable marketing',
      'Business developer',
      'Responsable clientèle'
    ],
    fraisInscription: 282500,
    mensualiteNormale: 85000,
    mensualiteBourseFi: 59500,
    coveragePercent: 30,
    diplomesDetail: [
      { diplome: 'Licence', niveau: 'Licence', slugSuffix: 'licence', duree: '3 ans (L1, L2, L3)' },
      { diplome: 'Bachelor', niveau: 'Bachelor', slugSuffix: 'bachelor', duree: '3 ans' },
      { diplome: 'Master', niveau: 'Master', slugSuffix: 'master', duree: '2 ans (M1, M2)' }
    ]
  },
  {
    baseSlug: 'ehes-marketing-digital',
    titre: 'Marketing Digital',
    domaine: 'Marketing Digital',
    description: 'Formation orientée vers le marketing numérique, les réseaux sociaux, la publicité digitale, le référencement et l\'acquisition client.',
    debouches: [
      'Community Manager',
      'Traffic Manager',
      'Responsable Marketing Digital',
      'Consultant SEO',
      'Growth Marketer'
    ],
    fraisInscription: 282500,
    mensualiteNormale: 85000,
    mensualiteBourseFi: 59500,
    coveragePercent: 30,
    diplomesDetail: [
      { diplome: 'Licence', niveau: 'Licence', slugSuffix: 'licence', duree: '3 ans (L1, L2, L3)' },
      { diplome: 'Bachelor', niveau: 'Bachelor', slugSuffix: 'bachelor', duree: '3 ans' },
      { diplome: 'Master', niveau: 'Master', slugSuffix: 'master', duree: '2 ans (M1, M2)' }
    ]
  },
  {
    baseSlug: 'ehes-data-et-intelligence-artificielle',
    titre: 'Data et Intelligence Artificielle',
    domaine: 'Data Science et IA',
    description: 'Formation spécialisée dans la science des données, l\'intelligence artificielle, le machine learning, l\'analyse de données et les technologies émergentes.',
    debouches: [
      'Data Analyst',
      'Data Scientist',
      'AI Engineer',
      'Machine Learning Engineer',
      'Consultant Data'
    ],
    fraisInscription: 282500,
    mensualiteNormale: 85000,
    mensualiteBourseFi: 59500,
    coveragePercent: 30,
    diplomesDetail: [
      { diplome: 'Licence', niveau: 'Licence', slugSuffix: 'licence', duree: '3 ans (L1, L2, L3)' },
      { diplome: 'Bachelor', niveau: 'Bachelor', slugSuffix: 'bachelor', duree: '3 ans' },
      { diplome: 'Master', niveau: 'Master', slugSuffix: 'master', duree: '2 ans (M1, M2)' }
    ]
  },
  {
    baseSlug: 'ehes-genie-civil',
    titre: 'Génie Civil',
    domaine: 'BTP',
    description: 'Formation spécialisée dans la conception, la réalisation et la gestion des infrastructures et bâtiments.',
    debouches: [
      'Conducteur de travaux',
      'Ingénieur BTP',
      'Dessinateur projeteur',
      'Chef de chantier',
      'Responsable travaux'
    ],
    fraisInscription: 282500,
    mensualiteNormale: 60000,
    mensualiteBourseFi: 42000,
    coveragePercent: 30,
    diplomesDetail: [
      { diplome: 'BTS d\'État', niveau: 'BTS', slugSuffix: 'bts', duree: '2 ans (BTS1, BTS2)' },
      { diplome: 'Licence', niveau: 'Licence', slugSuffix: 'licence', duree: '3 ans (L1, L2, L3)' },
      { diplome: 'Master', niveau: 'Master', slugSuffix: 'master', duree: '2 ans (M1, M2)' }
    ]
  },
  {
    baseSlug: 'ehes-geomatique',
    titre: 'Géomatique',
    domaine: 'Cartographie et Géomatique',
    description: 'Formation spécialisée dans les SIG, la cartographie numérique, le GPS, la télédétection et l\'analyse spatiale.',
    debouches: [
      'Géomaticien',
      'Cartographe',
      'Technicien SIG',
      'Analyste spatial',
      'Topographe'
    ],
    fraisInscription: 282500,
    mensualiteNormale: 85000,
    mensualiteBourseFi: 59500,
    coveragePercent: 30,
    diplomesDetail: [
      { diplome: 'BTS d\'État', niveau: 'BTS', slugSuffix: 'bts', duree: '2 ans (BTS1, BTS2)' },
      { diplome: 'Licence', niveau: 'Licence', slugSuffix: 'licence', duree: '3 ans (L1, L2, L3)' },
      { diplome: 'Master', niveau: 'Master', slugSuffix: 'master', duree: '2 ans (M1, M2)' }
    ]
  },
  {
    baseSlug: 'ehes-ingenierie-du-petrole-et-du-gaz',
    titre: 'Ingénierie du Pétrole et du Gaz',
    domaine: 'Pétrole et Gaz',
    description: 'Programme international bilingue formant des spécialistes du secteur pétrolier et gazier. Les étudiants sont formés aux techniques d\'exploration, de production, de transport et de gestion des hydrocarbures.',
    debouches: [
      'Ingénieur pétrolier',
      'Ingénieur forage',
      'Ingénieur réservoir',
      'Responsable production',
      'Responsable QHSE'
    ],
    fraisInscription: 382500,
    mensualiteNormale: 175000,
    mensualiteBourseFi: 136500,
    coveragePercent: 22,
    diplomesDetail: [
      { diplome: 'Bachelor International', niveau: 'Bachelor', slugSuffix: 'bachelor', duree: '4 ans (Bachelor 1, 2, 3, 4)' }
    ]
  }
]

// Génération de la liste complète des 25 programmes détaillés par Diplôme / Cycle
function getDetailedEHESProgrammes() {
  const programmes = []
  for (const d of DOMAINES_EHES) {
    for (const dt of d.diplomesDetail) {
      programmes.push({
        slug: `${d.baseSlug}-${dt.slugSuffix}`,
        titre: `${d.titre} — ${dt.diplome}`,
        niveauLabel: dt.niveau,
        duree: dt.duree,
        diplome: dt.diplome,
        domaine: d.domaine,
        description: d.description,
        debouches: d.debouches,
        fraisInscription: d.fraisInscription,
        mensualiteNormale: d.mensualiteNormale,
        mensualiteBourseFi: d.mensualiteBourseFi,
        coveragePercent: d.coveragePercent
      })
    }
  }
  return programmes
}

export async function runImportEHES() {
  console.log("🚀 Début de l'importation officielle EHES (25 programmes détaillés par Diplômes/Niveaux)...")

  const report = {
    etabCreatedOrUpdated: false,
    programmesCreated: 0,
    programmesUpdated: 0,
    tarifsCreated: 0,
    boursesUpserted: 0
  }

  const detailedProgrammes = getDetailedEHESProgrammes()

  await prisma.$transaction(async (tx) => {
    // 1. Partenaire par défaut (BourseFi)
    let partner = await tx.partner.findFirst({ where: { slug: 'boursefi' } })
    if (!partner) {
      partner = await tx.partner.findFirst()
    }
    assert.ok(partner, "Un partenaire par défaut doit exister")

    // 2. Établissement EHES
    const etab = await tx.etablissement.upsert({
      where: { slug: EHES_ETAB_SLUG },
      update: {
        nom: EHES_ETAB_NAME,
        ville: 'Dakar',
        adresse: 'Dakar, Sénégal',
        accreditation: 'Agréé par le Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation du Sénégal (MESRI)',
        site: 'https://ehes.sn',
        resume: 'L\'École des Hautes Études en Sciences (EHES) est un établissement d\'enseignement supérieur spécialisé dans les domaines du management, de la logistique, du pétrole et du gaz, du génie civil, de la géomatique, du marketing et des nouvelles technologies. L\'école propose des formations professionnalisantes allant du BTS au Master avec une forte orientation vers l\'employabilité, l\'innovation, l\'entrepreneuriat et l\'internationalisation.',
        typeLabel: 'École Supérieure',
        status: 'ACTIVE',
        isDirectPartner: true,
        fraisDossier: 15000,
        contactStatus: 'VERIFIED',
        contactVerifiedAt: new Date()
      },
      create: {
        slug: EHES_ETAB_SLUG,
        nom: EHES_ETAB_NAME,
        ville: 'Dakar',
        adresse: 'Dakar, Sénégal',
        accreditation: 'Agréé par le Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation du Sénégal (MESRI)',
        site: 'https://ehes.sn',
        resume: 'L\'École des Hautes Études en Sciences (EHES) est un établissement d\'enseignement supérieur spécialisé dans les domaines du management, de la logistique, du pétrole et du gaz, du génie civil, de la géomatique, du marketing et des nouvelles technologies. L\'école propose des formations professionnalisantes allant du BTS au Master avec une forte orientation vers l\'employabilité, l\'innovation, l\'entrepreneuriat et l\'internationalisation.',
        typeLabel: 'École Supérieure',
        status: 'ACTIVE',
        isDirectPartner: true,
        fraisDossier: 15000,
        contactStatus: 'VERIFIED',
        contactVerifiedAt: new Date()
      }
    })
    report.etabCreatedOrUpdated = true
    console.log(`✅ Établissement EHES configuré : ${etab.nom} (${etab.id})`)

    // Nettoyer les anciens programmes EHES génériques non-détaillés si présents
    const validSlugs = detailedProgrammes.map((p) => p.slug)
    await tx.programme.deleteMany({
      where: {
        etablissementId: etab.id,
        slug: { notIn: validSlugs }
      }
    })

    // 3. Boucle d'importation des 25 Formations détaillées
    for (const fData of detailedProgrammes) {
      let prog = await tx.programme.findUnique({
        where: { slug: fData.slug }
      })

      const debouchesJson = JSON.stringify(fData.debouches)

      if (prog) {
        prog = await tx.programme.update({
          where: { id: prog.id },
          data: {
            titre: fData.titre,
            niveau: fData.niveauLabel,
            duree: fData.duree,
            ville: 'Dakar',
            description: `${fData.description} (Diplôme préparé : ${fData.diplome}).`,
            debouches: debouchesJson,
            perspectives: `Points forts & Avantages EHES : ${EHES_ADVANTAGES}`,
            fraisDossier: 15000,
            fraisDossierEtranger: 30000,
            devise: 'FCFA',
            status: 'ACTIVE',
            etablissementId: etab.id,
            partnerId: partner.id,
          }
        })
        report.programmesUpdated++
      } else {
        prog = await tx.programme.create({
          data: {
            slug: fData.slug,
            titre: fData.titre,
            niveau: fData.niveauLabel,
            duree: fData.duree,
            ville: 'Dakar',
            description: `${fData.description} (Diplôme préparé : ${fData.diplome}).`,
            debouches: debouchesJson,
            perspectives: `Points forts & Avantages EHES : ${EHES_ADVANTAGES}`,
            fraisDossier: 15000,
            fraisDossierEtranger: 30000,
            devise: 'FCFA',
            status: 'ACTIVE',
            etablissementId: etab.id,
            partnerId: partner.id,
          }
        })
        report.programmesCreated++
      }

      // 4. Configuration Tarifaire (Année Académique 2026-2027)
      await tx.tarif.deleteMany({
        where: { programmeId: prog.id }
      })

      const montantTotalAnnuel = fData.mensualiteNormale * 10
      const montantBourseTotalAnnuel = fData.mensualiteBourseFi * 10

      await tx.tarif.create({
        data: {
          programmeId: prog.id,
          anneeAcademique: '2026-2027',
          label: `Tarif officiel BourseFi EHES 2026-2027 (${fData.diplome})`,
          montant: montantTotalAnnuel,
          montantBourse: montantBourseTotalAnnuel,
          fraisInscription: fData.fraisInscription,
          mensualite: fData.mensualiteBourseFi,
          nombreMois: 10,
          frequence: 'ANNUEL',
          devise: 'FCFA',
          isDefault: true,
          isVerified: true,
          status: 'ACTIVE',
        }
      })
      report.tarifsCreated++

      // 5. Configuration Offre Bourse BourseFi
      const bourseSlug = `bourse-${fData.slug}`
      const bourseTitle = `Bourse ${fData.titre}`

      const existingBourse = await tx.bourse.findFirst({
        where: { OR: [{ slug: bourseSlug }, { programmeId: prog.id }] }
      })

      const bourseData = {
        slug: bourseSlug,
        titre: bourseTitle,
        programmeId: prog.id,
        partnerId: partner.id,
        coveragePercent: fData.coveragePercent,
        quota: 30,
        placesRestantes: 22,
        dateLimite: new Date('2026-12-31T23:59:59.000Z'),
        conditions: `Admissibilité sur étude du dossier académique et entretien pour le niveau ${fData.diplome}.`,
        documentsRequis: 'Copie CNI / Passeport, Relevé de notes du Bac ou dernier diplôme, 2 photos d\'identité.',
        isActive: true,
        status: 'ACTIVE',
      }

      if (existingBourse) {
        await tx.bourse.update({
          where: { id: existingBourse.id },
          data: bourseData
        })
      } else {
        await tx.bourse.create({
          data: bourseData
        })
      }
      report.boursesUpserted++
    }

    console.log(`✅ Importation EHES terminée avec succès : ${detailedProgrammes.length} programmes détaillés par diplômes.`)
  })

  return report
}

async function main() {
  console.log("=== PASSAGE 1 : IMPORTATION INITIALE DÉTAILLÉE EHES ===")
  const stats1 = await runImportEHES()
  console.log("📊 Rapport passage 1 :", stats1)

  console.log("\n=== PASSAGE 2 : TEST D'IDEMPOTENCE ===")
  const stats2 = await runImportEHES()
  console.log("📊 Rapport passage 2 :", stats2)

  // Assertions de validation post-import
  assert.strictEqual(stats2.programmesCreated, 0, "[Assertion Idempotence] Aucun nouveau programme ne doit être créé au 2ème passage")

  const etab = await prisma.etablissement.findUnique({
    where: { slug: EHES_ETAB_SLUG }
  })
  assert.ok(etab, "[Assertion BDD] Établissement EHES présent")
  assert.strictEqual(etab.isDirectPartner, true, "[Assertion BDD] EHES est Partenaire Officiel Direct")

  const activeProgsCount = await prisma.programme.count({
    where: { etablissementId: etab.id, status: 'ACTIVE' }
  })
  assert.strictEqual(activeProgsCount, 25, "[Assertion BDD] Exactement 25 programmes actifs détaillés pour EHES")

  const activeBoursesCount = await prisma.bourse.count({
    where: { programme: { etablissementId: etab.id }, isActive: true, status: 'ACTIVE' }
  })
  assert.strictEqual(activeBoursesCount, 25, "[Assertion BDD] Exactement 25 bourses actives pour EHES")

  console.log("\n🎉 TOUTES LES ASSERTIONS ONT ÉTÉ VÉRIFIÉES AVEC SUCCÈS (25 PROGRAMMES DÉTAILLÉS) !")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error("❌ Erreur lors de l'importation EHES :", e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
