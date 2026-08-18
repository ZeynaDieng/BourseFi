import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

// Données de base HECM / Dakar
const HECM_ETAB_SLUG = 'hecm-dakar'
const HECM_ETAB_NAME = 'Haute École de Commerce et de Management (HECM / Dakar)'

// Grille tarifaire officielle BOURSE ENTIÈRE HECM 2026-2027 par Niveau
const HECM_LEVEL_CONFIGS = {
  L1: {
    niveau: '1ère Année / LMD',
    modalite: 'Cours du jour',
    duree: '9 mois',
    tarifNormal: 625000,
    coutBourseEntiere: 320000,
    fraisInscription: 155000,
    serviceMedical: 20000,
    fraisSoutenance: null,
    nombreMois: 9,
    mensualite: 16111, // Math.round((320000 - 155000 - 20000) / 9)
    economie: 305000,
    reductionPercent: 48.80
  },
  L2: {
    niveau: '2ème Année / LMD',
    modalite: 'Cours du jour',
    duree: '10 mois',
    tarifNormal: 675000,
    coutBourseEntiere: 335000,
    fraisInscription: 155000,
    serviceMedical: 20000,
    fraisSoutenance: null,
    nombreMois: 10,
    mensualite: 16000, // (335000 - 155000 - 20000) / 10
    economie: 340000,
    reductionPercent: 50.37
  },
  L3: {
    niveau: 'Licence 3',
    modalite: 'Cours du soir',
    duree: '10 mois',
    tarifNormal: 695000,
    coutBourseEntiere: 350000,
    fraisInscription: 125000,
    serviceMedical: 20000,
    fraisSoutenance: 40000,
    nombreMois: 10,
    mensualite: 20500, // (350000 - 125000 - 20000) / 10
    economie: 345000,
    reductionPercent: 49.64
  },
  M1: {
    niveau: 'Master 1',
    modalite: 'Cours du soir',
    duree: '10 mois',
    tarifNormal: 750000,
    coutBourseEntiere: 380000,
    fraisInscription: 130000,
    serviceMedical: 20000,
    fraisSoutenance: null,
    nombreMois: 10,
    mensualite: 23000, // (380000 - 130000 - 20000) / 10
    economie: 370000,
    reductionPercent: 49.33
  },
  M2: {
    niveau: 'Master 2',
    modalite: 'Cours du soir',
    duree: '10 mois',
    tarifNormal: 760000,
    coutBourseEntiere: 385000,
    fraisInscription: 140000,
    serviceMedical: 20000,
    fraisSoutenance: 50000,
    nombreMois: 10,
    mensualite: 22500, // (385000 - 140000 - 20000) / 10
    economie: 375000,
    reductionPercent: 49.34
  }
}

// 12 Formations Officielles HECM avec la liste exacte des niveaux ouverts (selon document source HECM)
const HECM_FORMATIONS = [
  {
    titre: 'Assistanat de Direction',
    levels: ['L1', 'L2', 'L3'],
    description: 'Formation supérieure aux métiers de secrétariat de direction, gestion administrative et organisation.'
  },
  {
    titre: 'Administration / Gestion des Entreprises',
    levels: ['L1', 'L2', 'L3', 'M1', 'M2'],
    description: 'Formation managériale complète en gestion d\'entreprise, pilotage stratégique et administration.'
  },
  {
    titre: 'Comptabilité - Gestion',
    levels: ['L1', 'L2', 'L3', 'M1', 'M2'],
    description: 'Spécialisation en comptabilité générale, analytique, contrôle de gestion et gestion financière.'
  },
  {
    titre: 'Banque - Finance - Assurance',
    levels: ['L1', 'L2', 'L3', 'M1', 'M2'],
    description: 'Expertise dans les produits bancaires, la gestion des risques et les opérations financières d\'assurance.'
  },
  {
    titre: 'Transport Logistique',
    levels: ['L1', 'L2', 'L3', 'M1', 'M2'],
    description: 'Maîtrise de la chaîne logistique, de la gestion des stocks, du fret et du transit international.'
  },
  {
    titre: 'Commerce International',
    levels: ['L1', 'L2', 'L3', 'M1', 'M2'],
    description: 'Spécialisation en négociations internationales, douanes, import-export et marchés mondiaux.'
  },
  {
    titre: 'Marketing - Communication Digitale',
    levels: ['L1', 'L2', 'L3', 'M1', 'M2'],
    description: 'Stratégies marketing, web-marketing, gestion des réseaux sociaux et communication d\'entreprise.'
  },
  {
    titre: 'Gestion des Projets',
    levels: ['L3', 'M1', 'M2'],
    description: 'Conception, planification, suivi-évaluation et gestion de projets de développement et d\'entreprise.'
  },
  {
    titre: 'Gestion des Ressources Humaines',
    levels: ['L3', 'M1', 'M2'],
    description: 'Administration du personnel, gestion des compétences, recrutement et droit du travail.'
  },
  {
    titre: 'Droit des Affaires - Fiscalité',
    levels: ['M1', 'M2'],
    description: 'Cadre juridique des entreprises, droit des contrats, fiscalité des sociétés et contentieux.'
  },
  {
    titre: 'Audit et Contrôle de Gestion',
    levels: ['M1', 'M2'],
    description: 'Audit financier, contrôle interne, cartographie des risques et gouvernance d\'entreprise.'
  },
  {
    titre: 'Management de la Qualité, Sécurité et Environnement',
    levels: ['L3', 'M1', 'M2'],
    description: 'Normes ISO, démarches qualité, hygiène-sécurité au travail et management environnemental.'
  }
]

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function runImport() {
  console.log("🚀 Début de l'importation officielle HECM / Dakar (Transaction Prisma)...")

  const report = {
    etabUpdated: false,
    programmesCreated: 0,
    programmesUpdated: 0,
    boursesUpserted: 0,
    tarifsUpserted: 0
  }

  await prisma.$transaction(async (tx) => {
    // 1. Partenaire BourseFi par défaut
    let partner = await tx.partner.findFirst({ where: { slug: 'boursefi' } })
    if (!partner) {
      partner = await tx.partner.findFirst()
    }
    assert(partner, "Un partenaire par défaut doit exister dans la base")

    // 2. Établissement HECM / Dakar
    const etab = await tx.etablissement.upsert({
      where: { slug: HECM_ETAB_SLUG },
      update: {
        nom: HECM_ETAB_NAME,
        ville: 'Dakar',
        accreditation: 'Agréé par le Ministère de l\'Enseignement Supérieur du Sénégal (MESRI)',
        site: 'https://hecm-dakar.com',
        resume: 'Haute École de Commerce et de Management (HECM / Dakar) - Établissement supérieur privé d\'excellence.',
        status: 'ACTIVE',
        isDirectPartner: true,
        fraisDossier: 0,
        contactStatus: 'VERIFIED'
      },
      create: {
        slug: HECM_ETAB_SLUG,
        nom: HECM_ETAB_NAME,
        ville: 'Dakar',
        accreditation: 'Agréé par le Ministère de l\'Enseignement Supérieur du Sénégal (MESRI)',
        site: 'https://hecm-dakar.com',
        resume: 'Haute École de Commerce et de Management (HECM / Dakar) - Établissement supérieur privé d\'excellence.',
        status: 'ACTIVE',
        isDirectPartner: true,
        fraisDossier: 0,
        contactStatus: 'VERIFIED'
      }
    })
    report.etabUpdated = true
    console.log(`✅ Établissement HECM prêt : ${etab.nom} (${etab.id})`)

    // Déterminer la liste des 44 slugs officiels HECM
    const officialSlugs = []
    for (const f of HECM_FORMATIONS) {
      for (const levelKey of f.levels) {
        officialSlugs.push(`hecm-${slugify(f.titre)}-${slugify(levelKey)}`)
      }
    }

    // Nettoyer uniquement les anciens programmes obsolètes appartenant à HECM / Dakar
    await tx.programme.deleteMany({
      where: {
        etablissementId: etab.id,
        slug: { notIn: officialSlugs }
      }
    })

    // 3. Boucle sur les 12 Formations et leurs Niveaux respectifs
    for (const f of HECM_FORMATIONS) {
      for (const levelKey of f.levels) {
        const lvlCfg = HECM_LEVEL_CONFIGS[levelKey]
        const progSlug = `hecm-${slugify(f.titre)}-${slugify(levelKey)}`
        const progTitre = `${f.titre} — ${lvlCfg.niveau}`

        const conditionsAdmission = levelKey === 'L1'
          ? 'Baccalauréat (Toutes séries) — Admissions : sur Dossier + Entretien'
          : levelKey === 'L2'
          ? 'Bac + 1 — Admissions : sur Dossier + Entretien'
          : levelKey === 'L3'
          ? 'Bac + 2 (BTS/DUT/L2) — Admissions : sur Dossier + Entretien'
          : levelKey === 'M1'
          ? 'Licence / Bac + 3 — Admissions : sur Dossier + Entretien'
          : 'Master 1 / Bac + 4 — Admissions : sur Dossier + Entretien'

        // Programme Prisma
        const existingProg = await tx.programme.findUnique({ where: { slug: progSlug } })
        const programmeData = {
          etablissementId: etab.id,
          partnerId: partner.id,
          titre: progTitre,
          ville: 'Dakar',
          duree: lvlCfg.duree,
          niveau: lvlCfg.niveau,
          modalites: lvlCfg.modalite,
          fraisDossier: 0,
          fraisDossierEtranger: 0,
          devise: 'FCFA',
          description: f.description,
          conditionsAdmission,
          status: 'ACTIVE'
        }

        let programme
        if (existingProg) {
          programme = await tx.programme.update({ where: { id: existingProg.id }, data: programmeData })
          report.programmesUpdated++
        } else {
          programme = await tx.programme.create({ data: { slug: progSlug, ...programmeData } })
          report.programmesCreated++
        }

        // Tarif Prisma pour 2026-2027
        const existingTarif = await tx.tarif.findFirst({
          where: { programmeId: programme.id, anneeAcademique: '2026-2027' }
        })

        const tarifData = {
          programmeId: programme.id,
          anneeAcademique: '2026-2027',
          montant: lvlCfg.tarifNormal,
          montantBourse: lvlCfg.coutBourseEntiere,
          fraisInscription: lvlCfg.fraisInscription,
          mensualite: lvlCfg.mensualite,
          nombreMois: lvlCfg.nombreMois,
          autresFrais: lvlCfg.serviceMedical, // Service Médical HECM (20 000 FCFA)
          fraisSoutenance: lvlCfg.fraisSoutenance,
          frequence: 'ANNUEL',
          devise: 'FCFA',
          isDefault: true,
          status: 'ACTIVE'
        }

        if (existingTarif) {
          await tx.tarif.update({ where: { id: existingTarif.id }, data: tarifData })
        } else {
          await tx.tarif.create({ data: tarifData })
        }
        report.tarifsUpserted++

        // Bourse BOURSE ENTIÈRE Prisma
        const bourseSlug = `bourse-hecm-${slugify(f.titre)}-${slugify(levelKey)}`
        const bourseTitre = `Offre HECM 2026-2027 — ${f.titre} (${lvlCfg.niveau})`

        const existingBourse = await tx.bourse.findUnique({ where: { slug: bourseSlug } })
        const bourseData = {
          titre: bourseTitre,
          programmeId: programme.id,
          partnerId: partner.id,
          coveragePercent: Math.round(lvlCfg.reductionPercent),
          montantMax: lvlCfg.coutBourseEntiere,
          quota: 50,
          placesRestantes: 50,
          dateLimite: new Date('2026-11-30T23:59:59Z'),
          conditions: `Admissions : sur Dossier + Entretien. Bourse entière accordée sur la scolarité HECM.`,
          isActive: true,
          status: 'ACTIVE'
        }

        if (existingBourse) {
          await tx.bourse.update({ where: { id: existingBourse.id }, data: bourseData })
        } else {
          await tx.bourse.create({ data: { slug: bourseSlug, ...bourseData } })
        }
        report.boursesUpserted++
      }
    }
  })

  console.log("✅ Importation HECM / Dakar terminée avec succès dans la transaction Prisma.")
  return report
}

async function verifyImport() {
  console.log("\n🧪 DÉBUT DES VÉRIFICATIONS AUTOMATISÉES POST-IMPORT HECM (22 ASSERTIONS)...")

  const etab = await prisma.etablissement.findUnique({
    where: { slug: HECM_ETAB_SLUG },
    include: {
      programmes: {
        include: {
          tarifs: true,
          bourses: true
        }
      }
    }
  })

  // 1. HECM existe une seule fois
  const etabCount = await prisma.etablissement.count({ where: { slug: HECM_ETAB_SLUG } })
  assert.strictEqual(etabCount, 1, "1. HECM doit exister une seule fois")

  // 2. Aucun doublon HECM
  const allProgs = etab.programmes
  const progSlugs = allProgs.map(p => p.slug)
  const uniqueSlugs = new Set(progSlugs)
  assert.strictEqual(progSlugs.length, uniqueSlugs.size, "2. Aucun doublon de programme HECM")

  // 3. Les 12 formations officielles sont représentées
  const uniqueTitles = new Set(allProgs.map(p => p.titre.split(' — ')[0]))
  assert.strictEqual(uniqueTitles.size, 12, "3. Les 12 formations officielles doivent être représentées")

  // 4. Nombre total d'offres / bourses (Assistanat=3, Admin=5, Comptabilité=5, Banque=5, Transport=5, Commerce=5, Marketing=5, Projets=3, RH=3, Droit=2, Audit=2, Qualité=3 => Total 46 offres)
  assert.strictEqual(allProgs.length, 46, "4. Doit contenir exactement 46 offres par niveaux autorisés")

  // 5. L1/L2 associés aux cours du jour
  const l1l2Progs = allProgs.filter(p => p.niveau.includes('1ère Année') || p.niveau.includes('2ème Année'))
  assert(l1l2Progs.length > 0 && l1l2Progs.every(p => p.modalites === 'Cours du jour'), "5. L1 et L2 doivent être en Cours du jour")

  // 6. L3/Masters associés aux cours du soir
  const l3mastersProgs = allProgs.filter(p => p.niveau.includes('Licence 3') || p.niveau.includes('Master'))
  assert(l3mastersProgs.length > 0 && l3mastersProgs.every(p => p.modalites === 'Cours du soir'), "6. L3 et Masters doivent être en Cours du soir")

  // 7. Niveau Droit des Affaires = M1/M2 uniquement
  const droitProgs = allProgs.filter(p => p.titre.includes('Droit des Affaires'))
  assert.strictEqual(droitProgs.length, 2, "7. Droit des Affaires doit avoir exactement 2 niveaux (M1/M2)")

  // 8. Niveau Gestion des Projets = L3/M1/M2 uniquement (3 niveaux)
  const projetsProgs = allProgs.filter(p => p.titre.includes('Gestion des Projets'))
  assert.strictEqual(projetsProgs.length, 3, "8. Gestion des Projets doit avoir 3 niveaux (L3/M1/M2)")

  // 9. Bourse entière L1 = 320 000 F
  const sampleL1 = allProgs.find(p => p.niveau.includes('1ère Année'))
  const tarifL1 = sampleL1.tarifs[0]
  assert.strictEqual(tarifL1.montantBourse, 320000, "9. Bourse entière L1 = 320 000 FCFA")

  // 10. Bourse entière L2 = 335 000 F
  const sampleL2 = allProgs.find(p => p.niveau.includes('2ème Année'))
  const tarifL2 = sampleL2.tarifs[0]
  assert.strictEqual(tarifL2.montantBourse, 335000, "10. Bourse entière L2 = 335 000 FCFA")

  // 11. Bourse entière L3 = 350 000 F
  const sampleL3 = allProgs.find(p => p.niveau.includes('Licence 3'))
  const tarifL3 = sampleL3.tarifs[0]
  assert.strictEqual(tarifL3.montantBourse, 350000, "11. Bourse entière L3 = 350 000 FCFA")

  // 12. Bourse entière M1 = 380 000 F
  const sampleM1 = allProgs.find(p => p.niveau.includes('Master 1'))
  const tarifM1 = sampleM1.tarifs[0]
  assert.strictEqual(tarifM1.montantBourse, 380000, "12. Bourse entière M1 = 380 000 FCFA")

  // 13. Bourse entière M2 = 385 000 F
  const sampleM2 = allProgs.find(p => p.niveau.includes('Master 2'))
  const tarifM2 = sampleM2.tarifs[0]
  assert.strictEqual(tarifM2.montantBourse, 385000, "13. Bourse entière M2 = 385 000 FCFA")

  // 14. Économies calculées L1 (625 000 - 320 000 = 305 000)
  assert.strictEqual(tarifL1.montant - tarifL1.montantBourse, 305000, "14. Économie L1 = 305 000 FCFA")

  // 15. Service médical enregistré (20 000 F)
  assert.strictEqual(tarifL1.autresFrais, 20000, "15. Service médical HECM = 20 000 FCFA")

  // 16. Frais d'inscription L1 = 155 000 F
  assert.strictEqual(tarifL1.fraisInscription, 155000, "16. Frais inscription L1 = 155 000 FCFA")

  // 17. Frais de soutenance L3 (40 000 F) et M2 (50 000 F)
  assert.strictEqual(tarifL3.fraisSoutenance, 40000, "17. Frais de soutenance L3 = 40 000 FCFA")
  assert.strictEqual(tarifM2.fraisSoutenance, 50000, "17. Frais de soutenance M2 = 50 000 FCFA")

  // 18. Aucune Demi-Bourse
  const demiCount = await prisma.bourse.count({ where: { titre: { contains: 'Demi-Bourse', mode: 'insensitive' }, programme: { etablissementId: etab.id } } })
  assert.strictEqual(demiCount, 0, "18. Aucune Demi-Bourse ne doit exister pour HECM")

  // 19. Aucun Quart de bourse
  const quartCount = await prisma.bourse.count({ where: { titre: { contains: 'Quart', mode: 'insensitive' }, programme: { etablissementId: etab.id } } })
  assert.strictEqual(quartCount, 0, "19. Aucun Quart de bourse ne doit exister pour HECM")

  // 20. Année académique = 2026-2027
  assert(allProgs.every(p => p.tarifs[0].anneeAcademique === '2026-2027'), "20. L'année académique doit être 2026-2027")

  // 21. Isolation : Les autres établissements n'ont pas été modifiés (ex: IFAA existe toujours)
  const ifaa = await prisma.etablissement.findFirst({ where: { slug: 'ifaa-dakar' } })
  assert(ifaa, "21. L'établissement IFAA doit continuer d'exister intact")

  console.log("🎉 TOUTES LES 22 ASSERTIONS POST-IMPORT HECM ONT RÉUSSI AVEC SUCCÈS !")
}

async function main() {
  try {
    const report1 = await runImport()
    console.log('\n📊 RAPPORT D\'EXÉCUTION 1ER PASSAGE HECM :', report1)
    await verifyImport()

    console.log('\n🔁 DEUXIÈME PASSAGE IDEMPOTENCE HECM...')
    const report2 = await runImport()
    console.log('📊 RAPPORT D\'EXÉCUTION 2ÈME PASSAGE HECM :', report2)
    await verifyImport()

    assert.strictEqual(report2.programmesCreated, 0, "Second passage ne doit créer aucun nouveau programme")
    console.log('\n🏆 TEST D\'IDEMPOTENCE HECM VALIDE : 100% IDEMPOTENT !')
  } catch (error) {
    console.error('\n❌ ERREUR D\'IMPORT HECM :', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
