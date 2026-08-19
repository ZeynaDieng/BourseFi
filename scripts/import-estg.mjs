import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

const ESTG_ETAB_ID = 'cmrghucg20023gny4vvjzdzva'

const OFFICIAL_PROGRAMMES_DATA = [
  // LICENCES (11)
  {
    slug: 'estg-licence-gestion-financiere-et-comptable',
    titre: 'Gestion Financière et Comptable (Licence Professionnelle)',
    niveau: 'Licence',
    existingId: 'cmrghucg8002bgny4dxlcmh7t',
    existingBourseId: 'cmrghucys00okgny4tlz62s0h',
    keywords: ['financi', 'comptab'],
    description: 'Formation aux normes comptables SYSCOHADA, analyse financière, gestion de trésorerie et contrôle de gestion.',
  },
  {
    slug: 'estg-licence-banque-finance-assurance',
    titre: 'Banque Finance Assurance (Licence Professionnelle)',
    niveau: 'Licence',
    existingId: 'cmrghucgb002ngny4dz4ynsr5',
    existingBourseId: 'cmrghucwk00icgny4sc69klyd',
    keywords: ['banque', 'assurance'],
    description: 'Spécialisation dans les opérations bancaires, les produits d\'assurance et la gestion de portefeuille.',
  },
  {
    slug: 'estg-licence-gestion-des-entreprises',
    titre: 'Gestion des Entreprises (Licence Professionnelle)',
    niveau: 'Licence',
    keywords: ['gestion des entreprises'],
    description: 'Management d\'entreprise, stratégie organisationnelle, droit des affaires et entrepreneuriat.',
  },
  {
    slug: 'estg-licence-commerce-international',
    titre: 'Commerce International (Licence Professionnelle)',
    niveau: 'Licence',
    existingId: 'cmrghucgd002rgny42gefzgdv',
    existingBourseId: 'cmrghucwp00iwgny44el1dg7o',
    keywords: ['commerce international'],
    description: 'Techniques d\'import-export, douanes, incoterms et négociation commerciale internationale.',
  },
  {
    slug: 'estg-licence-transport-et-logistique',
    titre: 'Transport et Logistique (Licence Professionnelle)',
    niveau: 'Licence',
    existingId: 'cmrghucg9002fgny48f3elu5p',
    existingBourseId: 'cmrghud1w00vugny4cp69ilo1',
    keywords: ['transport', 'logistique'],
    description: 'Gestion de la chaîne d\'approvisionnement (Supply Chain), logistique de distribution et gestion de flotte.',
  },
  {
    slug: 'estg-licence-marketing-et-communication',
    titre: 'Marketing et Communication (Licence Professionnelle)',
    niveau: 'Licence',
    keywords: ['marketing', 'communication'],
    description: 'Stratégie de marque, marketing digital, publicité, événementiel et relations publiques.',
  },
  {
    slug: 'estg-licence-qhse',
    titre: 'Qualité, Hygiène, Sécurité et Environnement (QHSE) (Licence Professionnelle)',
    niveau: 'Licence',
    keywords: ['qhse', 'qualité', 'qualite'],
    description: 'Management de la qualité, normes ISO, prévention des risques professionnels et gestion environnementale.',
  },
  {
    slug: 'estg-licence-gestion-des-ressources-humaines',
    titre: 'Gestion des Ressources Humaines (Licence Professionnelle)',
    niveau: 'Licence',
    existingId: 'cmrghucgc002pgny4z0y348st',
    existingBourseId: 'cmrghucz200p2gny4uxlpp8jl',
    keywords: ['ressources humaines', 'grh'],
    description: 'Gestion de la paie, recrutement, droit du travail et administration du personnel.',
  },
  {
    slug: 'estg-licence-informatique-de-gestion',
    titre: 'Informatique de Gestion (Licence Professionnelle)',
    niveau: 'Licence',
    keywords: ['informatique'],
    description: 'Conception de systèmes d\'information, bases de données d\'entreprise et développement d\'applications de gestion.',
  },
  {
    slug: 'estg-licence-securite-informatique',
    titre: 'Sécurité Informatique (Licence Professionnelle)',
    niveau: 'Licence',
    keywords: ['sécurité', 'securite'],
    description: 'Sécurisation des réseaux, cryptographie, protection des données et audit de vulnérabilités.',
  },
  {
    slug: 'estg-licence-reseaux-et-telecommunications',
    titre: 'Réseaux et Télécommunications (Licence Professionnelle)',
    niveau: 'Licence',
    keywords: ['réseaux', 'reseaux', 'télécom'],
    description: 'Administration système et réseaux, télécommunications, fibre optique et réseaux mobiles.',
  },

  // MASTERS (7)
  {
    slug: 'estg-master-management-et-strategie-financiere',
    titre: 'Management et Stratégie Financière (Master Professionnel)',
    niveau: 'Master',
    existingId: 'cmrghucgg002zgny4r858bw3v',
    existingBourseId: 'cmrghucyt00omgny4ok21pxxa',
    keywords: ['financie', 'financi'],
    description: 'Ingénierie financière, marchés des capitaux, évaluation d\'entreprise et stratégie financière.',
  },
  {
    slug: 'estg-master-comptabilite-controle-audit',
    titre: 'Comptabilité-Contrôle-Audit (Master Professionnel)',
    niveau: 'Master',
    keywords: ['comptab', 'audit'],
    description: 'Expertise comptable SYSCOHADA révisé, audit interne et externe et contrôle de gestion.',
  },
  {
    slug: 'estg-master-gestion-des-ressources-humaines',
    titre: 'Gestion des Ressources Humaines (Master Professionnel)',
    niveau: 'Master',
    existingId: 'cmrghucgg002xgny41w3jl747',
    existingBourseId: 'cmrghucyn00o4gny4hmvu0ejm',
    keywords: ['ressources humaines', 'grh'],
    description: 'Management stratégique des RH, développement du capital humain et gestion de la transformation organisationnelle.',
  },
  {
    slug: 'estg-master-qhse',
    titre: 'Qualité, Hygiène, Sécurité et Environnement (QHSE) (Master Professionnel)',
    niveau: 'Master',
    existingId: 'cmrghucgi0033gny4yfml8dkx',
    existingBourseId: 'cmrghud1900u2gny4lfp8qomt',
    keywords: ['qhse', 'qualité', 'qualite'],
    description: 'Audit et systèmes intégrés QSE, prévention des risques industriels et responsabilité sociétale (RSE).',
  },
  {
    slug: 'estg-master-management-et-strategie-d-entreprise',
    titre: 'Management et Stratégie d\'Entreprise (Master Professionnel)',
    niveau: 'Master',
    existingId: 'cmrghucgh0031gny4g691qhli',
    existingBourseId: 'cmrghud0f00s2gny4cwgmjurw',
    keywords: ['entreprise', 'management'],
    description: 'Pilotage de la performance, gouvernance d\'entreprise et développement stratégique.',
  },
  {
    slug: 'estg-master-transport-logistique',
    titre: 'Transport Logistique (Master Professionnel)',
    niveau: 'Master',
    existingId: 'cmrghucgi0035gny4cs9gzah1',
    existingBourseId: 'cmrghud1y00w0gny4xcgi1s4r',
    keywords: ['transport', 'logistique'],
    description: 'Supply Chain globale, ingénierie logistique et commerce international.',
  },
  {
    slug: 'estg-master-marketing-et-communication',
    titre: 'Marketing et Communication (Master Professionnel)',
    niveau: 'Master',
    existingId: 'cmrghucge002tgny40470wz04',
    existingBourseId: 'cmrghud0y00tcgny4ku5phwk0',
    keywords: ['marketing', 'communication'],
    description: 'Communication de crise, marketing d\'influence, stratégie de marque et branding.',
  },
]

async function runImport() {
  console.log('🚀 Début du traitement officiel ESTG (Transaction Prisma)...')

  let stats = {
    updateCount: 0,
    createCount: 0,
    tarifsCreatedCount: 0,
    boursesCreatedCount: 0,
    boursesUpdatedCount: 0,
    boursesDeactivatedCount: 0,
  }

  await prisma.$transaction(async (tx) => {
    // 1. Récupérer ou attribuer le Partenaire par défaut
    let partner = await tx.partner.findFirst({
      where: { name: { contains: 'ESTG', mode: 'insensitive' } }
    })
    if (!partner) {
      partner = await tx.partner.findFirst()
    }

    // 2. Mettre à jour ou créer l'établissement ESTG (Résolution robuste par ID, slug ou nom)
    let etab = await tx.etablissement.findFirst({
      where: {
        OR: [
          { id: ESTG_ETAB_ID },
          { slug: 'estg-dakar' },
          { nom: { contains: 'ESTG', mode: 'insensitive' } }
        ]
      }
    })

    if (etab) {
      etab = await tx.etablissement.update({
        where: { id: etab.id },
        data: {
          nom: 'ESTG — École Supérieure des Techniques de Gestion',
          slug: 'estg-dakar',
          ville: 'Dakar',
          adresse: 'Sicap / Liberté 4, Lot 5001, Dakar (côté camp des sapeurs-pompiers)',
          phone: '+221 33 867 57 57',
          phoneSecondary: '+221 77 864 47 47',
          email: 'contact@estg.sn',
          site: 'https://www.estg.sn/',
          fraisDossier: 20000,
          isDirectPartner: true,
          autoIssueAttestation: true,
          status: 'ACTIVE',
        }
      })
      stats.updateCount++
    } else {
      etab = await tx.etablissement.create({
        data: {
          id: ESTG_ETAB_ID,
          nom: 'ESTG — École Supérieure des Techniques de Gestion',
          slug: 'estg-dakar',
          ville: 'Dakar',
          adresse: 'Sicap / Liberté 4, Lot 5001, Dakar (côté camp des sapeurs-pompiers)',
          phone: '+221 33 867 57 57',
          phoneSecondary: '+221 77 864 47 47',
          email: 'contact@estg.sn',
          site: 'https://www.estg.sn/',
          fraisDossier: 20000,
          isDirectPartner: true,
          autoIssueAttestation: true,
          status: 'ACTIVE',
        }
      })
      stats.createCount++
    }

    console.log(`✅ Établissement prêt : ${etab.nom} (${etab.id})`)

    // 3. Désactiver tous les anciens programmes ESTG (les passer en INACTIVE)
    const existingProgs = await tx.programme.findMany({
      where: {
        OR: [
          { etablissementId: etab.id },
          { slug: { contains: 'estg' } }
        ]
      }
    })

    for (const ep of existingProgs) {
      await tx.programme.update({
        where: { id: ep.id },
        data: { status: 'INACTIVE', etablissementId: etab.id }
      })
    }

    // Désactiver toutes les anciennes bourses ESTG
    const existingBourses = await tx.bourse.findMany({
      where: { programme: { etablissementId: etab.id } }
    })

    for (const eb of existingBourses) {
      await tx.bourse.update({
        where: { id: eb.id },
        data: { isActive: false, status: 'INACTIVE' }
      })
      stats.boursesDeactivatedCount++
    }

    // 4. Traiter les 18 programmes officiels et leurs 36 tarifs
    const usedProgIds = new Set()

    for (const progData of OFFICIAL_PROGRAMMES_DATA) {
      let prog = null

      // 4.1 Recherche par slug exact
      prog = await tx.programme.findFirst({
        where: { slug: progData.slug }
      })

      // 4.2 Recherche par ID si non encore attribué
      if (!prog && progData.existingId && !usedProgIds.has(progData.existingId)) {
        prog = await tx.programme.findUnique({ where: { id: progData.existingId } })
      }

      // 4.3 Recherche par mot-clé et niveau parmi les programmes existants d'ESTG
      if (!prog) {
        for (const kw of (progData.keywords || [])) {
          prog = await tx.programme.findFirst({
            where: {
              etablissementId: etab.id,
              id: { notIn: Array.from(usedProgIds) },
              niveau: { contains: progData.niveau, mode: 'insensitive' },
              OR: [
                { titre: { contains: kw, mode: 'insensitive' } },
                { slug: { contains: kw, mode: 'insensitive' } }
              ]
            }
          })
          if (prog) break
        }
      }

      if (prog) {
        usedProgIds.add(prog.id)
        prog = await tx.programme.update({
          where: { id: prog.id },
          data: {
            titre: progData.titre,
            slug: progData.slug,
            niveau: progData.niveau,
            duree: progData.niveau === 'Licence' ? '3 ans (6 semestres)' : '2 ans (4 semestres)',
            ville: 'Dakar',
            fraisDossier: 20000,
            fraisDossierEtranger: 30000,
            devise: 'FCFA',
            description: progData.description,
            documentsRequis: 'CNI recto/verso, relevés de notes, diplôme ou attestation de niveau.',
            status: 'ACTIVE',
            etablissementId: etab.id,
            partnerId: partner.id,
          }
        })
        stats.updateCount++
      } else {
        prog = await tx.programme.create({
          data: {
            slug: progData.slug,
            titre: progData.titre,
            niveau: progData.niveau,
            duree: progData.niveau === 'Licence' ? '3 ans (6 semestres)' : '2 ans (4 semestres)',
            ville: 'Dakar',
            fraisDossier: 20000,
            fraisDossierEtranger: 30000,
            devise: 'FCFA',
            description: progData.description,
            documentsRequis: 'CNI recto/verso, relevés de notes, diplôme ou attestation de niveau.',
            status: 'ACTIVE',
            etablissementId: etab.id,
            partnerId: partner.id,
          }
        })
        usedProgIds.add(prog.id)
        stats.createCount++
      }

      // Supprimer les anciens tarifs pour ce programme et recréer les 2 tarifs officiels 2025-2026
      await tx.tarif.deleteMany({
        where: { programmeId: prog.id }
      })

      if (progData.niveau === 'Licence') {
        // Tarif 1: Licence 1 & Licence 2
        await tx.tarif.create({
          data: {
            programmeId: prog.id,
            anneeAcademique: '2025-2026',
            label: 'Licence 1 & Licence 2',
            montant: 580000,
            montantBourse: 355000,
            fraisInscription: 100000,
            fraisUniforme: 25000,
            autresFrais: 5000,
            mensualite: 25000,
            nombreMois: 9,
            frequence: 'ANNUEL',
            devise: 'FCFA',
            isDefault: true,
            isVerified: true,
            status: 'ACTIVE',
          }
        })
        stats.tarifsCreatedCount++

        // Tarif 2: Licence 3
        await tx.tarif.create({
          data: {
            programmeId: prog.id,
            anneeAcademique: '2025-2026',
            label: 'Licence 3',
            montant: 695000,
            montantBourse: 425000,
            fraisInscription: 100000,
            autresFrais: 5000,
            fraisSoutenance: 50000,
            mensualite: 30000,
            nombreMois: 9,
            frequence: 'ANNUEL',
            devise: 'FCFA',
            isDefault: false,
            isVerified: true,
            status: 'ACTIVE',
          }
        })
        stats.tarifsCreatedCount++
      } else {
        // Tarif 1: Master 1
        await tx.tarif.create({
          data: {
            programmeId: prog.id,
            anneeAcademique: '2025-2026',
            label: 'Master 1',
            montant: 820000,
            montantBourse: 455000,
            fraisInscription: 100000,
            autresFrais: 5000,
            mensualite: 35000,
            nombreMois: 10,
            frequence: 'ANNUEL',
            devise: 'FCFA',
            isDefault: true,
            isVerified: true,
            status: 'ACTIVE',
          }
        })
        stats.tarifsCreatedCount++

        // Tarif 2: Master 2
        await tx.tarif.create({
          data: {
            programmeId: prog.id,
            anneeAcademique: '2025-2026',
            label: 'Master 2',
            montant: 870000,
            montantBourse: 530000,
            fraisInscription: 100000,
            autresFrais: 5000,
            fraisSoutenance: 75000,
            mensualite: 35000,
            nombreMois: 10,
            frequence: 'ANNUEL',
            devise: 'FCFA',
            isDefault: false,
            isVerified: true,
            status: 'ACTIVE',
          }
        })
        stats.tarifsCreatedCount++
      }

      // Upsert de la Bourse officielle rattachée
      const bourseSlug = `bourse-${prog.slug}`
      const coveragePercent = 50

      let existingBourse = await tx.bourse.findFirst({
        where: { OR: [{ slug: bourseSlug }, { programmeId: prog.id }] }
      })

      if (existingBourse) {
        await tx.bourse.update({
          where: { id: existingBourse.id },
          data: {
            slug: bourseSlug,
            titre: `Bourse Officielle ESTG — ${prog.titre}`,
            programmeId: prog.id,
            partnerId: partner.id,
            coveragePercent: coveragePercent,
            quota: 30,
            placesRestantes: 25,
            dateLimite: new Date('2026-12-31T23:59:59.000Z'),
            conditions: 'Admissibilité sur étude de dossier académique.',
            documentsRequis: 'CNI recto/verso, relevés de notes, diplôme ou attestation de niveau.',
            isActive: true,
            status: 'ACTIVE',
          }
        })
        stats.boursesUpdatedCount++
      } else {
        await tx.bourse.create({
          data: {
            slug: bourseSlug,
            titre: `Bourse Officielle ESTG — ${prog.titre}`,
            programmeId: prog.id,
            partnerId: partner.id,
            coveragePercent: coveragePercent,
            quota: 30,
            placesRestantes: 25,
            dateLimite: new Date('2026-12-31T23:59:59.000Z'),
            conditions: 'Admissibilité sur étude de dossier académique.',
            documentsRequis: 'CNI recto/verso, relevés de notes, diplôme ou attestation de niveau.',
            isActive: true,
            status: 'ACTIVE',
          }
        })
        stats.boursesCreatedCount++
      }
    }

    console.log('✅ Importation terminée avec succès dans la transaction Prisma.')
  })

  // 5. VALIDATIONS D'INTÉGRITÉ AUTOMATISÉES POST-IMPORT
  console.log('\n🧪 DÉBUT DES VERIFICATIONS AUTOMATISÉES POST-IMPORT...')

  const etab = await prisma.etablissement.findFirst({
    where: { OR: [{ id: ESTG_ETAB_ID }, { slug: 'estg-dakar' }] }
  })
  assert.ok(etab, '[1] Établissement ESTG trouvé')

  const activeProgsCount = await prisma.programme.count({
    where: { etablissementId: etab.id, status: 'ACTIVE' }
  })
  assert.strictEqual(activeProgsCount, 18, '[2] Exactement 18 programmes officiels ACTIVE')

  const totalTarifsCount = await prisma.tarif.count({
    where: { programme: { etablissementId: etab.id }, status: 'ACTIVE' }
  })
  assert.strictEqual(totalTarifsCount, 36, '[4] Exactement 36 tarifs 2025-2026 ACTIVE')

  const activeBoursesCount = await prisma.bourse.count({
    where: { programme: { etablissementId: etab.id }, isActive: true, status: 'ACTIVE' }
  })
  assert.strictEqual(activeBoursesCount, 18, '[5] Exactement 18 bourses officielles ACTIVE')

  // Vérification des montants tarifaires et économies
  const sampleTarifL1 = await prisma.tarif.findFirst({
    where: { label: 'Licence 1 & Licence 2', programme: { etablissementId: etab.id } }
  })
  assert.strictEqual(sampleTarifL1.montant, 580000, '[9] Tarif Normal L1/L2 = 580 000')
  assert.strictEqual(sampleTarifL1.montantBourse, 355000, '[9b] Tarif Bourse L1/L2 = 355 000')
  assert.strictEqual(sampleTarifL1.montant - sampleTarifL1.montantBourse, 225000, '[13] Économie L1/L2 = 225 000 FCFA')

  console.log(' TOUTES LES ASSERTIONS POST-IMPORT ONT RÉUSSI AVEC SUCCÈS !')

  return stats
}

// Lancement premier import
runImport()
  .then(async (stats) => {
    console.log('\n📊 RAPPORT D\'EXÉCUTION 1ER PASSAGE :', stats)

    console.log('\n🔁 DEUXIÈME PASSAGE IDEMPOTENCE (Vérification 0 doublon)...')
    const stats2 = await runImport()
    console.log('📊 RAPPORT D\'EXÉCUTION 2ÈME PASSAGE :', stats2)

    assert.strictEqual(stats2.createCount, 0, '[25a] 0 nouveau programme créé au 2ème passage')
    assert.strictEqual(stats2.boursesCreatedCount, 0, '[25b] 0 nouvelle bourse créée au 2ème passage')
    console.log('\n🏆 TEST D\'IDEMPOTENCE VALIDE : 100% IDEMPOTENT !')

    await prisma.$disconnect()
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ ERREUR D\'IMPORT (ROLLBACK DÉCLENCHÉ) :', err)
    prisma.$disconnect()
    process.exit(1)
  })
