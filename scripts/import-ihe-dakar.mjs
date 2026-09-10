import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

const IHE_LICENCE_PROGRAMMES = [
  {
    name: 'Banque, Finance & Assurance',
    slug: 'ihe-dakar-licence-banque-finance-assurance',
    titre: 'Banque, Finance & Assurance (Licence)',
    niveau: 'Licence',
    description: 'Formation professionnelle axée sur la gestion bancaire, les produits financiers, l\'analyse du risque et la gestion de portefeuille d\'assurance.',
  },
  {
    name: 'Logistique & Transport',
    slug: 'ihe-dakar-licence-logistique-transport',
    titre: 'Logistique & Transport (Licence)',
    niveau: 'Licence',
    description: 'Spécialisation en Supply Chain Management, gestion des flux de marchandises, transport international et transit douanier.',
  },
  {
    name: 'Gestion des Ressources Humaines',
    slug: 'ihe-dakar-licence-gestion-des-ressources-humaines',
    titre: 'Gestion des Ressources Humaines (Licence)',
    niveau: 'Licence',
    description: 'Formation complète couvrant le recrutement, l\'administration du personnel, la gestion de la paie, le droit du travail et le développement du capital humain.',
  },
  {
    name: 'Management',
    slug: 'ihe-dakar-licence-management',
    titre: 'Management (Licence)',
    niveau: 'Licence',
    description: 'Gestion d\'entreprise, stratégie d\'organisation, pilotage de projets, entrepreneuriat et leadership opérationnel.',
  },
  {
    name: 'Comptabilité – Gestion',
    slug: 'ihe-dakar-licence-comptabilite-gestion',
    titre: 'Comptabilité – Gestion (Licence)',
    niveau: 'Licence',
    description: 'Maîtrise du référentiel comptable SYSCOHADA révisé, contrôle de gestion, fiscalité des entreprises et audit financier.',
  },
  {
    name: 'Marketing',
    slug: 'ihe-dakar-licence-marketing',
    titre: 'Marketing (Licence)',
    niveau: 'Licence',
    description: 'Stratégie commerciale, étude de marché, marketing digital, comportement du consommateur et gestion de la relation client.',
  },
  {
    name: 'Tourisme, Hôtellerie & Langues',
    slug: 'ihe-dakar-licence-tourisme-hotellerie-langues',
    titre: 'Tourisme, Hôtellerie & Langues (Licence)',
    niveau: 'Licence',
    description: 'Management d\'établissements hôteliers, ingénierie touristique, événementiel et pratique avancée des langues d\'affaires.',
  },
  {
    name: 'Droit des Affaires',
    slug: 'ihe-dakar-licence-droit-des-affaires',
    titre: 'Droit des Affaires (Licence)',
    niveau: 'Licence',
    description: 'Droit des sociétés, droit commercial, contentieux des affaires, droit des contrats et fiscalité des entreprises.',
  },
  {
    name: 'Informatique de Gestion',
    slug: 'ihe-dakar-licence-informatique-de-gestion',
    titre: 'Informatique de Gestion (Licence)',
    niveau: 'Licence',
    description: 'Développement d\'applications d\'entreprise, gestion de bases de données, systèmes d\'information et transformation digitale.',
  },
  {
    name: 'Management option Pétrole et Gaz',
    slug: 'ihe-dakar-licence-management-option-petrole-et-gaz',
    titre: 'Management option Pétrole et Gaz (Licence)',
    niveau: 'Licence',
    description: 'Management spécialisé dans le secteur de l\'énergie, économie pétrolière et gazière, chaîne de valeur hydrocarbures et sécurité environnementale.',
  },
]

const IHE_MASTER_PROGRAMMES = [
  {
    name: 'MBA Management',
    slug: 'ihe-dakar-mba-management',
    titre: 'MBA Management',
    niveau: 'Master',
    description: 'Programme exécutif en gouvernance d\'entreprise, stratégie globale, management de la performance et entrepreneuriat.',
  },
  {
    name: 'MBA Comptabilité – Contrôle',
    slug: 'ihe-dakar-mba-comptabilite-controle',
    titre: 'MBA Comptabilité – Contrôle',
    niveau: 'Master',
    description: 'Expertise supérieure en audit comptable, contrôle de gestion stratégique et révision SYSCOHADA.',
  },
  {
    name: 'MBA Finance',
    slug: 'ihe-dakar-mba-finance',
    titre: 'MBA Finance',
    niveau: 'Master',
    description: 'Ingénierie financière, marchés de capitaux, analyse boursière et stratégie d\'investissement.',
  },
  {
    name: 'MBA Marketing',
    slug: 'ihe-dakar-mba-marketing',
    titre: 'MBA Marketing',
    niveau: 'Master',
    description: 'Stratégie de marque, growth marketing, étude comportementale et direction commerciale.',
  },
  {
    name: 'MBA Informatique',
    slug: 'ihe-dakar-mba-informatique',
    titre: 'MBA Informatique',
    niveau: 'Master',
    description: 'Direction des systèmes d\'information (DSI), gestion de projets informatiques complexes et cybersécurité.',
  },
  {
    name: 'MBA Carrières Juridiques',
    slug: 'ihe-dakar-mba-carrieres-juridiques',
    titre: 'MBA Carrières Juridiques',
    niveau: 'Master',
    description: 'Juriste d\'affaires international, droit bancaire, arbitrage commercial et gouvernance juridique.',
  },
  {
    name: 'Master Marketing Digital',
    slug: 'ihe-dakar-master-marketing-digital',
    titre: 'Master Marketing Digital',
    niveau: 'Master',
    description: 'Stratégie web & mobile, acquisition digitale, SEO/SEA, e-commerce, social media et data analytics.',
  },
  {
    name: 'Master Marketing et Communication',
    slug: 'ihe-dakar-master-marketing-et-communication',
    titre: 'Master Marketing et Communication',
    niveau: 'Master',
    description: 'Branding, communication de crise, relations publiques, marketing d\'influence et stratégie média.',
  },
  {
    name: 'Master Ingénierie Financière',
    slug: 'ihe-dakar-master-ingenierie-financiere',
    titre: 'Master Ingénierie Financière',
    niveau: 'Master',
    description: 'Montage financier, fusions-acquisitions, évaluation d\'entreprises et modélisation financière avancée.',
  },
  {
    name: 'Master Risk Management',
    slug: 'ihe-dakar-master-risk-management',
    titre: 'Master Risk Management',
    niveau: 'Master',
    description: 'Cartographie des risques, contrôle interne, conformité réglementaire (Compliance) et gestion des risques de crédit.',
  },
  {
    name: 'Master Assurance & Actuariat',
    slug: 'ihe-dakar-master-assurance-actuariat',
    titre: 'Master Assurance & Actuariat',
    niveau: 'Master',
    description: 'Modélisation actuarielle, tarification des risques, gestion d\'actifs-passifs (ALM) et droit des assurances.',
  },
  {
    name: 'Master Administration des Affaires',
    slug: 'ihe-dakar-master-administration-des-affaires',
    titre: 'Master Administration des Affaires',
    niveau: 'Master',
    description: 'Pilotage global des organisations, gestion stratégique, leadership et développement des affaires (Business Development).',
  },
]

async function runImport() {
  console.log('🚀 Début de l\'importation officielle de IHE Dakar (Transaction Prisma)...')

  let stats = {
    etabStatus: 'UNTOUCHED',
    programmesCreated: 0,
    programmesUpdated: 0,
    tarifsCreated: 0,
    boursesCreated: 0,
    boursesUpdated: 0,
  }

  await prisma.$transaction(async (tx) => {
    // 1. Partenaire référent
    let partner = await tx.partner.findFirst({
      where: { name: { contains: 'IHE', mode: 'insensitive' } }
    })
    if (!partner) {
      partner = await tx.partner.findFirst()
    }

    // 2. Création / Mise à jour de l'établissement IHE Dakar
    let etab = await tx.etablissement.findFirst({
      where: {
        OR: [
          { slug: 'ihe-dakar' },
          { nom: { contains: 'IHE Dakar', mode: 'insensitive' } }
        ]
      }
    })

    const etabData = {
      nom: 'IHE Dakar — Institut des Hautes Études',
      slug: 'ihe-dakar',
      typeLabel: 'École supérieure privée',
      accreditation: 'N°176/MESR/DGES/DESP | Reconnu par l\'État | Habilité ANAQ-SUP',
      ville: 'Dakar',
      adresse: 'Sacré-Cœur, Dakar',
      resume: 'IHE Dakar est un établissement d\'enseignement supérieur reconnu par l\'État du Sénégal et habilité par l\'ANAQ-SUP pour l\'ensemble de ses filières. L\'école propose des formations professionnalisantes en Licence, Bachelor, Master et MBA avec des partenariats académiques internationaux.',
      fraisDossier: 150000,
      isDirectPartner: true,
      autoIssueAttestation: true,
      status: 'ACTIVE',
    }

    if (etab) {
      etab = await tx.etablissement.update({
        where: { id: etab.id },
        data: etabData,
      })
      stats.etabStatus = 'UPDATED'
    } else {
      etab = await tx.etablissement.create({
        data: etabData,
      })
      stats.etabStatus = 'CREATED'
    }

    console.log(`✅ Établissement prêt : ${etab.nom} (${etab.id})`)

    // 3. Traitement des Licences (10 formations)
    for (const item of IHE_LICENCE_PROGRAMMES) {
      let prog = await tx.programme.findFirst({
        where: { slug: item.slug }
      })

      const progData = {
        titre: item.titre,
        slug: item.slug,
        niveau: 'Licence',
        duree: '3 ans (6 semestres)',
        ville: 'Dakar',
        fraisDossier: 150000,
        devise: 'FCFA',
        description: item.description,
        documentsRequis: 'CNI recto/verso, relevés de notes du BAC, diplôme ou attestation de niveau.',
        status: 'ACTIVE',
        etablissementId: etab.id,
        partnerId: partner.id,
      }

      if (prog) {
        prog = await tx.programme.update({
          where: { id: prog.id },
          data: progData,
        })
        stats.programmesUpdated++
      } else {
        prog = await tx.programme.create({
          data: progData,
        })
        stats.programmesCreated++
      }

      // Re-créer les tarifs pour ce programme
      await tx.tarif.deleteMany({ where: { programmeId: prog.id } })

      // Tarif 1: Premier quota (30 premiers inscrits) -> 485 000 FCFA
      await tx.tarif.create({
        data: {
          programmeId: prog.id,
          anneeAcademique: '2026-2027',
          label: 'Tarif Boursier Premier Quota (30 premiers inscrits)',
          montant: 975000,
          montantBourse: 485000,
          fraisInscription: 150000,
          frequence: 'ANNUEL',
          devise: 'FCFA',
          isDefault: true,
          isVerified: true,
          status: 'ACTIVE',
        }
      })
      stats.tarifsCreated++

      // Tarif 2: Tarif boursier standard -> 600 000 FCFA
      await tx.tarif.create({
        data: {
          programmeId: prog.id,
          anneeAcademique: '2026-2027',
          label: 'Tarif Boursier Standard',
          montant: 975000,
          montantBourse: 600000,
          fraisInscription: 150000,
          frequence: 'ANNUEL',
          devise: 'FCFA',
          isDefault: false,
          isVerified: true,
          status: 'ACTIVE',
        }
      })
      stats.tarifsCreated++

      // Upsert Bourse officielle rattachée
      const bourseSlug = `bourse-${prog.slug}`
      let bourse = await tx.bourse.findFirst({
        where: { OR: [{ slug: bourseSlug }, { programmeId: prog.id }] }
      })

      const bourseData = {
        slug: bourseSlug,
        titre: `Bourse ${prog.titre}`,
        programmeId: prog.id,
        partnerId: partner.id,
        coveragePercent: Math.round(((975000 - 485000) / 975000) * 100), // ~50%
        quota: 30,
        placesRestantes: 30,
        dateLimite: new Date('2026-12-31T23:59:59.000Z'),
        conditions: 'Admissibilité sur étude de dossier. Tarif préférentiel de 485 000 FCFA pour les 30 premiers inscrits (puis 600 000 FCFA). Lettre de recommandation si exigée.',
        documentsRequis: 'CNI recto/verso, relevés de notes du BAC, diplôme ou attestation de niveau.',
        isActive: true,
        status: 'ACTIVE',
      }

      if (bourse) {
        await tx.bourse.update({
          where: { id: bourse.id },
          data: bourseData,
        })
        stats.boursesUpdated++
      } else {
        await tx.bourse.create({
          data: bourseData,
        })
        stats.boursesCreated++
      }
    }

    // 4. Traitement des Masters / MBA (12 formations)
    for (const item of IHE_MASTER_PROGRAMMES) {
      let prog = await tx.programme.findFirst({
        where: { slug: item.slug }
      })

      const progData = {
        titre: item.titre,
        slug: item.slug,
        niveau: 'Master',
        duree: '2 ans (4 semestres)',
        ville: 'Dakar',
        fraisDossier: 150000,
        devise: 'FCFA',
        description: item.description,
        documentsRequis: 'CNI recto/verso, attestation de Licence/Bac+3, relevés de notes académiques.',
        status: 'ACTIVE',
        etablissementId: etab.id,
        partnerId: partner.id,
      }

      if (prog) {
        prog = await tx.programme.update({
          where: { id: prog.id },
          data: progData,
        })
        stats.programmesUpdated++
      } else {
        prog = await tx.programme.create({
          data: progData,
        })
        stats.programmesCreated++
      }

      // Re-créer les tarifs pour ce programme
      await tx.tarif.deleteMany({ where: { programmeId: prog.id } })

      // Tarif Master/MBA: Tarif boursier -> 825 000 FCFA (Non boursier: 1 950 000 FCFA)
      await tx.tarif.create({
        data: {
          programmeId: prog.id,
          anneeAcademique: '2026-2027',
          label: 'Tarif Boursier Master/MBA',
          montant: 1950000,
          montantBourse: 825000,
          fraisInscription: 150000,
          frequence: 'ANNUEL',
          devise: 'FCFA',
          isDefault: true,
          isVerified: true,
          status: 'ACTIVE',
        }
      })
      stats.tarifsCreated++

      // Upsert Bourse officielle rattachée
      const bourseSlug = `bourse-${prog.slug}`
      let bourse = await tx.bourse.findFirst({
        where: { OR: [{ slug: bourseSlug }, { programmeId: prog.id }] }
      })

      const bourseData = {
        slug: bourseSlug,
        titre: `Bourse ${prog.titre}`,
        programmeId: prog.id,
        partnerId: partner.id,
        coveragePercent: Math.round(((1950000 - 825000) / 1950000) * 100), // ~58%
        quota: 30,
        placesRestantes: 30,
        dateLimite: new Date('2026-12-31T23:59:59.000Z'),
        conditions: 'Admissibilité sur étude de dossier académique Bac+3. Lettre de recommandation exigée.',
        documentsRequis: 'CNI recto/verso, attestation de Licence, relevés de notes.',
        isActive: true,
        status: 'ACTIVE',
      }

      if (bourse) {
        await tx.bourse.update({
          where: { id: bourse.id },
          data: bourseData,
        })
        stats.boursesUpdated++
      } else {
        await tx.bourse.create({
          data: bourseData,
        })
        stats.boursesCreated++
      }
    }
  })

  // Verifications automatiques d'intégrité
  console.log('\n🧪 VERIFICATIONS D\'INTÉGRITÉ POST-IMPORT...')

  const etab = await prisma.etablissement.findFirst({
    where: { slug: 'ihe-dakar' }
  })
  assert.ok(etab, '[1] Établissement IHE Dakar existe')

  const totalProgrammes = await prisma.programme.count({
    where: { etablissementId: etab.id, status: 'ACTIVE' }
  })
  assert.strictEqual(totalProgrammes, 22, '[2] Exactement 22 programmes créés pour IHE Dakar')

  const totalLicences = await prisma.programme.count({
    where: { etablissementId: etab.id, niveau: 'Licence', status: 'ACTIVE' }
  })
  assert.strictEqual(totalLicences, 10, '[3] Exactement 10 programmes Licence')

  const totalMasters = await prisma.programme.count({
    where: { etablissementId: etab.id, niveau: 'Master', status: 'ACTIVE' }
  })
  assert.strictEqual(totalMasters, 12, '[4] Exactement 12 programmes Master/MBA')

  const totalBourses = await prisma.bourse.count({
    where: { programme: { etablissementId: etab.id }, isActive: true }
  })
  assert.strictEqual(totalBourses, 22, '[5] Exactement 22 bourses créées')

  console.log('✅ TOUTES LES ASSERTIONS D\'INTÉGRITÉ ONT RÉUSSI AVEC SUCCÈS !')

  return stats
}

// Premier passage + deuxième passage pour vérification d'idempotence
runImport()
  .then(async (stats1) => {
    console.log('\n📊 RAPPORT PASSAGE 1 :', stats1)

    console.log('\n🔁 VÉRIFICATION D\'IDEMPOTENCE (PASSAGE 2)...')
    const stats2 = await runImport()
    console.log('📊 RAPPORT PASSAGE 2 :', stats2)

    assert.strictEqual(stats2.programmesCreated, 0, '0 programme créé au 2ème passage')
    assert.strictEqual(stats2.boursesCreated, 0, '0 bourse créée au 2ème passage')
    console.log('\n🏆 SCRIPT 100% IDEMPOTENT (0 DOUBLON DÉTECTÉ) !')

    await prisma.$disconnect()
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ ERREUR D\'IMPORTATION :', err)
    prisma.$disconnect()
    process.exit(1)
  })
