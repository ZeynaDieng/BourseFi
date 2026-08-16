import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

const AMDI_ETAB_ID = 'cmrghuch6004kgny4f7a46uua'

// Liste des filières officielles AMDI regroupées par pôle d'excellence
const OFFICIAL_AMDI_PROGRAMMES = [
  // POLE GENIE & INGENIERIE
  {
    slug: 'amdi-licence-genie-civil',
    titre: 'Génie Civil (Licence Professionnelle)',
    pole: 'GENIE',
    niveau: 'Licence',
    existingId: 'cmrghuchf0056gny4l75enk7z',
    description: 'Formation spécialisée en dimensionnement des structures BTP, mécanique des sols, étude de prix et conduite de chantiers.',
    tarifsBourse: {
      l1_l2: { montant: 890000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 },
      l3: { montant: 890000, montantBourse: 410000, inscription: 110000, mensualite: 50000, mois: 6 }
    }
  },
  {
    slug: 'amdi-licence-genie-informatique',
    titre: 'Génie Informatique et Réseaux (Licence Professionnelle)',
    pole: 'GENIE',
    niveau: 'Licence',
    existingId: 'cmrghuchg0058gny4t4h1wxqk',
    description: 'Développement web/mobile, administration des réseaux Cisco/Linux et gestion des bases de données d\'entreprise.',
    tarifsBourse: {
      l1_l2: { montant: 890000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 },
      l3: { montant: 890000, montantBourse: 410000, inscription: 110000, mensualite: 50000, mois: 6 }
    }
  },
  {
    slug: 'amdi-licence-geologie-mines-petrole',
    titre: 'Géologie, Mines et Pétrole (Licence Professionnelle)',
    pole: 'GENIE',
    niveau: 'Licence',
    existingId: 'cmrghuchb004ygny41gb8474v',
    description: 'Exploration géologique, génie minier, diagraphie et techniques d\'extraction pétrolière et gazière.',
    tarifsBourse: {
      l1_l2: { montant: 890000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 },
      l3: { montant: 890000, montantBourse: 410000, inscription: 110000, mensualite: 50000, mois: 6 }
    }
  },
  {
    slug: 'amdi-licence-electrotechnique-electromecanique',
    titre: 'Électrotechnique, Électromécanique et Froid (Licence Professionnelle)',
    pole: 'GENIE',
    niveau: 'Licence',
    existingId: 'cmrghuche0054gny4jmy9k5wv',
    description: 'Installation industrielle, automatismes, climatisation, froid industriel et réseaux électriques.',
    tarifsBourse: {
      l1_l2: { montant: 890000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 },
      l3: { montant: 890000, montantBourse: 410000, inscription: 110000, mensualite: 50000, mois: 6 }
    }
  },
  {
    slug: 'amdi-licence-environnement-geomatique',
    titre: 'Environnement, Géomatique et Cartographie (Licence Professionnelle)',
    pole: 'GENIE',
    niveau: 'Licence',
    existingId: 'cmrghuchc0050gny4zso4soqa',
    description: 'Systèmes d\'Information Géographique (SIG), télédétection, aménagement du territoire et étude d\'impact environnemental.',
    tarifsBourse: {
      l1_l2: { montant: 890000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 },
      l3: { montant: 890000, montantBourse: 410000, inscription: 110000, mensualite: 50000, mois: 6 }
    }
  },

  // POLE MANAGEMENT & COMMERCE
  {
    slug: 'amdi-licence-finance-comptabilite',
    titre: 'Finance Comptabilité (Licence Professionnelle)',
    pole: 'MANAGEMENT',
    niveau: 'Licence',
    description: 'Gestion comptable SYSCOHADA, analyse financière, gestion de trésorerie et fiscalité des entreprises.',
    tarifsBourse: {
      l1_l2: { montant: 640000, montantBourse: 260000, inscription: 110000, mensualite: 30000, mois: 5 },
      l3: { montant: 640000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 }
    }
  },
  {
    slug: 'amdi-licence-banque-finance-assurance',
    titre: 'Banque Finance et Assurance (Licence Professionnelle)',
    pole: 'MANAGEMENT',
    niveau: 'Licence',
    description: 'Gestion de portefeuille, techniques bancaires, analyse des risques et produits d\'assurance.',
    tarifsBourse: {
      l1_l2: { montant: 640000, montantBourse: 260000, inscription: 110000, mensualite: 30000, mois: 5 },
      l3: { montant: 640000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 }
    }
  },
  {
    slug: 'amdi-licence-transport-logistique',
    titre: 'Transport et Logistique (Licence Professionnelle)',
    pole: 'MANAGEMENT',
    niveau: 'Licence',
    existingId: 'cmrghuchm005mgny44k4md2zv',
    description: 'Gestion de la Supply Chain, transit douanier, incoterms et gestion des opérations portuaires.',
    tarifsBourse: {
      l1_l2: { montant: 640000, montantBourse: 260000, inscription: 110000, mensualite: 30000, mois: 5 },
      l3: { montant: 640000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 }
    }
  },
  {
    slug: 'amdi-licence-marketing-digital-communication',
    titre: 'Marketing Digital et Communication (Licence Professionnelle)',
    pole: 'MANAGEMENT',
    niveau: 'Licence',
    existingId: 'cmrghuchl005kgny4cln1nr7y',
    description: 'Stratégie de marque, social media management, publicité digitale et relations publiques.',
    tarifsBourse: {
      l1_l2: { montant: 640000, montantBourse: 260000, inscription: 110000, mensualite: 30000, mois: 5 },
      l3: { montant: 640000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 }
    }
  },
  {
    slug: 'amdi-licence-gestion-des-ressources-humaines',
    titre: 'Gestion des Ressources Humaines (Licence Professionnelle)',
    pole: 'MANAGEMENT',
    niveau: 'Licence',
    description: 'Gestion de la paie, recrutement, droit du travail sénégalais et administration du personnel.',
    tarifsBourse: {
      l1_l2: { montant: 640000, montantBourse: 260000, inscription: 110000, mensualite: 30000, mois: 5 },
      l3: { montant: 640000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 }
    }
  },
  {
    slug: 'amdi-master-management-qualite-grh',
    titre: 'Management des Entreprises et GRH (Master Professionnel)',
    pole: 'MANAGEMENT',
    niveau: 'Master',
    existingId: 'cmrghuchs0064gny4g7gsfibc',
    description: 'Management stratégique, développement du capital humain et pilotage des organisations.',
    tarifsBourse: {
      m1_m2: { montant: 900000, montantBourse: 350000, inscription: 100000, mensualite: 50000, mois: 5 }
    }
  },
  {
    slug: 'amdi-master-logistique-et-transport-international',
    titre: 'Logistique et Transport International (Master Professionnel)',
    pole: 'MANAGEMENT',
    niveau: 'Master',
    existingId: 'cmrghuchr0060gny44i68oeim',
    description: 'Supply Chain internationale, droit du transport maritime et ingénierie logistique.',
    tarifsBourse: {
      m1_m2: { montant: 900000, montantBourse: 350000, inscription: 100000, mensualite: 50000, mois: 5 }
    }
  },

  // POLE SANTE & SCIENCES BIOLOGIQUES
  {
    slug: 'amdi-licence-infirmier-d-etat',
    titre: 'Infirmier d\'État (Licence Professionnelle / DT)',
    pole: 'SANTE',
    niveau: 'Licence',
    existingId: 'cmrghuch6004mgny4e60hkqbi',
    description: 'Soins infirmiers, santé publique, réanimation et prise en charge médicale hospitalière.',
    tarifsBourse: {
      l1_l2: { montant: 640000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 },
      l3: { montant: 640000, montantBourse: 360000, inscription: 110000, mensualite: 50000, mois: 5 }
    }
  },
  {
    slug: 'amdi-licence-sage-femme-d-etat',
    titre: 'Sage-Femme d\'État (Licence Professionnelle / DT)',
    pole: 'SANTE',
    niveau: 'Licence',
    existingId: 'cmrghuch7004ogny4hlvjb8f2',
    description: 'Maïeutique, soins néonatals, suivi de grossesse, gynécologie et santé maternelle.',
    tarifsBourse: {
      l1_l2: { montant: 640000, montantBourse: 310000, inscription: 110000, mensualite: 40000, mois: 5 },
      l3: { montant: 640000, montantBourse: 360000, inscription: 110000, mensualite: 50000, mois: 5 }
    }
  },
  {
    slug: 'amdi-formation-delegation-medicale',
    titre: 'Délégation Médicale et Vendeur en Pharmacie (Formation 6 mois)',
    pole: 'SANTE',
    niveau: 'Certificat',
    existingId: 'cmrghuch8004sgny4qw3hr8xq',
    description: 'Pharmacologie, conseil en officine, visite médicale et techniques de vente pharmaceutique.',
    tarifsBourse: {
      c1: { montant: 400000, montantBourse: 200000, inscription: 100000, mensualite: 25000, mois: 4 }
    }
  },
  {
    slug: 'amdi-licence-analyses-biologiques',
    titre: 'Analyses Biologiques (Licence Professionnelle)',
    pole: 'SANTE',
    niveau: 'Licence',
    description: 'Analyses médicales, biochimie, hématologie, microbiologie et diagnostic de laboratoire.',
    tarifsBourse: {
      l1_l2: { montant: 890000, montantBourse: 430000, inscription: 110000, mensualite: 40000, mois: 8 },
      l3: { montant: 890000, montantBourse: 510000, inscription: 110000, mensualite: 50000, mois: 8 }
    }
  },
  {
    slug: 'amdi-master-analyses-biologiques',
    titre: 'Analyses Biologiques (Master Professionnel)',
    pole: 'SANTE',
    niveau: 'Master',
    existingId: 'cmrghuchp005ugny4ohler92g',
    description: 'Recherche biomédicale, biologie moléculaire, contrôle qualité et direction de laboratoires.',
    tarifsBourse: {
      m1_m2: { montant: 1000000, montantBourse: 610000, inscription: 110000, mensualite: 50000, mois: 10 }
    }
  },

  // POLE AGRO INDUSTRIES
  {
    slug: 'amdi-licence-agroalimentaire',
    titre: 'Agroalimentaire et Agribusiness (Licence Professionnelle)',
    pole: 'AGRO',
    niveau: 'Licence',
    existingId: 'cmrghucha004wgny43dkfz9q7',
    description: 'Transformation des produits agricoles, contrôle qualité des aliments et développement durable.',
    tarifsBourse: {
      l1_l2: { montant: 890000, montantBourse: 390000, inscription: 110000, mensualite: 40000, mois: 7 },
      l3: { montant: 890000, montantBourse: 420000, inscription: 100000, mensualite: 40000, mois: 8 }
    }
  },

  // DIPLOMES D'ETAT (BT & BTS)
  {
    slug: 'amdi-bts-analyse-biologique',
    titre: 'BTS Analyse Biologique (Diplôme d\'État)',
    pole: 'SANTE',
    niveau: 'BTS',
    description: 'Analyses médicales approfondies, biologie clinique et encadrement d\'activités de laboratoire.',
    tarifsBourse: {
      l1_l2: { montant: 890000, montantBourse: 460000, inscription: 100000, mensualite: 40000, mois: 9 }
    }
  },
  {
    slug: 'amdi-bt-analyse-biologique',
    titre: 'BT Analyse Biologique (Diplôme d\'État)',
    pole: 'SANTE',
    niveau: 'BT',
    description: 'Formation de techniciens qualifiés capables d\'effectuer des analyses biologiques en laboratoire.',
    tarifsBourse: {
      l1_l2: { montant: 700000, montantBourse: 460000, inscription: 100000, mensualite: 40000, mois: 9 }
    }
  }
]

async function runImportAMDI() {
  console.log('🚀 Début de l\'importation officielle AMDI (Transaction Prisma)...')

  let stats = {
    updateCount: 0,
    createCount: 0,
    tarifsCreatedCount: 0,
    boursesCreatedCount: 0,
    boursesUpdatedCount: 0,
    boursesDeactivatedCount: 0,
  }

  await prisma.$transaction(async (tx) => {
    // 1. Partenaire AMDI
    let partner = await tx.partner.findFirst({
      where: { name: { contains: 'AMDI', mode: 'insensitive' } }
    })
    if (!partner) {
      partner = await tx.partner.findFirst()
    }

    // 2. Mettre à jour l'Établissement AMDI
    let etab = await tx.etablissement.findFirst({
      where: {
        OR: [
          { id: AMDI_ETAB_ID },
          { slug: 'amdi-afrique' },
          { nom: { contains: 'AMDI', mode: 'insensitive' } }
        ]
      }
    })

    if (etab) {
      etab = await tx.etablissement.update({
        where: { id: etab.id },
        data: {
          nom: 'AMDI — African Millennium Development Institute (AMDI Afrique)',
          slug: 'amdi-afrique',
          ville: 'Dakar',
          adresse: 'VDN en face Saint-Lazare, Dakar / Grand Standing, Thiès',
          phone: '+221 77 709 78 16',
          phoneSecondary: '+221 77 977 74 55',
          email: 'contact@amdiafrique.com',
          site: 'https://amdiafrique.com/',
          fraisDossier: 10000,
          isDirectPartner: true,
          autoIssueAttestation: true,
          status: 'ACTIVE',
        }
      })
      stats.updateCount++
    } else {
      etab = await tx.etablissement.create({
        data: {
          id: AMDI_ETAB_ID,
          nom: 'AMDI — African Millennium Development Institute (AMDI Afrique)',
          slug: 'amdi-afrique',
          ville: 'Dakar',
          adresse: 'VDN en face Saint-Lazare, Dakar / Grand Standing, Thiès',
          phone: '+221 77 709 78 16',
          phoneSecondary: '+221 77 977 74 55',
          email: 'contact@amdiafrique.com',
          site: 'https://amdiafrique.com/',
          fraisDossier: 10000,
          isDirectPartner: true,
          autoIssueAttestation: true,
          status: 'ACTIVE',
        }
      })
      stats.createCount++
    }

    console.log(`✅ Établissement prêt : ${etab.nom} (${etab.id})`)

    // 3. Passer en INACTIVE tous les anciens programmes d'AMDI
    const existingProgs = await tx.programme.findMany({
      where: {
        OR: [
          { etablissementId: etab.id },
          { slug: { contains: 'amdi' } }
        ]
      }
    })

    for (const ep of existingProgs) {
      await tx.programme.update({
        where: { id: ep.id },
        data: { status: 'INACTIVE', etablissementId: etab.id }
      })
    }

    // Désactiver toutes les anciennes bourses AMDI
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

    // 4. Importer les 19 programmes officiels AMDI et leurs tarifs
    const usedProgIds = new Set()

    for (const progData of OFFICIAL_AMDI_PROGRAMMES) {
      let prog = await tx.programme.findFirst({
        where: { slug: progData.slug }
      })

      if (!prog && progData.existingId && !usedProgIds.has(progData.existingId)) {
        prog = await tx.programme.findUnique({ where: { id: progData.existingId } })
      }

      if (!prog) {
        prog = await tx.programme.findFirst({
          where: {
            etablissementId: etab.id,
            id: { notIn: Array.from(usedProgIds) },
            niveau: { contains: progData.niveau, mode: 'insensitive' },
            titre: { contains: progData.titre.slice(0, 10), mode: 'insensitive' }
          }
        })
      }

      // Commission Partenariat BourseFi (Article 11):
      // 15 000 FCFA pour BTS Génie Civil, BTS Analyses Biologiques, BTS Agroalimentaire
      // 10 000 FCFA pour les autres filières
      const is15kFrais = progData.titre.includes('Génie Civil') || progData.titre.includes('Analyse Biologique') || progData.titre.includes('Agroalimentaire')
      const fraisDossierProg = is15kFrais ? 15000 : 10000

      if (prog) {
        usedProgIds.add(prog.id)
        prog = await tx.programme.update({
          where: { id: prog.id },
          data: {
            titre: progData.titre,
            slug: progData.slug,
            niveau: progData.niveau,
            duree: progData.niveau === 'Licence' ? '3 ans (6 semestres)' : progData.niveau === 'Master' ? '2 ans (4 semestres)' : '2 ans',
            ville: 'Dakar',
            fraisDossier: fraisDossierProg,
            fraisDossierEtranger: fraisDossierProg + 10000,
            devise: 'FCFA',
            description: progData.description,
            documentsRequis: 'CNI recto/verso, relevés de notes du Bac/diplôme, 3 photos d\'identité, extrait de naissance.',
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
            duree: progData.niveau === 'Licence' ? '3 ans (6 semestres)' : progData.niveau === 'Master' ? '2 ans (4 semestres)' : '2 ans',
            ville: 'Dakar',
            fraisDossier: fraisDossierProg,
            fraisDossierEtranger: fraisDossierProg + 10000,
            devise: 'FCFA',
            description: progData.description,
            documentsRequis: 'CNI recto/verso, relevés de notes du Bac/diplôme, 3 photos d\'identité, extrait de naissance.',
            status: 'ACTIVE',
            etablissementId: etab.id,
            partnerId: partner.id,
          }
        })
        usedProgIds.add(prog.id)
        stats.createCount++
      }

      // Supprimer les anciens tarifs et créer les nouveaux tarifs officiels AMDI
      await tx.tarif.deleteMany({
        where: { programmeId: prog.id }
      })

      const tBourse = progData.tarifsBourse

      if (tBourse.l1_l2) {
        await tx.tarif.create({
          data: {
            programmeId: prog.id,
            anneeAcademique: '2025-2026',
            label: progData.niveau === 'Licence' ? 'Licence 1 & Licence 2' : 'Année 1 & Année 2',
            montant: tBourse.l1_l2.montant,
            montantBourse: tBourse.l1_l2.montantBourse,
            fraisInscription: tBourse.l1_l2.inscription,
            mensualite: tBourse.l1_l2.mensualite,
            nombreMois: tBourse.l1_l2.mois,
            frequence: 'ANNUEL',
            devise: 'FCFA',
            isDefault: true,
            isVerified: true,
            status: 'ACTIVE',
          }
        })
        stats.tarifsCreatedCount++
      }

      if (tBourse.l3) {
        await tx.tarif.create({
          data: {
            programmeId: prog.id,
            anneeAcademique: '2025-2026',
            label: 'Licence 3',
            montant: tBourse.l3.montant,
            montantBourse: tBourse.l3.montantBourse,
            fraisInscription: tBourse.l3.inscription,
            mensualite: tBourse.l3.mensualite,
            nombreMois: tBourse.l3.mois,
            frequence: 'ANNUEL',
            devise: 'FCFA',
            isDefault: false,
            isVerified: true,
            status: 'ACTIVE',
          }
        })
        stats.tarifsCreatedCount++
      }

      if (tBourse.m1_m2) {
        await tx.tarif.create({
          data: {
            programmeId: prog.id,
            anneeAcademique: '2025-2026',
            label: 'Master 1 & Master 2',
            montant: tBourse.m1_m2.montant,
            montantBourse: tBourse.m1_m2.montantBourse,
            fraisInscription: tBourse.m1_m2.inscription,
            mensualite: tBourse.m1_m2.mensualite,
            nombreMois: tBourse.m1_m2.mois,
            frequence: 'ANNUEL',
            devise: 'FCFA',
            isDefault: true,
            isVerified: true,
            status: 'ACTIVE',
          }
        })
        stats.tarifsCreatedCount++
      }

      if (tBourse.c1) {
        await tx.tarif.create({
          data: {
            programmeId: prog.id,
            anneeAcademique: '2025-2026',
            label: 'Formation 6 mois',
            montant: tBourse.c1.montant,
            montantBourse: tBourse.c1.montantBourse,
            fraisInscription: tBourse.c1.inscription,
            mensualite: tBourse.c1.mensualite,
            nombreMois: tBourse.c1.mois,
            frequence: 'ANNUEL',
            devise: 'FCFA',
            isDefault: true,
            isVerified: true,
            status: 'ACTIVE',
          }
        })
        stats.tarifsCreatedCount++
      }

      // Upsert Bourse officielle AMDI
      const bourseSlug = `bourse-${prog.slug}`
      const defaultTarif = tBourse.l1_l2 || tBourse.m1_m2 || tBourse.c1
      const coveragePercent = Math.round(((defaultTarif.montant - defaultTarif.montantBourse) / defaultTarif.montant) * 100)

      let existingBourse = await tx.bourse.findFirst({
        where: { OR: [{ slug: bourseSlug }, { programmeId: prog.id }] }
      })

      if (existingBourse) {
        await tx.bourse.update({
          where: { id: existingBourse.id },
          data: {
            slug: bourseSlug,
            titre: `Bourse Officielle AMDI — ${prog.titre}`,
            programmeId: prog.id,
            partnerId: partner.id,
            coveragePercent: coveragePercent,
            quota: 30,
            placesRestantes: 25,
            dateLimite: new Date('2026-12-31T23:59:59.000Z'),
            conditions: 'Admissibilité sur étude de dossier académique et diplôme requis.',
            documentsRequis: 'CNI/Passeport, diplôme du Bac ou attestation, relevé de notes, 3 photos d\'identité.',
            isActive: true,
            status: 'ACTIVE',
          }
        })
        stats.boursesUpdatedCount++
      } else {
        await tx.bourse.create({
          data: {
            slug: bourseSlug,
            titre: `Bourse Officielle AMDI — ${prog.titre}`,
            programmeId: prog.id,
            partnerId: partner.id,
            coveragePercent: coveragePercent,
            quota: 30,
            placesRestantes: 25,
            dateLimite: new Date('2026-12-31T23:59:59.000Z'),
            conditions: 'Admissibilité sur étude de dossier académique et diplôme requis.',
            documentsRequis: 'CNI/Passeport, diplôme du Bac ou attestation, relevé de notes, 3 photos d\'identité.',
            isActive: true,
            status: 'ACTIVE',
          }
        })
        stats.boursesCreatedCount++
      }
    }

    console.log('✅ Importation AMDI terminée avec succès dans la transaction Prisma.')
  })

  // 5. POST-IMPORT ASSERTIONS
  console.log('\n🧪 DÉBUT DES VERIFICATIONS AUTOMATISÉES POST-IMPORT AMDI...')

  const etab = await prisma.etablissement.findFirst({
    where: { OR: [{ id: AMDI_ETAB_ID }, { slug: 'amdi-afrique' }] }
  })
  assert.ok(etab, '[1] Établissement AMDI trouvé')

  const activeProgsCount = await prisma.programme.count({
    where: { etablissementId: etab.id, status: 'ACTIVE' }
  })
  assert.strictEqual(activeProgsCount, OFFICIAL_AMDI_PROGRAMMES.length, `[2] Exactement ${OFFICIAL_AMDI_PROGRAMMES.length} programmes AMDI ACTIVE`)

  const activeBoursesCount = await prisma.bourse.count({
    where: { programme: { etablissementId: etab.id }, isActive: true, status: 'ACTIVE' }
  })
  assert.strictEqual(activeBoursesCount, OFFICIAL_AMDI_PROGRAMMES.length, `[3] Exactement ${OFFICIAL_AMDI_PROGRAMMES.length} bourses AMDI ACTIVE`)

  console.log('🎉 TOUTES LES ASSERTIONS POST-IMPORT AMDI ONT RÉUSSI AVEC SUCCÈS !')

  return stats
}

runImportAMDI()
  .then(async (stats) => {
    console.log('\n📊 RAPPORT D\'EXÉCUTION 1ER PASSAGE AMDI :', stats)

    console.log('\n🔁 DEUXIÈME PASSAGE IDEMPOTENCE AMDI...')
    const stats2 = await runImportAMDI()
    console.log('📊 RAPPORT D\'EXÉCUTION 2ÈME PASSAGE AMDI :', stats2)

    assert.strictEqual(stats2.createCount, 0, '[4a] 0 nouveau programme créé au 2ème passage')
    assert.strictEqual(stats2.boursesCreatedCount, 0, '[4b] 0 nouvelle bourse créée au 2ème passage')
    console.log('\n🏆 TEST D\'IDEMPOTENCE VALIDE : 100% IDEMPOTENT !')

    await prisma.$disconnect()
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ ERREUR D\'IMPORT AMDI (ROLLBACK DÉCLENCHÉ) :', err)
    prisma.$disconnect()
    process.exit(1)
  })
