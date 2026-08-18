import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

// Documents requis officiels d'admission d'après les conditions IFAA 2025/2026
const IFAA_DOCUMENTS_REQUIS = `• 02 Extraits d'acte de naissance de moins de 3 mois
• 04 Photos d'identité récentes
• Photocopie légalisée du diplôme du BAC/BFEM selon le niveau d'étude (ou attestation de réussite)
• Photocopie certifiée conforme des bulletins de notes des dernières années d'études
• Photocopie légalisée de la Carte Nationale d'Identité / Passeport
• Photocopie légalisée du diplôme de Licence, DEUG, BTS ou équivalent pour l'admission en Master
• Carte de membre CIAE obligatoire (5 000 FCFA versés à l'inscription)
• Fiche d'engagement d'inscription dûment complétée`

// Formations officielles issues de la plaquette et grilles d'IFAA Business School 2025/2026
const OFFICIAL_IFAA_PROGRAMMES = [
  // --- A. MASTERS MANAGEMENT (Licence ou équivalent requis - Durée: 10 mois) ---
  {
    slug: 'ifaa-master-banque-finance',
    titre: 'Master Banque Finance (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 420000,
    inscription: 70000,
    mensualite: 35000,
    mois: 10,
    isToVerify: true,
    description: 'Ingénierie financière, marchés de capitaux, banque d\'investissement et gestion des risques bancaires.'
  },
  {
    slug: 'ifaa-master-comptabilite-gestion',
    titre: 'Master Comptabilité et Gestion (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 420000,
    inscription: 70000,
    mensualite: 35000,
    mois: 10,
    isToVerify: true,
    description: 'Comptabilité approfondie SYSCOHADA, contrôle de gestion stratégique et fiscalité des groupes.'
  },
  {
    slug: 'ifaa-master-audit-controle-gestion',
    titre: 'Master Audit & Contrôle de Gestion (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 420000,
    inscription: 70000,
    mensualite: 35000,
    mois: 10,
    isToVerify: true,
    description: 'Audit financier interne/externe, contrôle budgétaire, gouvernance et normes IFRS.'
  },
  {
    slug: 'ifaa-master-commerce-international',
    titre: 'Master Commerce International (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 420000,
    inscription: 70000,
    mensualite: 35000,
    mois: 10,
    isToVerify: true,
    description: 'Négociation internationale, stratégie d\'exportation, douane et droit des affaires internationales.'
  },
  {
    slug: 'ifaa-master-marketing',
    titre: 'Master Marketing (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 420000,
    inscription: 70000,
    mensualite: 35000,
    mois: 10,
    isToVerify: true,
    description: 'Marketing stratégique, étude de marché internationale, branding et communication globale.'
  },
  {
    slug: 'ifaa-master-transport-logistique',
    titre: 'Master Transport Logistique (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 420000,
    inscription: 70000,
    mensualite: 35000,
    mois: 10,
    isToVerify: true,
    description: 'Supply Chain Management globale, transit multimodal, logistique portuaire et maritime.'
  },
  {
    slug: 'ifaa-master-gestion-ressources-humaines',
    titre: 'Master Gestion des Ressources Humaines (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 420000,
    inscription: 70000,
    mensualite: 35000,
    mois: 10,
    isToVerify: true,
    description: 'GPEC, politique de rémunération, relations sociales et développement des talents.'
  },
  {
    slug: 'ifaa-master-gestion-projets',
    titre: 'Master Gestion des Projets (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 420000,
    inscription: 70000,
    mensualite: 35000,
    mois: 10,
    isToVerify: true,
    description: 'Management de projet (PMI / PMP), suivi-évaluation, gestion budgétaire et risques.'
  },
  {
    slug: 'ifaa-master-qhse',
    titre: 'Master Qualité - Hygiène - Sécurité & Environnement (Master QHSE)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Licence ou équivalent',
    domaine: 'Management Spécifique',
    isHealth: false,
    tarifNormal: 782000,
    tarifBoursier: 475000,
    inscription: 75000,
    mensualite: 40000,
    mois: 10,
    isToVerify: false,
    description: 'Normes ISO 9001/14001/45001, audit QHSE, prévention des risques industriels et développement durable.'
  },

  // --- B. LICENCES MANAGEMENT (BAC ou équivalent requis - Durée: 3 ans) ---
  {
    slug: 'ifaa-licence-banque-finance',
    titre: 'Licence Banque Finance (Licence 1, 2, 3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Produits bancaires et d\'assurance, analyse financière de premier niveau et relation client.'
  },
  {
    slug: 'ifaa-licence-comptabilite-gestion',
    titre: 'Licence Comptabilité et Gestion (Licence 1, 2, 3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Comptabilité générale SYSCOHADA, paie, fiscalité pratique et gestion de trésorerie.'
  },
  {
    slug: 'ifaa-licence-commerce-international',
    titre: 'Licence Commerce International (Licence 1, 2, 3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Incoterms 2020, douanes, transit, prospection internationale et techniques d\'import-export.'
  },
  {
    slug: 'ifaa-licence-marketing-communication-digitale',
    titre: 'Licence Marketing Communication Transformation Digitale (Licence 1, 2, 3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Marketing stratégique et opérationnel, social media management, création de contenu et stratégie digitale.'
  },
  {
    slug: 'ifaa-licence-ingenierie-projets-entreprenariat',
    titre: 'Licence Ingénierie des Projets et Entreprenariat (Licence 1, 2, 3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Élaboration de business plan, montage de projets, recherche de financement et création d\'entreprise.'
  },
  {
    slug: 'ifaa-licence-transport-logistique',
    titre: 'Licence Transport Logistique (Licence 1, 2, 3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Gestion d\'entrepôts, affrètement, régimes douaniers sénégalais et transport multimodal.'
  },
  {
    slug: 'ifaa-licence-gestion-ressources-humaines',
    titre: 'Licence Gestion des Ressources Humaines (Licence 1, 2, 3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Gestion du personnel, contrats de travail, paie informatisée et recrutement.'
  },
  {
    slug: 'ifaa-licence-sciences-gestion-informatique',
    titre: 'Licence Sciences de Gestion & Informatique (Licence 1, 2, 3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'Management & IT',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Bases de données SQL, ERP de gestion, développement web applicatif et algorithmique d\'entreprise.'
  },
  {
    slug: 'ifaa-licence-qhse',
    titre: 'Licence Qualité - Hygiène - Sécurité & Environnement (Licence 1, 2, 3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Systèmes de management de la qualité, sécurité au travail, contrôle d\'hygiène et gestion environnementale.'
  },
  {
    slug: 'ifaa-licence-sage-femme-etat',
    titre: 'Licence Sage Femme d\'État (Filière Santé L3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC',
    domaine: 'Santé',
    isHealth: true,
    fraisExamenSante: 20000,
    tarifNormal: 722000,
    tarifBoursier: 475000,
    inscription: 75000,
    mensualite: 40000,
    mois: 10,
    isToVerify: false,
    description: 'Soins obstétricaux, néonatologie, accompagnement de la grossesse, accouchement et santé de la reproduction.'
  },
  {
    slug: 'ifaa-licence-infirmier-etat',
    titre: 'Licence Infirmier(e) d\'État (Filière Santé L3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    condition: 'BAC',
    domaine: 'Santé',
    isHealth: true,
    fraisExamenSante: 20000,
    tarifNormal: 722000,
    tarifBoursier: 475000,
    inscription: 75000,
    mensualite: 40000,
    mois: 10,
    isToVerify: false,
    description: 'Soins infirmiers généraux, pharmacologie, soins d\'urgence, pathologie médicale et gestion de salle d\'hospitalisation.'
  },

  // --- C. BTS EN APPROCHE PAR COMPÉTENCE (Durée: 2 ans) ---
  {
    slug: 'ifaa-bts-qhse',
    titre: 'BTS Qualité - Hygiène - Sécurité & Environnement (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Techniques de contrôle qualité, prévention des risques professionnels et hygiène en entreprise.'
  },
  {
    slug: 'ifaa-bts-industrie-agroalimentaire',
    titre: 'BTS Industrie Agroalimentaire (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Transformation et conservation des aliments, microbiologie et contrôle qualité de la chaîne alimentaire.'
  },
  {
    slug: 'ifaa-bts-nutrition-dietetique',
    titre: 'BTS Nutrition Diététique (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Équilibre nutritionnel, régime alimentaire hospitalier et conseils en hygiène de vie et diététique.'
  },
  {
    slug: 'ifaa-bts-analyse-biologique',
    titre: 'BTS Analyse Biologique (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Techniques d\'analyses de laboratoire, hématologie, biochimie médicale et parasitologie.'
  },
  {
    slug: 'ifaa-bts-informatique-de-gestion',
    titre: 'BTS Informatique de Gestion (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Bases de données SQL, algorithmique, développement logiciel et tableurs décisionnels.'
  },
  {
    slug: 'ifaa-bts-gestion-de-projet',
    titre: 'BTS Gestion de Projet (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscription: 75000,
    mensualite: 30000,
    mois: 10,
    isToVerify: true,
    description: 'Planification opérationnelle de projets, suivi d\'exécution et gestion des équipes sur le terrain.'
  },

  // --- D. BFEM – NIVEAU TERMINALE – BAC (SANTÉ & PARAMÉDICAL) ---
  {
    slug: 'ifaa-delegation-medicale',
    titre: 'Délégation Médicale (Formation Santé)',
    niveau: 'Certificat',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Bac / Niveau Terminale ou équivalent',
    domaine: 'Santé',
    isHealth: true,
    tarifNormal: 658500,
    tarifBoursier: 370000,
    inscription: 70000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Pharmacologie, visite médicale, présentation des spécialités pharmaceutiques aux médecins et éthique.'
  },
  {
    slug: 'ifaa-assistant-infirmier-etat',
    titre: 'Assistant(e) Infirmier(e) d\'État (Formation Santé)',
    niveau: 'Certificat',
    duree: '2 ans',
    billingDuration: '10 mois',
    condition: 'BFEM',
    domaine: 'Santé',
    isHealth: true,
    fraisExamenSante: null, // Retiré conformément aux consignes
    tarifNormal: 722000,
    tarifBoursier: 475000,
    inscription: 75000,
    mensualite: 40000,
    mois: 10,
    isToVerify: false,
    description: 'Soins de santé primaires, hygiène hospitalière, prise de constantes et assistance aux soins infirmiers.'
  },
  {
    slug: 'ifaa-vendeur-en-pharmacie',
    titre: 'Vendeur(se) en Pharmacie (Formation Santé)',
    niveau: 'Certificat',
    duree: '10 mois',
    billingDuration: '10 mois',
    condition: 'Bac / Niveau Terminale ou équivalent',
    domaine: 'Santé',
    isHealth: true,
    tarifNormal: 658500,
    tarifBoursier: 370000,
    inscription: 70000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Gestion des stocks d\'officine, conseil en parapharmacie, délivrance d\'ordonnances et encaissement.'
  }
]

async function runImport() {
  console.log('🚀 Début de l\'importation officielle IFAA Business School (Transaction Prisma)...')

  const stats = {
    etabUpdated: false,
    contactsCreated: 0,
    programmesCreated: 0,
    programmesUpdated: 0,
    programmesCleaned: 0,
    tarifsUpserted: 0,
    boursesUpserted: 0
  }

  await prisma.$transaction(async (tx) => {
    // 1. Partenaire référent
    let partner = await tx.partner.findFirst({
      where: {
        OR: [
          { slug: 'boursefi-partenaire' },
          { name: { contains: 'Partenaire Principal', mode: 'insensitive' } }
        ]
      }
    })

    if (!partner) {
      partner = await tx.partner.create({
        data: {
          name: 'BourseFi - Partenaire Principal',
          slug: 'boursefi-partenaire',
          partnerSharePercent: 75
        }
      })
    }

    // 2. Établissement IFAA Business School
    let etab = await tx.etablissement.findFirst({
      where: {
        OR: [
          { id: 'cmrghucki009ugny4ntnmakol' },
          { slug: 'ifaa-dakar' },
          { nom: { contains: 'IFAA', mode: 'insensitive' } }
        ]
      }
    })

    const etabPayload = {
      nom: 'IFAA Business School',
      slug: 'ifaa-dakar',
      ville: 'Dakar',
      adresse: 'VDN Face Hypermarché Exclusive, Dakar, Sénégal',
      phone: '+221 33 867 36 35',
      phoneSecondary: '+221 78 112 47 18',
      whatsapp: null,
      email: null,
      site: 'https://ifaa.sn',
      fraisDossier: 10000,
      isDirectPartner: true,
      autoIssueAttestation: true,
      status: 'ACTIVE'
    }

    if (etab) {
      etab = await tx.etablissement.update({
        where: { id: etab.id },
        data: etabPayload
      })
      stats.etabUpdated = true
    } else {
      etab = await tx.etablissement.create({
        data: {
          id: 'cmrghucki009ugny4ntnmakol',
          ...etabPayload
        }
      })
      stats.etabUpdated = true
    }

    console.log(`✅ Établissement IFAA prêt : ${etab.nom} (${etab.id})`)

    // 3. Contacts téléphoniques officiels
    const phones = [
      { val: '+221 33 867 36 35', isPrincipal: true },
      { val: '+221 78 112 47 18', isPrincipal: false }
    ]

    for (const pInfo of phones) {
      const existing = await tx.etablissementContact.findFirst({
        where: { etablissementId: etab.id, valeur: pInfo.val }
      })
      if (!existing) {
        await tx.etablissementContact.create({
          data: {
            etablissementId: etab.id,
            type: 'PHONE',
            valeur: pInfo.val,
            label: 'Téléphone Officiel IFAA',
            isPrincipal: pInfo.isPrincipal,
            status: 'VERIFIED',
            source: 'ESTABLISHMENT',
            isActive: true
          }
        })
        stats.contactsCreated++
      }
    }

    // 4. Nettoyer ou désactiver les anciens programmes obsolètes d'IFAA non présents dans la liste officielle
    const officialSlugs = OFFICIAL_IFAA_PROGRAMMES.map((p) => p.slug)
    const oldProgs = await tx.programme.findMany({
      where: {
        etablissementId: etab.id,
        slug: { notIn: officialSlugs }
      },
      include: { candidatures: true }
    })

    for (const oldP of oldProgs) {
      if (oldP.candidatures.length === 0) {
        await tx.bourse.deleteMany({ where: { programmeId: oldP.id } })
        await tx.tarif.deleteMany({ where: { programmeId: oldP.id } })
        await tx.programme.delete({ where: { id: oldP.id } })
        stats.programmesCleaned++
      } else {
        await tx.bourse.updateMany({ where: { programmeId: oldP.id }, data: { isActive: false, status: 'INACTIVE' } })
        await tx.programme.update({ where: { id: oldP.id }, data: { status: 'INACTIVE' } })
      }
    }

    // 5. Importer les 29 programmes et tarifs officiels IFAA 2025/2026
    for (const progData of OFFICIAL_IFAA_PROGRAMMES) {
      let prog = await tx.programme.findFirst({
        where: { slug: progData.slug }
      })

      const progPayload = {
        etablissementId: etab.id,
        partnerId: partner.id,
        titre: progData.titre,
        slug: progData.slug,
        ville: 'Dakar',
        duree: progData.duree,
        niveau: progData.niveau,
        description: progData.description,
        conditionsAdmission: `• Condition d'admission : ${progData.condition}\n• Durée de facturation : ${progData.billingDuration}\n• Frais annexes : Vaccin (13 000 F), Blouses (30 000 F), Frais de stage (10 000 F).\n• Carte CIAE obligatoire dès l'inscription : 5 000 FCFA.${progData.fraisExamenSante ? '\n• Frais d\'examen filière Santé L3 : 20 000 FCFA.' : ''}`,
        documentsRequis: IFAA_DOCUMENTS_REQUIS,
        eligibilite: `Ouvert aux étudiants remplissant la condition officielle (${progData.condition}).`,
        sourceType: 'DOCUMENT_ETABLISSEMENT',
        verifiedAt: new Date(),
        status: 'ACTIVE'
      }

      if (prog) {
        prog = await tx.programme.update({
          where: { id: prog.id },
          data: progPayload
        })
        stats.programmesUpdated++
      } else {
        prog = await tx.programme.create({
          data: progPayload
        })
        stats.programmesCreated++
      }

      // --- CALCUL PRÉCIS DE L'ÉCONOMIE & DU POURCENTAGE ---
      const hasTarifNormal = progData.tarifNormal !== null && progData.tarifNormal !== undefined
      const economie = hasTarifNormal ? progData.tarifNormal - progData.tarifBoursier : null
      const percentageReduction = hasTarifNormal ? Number(((economie / progData.tarifNormal) * 100).toFixed(2)) : null

      // --- TARIF NOMINAL ET PRÉFÉRENTIEL (2025/2026) ---
      let existingTarif = await tx.tarif.findFirst({
        where: { programmeId: prog.id, anneeAcademique: '2025/2026' }
      })

      const tarifPayload = {
        programmeId: prog.id,
        anneeAcademique: '2025/2026',
        montant: hasTarifNormal ? progData.tarifNormal : progData.tarifBoursier,
        montantBourse: progData.tarifBoursier,
        fraisInscription: progData.inscription,
        mensualite: progData.mensualite,
        nombreMois: progData.mois,
        autresFrais: progData.fraisExamenSante || null,
        devise: 'FCFA',
        frequence: 'ANNUEL',
        label: progData.isToVerify ? 'Tarif Préférentiel Manuscrit 2025/2026 (À vérifier)' : 'Tarif Préférentiel 2025/2026',
        source: 'DOCUMENT',
        isVerified: !progData.isToVerify,
        isDefault: true,
        status: 'ACTIVE'
      }

      if (existingTarif) {
        await tx.tarif.update({
          where: { id: existingTarif.id },
          data: tarifPayload
        })
      } else {
        await tx.tarif.create({
          data: tarifPayload
        })
      }
      stats.tarifsUpserted++

      // --- BOURSE ASSOCIÉE (OFFRE PRÉFÉRENTIELLE BOURSEFI) ---
      const bourseTitle = `Offre Préférentielle IFAA 2025-2026 — ${progData.titre}`
      const bourseSlug = `bourse-${progData.slug}`

      let existingBourse = await tx.bourse.findFirst({
        where: { slug: bourseSlug }
      })

      const boursePayload = {
        programmeId: prog.id,
        partnerId: partner.id,
        titre: bourseTitle,
        slug: bourseSlug,
        coveragePercent: percentageReduction ? Math.round(percentageReduction) : 0,
        montantMax: economie || 0,
        dateLimite: new Date('2026-11-30'),
        conditions: `Condition d'admission : ${progData.condition}. Durée du cursus : ${progData.duree} (Facturation : ${progData.billingDuration}). Frais d'inscription préférentiels : ${progData.inscription.toLocaleString('fr-FR')} FCFA. Mensualité : ${progData.mensualite.toLocaleString('fr-FR')} FCFA sur 10 mois. Carte CIAE obligatoire : 5 000 FCFA.`,
        documentsRequis: IFAA_DOCUMENTS_REQUIS,
        isActive: true,
        status: 'ACTIVE'
      }

      if (existingBourse) {
        await tx.bourse.update({
          where: { id: existingBourse.id },
          data: boursePayload
        })
      } else {
        await tx.bourse.create({
          data: boursePayload
        })
      }
      stats.boursesUpserted++
    }
  })

  console.log('✅ Importation IFAA Business School terminée avec succès dans la transaction Prisma.')
  return stats
}

async function verifyImport() {
  console.log('\n🧪 DÉBUT DES VÉRIFICATIONS AUTOMATISÉES POST-IMPORT IFAA...')

  const etab = await prisma.etablissement.findFirst({
    where: {
      OR: [
        { slug: 'ifaa-dakar' },
        { nom: { contains: 'IFAA', mode: 'insensitive' } }
      ]
    },
    include: {
      contacts: true,
      programmes: {
        where: { status: 'ACTIVE' },
        include: { bourses: true, tarifs: true }
      }
    }
  })

  assert.ok(etab, 'L\'établissement IFAA doit exister')
  assert.strictEqual(etab.nom, 'IFAA Business School')
  assert.strictEqual(etab.slug, 'ifaa-dakar')
  assert.strictEqual(etab.phone, '+221 33 867 36 35')
  assert.strictEqual(etab.phoneSecondary, '+221 78 112 47 18')
  assert.strictEqual(etab.isDirectPartner, true)
  assert.strictEqual(etab.programmes.length, 29, 'Il doit y avoir exactement 29 programmes officiels IFAA actifs')

  // Vérification des calculs pour quelques formations représentatives
  const testCalculations = [
    { slug: 'ifaa-master-banque-finance', expectedNormal: 420000, expectedBoursier: 420000, expectedEco: 0, expectedPct: 0, expectedToVerify: true },
    { slug: 'ifaa-master-qhse', expectedNormal: 782000, expectedBoursier: 475000, expectedEco: 307000, expectedPct: 39, expectedToVerify: false },
    { slug: 'ifaa-licence-banque-finance', expectedNormal: 375000, expectedBoursier: 375000, expectedEco: 0, expectedPct: 0, expectedToVerify: true },
    { slug: 'ifaa-licence-sage-femme-etat', expectedNormal: 722000, expectedBoursier: 475000, expectedEco: 247000, expectedPct: 34, expectedToVerify: false },
    { slug: 'ifaa-delegation-medicale', expectedNormal: 658500, expectedBoursier: 370000, expectedEco: 288500, expectedPct: 44, expectedToVerify: false }
  ]

  for (const tc of testCalculations) {
    const p = etab.programmes.find((item) => item.slug === tc.slug)
    assert.ok(p, `Le programme ${tc.slug} doit exister`)
    const tarif = p.tarifs.find((t) => t.anneeAcademique === '2025/2026')
    assert.ok(tarif, `Le tarif 2025/2026 pour ${tc.slug} doit exister`)
    assert.strictEqual(tarif.montant, tc.expectedNormal, `Tarif normal pour ${tc.slug}`)
    assert.strictEqual(tarif.montantBourse, tc.expectedBoursier, `Tarif boursier pour ${tc.slug}`)

    const bourse = p.bourses[0]
    assert.ok(bourse, `La bourse pour ${tc.slug} doit exister`)
    assert.strictEqual(bourse.montantMax, tc.expectedEco, `Économie pour ${tc.slug}`)
    assert.strictEqual(bourse.coveragePercent, tc.expectedPct, `Pourcentage pour ${tc.slug}`)
  }

  // Vérification de la non-application des frais d'examen de 20 000 F à Assistant Infirmier d'État (BFEM)
  const asstInfir = etab.programmes.find(p => p.slug === 'ifaa-assistant-infirmier-etat')
  assert.ok(asstInfir, 'Assistant Infirmier doit exister')
  const tAsst = asstInfir.tarifs.find(t => t.anneeAcademique === '2025/2026')
  assert.strictEqual(tAsst.autresFrais, null, 'Assistant Infirmier ne doit PAS recevoir les 20 000 FCFA de frais d\'examen Santé L3')

  console.log('🎉 TOUTES LES ASSERTIONS POST-IMPORT IFAA ONT RÉUSSI AVEC SUCCÈS !')
}

async function main() {
  try {
    const run1 = await runImport()
    console.log('\n📊 RAPPORT D\'EXÉCUTION 1ER PASSAGE IFAA :', run1)

    await verifyImport()

    console.log('\n🔁 DEUXIÈME PASSAGE IDEMPOTENCE IFAA...')
    const run2 = await runImport()
    console.log('📊 RAPPORT D\'EXÉCUTION 2ÈME PASSAGE IFAA :', run2)

    await verifyImport()
    console.log('\n🏆 TEST D\'IDEMPOTENCE VALIDE : 100% IDEMPOTENT !')
  } catch (err) {
    console.error('\n❌ ERREUR D\'IMPORT IFAA (ROLLBACK DÉCLENCHÉ) :', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
