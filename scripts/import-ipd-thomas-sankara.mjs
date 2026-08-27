import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PROGRAMMES_DATA = [
  // LICENCE — SCIENCES ET TECHNOLOGIES (5)
  // Brochure publique : Inscription 150 000 + 8 mensualités de 85 000 = 830 000 FCFA
  // Tarif réduit BourseFi : Inscription 150 000 + 8 mensualités de 54 375 = 585 000 FCFA (Économie: 245 000 FCFA / ~30%)
  {
    titre: 'Génie Civil (Licence)',
    slug: 'ipd-licence-genie-civil',
    niveau: 'Licence',
    categorie: 'TECH',
    montantNormal: 830000,
    montantReduit: 585000,
    fraisInscription: 150000,
    mensualite: 54375,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Formation supérieure en Génie Civil couvrant le dimensionnement des ouvrages, les matériaux de construction, la mécanique des sols et le suivi de chantier.',
    conditionsAdmission: 'Baccalauréat scientifique ou technique (S1, S2, S3, T1, T2) ou diplôme homologué équivalent. Étude de dossier.',
  },
  {
    titre: 'Administration et Gestion des Réseaux (Licence)',
    slug: 'ipd-licence-administration-gestion-reseaux',
    niveau: 'Licence',
    categorie: 'TECH',
    montantNormal: 830000,
    montantReduit: 585000,
    fraisInscription: 150000,
    mensualite: 54375,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Spécialisation en administration système, architecture réseau, virtualisation et maintenance des infrastructures informatiques d\'entreprise.',
    conditionsAdmission: 'Baccalauréat scientifique, technique ou général. Étude de dossier académique.',
  },
  {
    titre: 'Génie Logiciel (Licence)',
    slug: 'ipd-licence-genie-logiciel',
    niveau: 'Licence',
    categorie: 'TECH',
    montantNormal: 830000,
    montantReduit: 585000,
    fraisInscription: 150000,
    mensualite: 54375,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Parcours axé sur la conception d\'applications web, mobiles et d\'entreprise, le génie logiciel, la gestion de bases de données et la méthodologie Agile.',
    conditionsAdmission: 'Baccalauréat scientifique (S1, S2) ou technique. Étude de dossier.',
  },
  {
    titre: 'Réseaux Télécom (Licence)',
    slug: 'ipd-licence-reseaux-telecom',
    niveau: 'Licence',
    categorie: 'TECH',
    montantNormal: 830000,
    montantReduit: 585000,
    fraisInscription: 150000,
    mensualite: 54375,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Formation d\'ingénierie appliquée aux télécommunications, à la transmission de données, à la fibre optique et aux réseaux mobiles 4G/5G.',
    conditionsAdmission: 'Baccalauréat S1, S2, T1, T2 ou diplôme équivalent.',
  },
  {
    titre: 'Électrotechnique (Licence)',
    slug: 'ipd-licence-electrotechnique',
    niveau: 'Licence',
    categorie: 'TECH',
    montantNormal: 830000,
    montantReduit: 585000,
    fraisInscription: 150000,
    mensualite: 54375,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Spécialisation en conversion d\'énergie, machines électriques, installations industrielles, réseaux HTA/BTA et systèmes automatisés.',
    conditionsAdmission: 'Baccalauréat scientifique ou technique. Étude de dossier.',
  },

  // LICENCE — SCIENCES ÉCONOMIQUES ET DE GESTION (7)
  // Brochure publique : Inscription 100 000 + 8 mensualités de 75 000 = 700 000 FCFA
  // Tarif réduit BourseFi : Inscription 150 000 + 8 mensualités de 41 875 = 485 000 FCFA (Économie: 215 000 FCFA / ~31%)
  {
    titre: 'Administration des Entreprises (Licence)',
    slug: 'ipd-licence-administration-des-entreprises',
    niveau: 'Licence',
    categorie: 'ECO',
    montantNormal: 700000,
    montantReduit: 485000,
    fraisInscription: 150000,
    mensualite: 41875,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Formation polyvalente en management général, stratégie d\'entreprise, gestion comptable, droit des affaires et entrepreneuriat.',
    conditionsAdmission: 'Baccalauréat toutes séries (L, S, G). Étude de dossier.',
  },
  {
    titre: 'Gestion des Ressources Humaines (Licence)',
    slug: 'ipd-licence-gestion-des-ressources-humaines',
    niveau: 'Licence',
    categorie: 'ECO',
    montantNormal: 700000,
    montantReduit: 485000,
    fraisInscription: 150000,
    mensualite: 41875,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Cursus dédié à la gestion de la paie, au recrutement, aux relations sociales, au droit du travail et au développement du capital humain.',
    conditionsAdmission: 'Baccalauréat toutes séries (L, S, G). Étude de dossier.',
  },
  {
    titre: 'Finance / Banque / Assurance (Licence)',
    slug: 'ipd-licence-finance-banque-assurance',
    niveau: 'Licence',
    categorie: 'ECO',
    montantNormal: 700000,
    montantReduit: 485000,
    fraisInscription: 150000,
    mensualite: 41875,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Maîtrise des opérations financières, des marchés bancaires, des produits d\'assurance et de la gestion de portefeuille d\'entreprise.',
    conditionsAdmission: 'Baccalauréat S, G ou L2/L3 économie.',
  },
  {
    titre: 'Finance Comptabilité (Licence)',
    slug: 'ipd-licence-finance-comptabilite',
    niveau: 'Licence',
    categorie: 'ECO',
    montantNormal: 700000,
    montantReduit: 485000,
    fraisInscription: 150000,
    mensualite: 41875,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Formation certifiante aux normes comptables SYSCOHADA, au contrôle budgétaire, à la fiscalité des entreprises et à l\'analyse financière.',
    conditionsAdmission: 'Baccalauréat G2, S ou L. Étude de dossier.',
  },
  {
    titre: 'Commerce International (Licence)',
    slug: 'ipd-licence-commerce-international',
    niveau: 'Licence',
    categorie: 'ECO',
    montantNormal: 700000,
    montantReduit: 485000,
    fraisInscription: 150000,
    mensualite: 41875,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Spécialisation dans les échanges de marchandises à l\'export/import, les incoterms, les procédures douanières et le marketing international.',
    conditionsAdmission: 'Baccalauréat toutes séries. Étude de dossier.',
  },
  {
    titre: 'Transport Logistique (Licence)',
    slug: 'ipd-licence-transport-logistique',
    niveau: 'Licence',
    categorie: 'ECO',
    montantNormal: 700000,
    montantReduit: 485000,
    fraisInscription: 150000,
    mensualite: 41875,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Gestion de la chaîne d\'approvisionnement (Supply Chain), optimisation des flux logistiques, gestion de flotte et douanes.',
    conditionsAdmission: 'Baccalauréat toutes séries. Étude de dossier.',
  },
  {
    titre: 'Marketing Communication (Licence)',
    slug: 'ipd-licence-marketing-communication',
    niveau: 'Licence',
    categorie: 'ECO',
    montantNormal: 700000,
    montantReduit: 485000,
    fraisInscription: 150000,
    mensualite: 41875,
    nombreMois: 8,
    fraisSoutenance: null,
    description: 'Parcours en stratégie de marque, marketing digital, publicité, relation publique et événementiel d\'entreprise.',
    conditionsAdmission: 'Baccalauréat toutes séries. Étude de dossier.',
  },

  // MASTER — SCIENCES ET TECHNOLOGIES (9)
  // Brochure publique : Inscription 150 000 + 8 mensualités de 95 000 = 910 000 FCFA
  // Tarif réduit BourseFi : Inscription 150 000 + 8 mensualités de 60 000 = 630 000 FCFA (Économie: 280 000 FCFA / ~31%)
  {
    titre: 'Génie Civil (Master)',
    slug: 'ipd-master-genie-civil',
    niveau: 'Master',
    categorie: 'TECH',
    montantNormal: 910000,
    montantReduit: 630000,
    fraisInscription: 150000,
    mensualite: 60000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Expertise avancée en ingénierie des structures, calcul béton armé/charpente métallique, géotechnique et pilotage de grands projets BTP.',
    conditionsAdmission: 'Licence (L3) en Génie Civil, BTP ou diplôme équivalent. Sélection sur dossier.',
  },
  {
    titre: 'Architecture (Master)',
    slug: 'ipd-master-architecture',
    niveau: 'Master',
    categorie: 'TECH',
    montantNormal: 910000,
    montantReduit: 630000,
    fraisInscription: 150000,
    mensualite: 60000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Conception architecturale, urbanisme durable, modélisation BIM et gestion technique du patrimoine bâti.',
    conditionsAdmission: 'Licence en Architecture, Design de l\'espace ou Génie Civil.',
  },
  {
    titre: 'Topographie (Master)',
    slug: 'ipd-master-topographie',
    niveau: 'Master',
    categorie: 'TECH',
    montantNormal: 910000,
    montantReduit: 630000,
    fraisInscription: 150000,
    mensualite: 60000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Géodésie, photogrammétrie, télédétection, SIG (Systèmes d\'Information Géographique) et foncier.',
    conditionsAdmission: 'Licence en Topographie, Géomatique ou Génie Civil.',
  },
  {
    titre: 'Bâtiments et Construction (Master)',
    slug: 'ipd-master-batiments-et-construction',
    niveau: 'Master',
    categorie: 'TECH',
    montantNormal: 910000,
    montantReduit: 630000,
    fraisInscription: 150000,
    mensualite: 60000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Ingénierie de la construction, efficacité énergétique des bâtiments, contrôle de conformité et sécurité de chantier.',
    conditionsAdmission: 'Licence en Génie Civil, BTP ou Sciences Physiques.',
  },
  {
    titre: 'Génie Logiciel (Master)',
    slug: 'ipd-master-genie-logiciel',
    niveau: 'Master',
    categorie: 'TECH',
    montantNormal: 910000,
    montantReduit: 630000,
    fraisInscription: 150000,
    mensualite: 60000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Architecture logicielle distribuée, DevOps, intégration continue, Cloud Computing et développement d\'applications complexes.',
    conditionsAdmission: 'Licence en Informatique, Génie Logiciel ou Mathématiques Appliquées.',
  },
  {
    titre: 'Administration des Réseaux (Master)',
    slug: 'ipd-master-administration-des-reseaux',
    niveau: 'Master',
    categorie: 'TECH',
    montantNormal: 910000,
    montantReduit: 630000,
    fraisInscription: 150000,
    mensualite: 60000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Gestion avancée des datacenters, virtualisation des infrastructures, serveurs d\'entreprise et supervision réseau.',
    conditionsAdmission: 'Licence en Informatique, Réseaux ou Télécoms.',
  },
  {
    titre: 'Réseaux Télécom (Master)',
    slug: 'ipd-master-reseaux-telecom',
    niveau: 'Master',
    categorie: 'TECH',
    montantNormal: 910000,
    montantReduit: 630000,
    fraisInscription: 150000,
    mensualite: 60000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Ingénierie des réseaux à haut débit, communications satellitaires, IoT et protocoles de télécommunication avancés.',
    conditionsAdmission: 'Licence en Réseaux & Télécoms ou Électronique.',
  },
  {
    titre: 'Sécurité des Systèmes et Réseaux (Master)',
    slug: 'ipd-master-securite-des-systemes-et-reseaux',
    niveau: 'Master',
    categorie: 'TECH',
    montantNormal: 910000,
    montantReduit: 630000,
    fraisInscription: 150000,
    mensualite: 60000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Cybersécurité d\'entreprise, cryptographie, audits de vulnérabilités, SOC/SIEM et protection des données sensibles.',
    conditionsAdmission: 'Licence en Informatique, Réseaux ou Télécoms.',
  },
  {
    titre: 'Électrotechnique (Master)',
    slug: 'ipd-master-electrotechnique',
    niveau: 'Master',
    categorie: 'TECH',
    montantNormal: 910000,
    montantReduit: 630000,
    fraisInscription: 150000,
    mensualite: 60000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Ingénierie des réseaux électriques forte puissance, énergies renouvelables, électronique de puissance et automatismes industriels.',
    conditionsAdmission: 'Licence en Électrotechnique, Électronique ou Physique.',
  },

  // MASTER — SCIENCES ÉCONOMIQUES ET DE GESTION (9)
  // Brochure publique : Inscription 100 000 + 8 mensualités de 85 000 = 780 000 FCFA
  // Tarif réduit BourseFi : Inscription 150 000 + 8 mensualités de 50 000 = 550 000 FCFA (Économie: 230 000 FCFA / ~30%)
  {
    titre: 'Administration des Entreprises (Master)',
    slug: 'ipd-master-administration-des-entreprises',
    niveau: 'Master',
    categorie: 'ECO',
    montantNormal: 780000,
    montantReduit: 550000,
    fraisInscription: 150000,
    mensualite: 50000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Management stratégique, pilotage de la performance d\'entreprise, gouvernance d\'organisation et leadership d\'affaires.',
    conditionsAdmission: 'Licence en Gestion, Économie, Administration ou diplôme équivalent.',
  },
  {
    titre: 'Gestion des Ressources Humaines (Master)',
    slug: 'ipd-master-gestion-des-ressources-humaines',
    niveau: 'Master',
    categorie: 'ECO',
    montantNormal: 780000,
    montantReduit: 550000,
    fraisInscription: 150000,
    mensualite: 50000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Management stratégique des RH, gestion de la paie et du climat social, développement des compétences et transformation digitale RH.',
    conditionsAdmission: 'Licence en RH, Gestion, Droit ou Sciences Sociales.',
  },
  {
    titre: 'Marketing Communication (Master)',
    slug: 'ipd-master-marketing-communication',
    niveau: 'Master',
    categorie: 'ECO',
    montantNormal: 780000,
    montantReduit: 550000,
    fraisInscription: 150000,
    mensualite: 50000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Stratégie marketing omnibus, brand management, communication de crise et marketing d\'influence.',
    conditionsAdmission: 'Licence en Marketing, Communication ou Gestion.',
  },
  {
    titre: 'Commerce International (Master)',
    slug: 'ipd-master-commerce-international',
    niveau: 'Master',
    categorie: 'ECO',
    montantNormal: 780000,
    montantReduit: 550000,
    fraisInscription: 150000,
    mensualite: 50000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Négociation commerciale internationale, douane approfondie, finance internationale et stratégies d\'exportation.',
    conditionsAdmission: 'Licence en Commerce International, Économie ou Gestion.',
  },
  {
    titre: 'Transport Logistique (Master)',
    slug: 'ipd-master-transport-logistique',
    niveau: 'Master',
    categorie: 'ECO',
    montantNormal: 780000,
    montantReduit: 550000,
    fraisInscription: 150000,
    mensualite: 50000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Management de la Supply Chain globale, ingénierie des transports multimodaux et logistique portuaire/aéroportuaire.',
    conditionsAdmission: 'Licence en Transport, Logistique, Économie ou Gestion.',
  },
  {
    titre: 'Finance Comptabilité (Master)',
    slug: 'ipd-master-finance-comptabilite',
    niveau: 'Master',
    categorie: 'ECO',
    montantNormal: 780000,
    montantReduit: 550000,
    fraisInscription: 150000,
    mensualite: 50000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Expertise comptable et financière selon les normes SYSCOHADA révisées, consolidation des comptes et ingénierie fiscale.',
    conditionsAdmission: 'Licence en Finance, Comptabilité ou Gestion.',
  },
  {
    titre: 'Finance Banque Assurance (Master)',
    slug: 'ipd-master-finance-banque-assurance',
    niveau: 'Master',
    categorie: 'ECO',
    montantNormal: 780000,
    montantReduit: 550000,
    fraisInscription: 150000,
    mensualite: 50000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Gestion des risques bancaires et prudentiels (Bâle II/III), finance de marché et ingénierie des contrats d\'assurance.',
    conditionsAdmission: 'Licence en Finance, Banque, Assurance ou Économie.',
  },
  {
    titre: 'Audit Comptable, Financier et Fiscal (Master)',
    slug: 'ipd-master-audit-comptable-financier-et-fiscal',
    niveau: 'Master',
    categorie: 'ECO',
    montantNormal: 780000,
    montantReduit: 550000,
    fraisInscription: 150000,
    mensualite: 50000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Audit interne et externe, contrôle de gestion avancé, optimisation fiscale et gouvernance financière d\'entreprise.',
    conditionsAdmission: 'Licence en Finance, Comptabilité, Audit ou Gestion.',
  },
  {
    titre: 'Ingénierie Financière (Master)',
    slug: 'ipd-master-ingenierie-financiere',
    niveau: 'Master',
    categorie: 'ECO',
    montantNormal: 780000,
    montantReduit: 550000,
    fraisInscription: 150000,
    mensualite: 50000,
    nombreMois: 8,
    fraisSoutenance: 180000,
    description: 'Montages financiers complexes, évaluation d\'entreprises, capital-investissement (Private Equity) et fusions-acquisitions.',
    conditionsAdmission: 'Licence en Finance, Mathématiques Financières, Économie ou Gestion.',
  },
]

async function runImport() {
  console.log('🚀 Début de l\'importation officielle IPD Thomas Sankara (résolution sécurisée de l\'établissement)...')

  // 1. Récupérer ou créer le partenaire par défaut
  let partner = await prisma.partner.findFirst({
    where: { name: { contains: 'IPD', mode: 'insensitive' } }
  })

  if (!partner) {
    partner = await prisma.partner.findFirst()
  }

  // 2. Trouver l'établissement IPD par slug ou nom
  let etab = await prisma.etablissement.findFirst({
    where: {
      OR: [
        { slug: 'ipd-thomas-sankara' },
        { nom: { contains: 'IPD', mode: 'insensitive' } },
        { nom: { contains: 'Sankara', mode: 'insensitive' } }
      ]
    }
  })

  const etabData = {
    nom: 'IPD Thomas Sankara',
    slug: 'ipd-thomas-sankara',
    ville: 'Dakar',
    adresse: 'Sud-Foire (à proximité du SAMU Municipal), Dakar, Sénégal',
    phone: '+221 33 867 58 58',
    email: 'contact@ipd.sn',
    site: 'https://ipd.sn',
    fraisDossier: 20000,
    isDirectPartner: true,
    autoIssueAttestation: true,
    status: 'ACTIVE',
  }

  if (etab) {
    etab = await prisma.etablissement.update({
      where: { id: etab.id },
      data: etabData
    })
  } else {
    etab = await prisma.etablissement.create({
      data: etabData
    })
  }

  console.log('✅ Établissement configuré avec succès :', etab.nom, `(ID: ${etab.id})`)

  // 3. Supprimer les anciennes bourses et anciens programmes obsolètes sans candidature
  const existingProgs = await prisma.programme.findMany({
    where: { etablissementId: etab.id },
    select: { id: true }
  })

  const existingProgIds = existingProgs.map(p => p.id)

  if (existingProgIds.length > 0) {
    await prisma.bourse.deleteMany({
      where: { programmeId: { in: existingProgIds } }
    })
    await prisma.tarif.deleteMany({
      where: { programmeId: { in: existingProgIds } }
    })
    await prisma.programme.deleteMany({
      where: { id: { in: existingProgIds } }
    })
    console.log(`🧹 ${existingProgIds.length} ancien(s) programme(s) nettoyé(s).`)
  }

  // 4. Importer les 30 programmes officiels 2026-2027 avec comparaison Tarifs Normaux vs Réduits
  let countImported = 0

  for (const progData of PROGRAMMES_DATA) {
    const economie = progData.montantNormal - progData.montantReduit
    const economiePercent = Math.round((economie / progData.montantNormal) * 100)

    const programme = await prisma.programme.create({
      data: {
        slug: progData.slug,
        etablissementId: etab.id,
        partnerId: partner.id,
        titre: progData.titre,
        niveau: progData.niveau,
        duree: progData.niveau === 'Licence' ? '3 ans (6 semestres)' : '2 ans (4 semestres)',
        ville: 'Dakar',
        fraisDossier: 20000,
        fraisDossierEtranger: 30000,
        devise: 'FCFA',
        description: progData.description,
        conditionsAdmission: progData.conditionsAdmission,
        documentsRequis: 'CNI recto/verso, relevé de notes de la dernière année d\'études, attestation de réussite ou diplôme.',
        status: 'ACTIVE',
        tarifs: {
          create: {
            anneeAcademique: '2026-2027',
            montant: progData.montantNormal,
            montantBourse: progData.montantReduit,
            fraisInscription: progData.fraisInscription,
            mensualite: progData.mensualite,
            nombreMois: progData.nombreMois,
            fraisSoutenance: progData.fraisSoutenance,
            frequence: 'ANNUEL',
            devise: 'FCFA',
            label: 'Tarif Réduit Officiel BourseFi 2026-2027',
            isDefault: true,
            isVerified: true,
            status: 'ACTIVE',
          }
        },
        bourses: {
          create: {
            slug: `bourse-${progData.slug}`,
            titre: `Bourse ${progData.titre}`,
            partnerId: partner.id,
            coveragePercent: economiePercent,
            quota: 30,
            placesRestantes: 25,
            dateLimite: new Date('2026-12-31T23:59:59.000Z'),
            conditions: 'Admissibilité sur étude de dossier académique. Inscription de 150 000 FCFA + 8 mensualités.',
            documentsRequis: 'CNI recto/verso, relevés de notes, diplôme ou attestation de niveau.',
            isActive: true,
            status: 'ACTIVE',
          }
        }
      }
    })

    countImported++
    console.log(`  [${countImported}/30] ${programme.titre} | Normal: ${progData.montantNormal.toLocaleString('fr-FR')} F -> BourseFi: ${progData.montantReduit.toLocaleString('fr-FR')} F (-${economie.toLocaleString('fr-FR')} FCFA / ${economiePercent}%)`)
  }

  console.log(`\n IMPORTATION RÉUSSIE ! ${countImported} programmes officiels IPD Thomas Sankara mis à jour.`)
}

runImport()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('❌ Erreur lors de l\'import :', err)
    prisma.$disconnect()
    process.exit(1)
  })
