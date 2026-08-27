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
  // --- A. MASTERS MANAGEMENT (8 Masters - Durée: 10 mois) ---
  {
    slug: 'ifaa-master-banque-finance',
    titre: 'Master Banque Finance (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Ingénierie financière, marchés de capitaux, banque d\'investissement et gestion des risques bancaires.'
  },
  {
    slug: 'ifaa-master-comptabilite-gestion',
    titre: 'Master Comptabilité et Gestion (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Comptabilité approfondie SYSCOHADA, contrôle de gestion stratégique et fiscalité des groupes.'
  },
  {
    slug: 'ifaa-master-audit-controle-gestion',
    titre: 'Master Audit & Contrôle de Gestion (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Audit financier interne/externe, contrôle budgétaire, gouvernance et normes IFRS.'
  },
  {
    slug: 'ifaa-master-commerce-international',
    titre: 'Master Commerce International (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Négociation internationale, stratégie d\'exportation, douane et droit des affaires internationales.'
  },
  {
    slug: 'ifaa-master-marketing',
    titre: 'Master Marketing (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Marketing stratégique, étude de marché internationale, branding et communication globale.'
  },
  {
    slug: 'ifaa-master-transport-logistique',
    titre: 'Master Transport Logistique (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Supply Chain Management globale, transit multimodal, logistique portuaire et maritime.'
  },
  {
    slug: 'ifaa-master-gestion-ressources-humaines',
    titre: 'Master Gestion des Ressources Humaines (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'GPEC, politique de rémunération, relations sociales et développement des talents.'
  },
  {
    slug: 'ifaa-master-gestion-projets',
    titre: 'Master Gestion des Projets (Master 1 / Master 2)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Licence ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Management de projet (PMI / PMP), suivi-évaluation, gestion budgétaire et risques.'
  },
  {
    slug: 'ifaa-master-qhse',
    titre: 'Master Qualité - Hygiène - Sécurité & Environnement (Master QHSE)',
    niveau: 'Master',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Licence ou équivalent',
    domaine: 'Management Spécifique',
    isHealth: false,
    tarifNormal: 782000,
    tarifBoursier: 475000,
    inscriptionNormal: 152000,
    inscription: 75000,
    mensualiteNormal: 63000,
    mensualite: 40000,
    mois: 10,
    isToVerify: false,
    description: 'Normes ISO 9001/14001/45001, audit QHSE, prévention des risques industriels et développement durable.'
  },

  // --- B. LICENCES MANAGEMENT — COURS DU JOUR (9 Licences) ---
  {
    slug: 'ifaa-licence-banque-finance-jour',
    titre: 'Licence Banque Finance (Cours du Jour)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 722000,
    tarifBoursier: 375000,
    inscriptionNormal: 192000,
    inscription: 75000,
    mensualiteNormal: 53000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Produits bancaires et d\'assurance, analyse financière de premier niveau et relation client.'
  },
  {
    slug: 'ifaa-licence-comptabilite-gestion-jour',
    titre: 'Licence Comptabilité et Gestion (Cours du Jour)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 722000,
    tarifBoursier: 375000,
    inscriptionNormal: 192000,
    inscription: 75000,
    mensualiteNormal: 53000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Comptabilité générale SYSCOHADA, paie, fiscalité pratique et gestion de trésorerie.'
  },
  {
    slug: 'ifaa-licence-commerce-international-jour',
    titre: 'Licence Commerce International (Cours du Jour)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 722000,
    tarifBoursier: 375000,
    inscriptionNormal: 192000,
    inscription: 75000,
    mensualiteNormal: 53000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Incoterms 2020, douanes, transit, prospection internationale et techniques d\'import-export.'
  },
  {
    slug: 'ifaa-licence-marketing-communication-digitale-jour',
    titre: 'Licence Marketing Communication Transformation Digitale (Cours du Jour)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 722000,
    tarifBoursier: 375000,
    inscriptionNormal: 192000,
    inscription: 75000,
    mensualiteNormal: 53000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Marketing stratégique et opérationnel, social media management, création de contenu et stratégie digitale.'
  },
  {
    slug: 'ifaa-licence-ingenierie-projets-entreprenariat-jour',
    titre: 'Licence Ingénierie des Projets et Entreprenariat (Cours du Jour)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 722000,
    tarifBoursier: 375000,
    inscriptionNormal: 192000,
    inscription: 75000,
    mensualiteNormal: 53000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Élaboration de business plan, montage de projets, recherche de financement et création d\'entreprise.'
  },
  {
    slug: 'ifaa-licence-transport-logistique-jour',
    titre: 'Licence Transport Logistique (Cours du Jour)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 722000,
    tarifBoursier: 375000,
    inscriptionNormal: 192000,
    inscription: 75000,
    mensualiteNormal: 53000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Gestion d\'entrepôts, affrètement, régimes douaniers sénégalais et transport multimodal.'
  },
  {
    slug: 'ifaa-licence-gestion-ressources-humaines-jour',
    titre: 'Licence Gestion des Ressources Humaines (Cours du Jour)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 722000,
    tarifBoursier: 375000,
    inscriptionNormal: 192000,
    inscription: 75000,
    mensualiteNormal: 53000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Gestion du personnel, contrats de travail, paie informatisée et recrutement.'
  },
  {
    slug: 'ifaa-licence-sciences-gestion-informatique-jour',
    titre: 'Licence Sciences de Gestion & Informatique (Cours du Jour)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour',
    condition: 'BAC ou équivalent',
    domaine: 'Management & IT',
    isHealth: false,
    tarifNormal: 722000,
    tarifBoursier: 375000,
    inscriptionNormal: 192000,
    inscription: 75000,
    mensualiteNormal: 53000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Bases de données SQL, ERP de gestion, développement web applicatif et algorithmique d\'entreprise.'
  },
  {
    slug: 'ifaa-licence-qhse-jour',
    titre: 'Licence Qualité - Hygiène - Sécurité & Environnement (Cours du Jour)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 722000,
    tarifBoursier: 375000,
    inscriptionNormal: 192000,
    inscription: 75000,
    mensualiteNormal: 53000,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Systèmes de management de la qualité, sécurité au travail, contrôle d\'hygiène et gestion environnementale.'
  },

  // --- C. LICENCES MANAGEMENT — COURS DU SOIR (9 Licences) ---
  {
    slug: 'ifaa-licence-banque-finance-soir',
    titre: 'Licence Banque Finance (Cours du Soir)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Produits bancaires et d\'assurance, analyse financière de premier niveau et relation client.'
  },
  {
    slug: 'ifaa-licence-comptabilite-gestion-soir',
    titre: 'Licence Comptabilité et Gestion (Cours du Soir)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Comptabilité générale SYSCOHADA, paie, fiscalité pratique et gestion de trésorerie.'
  },
  {
    slug: 'ifaa-licence-commerce-international-soir',
    titre: 'Licence Commerce International (Cours du Soir)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Incoterms 2020, douanes, transit, prospection internationale et techniques d\'import-export.'
  },
  {
    slug: 'ifaa-licence-marketing-communication-digitale-soir',
    titre: 'Licence Marketing Communication Transformation Digitale (Cours du Soir)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Marketing stratégique et opérationnel, social media management, création de contenu et stratégie digitale.'
  },
  {
    slug: 'ifaa-licence-ingenierie-projets-entreprenariat-soir',
    titre: 'Licence Ingénierie des Projets et Entreprenariat (Cours du Soir)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Élaboration de business plan, montage de projets, recherche de financement et création d\'entreprise.'
  },
  {
    slug: 'ifaa-licence-transport-logistique-soir',
    titre: 'Licence Transport Logistique (Cours du Soir)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Gestion d\'entrepôts, affrètement, régimes douaniers sénégalais et transport multimodal.'
  },
  {
    slug: 'ifaa-licence-gestion-ressources-humaines-soir',
    titre: 'Licence Gestion des Ressources Humaines (Cours du Soir)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Gestion du personnel, contrats de travail, paie informatisée et recrutement.'
  },
  {
    slug: 'ifaa-licence-sciences-gestion-informatique-soir',
    titre: 'Licence Sciences de Gestion & Informatique (Cours du Soir)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'BAC ou équivalent',
    domaine: 'Management & IT',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Bases de données SQL, ERP de gestion, développement web applicatif et algorithmique d\'entreprise.'
  },
  {
    slug: 'ifaa-licence-qhse-soir',
    titre: 'Licence Qualité - Hygiène - Sécurité & Environnement (Cours du Soir)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'BAC ou équivalent',
    domaine: 'Management',
    isHealth: false,
    tarifNormal: 667000,
    tarifBoursier: 420000,
    inscriptionNormal: 137000,
    inscription: 70000,
    mensualiteNormal: 53000,
    mensualite: 35000,
    mois: 10,
    isToVerify: false,
    description: 'Systèmes de management de la qualité, sécurité au travail, contrôle d\'hygiène et gestion environnementale.'
  },

  // --- D. LICENCES SANTÉ (2 Licences - Durée: 3 ans) ---
  {
    slug: 'ifaa-licence-sage-femme-etat',
    titre: 'Licence Sage Femme d\'État (Filière Santé L3)',
    niveau: 'Licence',
    duree: '3 ans',
    billingDuration: '10 mois',
    parcours: 'Santé',
    condition: 'BAC',
    domaine: 'Santé',
    isHealth: true,
    fraisExamenSante: 20000,
    tarifNormal: 722000,
    tarifBoursier: 475000,
    inscriptionNormal: 202000,
    inscription: 75000,
    mensualiteNormal: 52000,
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
    parcours: 'Santé',
    condition: 'BAC',
    domaine: 'Santé',
    isHealth: true,
    fraisExamenSante: 20000,
    tarifNormal: 722000,
    tarifBoursier: 475000,
    inscriptionNormal: 202000,
    inscription: 75000,
    mensualiteNormal: 52000,
    mensualite: 40000,
    mois: 10,
    isToVerify: false,
    description: 'Soins infirmiers généraux, pharmacologie, soins d\'urgence, pathologie médicale et gestion de salle d\'hospitalisation.'
  },

  // --- E. BTS EN APPROCHE PAR COMPÉTENCE (6 BTS - Durée: 2 ans, Tarif normal non documenté) ---
  {
    slug: 'ifaa-bts-qhse',
    titre: 'BTS Qualité - Hygiène - Sécurité & Environnement (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour / Soir',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscriptionNormal: null,
    inscription: 75000,
    mensualiteNormal: null,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Techniques de contrôle qualité, prévention des risques professionnels et hygiène en entreprise.'
  },
  {
    slug: 'ifaa-bts-industrie-agroalimentaire',
    titre: 'BTS Industrie Agroalimentaire (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour / Soir',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscriptionNormal: null,
    inscription: 75000,
    mensualiteNormal: null,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Transformation et conservation des aliments, microbiologie et contrôle qualité de la chaîne alimentaire.'
  },
  {
    slug: 'ifaa-bts-nutrition-dietetique',
    titre: 'BTS Nutrition Diététique (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour / Soir',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscriptionNormal: null,
    inscription: 75000,
    mensualiteNormal: null,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Équilibre nutritionnel, régime alimentaire hospitalier et conseils en hygiène de vie et diététique.'
  },
  {
    slug: 'ifaa-bts-analyse-biologique',
    titre: 'BTS Analyse Biologique (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour / Soir',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscriptionNormal: null,
    inscription: 75000,
    mensualiteNormal: null,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Techniques d\'analyses de laboratoire, hématologie, biochimie médicale et parasitologie.'
  },
  {
    slug: 'ifaa-bts-informatique-de-gestion',
    titre: 'BTS Informatique de Gestion (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour / Soir',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscriptionNormal: null,
    inscription: 75000,
    mensualiteNormal: null,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Bases de données SQL, algorithmique, développement logiciel et tableurs décisionnels.'
  },
  {
    slug: 'ifaa-bts-gestion-de-projet',
    titre: 'BTS Gestion de Projet (BTS)',
    niveau: 'BTS',
    duree: '2 ans',
    billingDuration: '10 mois',
    parcours: 'Cours du Jour / Soir',
    condition: 'BAC ou équivalent',
    domaine: 'BTS',
    isHealth: false,
    tarifNormal: null,
    tarifBoursier: 375000,
    inscriptionNormal: null,
    inscription: 75000,
    mensualiteNormal: null,
    mensualite: 30000,
    mois: 10,
    isToVerify: false,
    description: 'Planification opérationnelle de projets, suivi d\'exécution et gestion des équipes sur le terrain.'
  },

  // --- F. BFEM – NIVEAU TERMINALE – BAC (SANTÉ & PARAMÉDICAL - 3 Formations) ---
  {
    slug: 'ifaa-delegation-medicale',
    titre: 'Délégation Médicale (Formation Santé)',
    niveau: 'Certificat',
    duree: '10 mois',
    billingDuration: '10 mois',
    parcours: 'Cours du Soir',
    condition: 'Bac / Niveau Terminale ou équivalent',
    domaine: 'Santé',
    isHealth: true,
    tarifNormal: 658500,
    tarifBoursier: 370000,
    inscriptionNormal: 108500,
    inscription: 70000,
    mensualiteNormal: 55000,
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
    parcours: 'Cours du Jour / Soir',
    condition: 'BFEM',
    domaine: 'Santé',
    isHealth: true,
    fraisExamenSante: null,
    tarifNormal: 722000,
    tarifBoursier: 475000,
    inscriptionNormal: 202000,
    inscription: 75000,
    mensualiteNormal: 52000,
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
    parcours: 'Cours du Soir',
    condition: 'Bac / Niveau Terminale ou équivalent',
    domaine: 'Santé',
    isHealth: true,
    tarifNormal: 658500,
    tarifBoursier: 370000,
    inscriptionNormal: 108500,
    inscription: 70000,
    mensualiteNormal: 55000,
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

    // 2. Établissement IFAA Business School (fraisDossier fixé à 0 car la source indique la Carte CIAE de 5 000 FCFA à l'inscription)
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
      fraisDossier: 0,
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

    // 5. Importer les programmes et tarifs officiels IFAA 2025/2026
    for (const progData of OFFICIAL_IFAA_PROGRAMMES) {
      let prog = await tx.programme.findFirst({
        where: { slug: progData.slug }
      })

      const normalText = progData.tarifNormal
        ? `Inscription (${progData.inscriptionNormal.toLocaleString('fr-FR')} F) + Scolarité (${progData.mensualiteNormal.toLocaleString('fr-FR')} F x 10) = ${progData.tarifNormal.toLocaleString('fr-FR')} FCFA`
        : 'Non documenté'

      const progPayload = {
        etablissementId: etab.id,
        partnerId: partner.id,
        titre: progData.titre,
        slug: progData.slug,
        ville: 'Dakar',
        duree: progData.duree,
        niveau: progData.niveau,
        fraisDossier: 0,
        fraisDossierEtranger: 0,
        description: progData.description,
        conditionsAdmission: `• Parcours : ${progData.parcours}\n• Condition d'admission : ${progData.condition}\n• Durée de facturation : ${progData.billingDuration}\n• Tarif normal : ${normalText}.\n• Frais annexes : Vaccin (13 000 F), Blouses (30 000 F), Frais de stage (10 000 F).\n• Carte CIAE obligatoire dès l'inscription : 5 000 FCFA.${progData.fraisExamenSante ? '\n• Frais d\'examen filière Santé L3 : 20 000 FCFA.' : ''}`,
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
      const economie = progData.tarifNormal ? progData.tarifNormal - progData.tarifBoursier : null
      const percentageReduction = (progData.tarifNormal && economie) ? Number(((economie / progData.tarifNormal) * 100).toFixed(2)) : 0

      // Verification formule
      if (progData.tarifNormal) {
        const calcNormal = progData.inscriptionNormal + (progData.mensualiteNormal * progData.mois)
        assert.strictEqual(calcNormal, progData.tarifNormal, `Erreur calcul normal sur ${progData.slug}`)
      }
      const calcBoursier = progData.inscription + (progData.mensualite * progData.mois)
      assert.strictEqual(calcBoursier, progData.tarifBoursier, `Erreur calcul boursier sur ${progData.slug}`)

      // --- TARIF NOMINAL ET PRÉFÉRENTIEL (2025/2026) ---
      let existingTarif = await tx.tarif.findFirst({
        where: { programmeId: prog.id, anneeAcademique: '2025/2026' }
      })

      const tarifPayload = {
        programmeId: prog.id,
        anneeAcademique: '2025/2026',
        montant: progData.tarifNormal || progData.tarifBoursier,
        montantBourse: progData.tarifBoursier,
        fraisInscription: progData.inscription,
        mensualite: progData.mensualite,
        nombreMois: progData.mois,
        autresFrais: progData.fraisExamenSante || null,
        devise: 'FCFA',
        frequence: 'ANNUEL',
        label: `Tarif Préférentiel 2025/2026 (${progData.parcours})`,
        source: 'DOCUMENT',
        isVerified: true,
        isDefault: true,
        status: 'ACTIVE'
      }

      if (existingTarif) {
        const { programmeId, ...tarifUpdateData } = tarifPayload
        await tx.tarif.update({
          where: { id: existingTarif.id },
          data: tarifUpdateData
        })
      } else {
        await tx.tarif.create({
          data: tarifPayload
        })
      }
      stats.tarifsUpserted++

      // --- BOURSE ASSOCIÉE (MODÈLE ENSUP) ---
      const bourseTitle = `Bourse ${progData.titre}`
      const bourseSlug = `bourse-${progData.slug}`

      let existingBourse = await tx.bourse.findFirst({
        where: { slug: bourseSlug }
      })

      const boursePayload = {
        programmeId: prog.id,
        partnerId: partner.id,
        titre: bourseTitle,
        slug: bourseSlug,
        coveragePercent: Math.round(percentageReduction),
        montantMax: economie,
        dateLimite: new Date('2026-11-30'),
        conditions: `Condition d'admission : ${progData.condition}. Parcours : ${progData.parcours}. Tarif normal : ${progData.tarifNormal ? progData.tarifNormal.toLocaleString('fr-FR') + ' FCFA' : 'Non documenté'}. Frais d'inscription préférentiels : ${progData.inscription.toLocaleString('fr-FR')} FCFA. Mensualité : ${progData.mensualite.toLocaleString('fr-FR')} FCFA sur 10 mois. Total après bourse : ${progData.tarifBoursier.toLocaleString('fr-FR')} FCFA. Carte CIAE obligatoire : 5 000 FCFA.`,
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
  assert.strictEqual(etab.fraisDossier, 0, 'fraisDossier établissement IFAA doit être 0')
  assert.strictEqual(etab.programmes.length, 38, 'Il doit y avoir exactement 38 offres tarifaires IFAA')

  // Vérification BTS (tarif boursier = 375 000)
  const btsGestion = etab.programmes.find(p => p.slug === 'ifaa-bts-informatique-de-gestion')
  assert.ok(btsGestion, 'BTS Informatique de Gestion doit exister')
  const tBts = btsGestion.tarifs[0]
  assert.strictEqual(tBts.montant, 375000, 'Tarif normal BTS (non documenté / égal à montantBourse) = 375000')
  assert.strictEqual(tBts.montantBourse, 375000, 'Tarif boursier BTS = 375 000 FCFA')
  assert.strictEqual(tBts.fraisInscription, 75000, 'Inscription boursière BTS = 75 000 FCFA')
  assert.strictEqual(tBts.mensualite, 30000, 'Mensualité boursière BTS = 30 000 FCFA')

  console.log(' TOUTES LES ASSERTIONS POST-IMPORT IFAA ONT RÉUSSI AVEC SUCCÈS !')
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
