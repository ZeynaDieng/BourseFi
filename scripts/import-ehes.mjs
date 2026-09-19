import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

const EHES_ETAB_SLUG = 'ehes-dakar'
const EHES_ETAB_NAME = 'EHES Dakar (École des Hautes Études en Sciences)'
const EHES_ETAB_ADRESSE = "Dakar, Rond point Virage"
const EHES_ETAB_TYPE = 'École supérieure privée'
const EHES_ETAB_RESUME = `Fondé sur des exigences d'excellence et de sélectivité, le Groupe EHES Dakar s'impose comme une institution de référence au Sénégal et en Afrique. Véritable pionnière dans les formations de pointe en ingénierie du pétrole et du gaz, en transport et logistique option pétrole et gaz, ainsi qu'en gestion des entreprises pétrolières et gazières.

Le groupe EHES Dakar s'appuie sur un corps professoral, composé exclusivement d'ingénieurs, de docteurs et de professeurs de rang magistral. Cette excellence académique s'articule autour d'une pédagogie active, plaçant l'étudiant au cœur de situations réelles et professionnelles pour stimuler son esprit critique, son sens de l'innovation et sa capacité à relever les défis complexes.`

const EHES_ADVANTAGES = [
  'Corps professoral composé exclusivement d\'ingénieurs, docteurs et professeurs de rang magistral',
  'Pédagogie active axée sur des situations réelles et professionnelles',
  'Pionnier dans les formations pétrole et gaz au Sénégal et en Afrique',
  'Partenariats stratégiques et insertion professionnelle rapide',
  'Diplômes reconnus'
].join(' · ')

// 11 Programmes officiels EHES Dakar pris en compte dans le partenariat BourseFi
const PROGRAMMES_EHES = [
  {
    slug: 'ehes-ingenierie-du-petrole-et-du-gaz-bs',
    titre: 'Ingénierie du Pétrole et du Gaz - B.S',
    niveau: 'Bachelor',
    diplome: 'Bachelor of Science (B.S)',
    duree: '3 ans',
    domaine: 'Ingénierie, Pétrole & Gaz',
    description: 'Programme international de référence formant des spécialistes de pointe du secteur pétrolier et gazier en exploration, production, transport et gestion des hydrocarbures.',
    debouches: [
      'Ingénieur pétrolier',
      'Ingénieur forage',
      'Ingénieur réservoir',
      'Responsable production',
      'Responsable QHSE'
    ],
    montantNormal: 2132500,
    montantBourseFi: 1732500
  },
  {
    slug: 'ehes-transport-et-logistique-option-petrole-et-gaz',
    titre: 'Transport & Logistique Option Pétrole et Gaz',
    niveau: 'Licence',
    diplome: 'Licence',
    duree: '3 ans',
    domaine: 'Transport, Logistique & Énergie',
    description: 'Formation spécialisée dans la gestion logistique des activités pétrolières et gazières, le transport des hydrocarbures et la supply chain énergétique.',
    debouches: [
      'Logisticien pétrolier',
      'Responsable approvisionnement',
      'Responsable transport hydrocarbures',
      'Coordinateur logistique'
    ],
    montantNormal: 1132500,
    montantBourseFi: 877500
  },
  {
    slug: 'ehes-gestion-des-entreprises-option-petrole-et-gaz',
    titre: 'Gestion des Entreprises Option Pétrole et Gaz',
    niveau: 'Licence',
    diplome: 'Licence',
    duree: '3 ans',
    domaine: 'Management & Énergie',
    description: 'Formation préparant aux métiers de la gestion, de l\'administration et du management adaptés aux spécificités des entreprises pétrolières et gazières.',
    debouches: [
      'Responsable administratif pétrolier',
      'Assistant gestionnaire',
      'Responsable financier',
      'Cadre d\'entreprise secteur énergie'
    ],
    montantNormal: 1132500,
    montantBourseFi: 877500
  },
  {
    slug: 'ehes-marketing-option-digital-et-intelligence-artificielle',
    titre: 'Marketing Option Digital et Intelligence Artificielle',
    niveau: 'Licence',
    diplome: 'Licence',
    duree: '3 ans',
    domaine: 'Marketing Digital & IA',
    description: 'Programme innovant combinant marketing numérique, IA, réseaux sociaux, stratégie d\'acquisition client et nouvelles technologies.',
    debouches: [
      'Community Manager',
      'Growth Marketer',
      'Responsable Marketing Digital & IA',
      'Consultant SEO/Data Marketing'
    ],
    montantNormal: 1132500,
    montantBourseFi: 877500
  },
  {
    slug: 'ehes-genie-civil',
    titre: 'Génie Civil',
    niveau: 'Licence',
    diplome: 'Licence',
    duree: '3 ans',
    domaine: 'BTP & Construction',
    description: 'Formation axée sur la conception, le calcul de structures, la réalisation et la gestion de chantier de bâtiments et travaux publics.',
    debouches: [
      'Conducteur de travaux',
      'Ingénieur BTP',
      'Dessinateur projeteur',
      'Chef de chantier'
    ],
    montantNormal: 882500,
    montantBourseFi: 682500
  },
  {
    slug: 'ehes-geotechnique',
    titre: 'Géotechnique',
    niveau: 'Licence',
    diplome: 'Licence',
    duree: '3 ans',
    domaine: 'Géologie & BTP',
    description: 'Formation spécialisée dans la mécanique des sols, l\'étude géotechnique des fondations, les travaux de terrassement et de sous-sol.',
    debouches: [
      'Géotechnicien',
      'Ingénieur géotechnique',
      'Responsable contrôle de sols',
      'Technicien d\'essais en laboratoire BTP'
    ],
    montantNormal: 882500,
    montantBourseFi: 682500
  },
  {
    slug: 'ehes-master-supply-chain-management-logistique-petroliere',
    titre: 'Master en Supply Chain Management option Logistique Pétrolière',
    niveau: 'Master',
    diplome: 'Master',
    duree: '2 ans',
    domaine: 'Supply Chain & Pétrole',
    description: 'Master de haut niveau préparant aux fonctions de direction de la chaîne logistique, des approvisionnements et du transit dans le secteur pétrolier et gazier.',
    debouches: [
      'Directeur Supply Chain',
      'Responsable Logistique Pétrolière',
      'Manager Transport Hydrocarbures',
      'Consultant Logistique internationale'
    ],
    montantNormal: 2750000,
    montantBourseFi: 2350000
  },
  {
    slug: 'ehes-master-management-de-projet',
    titre: 'Master en Management de Projet',
    niveau: 'Master',
    diplome: 'Master',
    duree: '2 ans',
    domaine: 'Management & Stratégie',
    description: 'Master formant des chefs de projet agiles capables de piloter des projets complexes, de la conception à la réalisation, dans tous secteurs d\'activité.',
    debouches: [
      'Chef de Projet',
      'Directeur de Projet',
      'Consultant en Organisation',
      'Project Management Officer (PMO)'
    ],
    montantNormal: 2400000,
    montantBourseFi: 2000000
  },
  {
    slug: 'ehes-master-genie-civil',
    titre: 'Master en Génie Civil',
    niveau: 'Master',
    diplome: 'Master',
    duree: '2 ans',
    domaine: 'BTP & Génie Civil',
    description: 'Master formant des cadres supérieurs et ingénieurs concepteurs de grands ouvrages de bâtiment, d\'infrastructures et de travaux publics.',
    debouches: [
      'Ingénieur Structure',
      'Directeur de Travaux',
      'Chef de projet BTP',
      'Consultant Génie Civil'
    ],
    montantNormal: 2300000,
    montantBourseFi: 2000000
  },
  {
    slug: 'ehes-master-management-de-ressources-humaines',
    titre: 'Master en Management de Ressources Humaines',
    niveau: 'Master',
    diplome: 'Master',
    duree: '2 ans',
    domaine: 'Ressources Humaines',
    description: 'Master visant à maîtriser les compétences stratégiques des RH : recrutement, gestion des talents, droit du travail, formation et conduite du changement.',
    debouches: [
      'Responsable RH',
      'Directeur des Ressources Humaines (DRH)',
      'Consultant en Recrutement & Talents',
      'Responsable Formation'
    ],
    montantNormal: 2400000,
    montantBourseFi: 2000000
  },
  {
    slug: 'ehes-master-marketing',
    titre: 'Master Marketing',
    niveau: 'Master',
    diplome: 'Master',
    duree: '2 ans',
    domaine: 'Marketing & Stratégie',
    description: 'Master formant des cadres marketing stratégique et opérationnel capables d\'élaborer et d\'exécuter des stratégies de marque, de marché et de croissance.',
    debouches: [
      'Directeur Marketing',
      'Chef de Groupe / Chef de Produit',
      'Responsable Stratégie Commerciale',
      'Consultant Marketing'
    ],
    montantNormal: 2400000,
    montantBourseFi: 2000000
  }
]

export async function runImportEHES() {
  console.log("🚀 Début de l'importation officielle EHES Dakar (11 programmes officiels)...")

  const report = {
    etabCreatedOrUpdated: false,
    programmesCreated: 0,
    programmesUpdated: 0,
    tarifsCreated: 0,
    boursesUpserted: 0
  }

  await prisma.$transaction(async (tx) => {
    // 1. Partenaire par défaut (BourseFi)
    let partner = await tx.partner.findFirst({ where: { slug: 'boursefi' } })
    if (!partner) {
      partner = await tx.partner.findFirst({ where: { slug: 'boursefi-partenaire' } })
    }
    if (!partner) {
      partner = await tx.partner.findFirst()
    }
    assert.ok(partner, "Un partenaire par défaut doit exister")

    // 2. Établissement EHES Dakar
    const etab = await tx.etablissement.upsert({
      where: { slug: EHES_ETAB_SLUG },
      update: {
        nom: EHES_ETAB_NAME,
        ville: 'Dakar',
        adresse: EHES_ETAB_ADRESSE,
        accreditation: 'Agréé par le Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation du Sénégal (MESRI)',
        site: 'https://ehes.sn',
        resume: EHES_ETAB_RESUME,
        typeLabel: EHES_ETAB_TYPE,
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
        adresse: EHES_ETAB_ADRESSE,
        accreditation: 'Agréé par le Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation du Sénégal (MESRI)',
        site: 'https://ehes.sn',
        resume: EHES_ETAB_RESUME,
        typeLabel: EHES_ETAB_TYPE,
        status: 'ACTIVE',
        isDirectPartner: true,
        fraisDossier: 15000,
        contactStatus: 'VERIFIED',
        contactVerifiedAt: new Date()
      }
    })
    report.etabCreatedOrUpdated = true
    console.log(`✅ Établissement EHES Dakar configuré : ${etab.nom} (${etab.id})`)

    // Nettoyer les anciens programmes EHES non présents dans la nouvelle liste
    const validSlugs = PROGRAMMES_EHES.map((p) => p.slug)
    await tx.programme.deleteMany({
      where: {
        etablissementId: etab.id,
        slug: { notIn: validSlugs }
      }
    })

    // 3. Boucle d'importation des 11 Formations officielles
    for (const fData of PROGRAMMES_EHES) {
      let prog = await tx.programme.findUnique({
        where: { slug: fData.slug }
      })

      const debouchesJson = JSON.stringify(fData.debouches)

      if (prog) {
        prog = await tx.programme.update({
          where: { id: prog.id },
          data: {
            titre: fData.titre,
            niveau: fData.niveau,
            duree: fData.duree,
            ville: 'Dakar',
            description: `${fData.description} (Diplôme préparé : ${fData.diplome}).`,
            debouches: debouchesJson,
            perspectives: `Points forts & Avantages EHES Dakar : ${EHES_ADVANTAGES}`,
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
            niveau: fData.niveau,
            duree: fData.duree,
            ville: 'Dakar',
            description: `${fData.description} (Diplôme préparé : ${fData.diplome}).`,
            debouches: debouchesJson,
            perspectives: `Points forts & Avantages EHES Dakar : ${EHES_ADVANTAGES}`,
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

      await tx.tarif.create({
        data: {
          programmeId: prog.id,
          anneeAcademique: '2026-2027',
          label: `Tarif officiel BourseFi EHES Dakar 2026-2027 (${fData.diplome})`,
          montant: fData.montantNormal,
          montantBourse: fData.montantBourseFi,
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
      const coveragePercent = Math.round(((fData.montantNormal - fData.montantBourseFi) / fData.montantNormal) * 100)

      const existingBourse = await tx.bourse.findFirst({
        where: { OR: [{ slug: bourseSlug }, { programmeId: prog.id }] }
      })

      const bourseData = {
        slug: bourseSlug,
        titre: bourseTitle,
        programmeId: prog.id,
        partnerId: partner.id,
        coveragePercent,
        quota: 30,
        placesRestantes: 20,
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

    console.log(`✅ Importation EHES Dakar terminée avec succès : ${PROGRAMMES_EHES.length} programmes officiels mis à jour.`)
  })

  return report
}

async function main() {
  console.log("=== PASSAGE 1 : IMPORTATION INITIALE ÉTABLISSEMENT & PROGRAMMES EHES DAKAR ===")
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
  assert.ok(etab, "[Assertion BDD] Établissement EHES Dakar présent")
  assert.strictEqual(etab.nom, EHES_ETAB_NAME, "[Assertion BDD] Nom exact de l'école mis à jour")
  assert.strictEqual(etab.adresse, EHES_ETAB_ADRESSE, "[Assertion BDD] Adresse exacte mise à jour")
  assert.strictEqual(etab.typeLabel, EHES_ETAB_TYPE, "[Assertion BDD] TypeLabel mis à jour")
  assert.strictEqual(etab.isDirectPartner, true, "[Assertion BDD] EHES Dakar est Partenaire Officiel Direct")

  const activeProgsCount = await prisma.programme.count({
    where: { etablissementId: etab.id, status: 'ACTIVE' }
  })
  assert.strictEqual(activeProgsCount, 11, "[Assertion BDD] Exactement 11 programmes actifs pour EHES Dakar")

  const activeBoursesCount = await prisma.bourse.count({
    where: { programme: { etablissementId: etab.id }, isActive: true, status: 'ACTIVE' }
  })
  assert.strictEqual(activeBoursesCount, 11, "[Assertion BDD] Exactement 11 bourses actives pour EHES Dakar")

  console.log("\n🎉 TOUTES LES ASSERTIONS ONT ÉTÉ VÉRIFIÉES AVEC SUCCÈS (11 PROGRAMMES ET TARIFS OFFICIELS EHES DAKAR) !")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error("❌ Erreur lors de l'importation EHES Dakar :", e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
