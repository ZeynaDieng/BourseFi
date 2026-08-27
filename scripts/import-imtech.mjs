import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

// Documents requis officiels d'admission d'après la Fiche de Renseignement IMTECH 2025/2026
const IMTECH_DOCUMENTS_REQUIS = `• 02 Extraits d'acte de naissance de moins de 3 mois
• 04 Photos d'identité récentes
• Photocopie légalisée du diplôme du BAC/BFEM selon le niveau d'étude (ou certificat de scolarité pour BEP/CAP)
• Photocopie certifiée conforme des bulletins de notes de la dernière classe fréquentée
• Photocopie légalisée de la Carte Nationale d'Identité / Passeport (pour les étudiants étrangers)
• Photocopie légalisée du DEUG, BTS, DUT ou équivalent pour l'admission en 3ème année (L3)
• Versement des frais d'inscription conformément à la lettre d'engagement
• Lettre de motivation adressée au Directeur de l'établissement`

// Formations officielles IMTECH 2025/2026 d'après la grille officielle transmise
const OFFICIAL_IMTECH_PROGRAMMES = [
  // --- FORMATIONS À 360 000 FCFA (Inscription 110 000 F + 10 x 25 000 F) ---
  {
    slug: 'imtech-cap-dactylographie',
    titre: 'Dactylographie (CAP)',
    niveau: 'CAP',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau 5e ou 4e collège',
    domaine: 'Gestion',
    tarifNormal: null,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Formation pratique en dactylographie, bureautique, traitement de texte et secrétariat de base.'
  },
  {
    slug: 'imtech-cap-aide-comptable',
    titre: 'Aide-Comptable (CAP)',
    niveau: 'CAP',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau 5e ou 4e collège',
    domaine: 'Gestion',
    tarifNormal: null,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Techniques comptables de base, tenue de journaux, travaux élémentaires de caisse et écriture comptable.'
  },
  {
    slug: 'imtech-bts1-assistant-gestion-pme-pmi',
    titre: 'Assistant de Gestion PME/PMI (BTS 1er Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Gestion',
    tarifNormal: 670000,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Assistanat de direction, suivi administratif et commercial des PME, gestion des fournitures et comptabilité générale.'
  },
  {
    slug: 'imtech-l1-banque-assurance',
    titre: 'Banques et Assurance (Licence 1er Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Gestion',
    tarifNormal: 670000,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Fondamentaux de la banque, produits financiers, produits d\'assurance, relation clientèle et comptabilité bancaire.'
  },
  {
    slug: 'imtech-bts1-l1-commerce-international',
    titre: 'Commerce International / Techniques du Commerce International (BTS 1 / L1)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Gestion',
    tarifNormal: 670000,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Techniques d\'import-export, Incoterms 2020, douane, prospection internationale et négociation commerciale.'
  },
  {
    slug: 'imtech-bts1-l1-comptabilite-controle-audit',
    titre: 'Comptabilité-Contrôle-Audit (BTS 1 / L1)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Gestion',
    tarifNormal: 670000,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Comptabilité générale SYSCOHADA, fiscalité des entreprises, contrôle de gestion et initiation à l\'audit.'
  },
  {
    slug: 'imtech-l1-finance-controle-gestion',
    titre: 'Finance-Contrôle de Gestion (Licence 1er Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Gestion',
    tarifNormal: 670000,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Analyse financière, gestion de trésorerie, budgets prévisionnels et tableaux de bord de gestion.'
  },
  {
    slug: 'imtech-l1-gestion-ressources-humaines',
    titre: 'Gestion des Ressources Humaines (Licence 1er Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Gestion',
    tarifNormal: 670000,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Administration du personnel, paie, recrutement, droit du travail sénégalais et gestion des compétences.'
  },
  {
    slug: 'imtech-bts1-informatique-de-gestion',
    titre: 'Informatique de Gestion (BTS 1er Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Gestion',
    tarifNormal: 670000,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Bases de données SQL, algorithmique, ERP de gestion, tableurs avancés et bureautique décisionnelle.'
  },
  {
    slug: 'imtech-l1-marketing',
    titre: 'Marketing (Licence 1er Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Gestion',
    tarifNormal: 670000,
    tarifBoursier: 360000,
    inscription: 110000,
    mensualite: 25000,
    mois: 10,
    description: 'Études de marché, comportement du consommateur, mix marketing (4P), stratégie commerciale et négociation.'
  },

  // --- FORMATIONS À 410 000 FCFA (Inscription 110 000 F + 10 x 30 000 F) ---
  {
    slug: 'imtech-cap-bep-dessin-batiment',
    titre: 'Dessin Bâtiment (CAP / BEP)',
    niveau: 'BEP',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau 4e ou 3e collège',
    domaine: 'Tech',
    tarifNormal: null,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Dessin technique, DAO/CAO (AutoCAD), métré du bâtiment, plans d\'architecte et lecture de plans d\'exécution.'
  },
  {
    slug: 'imtech-l1-electromecanique',
    titre: 'Électromécanique (Licence 1er Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Tech',
    tarifNormal: 840000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Systèmes électromécaniques, moteurs électriques, schéma de câblage, maintenance industrielle et hydraulique.'
  },
  {
    slug: 'imtech-l1-bts1-electrotechnique',
    titre: 'Électrotechnique (Licence 1 / BTS 1)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Tech',
    tarifNormal: 840000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Réseaux électriques BT/HT, transformateurs, machines électriques, armoires de commande et sécurité électrique.'
  },
  {
    slug: 'imtech-cap-bep-electricite',
    titre: 'Électricité (CAP / BEP)',
    niveau: 'BEP',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau 4e ou 3e collège',
    domaine: 'Tech',
    tarifNormal: null,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Électricité bâtiment et tertiaire, câblage, appareillage, schémas électriques et mise en conformité.'
  },
  {
    slug: 'imtech-bts1-l1-genie-civil',
    titre: 'Génie Civil (BTS 1 / Licence 1)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Tech',
    tarifNormal: 840000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Résistance des matériaux (RDM), béton armé, topographie, métré et conduite de chantier du BTP.'
  },
  {
    slug: 'imtech-bts1-informatique-industrielle-reseaux',
    titre: 'Informatique Industrielle et Réseaux (BTS 1er Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Tech',
    tarifNormal: 840000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Automates programmables (API), réseaux locaux industriels, microcontrôleurs, maintenance système et routage.'
  },
  {
    slug: 'imtech-cap-bep-mecanique-generale',
    titre: 'Mécanique Générale (CAP / BEP)',
    niveau: 'BEP',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau 4e ou 3e collège',
    domaine: 'Tech',
    tarifNormal: null,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Usinage, tournage, fraisage, ajustage mécanique, maintenance d\'équipements mécaniques et sécurité des ateliers.'
  },

  // --- FORMATIONS BTS2 / L2 À 410 000 FCFA (Inscription 110 000 F + 10 x 30 000 F, Rentrée 13/10/2025) ---
  {
    slug: 'imtech-bts2-assistant-gestion-pme-pmi',
    titre: 'Assistant de Gestion PME/PMI (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Gestion approfondie des PME, diagnostic financier, gestion de projet et préparation à l\'examen national du BTS.'
  },
  {
    slug: 'imtech-l2-banque-assurance',
    titre: 'Banques et Assurance (Licence 2ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Gestion du risque crédit, gestion de portefeuille, droit bancaire et assurances IARD / Vie.'
  },
  {
    slug: 'imtech-bts2-commerce-international',
    titre: 'Commerce International / Techniques du Commerce International (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Logistique internationale, cotations douanières GAINDE, financement de l\'export et commerce transfrontalier.'
  },
  {
    slug: 'imtech-bts2-comptabilite-controle-audit',
    titre: 'Comptabilité-Contrôle-Audit (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Comptabilité de société, états financiers de synthèse SYSCOHADA, fiscalité des affaires et audit interne.'
  },
  {
    slug: 'imtech-l2-finance-controle-gestion',
    titre: 'Finance-Contrôle de Gestion (Licence 2ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Choix d\'investissements, gestion de la trésorerie et de l\'endettement, contrôle budgétaire et tableaux de bord.'
  },
  {
    slug: 'imtech-bts2-genie-civil',
    titre: 'Génie Civil (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Tech',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 840000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Calcul des structures en béton armé et charpente métallique, métré spécialisé et organisation du chantier BTP.'
  },
  {
    slug: 'imtech-bts2-industrie-agro-alimentaire',
    titre: 'Industrie Agro-alimentaire (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Tech',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 840000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Procédés de conservation et de transformation des produits alimentaires, hygiène et sécurité sanitaire (HACCP).'
  },
  {
    slug: 'imtech-l2-marketing',
    titre: 'Marketing (Licence 2ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Stratégies de marque, marketing relationnel, gestion de la force de vente et promotion commerciale.'
  },
  {
    slug: 'imtech-l2-marketing-digital-reseaux-sociaux',
    titre: 'Marketing Digital et Réseaux Sociaux (Licence 2ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Community Management, médias sociaux, création de contenu visuel, campagnes publicitaires Meta/Google Ads.'
  },
  {
    slug: 'imtech-bts2-transport-logistique',
    titre: 'Transport Logistique et Transport International (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Supply Chain Management, transit maritime et portuaire (Port Autonome de Dakar), affrètement et gestion des entrepôts.'
  },
  {
    slug: 'imtech-bts2-secretariat-bureautique',
    titre: 'Secrétariat Bureautique (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 410000,
    inscription: 110000,
    mensualite: 30000,
    mois: 10,
    description: 'Rédaction administrative avancée, organisation de séminaires, gestion documentaire et télécommunications d\'entreprise.'
  },

  // --- FORMATIONS BTS2 / L2 À 460 000 FCFA (Inscription 110 000 F + 10 x 35 000 F, Rentrée 13/10/2025) ---
  {
    slug: 'imtech-bts2-electrotechnique',
    titre: 'Électrotechnique (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Tech',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 840000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Automatisme industriel, électronique de puissance, régulation, étude et installation de réseaux HT/BT.'
  },
  {
    slug: 'imtech-bts2-genie-civil-460k',
    titre: 'Génie Civil — Spécialité Travaux Publics (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Tech',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 840000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Techniques de terrassement, voiries et réseaux divers (VRD), ponts, ouvrages d\'art et gestion technique des chantiers.'
  },
  {
    slug: 'imtech-bts2-informatique-de-gestion',
    titre: 'Informatique de Gestion (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Tech',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 840000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Développement d\'applications Web & Desktop, administration de bases de données et maintenance logicielle.'
  },
  {
    slug: 'imtech-bts2-informatique-industrielle-reseaux',
    titre: 'Informatique Industrielle et Réseaux (BTS 2ème Année)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Tech',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 840000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Supervision industrielle (SCADA), réseaux locaux informatiques Cisco, sécurité réseau et bus de terrain.'
  },
  {
    slug: 'imtech-l2-gestion-ressources-humaines-610k',
    titre: 'Gestion des Ressources Humaines (Licence 2ème Année — Spéciale)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Gestion',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 670000,
    tarifBoursier: 610000,
    inscription: 110000,
    mensualite: 50000,
    mois: 10,
    isToVerify: true,
    description: 'Gestion des RH spécialisée. Note: Tarif à vérifier d\'après la grille officielle transmise (Mensualité 50 000 FCFA).'
  },

  // --- FORMATIONS L3 À 460 000 FCFA (Inscription 110 000 F + 10 x 35 000 F, Rentrée 08/12/2025) ---
  {
    slug: 'imtech-l3-finance-controle-gestion',
    titre: 'Finance-Contrôle de Gestion (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Gestion L3',
    fraisSoutenance: 100000,
    tarifNormal: 720000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Ingénierie financière, audit financier, contrôle de gestion stratégique et mémoire professionnel de fin d\'études.'
  },
  {
    slug: 'imtech-l3-gestion-ressources-humaines',
    titre: 'Gestion des Ressources Humaines (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Gestion L3',
    fraisSoutenance: 100000,
    tarifNormal: 720000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'GPEC, management stratégique des RH, relations sociales et soutien à la rédaction du mémoire de Licence.'
  },
  {
    slug: 'imtech-l3-logistique-transport-international',
    titre: 'Logistique et Transport International (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Gestion L3',
    fraisSoutenance: 100000,
    tarifNormal: 720000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Optimisation de la Supply Chain globale, régimes douaniers suspensifs et gestion stratégique des transports.'
  },
  {
    slug: 'imtech-l3-marketing',
    titre: 'Marketing (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Gestion L3',
    fraisSoutenance: 100000,
    tarifNormal: 720000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Stratégie marketing globale, gestion de la relation client (CRM), lancement de produit et plan d\'action commercial.'
  },
  {
    slug: 'imtech-l3-marketing-digital-reseaux-sociaux',
    titre: 'Marketing Digital et Réseaux Sociaux (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Gestion L3',
    fraisSoutenance: 100000,
    tarifNormal: 720000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Growth Hacking, SEO/SEA, e-réputation, stratégie d\'acquisition digitale et pilotage de campagnes digitales.'
  },
  {
    slug: 'imtech-l3-techniques-commerce-international',
    titre: 'Techniques du Commerce International (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Gestion L3',
    fraisSoutenance: 100000,
    tarifNormal: 720000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Management du commerce international, sécurisation des paiements internationaux (Credoc/Remdoc) et négoce.'
  },
  {
    slug: 'imtech-l3-banque-assurance',
    titre: 'Banques et Assurance (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Gestion L3',
    fraisSoutenance: 100000,
    tarifNormal: 720000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Gestion actif-passif (ALM), contrôle de gestion bancaire, réassurance et ingénierie de la gestion de patrimoine.'
  },
  {
    slug: 'imtech-l3-comptabilite-controle-audit',
    titre: 'Comptabilité-Contrôle-Audit (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Gestion L3',
    fraisSoutenance: 100000,
    tarifNormal: 720000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Normes comptables internationales IFRS, audit légal et contractuel, consolidation des comptes et ingénierie fiscale.'
  },
  {
    slug: 'imtech-l3-secretariat-bureautique',
    titre: 'Secrétariat Bureautique (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Gestion L3',
    fraisSoutenance: 100000,
    tarifNormal: 720000,
    tarifBoursier: 460000,
    inscription: 110000,
    mensualite: 35000,
    mois: 10,
    description: 'Management de secrétariat de haute direction, communication d\'entreprise, gestion des événements d\'affaires et mémoire.'
  },

  // --- FORMATIONS À 510 000 FCFA (Inscription 110 000 F + 10 x 40 000 F) ---
  {
    slug: 'imtech-l1-cybersecurite',
    titre: 'Cybersécurité (Licence 1er Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC',
    domaine: 'Tech L1',
    tarifNormal: 840000,
    tarifBoursier: 510000,
    inscription: 110000,
    mensualite: 40000,
    mois: 10,
    description: 'Introduction à la sécurité des systèmes d\'information, réseaux TCP/IP, Linux, cryptographie et hygiène informatique.'
  },
  {
    slug: 'imtech-bts1-cap-industrie-agro-alimentaire',
    titre: 'Industrie Agro-alimentaire / Transformation des produits agroalimentaires (BTS 1 / CAP)',
    niveau: 'BTS',
    duree: '1 an',
    rentree: '10/11/2025',
    condition: 'Niveau BAC ou BEP',
    domaine: 'Tech',
    tarifNormal: 840000,
    tarifBoursier: 510000,
    inscription: 110000,
    mensualite: 40000,
    mois: 10,
    description: 'Chimie et microbiologie alimentaires, génie des procédés agroalimentaires, emballage et contrôle qualité.'
  },
  {
    slug: 'imtech-l3-electromecanique',
    titre: 'Électromécanique (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Tech L3',
    fraisSoutenance: 100000,
    tarifNormal: 940000,
    tarifBoursier: 510000,
    inscription: 110000,
    mensualite: 40000,
    mois: 10,
    description: 'Conception électromécanique assistée par ordinateur, automatisme avancé et projet de fin d\'études en ingénierie.'
  },
  {
    slug: 'imtech-l3-electronique-electrotechnique-automatique',
    titre: 'Électronique, Électrotechnique et Automatique (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Tech L3',
    fraisSoutenance: 100000,
    tarifNormal: 940000,
    tarifBoursier: 510000,
    inscription: 110000,
    mensualite: 40000,
    mois: 10,
    description: 'Traitement du signal, électronique embarquée, automates industriels et mécatronique.'
  },
  {
    slug: 'imtech-l3-genie-civil',
    titre: 'Génie Civil (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Tech L3',
    fraisSoutenance: 100000,
    tarifNormal: 940000,
    tarifBoursier: 510000,
    inscription: 110000,
    mensualite: 40000,
    mois: 10,
    description: 'Calcul d\'ouvrages d\'art, géotechnique routière, gestion financière de chantiers BTP et soutenance de mémoire.'
  },

  // --- FORMATIONS À 560 000 FCFA (Inscription 110 000 F + 10 x 45 000 F) ---
  {
    slug: 'imtech-l2-cybersecurite',
    titre: 'Cybersécurité (Licence 2ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '13/10/2025',
    condition: 'Niveau BAC+1 validé',
    domaine: 'Tech L2',
    fraisUniforme: 50000,
    autresFrais: 15000,
    tarifNormal: 840000,
    tarifBoursier: 560000,
    inscription: 110000,
    mensualite: 45000,
    mois: 10,
    description: 'Sécurité réseau avancée, pare-feu, détection d\'intrusions (IDS/IPS), administration système sécurisée et tests d\'intrusion.'
  },

  // --- FORMATIONS À 610 000 FCFA (Inscription 110 000 F + 10 x 50 000 F) ---
  {
    slug: 'imtech-l3-cybersecurite',
    titre: 'Cybersécurité (Licence 3ème Année)',
    niveau: 'Licence',
    duree: '1 an',
    rentree: '08/12/2025',
    condition: 'BTS ou Bac+2 validé',
    domaine: 'Tech L3',
    fraisSoutenance: 100000,
    tarifNormal: 940000,
    tarifBoursier: 610000,
    inscription: 110000,
    mensualite: 50000,
    mois: 10,
    description: 'Audits de sécurité, analyse médico-légale (Forensics), normes ISO 27001, réponse aux incidents et projet de mémoire L3.'
  }
]

async function runImport() {
  console.log('🚀 Début de l\'importation officielle IMTECH (Transaction Prisma)...')

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

    // 2. Établissement IMTECH
    let etab = await tx.etablissement.findFirst({
      where: {
        OR: [
          { id: 'cmrghuce00001gny4nx5v3dvb' },
          { slug: 'imtech-dakar' },
          { nom: { contains: 'IMTECH', mode: 'insensitive' } }
        ]
      }
    })

    const etabPayload = {
      nom: 'Institut de Management et de Technologie (IMTECH) – Nelson Mandela',
      slug: 'imtech-dakar',
      ville: 'Dakar',
      adresse: 'Rond-Point Castors × Avenue Bourguiba, Dakar, Sénégal',
      phone: '+221 33 825 58 21',
      phoneSecondary: '+221 77 652 83 76',
      whatsapp: null,
      email: null,
      site: 'https://imtech-nelsonmandela.com/',
      accreditation: 'Agrément n° RepSEN/Ensup-priv/AP/322-2017 · Arrêté N°00162 MFPAAS/SG/DFPT · NINEA 005071775 · RCCM SN DKR 2014 B 8723',
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
          id: 'cmrghuce00001gny4nx5v3dvb',
          ...etabPayload
        }
      })
      stats.etabUpdated = true
    }

    console.log(`✅ Établissement IMTECH prêt : ${etab.nom} (${etab.id})`)

    // 3. contacts téléphoniques
    const phones = [
      { val: '+221 33 825 58 21', isPrincipal: true },
      { val: '+221 77 652 83 76', isPrincipal: false },
      { val: '+221 77 483 61 61', isPrincipal: false }
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
            label: 'Téléphone Officiel IMTECH',
            isPrincipal: pInfo.isPrincipal,
            status: 'VERIFIED',
            source: 'ESTABLISHMENT',
            isActive: true
          }
        })
        stats.contactsCreated++
      }
    }

    // 4. Nettoyer ou désactiver les anciens programmes obsolètes d'IMTECH non présents dans la nouvelle liste officielle
    const officialSlugs = OFFICIAL_IMTECH_PROGRAMMES.map((p) => p.slug)
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

    // 5. Importer les 49 programmes et tarifs officiels IMTECH 2025/2026
    for (const progData of OFFICIAL_IMTECH_PROGRAMMES) {
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
        conditionsAdmission: `• Condition officielle : ${progData.condition}\n• Rentrée prévue le : ${progData.rentree}\n• Niveau d'étude validé requis.`,
        documentsRequis: IMTECH_DOCUMENTS_REQUIS,
        eligibilite: `Ouvert aux étudiants remplissant la condition (${progData.condition}). Rentrée officielle le ${progData.rentree}.`,
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
        fraisUniforme: progData.fraisUniforme || null,
        autresFrais: progData.autresFrais || null,
        fraisSoutenance: progData.fraisSoutenance || null,
        devise: 'FCFA',
        frequence: 'ANNUEL',
        label: progData.isToVerify ? 'Tarif Préférentiel 2025/2026 (À vérifier)' : 'Tarif Préférentiel 2025/2026',
        source: 'DOCUMENT',
        isVerified: true,
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
        coveragePercent: percentageReduction ? Math.round(percentageReduction) : 0,
        montantMax: economie || 0,
        dateLimite: new Date('2026-11-30'),
        conditions: `Condition d'admission : ${progData.condition}. Inscription : ${progData.inscription.toLocaleString('fr-FR')} FCFA. Mensualité : ${progData.mensualite.toLocaleString('fr-FR')} FCFA sur 10 mois. Rentrée officielle : ${progData.rentree}.`,
        documentsRequis: IMTECH_DOCUMENTS_REQUIS,
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

  console.log('✅ Importation IMTECH terminée avec succès dans la transaction Prisma.')
  return stats
}

async function verifyImport() {
  console.log('\n🧪 DÉBUT DES VÉRIFICATIONS AUTOMATISÉES POST-IMPORT IMTECH...')

  const etab = await prisma.etablissement.findFirst({
    where: {
      OR: [
        { slug: 'imtech-dakar' },
        { nom: { contains: 'IMTECH', mode: 'insensitive' } }
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

  assert.ok(etab, 'L\'établissement IMTECH doit exister')
  assert.strictEqual(etab.nom, 'Institut de Management et de Technologie (IMTECH) – Nelson Mandela')
  assert.strictEqual(etab.slug, 'imtech-dakar')
  assert.strictEqual(etab.phone, '+221 33 825 58 21')
  assert.strictEqual(etab.phoneSecondary, '+221 77 652 83 76')
  assert.strictEqual(etab.isDirectPartner, true)
  assert.strictEqual(etab.programmes.length, 49, 'Il doit y avoir exactement 49 programmes officiels IMTECH actifs')

  // Vérification des calculs pour quelques formations représentatives
  const testCalculations = [
    { slug: 'imtech-cap-dactylographie', expectedNormal: 360000, expectedBoursier: 360000, expectedEco: 0, expectedPct: 0 },
    { slug: 'imtech-cap-bep-dessin-batiment', expectedNormal: 410000, expectedBoursier: 410000, expectedEco: 0, expectedPct: 0 },
    { slug: 'imtech-bts2-electrotechnique', expectedNormal: 840000, expectedBoursier: 460000, expectedEco: 380000, expectedPct: 45.24 },
    { slug: 'imtech-l1-cybersecurite', expectedNormal: 840000, expectedBoursier: 510000, expectedEco: 330000, expectedPct: 39.29 },
    { slug: 'imtech-l2-cybersecurite', expectedNormal: 840000, expectedBoursier: 560000, expectedEco: 280000, expectedPct: 33.33 },
    { slug: 'imtech-l3-cybersecurite', expectedNormal: 940000, expectedBoursier: 610000, expectedEco: 330000, expectedPct: 35.11 },
    { slug: 'imtech-l3-finance-controle-gestion', expectedNormal: 720000, expectedBoursier: 460000, expectedEco: 260000, expectedPct: 36.11 }
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
    assert.strictEqual(bourse.coveragePercent, Math.round(tc.expectedPct), `Pourcentage pour ${tc.slug}`)
  }

  console.log(' TOUTES LES ASSERTIONS POST-IMPORT IMTECH ONT RÉUSSI AVEC SUCCÈS !')
}

async function main() {
  try {
    const run1 = await runImport()
    console.log('\n📊 RAPPORT D\'EXÉCUTION 1ER PASSAGE IMTECH :', run1)

    await verifyImport()

    console.log('\n🔁 DEUXIÈME PASSAGE IDEMPOTENCE IMTECH...')
    const run2 = await runImport()
    console.log('📊 RAPPORT D\'EXÉCUTION 2ÈME PASSAGE IMTECH :', run2)

    await verifyImport()
    console.log('\n🏆 TEST D\'IDEMPOTENCE VALIDE : 100% IDEMPOTENT !')
  } catch (err) {
    console.error('\n❌ ERREUR D\'IMPORT IMTECH (ROLLBACK DÉCLENCHÉ) :', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
