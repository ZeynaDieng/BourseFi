import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ENSUP_OFFICIAL_URL = 'https://www.ensupafrique.com/formations/formations.php'

const OFFICALL_CATALOGUE = [
  // ==========================================
  // BTS (4 PROGRAMMES)
  // ==========================================
  {
    code: 'bts-transports-logistique',
    niveau: 'BTS',
    domain: 'Transport-Logistique',
    titre: 'Transports Logistique (BTS)',
    duree: '2 ans',
    fraisInscription: 135000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 0,
    fraisUniforme: 40000,
    montantBourse: 435000,
    montantNormal: 870000,
    debouches: [
      'Assistant déclarant en douane',
      'Gestionnaire de stocks et magasins',
      'Agent d exploitation transport',
      'Assistant logistique et supply chain',
    ],
    competences: [
      'Gestion des flux de marchandises et entreposage',
      'Organisation des opérations de transport multimodal',
      'Procédures douanières et transit international',
      'Utilisation des logiciels ERP et de gestion de stock',
    ],
    objectifs:
      'Forme des techniciens supérieurs capables de planifier, organiser et piloter l ensemble des opérations logistiques et de transport de marchandises.',
  },
  {
    code: 'bts-comptabilite-gestion',
    niveau: 'BTS',
    domain: 'Comptabilité-Gestion',
    titre: 'Comptabilité de Gestion (BTS)',
    duree: '2 ans',
    fraisInscription: 135000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 0,
    fraisUniforme: 40000,
    montantBourse: 435000,
    montantNormal: 870000,
    debouches: [
      'Assistant comptable',
      'Comptable junior en cabinet ou entreprise',
      'Gestionnaire de la paie et des déclarations sociales',
      'Assistant de gestion PME/PMI',
    ],
    competences: [
      'Tenue et saisie des opérations comptables au quotidien',
      'Établissement des états financiers et paie',
      'Déclarations fiscales et sociales (IPRES, CSS, TVA)',
      'Maîtrise des logiciels comptables (SAARI / Sage)',
    ],
    objectifs:
      'Acquérir les compétences techniques essentielles en comptabilité générale, analytique et fiscale pour assurer la tenue rigoureuse des comptes.',
  },
  {
    code: 'bts-commerce-international',
    niveau: 'BTS',
    domain: 'Commerce International',
    titre: 'Commerce International (BTS)',
    duree: '2 ans',
    fraisInscription: 135000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 0,
    fraisUniforme: 40000,
    montantBourse: 435000,
    montantNormal: 870000,
    debouches: [
      'Assistant commercial grand import/export',
      'Gestionnaire des opérations douanières',
      'Assistant ADV international (Administration Des Ventes)',
      'Agent de prospection internationale',
    ],
    competences: [
      'Prospection et négociation commerciale à l international',
      'Gestion des incoterms et contrats d achat/vente international',
      'Suivi administratif et financier des dossiers import-export',
    ],
    objectifs:
      'Former des professionnels des échanges commerciaux internationaux maîtrisant les techniques d achat, de vente et d acheminement des marchandises.',
  },
  {
    code: 'bts-marketing-communication',
    niveau: 'BTS',
    domain: 'Marketing Communication',
    titre: 'Marketing Communication (BTS)',
    duree: '2 ans',
    fraisInscription: 135000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 0,
    fraisUniforme: 40000,
    montantBourse: 435000,
    montantNormal: 870000,
    debouches: [
      'Assistant chef de produit / brand assistant',
      'Chargé de communication junior',
      'Attaché commercial et relation client',
      'Community manager junior',
    ],
    competences: [
      'Conception de supports promotionnels et publicitaires',
      'Étude de marché et analyse du comportement consommateur',
      'Planification d actions marketing et événementielles',
    ],
    objectifs:
      'Maîtriser les fondamentaux du marketing opérationnel, de la communication des entreprises et des ventes.',
  },

  // ==========================================
  // LICENCE (15 PROGRAMMES)
  // ==========================================
  {
    code: 'licence-audit-control-de-gestion',
    niveau: 'Licence',
    domain: 'Audit Control de Gestion',
    titre: 'Audit Control de Gestion (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Auditeur junior en cabinet d expertise comptable',
      'Contrôleur de gestion junior',
      'Analyste financier d entreprise',
      'Assistant de direction financière',
    ],
    competences: [
      'Élaboration et suivi des budgets prévisionnels',
      'Mise en place de tableaux de bord et indicateurs de performance',
      'Vérification de la conformité des comptes et audit interne',
    ],
    objectifs:
      'Former des cadres financiers capables de piloter la performance financière d une organisation et de veiller à la maîtrise des risques.',
  },
  {
    code: 'licence-administration-des-entreprises',
    niveau: 'Licence',
    domain: 'Administration des Entreprises',
    titre: 'Administration des Entreprises (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Responsable administratif et financier junior',
      'Assistant de gestion globale PME/PMI',
      'Gestionnaire d unité opérationnelle',
      'Consultant junior en organisation',
    ],
    competences: [
      'Pilotage polyvalent des activités administratives, financières et humaines',
      'Gestion de projet d entreprise et analyse de processus',
      'Élaboration de stratégies de développement commercial',
    ],
    objectifs:
      'Offrir une vision transversale de la gestion des organisations et préparer à la direction polyvalente des entreprises.',
  },
  {
    code: 'licence-banque-finance-assurance',
    niveau: 'Licence',
    domain: 'Banque Finance Assurance',
    titre: 'Banque Finance Assurance (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Conseiller clientèle banque particuliers / professionnels',
      'Analyste de crédit bancaire',
      'Gestionnaire de contrats d assurance',
      'Assistant de gestion de patrimoine',
    ],
    competences: [
      'Analyse financière de la solvabilité des emprunteurs',
      'Gestion du portefeuille de produits bancaires et d assurance',
      'Réglementation bancaire et gestion des risques de marché',
    ],
    objectifs:
      'Former des professionnels opérationnels pour les établissements bancaires, compagnies d assurances et institutions financières.',
  },
  {
    code: 'licence-comptabilite-de-gestion',
    niveau: 'Licence',
    domain: 'Comptabilité de Gestion',
    titre: 'Comptabilité de Gestion (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Comptable d entreprise confirmé',
      'Responsable comptabilité analytique',
      'Collaborateur en cabinet d expertise comptable',
      'Gestionnaire trésorerie et fiscalité',
    ],
    competences: [
      'Établissement complet des bilans et comptes de résultat SYSCOHADA',
      'Calcul des coûts de revient et marges par activité',
      'Gestion fiscale des sociétés et suivi des contrôles',
    ],
    objectifs:
      'Garantir la fiabilité des données comptables et fiscales conformément aux normes comptables en vigueur dans la zone UEMOA.',
  },
  {
    code: 'licence-communication-journalisme',
    niveau: 'Licence',
    domain: 'Communication Journalisme',
    titre: 'Communication Journalisme (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Journaliste réacteur presse écrite / web / radio',
      'Chargé des relations presse et publiques',
      'Responsable de communication institutionnelle',
      'Créateur de contenus multimédias',
    ],
    competences: [
      'Techniques d enquête, d interview et de rédaction journalistique',
      'Élaboration de plans de communication média et hors-média',
      'Maîtrise des outils d édition web et réseaux sociaux',
    ],
    objectifs:
      'Former des professionnels polyvalents de la presse, des médias numériques et de la communication d entreprise.',
  },
  {
    code: 'licence-commerce-international',
    niveau: 'Licence',
    domain: 'Commerce International',
    titre: 'Commerce International (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Responsable de zone export / import',
      'Acheteur international',
      'Consultant en commerce international',
      'Négociateur international',
    ],
    competences: [
      'Développement de marchés internationaux et prospection ciblée',
      'Techniques de douanes, logistique globale et moyens de paiement internationaux',
      'Négociation interculturelle et contrats internationaux',
    ],
    objectifs:
      'Développer des compétences stratégiques et opérationnelles pour développer l activité internationale des entreprises.',
  },
  {
    code: 'licence-droit-des-affaires-et-fiscalite',
    niveau: 'Licence',
    domain: 'Droit des Affaires et Fiscalité',
    titre: 'Droit des Affaires et Fiscalité (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Juriste d entreprise junior',
      'Conseiller fiscal adjoint',
      'Assistant en cabinet d avocats ou de notaire',
      'Gestionnaire des contentieux et contrats',
    ],
    competences: [
      'Rédaction et négociation de contrats commerciaux (OHADA)',
      'Gestion du droit du travail et droit des sociétés',
      'Optimisation et sécurité fiscale des opérations juridiques',
    ],
    objectifs:
      'Acquérir une solide expertise juridique et fiscale adaptée aux spécificités du droit des affaires OHADA et de la fiscalité.',
  },
  {
    code: 'licence-gestion-des-ressources-humaines',
    niveau: 'Licence',
    domain: 'Gestion des Ressources Humaines',
    titre: 'Gestion des Ressources Humaines (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Chargé de recrutement et de la formation',
      'Assistant RH / Gestionnaire du personnel',
      'Responsable de la paie et du climat social',
      'Consultant junior en mobilité et compétences',
    ],
    competences: [
      'Gestion administrative du personnel et suivi du droit du travail',
      'Conduite du processus de recrutement et intégration des collaborateurs',
      'Élaboration des plans de formation et gestion prévisionnelle des emplois',
    ],
    objectifs:
      'Former des professionnels capables d administrer et de valoriser le capital humain des entreprises.',
  },
  {
    code: 'licence-hotellerie-tourisme',
    niveau: 'Licence',
    domain: 'Hôtellerie Tourisme',
    titre: 'Hôtellerie Tourisme (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Manager d hébergement / sous-directeur d hôtel',
      'Chef de projet événementiel et voyages',
      'Responsable d agence de voyage ou de circuit touristique',
      'Yield manager junior / Responsable réservation',
    ],
    competences: [
      'Gestion opérationnelle et commerciale d un établissement hôtelier',
      'Conception de produits touristiques et valorisation du patrimoine',
      'Maîtrise du service client haut de gamme et des réservations GDS',
    ],
    objectifs:
      'Préparer aux métiers de la direction, du développement touristique et du management hôtelier international.',
  },
  {
    code: 'licence-informatique-de-gestion',
    niveau: 'Licence',
    domain: 'Informatique de Gestion',
    titre: 'Informatique de Gestion (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Développeur d applications web et mobiles',
      'Administrateur de bases de données',
      'Analyste programmeur SI',
      'Assistant chef de projet informatique',
    ],
    competences: [
      'Conception et développement web (JavaScript, Python, PHP, SQL)',
      'Administration et modélisation de bases de données (MySQL, PostgreSQL)',
      'Analyse des besoins des utilisateurs et rédaction de cahiers des charges',
    ],
    objectifs:
      'Former des informaticiens de gestion capables de concevoir, développer et maintenir les systèmes d information d entreprise.',
  },
  {
    code: 'licence-marketing-communication',
    niveau: 'Licence',
    domain: 'Marketing Communication',
    titre: 'Marketing Communication (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Chef de projet marketing digital',
      'Responsable de campagne publicitaire',
      'Chargé d étude de marché',
      'Consultant en stratégie de marque',
    ],
    competences: [
      'Élaboration et mise en œuvre de la stratégie marketing',
      'Gestion de projets digitaux et réseaux sociaux',
      'Mesure du retour sur investissement (ROI) des actions marketing',
    ],
    objectifs:
      'Concevoir et piloter des stratégies marketing stratégiques et digitales pour accélérer la croissance des marques.',
  },
  {
    code: 'licence-management',
    niveau: 'Licence',
    domain: 'Management',
    titre: 'Management (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Manager d équipe opérationnelle',
      'Responsable d centre de profit',
      'Assistant de direction générale',
      'Entrepreneur / Créateur d entreprise',
    ],
    competences: [
      'Animation et leadership d équipes pluridirectionnelles',
      'Conduite du changement et optimisation des processus',
      'Supervision du budget et de la rentabilité commerciale',
    ],
    objectifs:
      'Acquérir les méthodes et compétences fondamentales pour encadrer des équipes et diriger des centres de profit.',
  },
  {
    code: 'licence-management-de-la-qualite',
    niveau: 'Licence',
    domain: 'Management de la Qualité',
    titre: 'Management de la Qualité (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Animateur / Responsable Qualité Sécurité Environnement (QSE)',
      'Auditeur qualité certifié',
      'Gestionnaire du système de management de la qualité (ISO 9001)',
      'Consultant en amélioration continue',
    ],
    competences: [
      'Déploiement de normes de management de la qualité (ISO)',
      'Audit interne de processus et gestion du plan d amélioration',
      'Cartographie des risques et prévention des dysfonctionnements',
    ],
    objectifs:
      'Garantir la conformité des produits/services aux exigences réglementaires et mener la démarche d amélioration continue.',
  },
  {
    code: 'licence-management-de-projets',
    niveau: 'Licence',
    domain: 'Management de Projets',
    titre: 'Management de Projets (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Chef de projet junior en entreprise ou ONG',
      'Coordinator de projets de développement',
      'Assistant PMO (Project Management Office)',
      'Gestionnaire de planification et ressources',
    ],
    competences: [
      'Cadrage, planification et suivi de projets (Gantt, méthodes agiles)',
      'Gestion des coûts, des délais et des ressources projet',
      'Évaluation de l impact et reporting auprès des bailleurs de fonds',
    ],
    objectifs:
      'Maitriser le cycle complet de gestion d un projet depuis sa conception jusqu à sa livraison et son évaluation.',
  },
  {
    code: 'licence-transports-logistique',
    niveau: 'Licence',
    domain: 'Transports Logistique',
    titre: 'Transports Logistique (Licence)',
    duree: '3 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 50000,
    fraisUniforme: 40000,
    montantBourse: 480000,
    montantNormal: 960000,
    debouches: [
      'Responsable logistique / Supply Chain Manager',
      'Responsable de flotte de transport',
      'Gestionnaire des plateformes logistiques et entrepôts',
      'Consultant en optimisation des flux logistiques',
    ],
    competences: [
      'Pilotage des chaînes logistiques globales (Supply Chain)',
      'Négociation des prestations de transport terrestre, maritime et aérien',
      'Optimisation du stockage, de la distribution et réduction des coûts',
    ],
    objectifs:
      'Organiser, optimiser et superviser la chaîne logistique internationale et les flux de transports complexes.',
  },

  // ==========================================
  // MASTER (14 PROGRAMMES)
  // ==========================================
  {
    code: 'master-audit-control-de-gestion',
    niveau: 'Master',
    domain: 'Audit Control de Gestion',
    titre: 'Audit Control de Gestion (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Auditeur senior / Chef de mission audit',
      'Directeur du contrôle de gestion',
      'Consultant senior en gestion des risques et gouvernance',
      'Directeur Financier (DAF)',
    ],
    competences: [
      'Audit financier stratégique et consolidation des comptes',
      'Pilotage des systèmes de contrôle interne complexes',
      'Conseil en gouvernance d entreprise et valorisation de sociétés',
    ],
    objectifs:
      'Expertiser la santé financière des organisations, maîtriser les risques opérationnels et piloter les arbitrages stratégiques.',
  },
  {
    code: 'master-administration-des-entreprises',
    niveau: 'Master',
    domain: 'Administration des Entreprises',
    titre: 'Administration des Entreprises (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur Général d filiale / PME',
      'Consultant en stratégie et management',
      'Manager de Business Unit',
      'Directeur du développement des affaires',
    ],
    competences: [
      'Élaboration et exécution de plans stratégiques quinquennaux',
      'Management exécutif d équipes plurisectorielles',
      'Gestion globale de la performance et de l innovation',
    ],
    objectifs:
      'Former des dirigeants d entreprise visionnaires capables de mener la croissance et la transformation des organisations.',
  },
  {
    code: 'master-banque-finance-assurance',
    niveau: 'Master',
    domain: 'Banque Finance Assurance',
    titre: 'Banque Finance Assurance (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur d agence bancaire',
      'Analyste financier de marché / Gestions d actifs',
      'Ingénieur financier et risques d assurance',
      'Responsable des engagements et du crédit corporate',
    ],
    competences: [
      'Modélisation financière et évaluation des risques bancaires',
      'Gestion de portefeuilles d investissement et de capitaux',
      'Ingénierie financière et produits d assurance complexes',
    ],
    objectifs:
      'Former des experts de haut niveau en ingénierie financière, gestion d actifs et direction d institutions bancaires et d assurance.',
  },
  {
    code: 'master-comptabilite-de-gestion',
    niveau: 'Master',
    domain: 'Comptabilité de Gestion',
    titre: 'Comptabilité de Gestion (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Expert-comptable mémorialiste',
      'Directeur de la comptabilité et de la fiscalité',
      'Chef de mission comptable en cabinet',
      'Consultant en normes IFRS / SYSCOHADA révisé',
    ],
    competences: [
      'Expertise comptable poussée et consolidation de groupes d entreprises',
      'Stratégie fiscale internationale et gestion des affaires juridiques',
      'Supervision du système d information comptable et reporting financier',
    ],
    objectifs:
      'Expertiser la gouvernance comptable et fiscale d entreprise et préparer aux hautes fonctions de la comptabilité et de l expertise.',
  },
  {
    code: 'master-commerce-international',
    niveau: 'Master',
    domain: 'Commerce International',
    titre: 'Commerce International (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur du développement international',
      'Responsable grands comptes à l export',
      'Consultant en stratégie d internationalisation',
      'Courtier international en matières premières',
    ],
    competences: [
      'Conception de plans de pénétration de marchés mondiaux',
      'Négociation complexe et financement des opérations de commerce extérieur',
      'Management multiculturel et gestion de filiales à l étranger',
    ],
    objectifs:
      'Former des stratèges du commerce international capables d orchestrer l expansion internationale des entreprises.',
  },
  {
    code: 'master-communication-journalisme',
    niveau: 'Master',
    domain: 'Communication Journalisme',
    titre: 'Communication Journalisme (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Rédacteur en chef / Directeur de la rédaction',
      'Directeur de la communication (DIRCOM)',
      'Conseiller en stratégie d influence et gestion de crise',
      'Directeur d agence de presse ou de média numérique',
    ],
    competences: [
      'Pilotage de stratégies globales de communication institutionnelle et de crise',
      'Direction éditoriale de médias traditionnels et plateformes numériques',
      'Management d équipes de journalistes et communicants',
    ],
    objectifs:
      'Former les futurs leaders des médias et directeurs de communication d influence.',
  },
  {
    code: 'master-droit-des-affaires-et-fiscalite',
    niveau: 'Master',
    domain: 'Droit des Affaires et Fiscalité',
    titre: 'Droit des Affaires et Fiscalité (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur juridique d entreprise',
      'Avocat d affaires (sous réserve des concours)',
      'Expert-conseil en ingénierie fiscale et restructurations',
      'Juriste spécialisé en fusions-acquisitions (M&A)',
    ],
    competences: [
      'Ingénierie juridique des fusions, acquisitions et restructurations (OHADA)',
      'Audit juridique et contentieux des affaires à haut risque',
      'Stratégie de défense et d optimisation fiscale des grandes entreprises',
    ],
    objectifs:
      'Former des juristes et fiscalistes d affaires de haut niveau capables de sécuriser les opérations financières et stratégiques.',
  },
  {
    code: 'master-gestion-des-ressources-humaines',
    niveau: 'Master',
    domain: 'Gestion des Ressources Humaines',
    titre: 'Gestion des Ressources Humaines (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur des Ressources Humaines (DRH)',
      'Responsable des relations sociales et du dialogue social',
      'Consultant senior en conduite du changement et organisation',
      'Responsable de la marque employeur et des talents',
    ],
    competences: [
      'Définition et pilotage de la politique RH globale de l entreprise',
      'Négociation collective et maîtrise du climat social',
      'Transformation digitale des RH et gestion stratégique des talents',
    ],
    objectifs:
      'Préparer aux fonctions stratégiques de direction des ressources humaines et de pilotage du capital humain.',
  },
  {
    code: 'master-marketing-communication',
    niveau: 'Master',
    domain: 'Marketing Communication',
    titre: 'Marketing Communication (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur Marketing et Digital (CMO)',
      'Directeur d agence de communication',
      'Directeur de la stratégie de marque',
      'Growth Strategist / Responsable de la croissance',
    ],
    competences: [
      'Supervision de stratégies marketing globales et omnicanales',
      'Lancement stratégique de nouveaux produits et repositionnement',
      'Management d équipes créatives, technologiques et commerciales',
    ],
    objectifs:
      'Former des directeurs marketing innovants capables de piloter la création de valeur et la croissance de la marque.',
  },
  {
    code: 'master-management',
    niveau: 'Master',
    domain: 'Management',
    titre: 'Management (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur d filiale ou d un centre de profit majeur',
      'Consultant senior en management stratégique',
      'Directeur des opérations (COO)',
      'Entrepreneur et fondateur d entreprise',
    ],
    competences: [
      'Prise de décision stratégique en environnement incertain',
      'Pilotage des transformations organisationnelles et digitales',
      'Optimisation de la rentabilité financière et opérationnelle',
    ],
    objectifs:
      'Formater les leaders capables de piloter la gouvernance, les opérations et la croissance durable des organisations.',
  },
  {
    code: 'master-management-de-la-qualite',
    niveau: 'Master',
    domain: 'Management de la Qualité',
    titre: 'Management de la Qualité (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur Qualité, Sécurité, Environnement (QSE / QHSE)',
      'Consultant senior en certification et performance industrielle',
      'Auditeur principal des systèmes de management',
      'Directeur de l amélioration continue et du Lean Management',
    ],
    competences: [
      'Conception et pilotage de systèmes intégrés QHSE (ISO 9001, 14001, 45001)',
      'Management des risques industriels, sanitaires et environnementaux',
      'Leadership de la conduite du changement orientée excellence opérationnelle',
    ],
    objectifs:
      'Former des directeurs qualité et QHSE moteurs de la conformité, du développement durable et de la performance globale.',
  },
  {
    code: 'master-management-de-projets',
    niveau: 'Master',
    domain: 'Management de Projets',
    titre: 'Management de Projets (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur de programme / Directeur de portefeuille de projets (PMO)',
      'Chef de projet senior pour des programmes multinationaux ou ONG',
      'Consultant senior en gouvernance de projets',
      'Directeur du développement de projets complexes',
    ],
    competences: [
      'Gouvernance stratégique de portefeuilles de projets complexes',
      'Négociation contractuelle et gestion financière des bailleurs internationaux',
      'Gestion des risques stratégiques et conduite du changement à grande échelle',
    ],
    objectifs:
      'Délivrer une expertise haut niveau pour la gouvernance, la direction et le succès des grands programmes et projets stratégiques.',
  },
  {
    code: 'master-passation-de-marches',
    niveau: 'Master',
    domain: 'Passation de Marchés',
    titre: 'Passation de Marchés (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Spécialiste senior en passation de marchés publics et privés',
      'Directeur de la commande publique',
      'Consultant auprès des organismes internationaux (Banque Mondiale, BAD...)',
      'Responsable de la conformité et des audits de marchés',
    ],
    competences: [
      'Conception des dossiers d appel d offres (DAO) selon la réglementation en vigueur',
      'Conduite des procédures d attribution et négociation des contrats publics',
      'Audit, contrôle et prévention des risques d irrégularité des marchés',
    ],
    objectifs:
      'Former des experts de référence dans la gestion, le contrôle et l audit de la commande publique et des grands marchés.',
  },
  {
    code: 'master-transports-logistique',
    niveau: 'Master',
    domain: 'Transports Logistique',
    titre: 'Transports Logistique (Master)',
    duree: '2 ans',
    fraisInscription: 130000,
    mensualite: 30000,
    nombreMois: 10,
    fraisSoutenance: 120000,
    fraisUniforme: 40000,
    montantBourse: 550000,
    montantNormal: 1100000,
    debouches: [
      'Directeur Supply Chain (CSCO)',
      'Directeur des opérations logistiques et portuaires',
      'Consultant senior en stratégie industrielle et transport',
      'Directeur de centrale d achat et de distribution',
    ],
    competences: [
      'Design et optimisation des réseaux logistiques internationaux',
      'Pilotage de la transformation digitale des flux industriels (IoT, IA)',
      'Management des infrastructures logistiques, portuaires et ferroviaires',
    ],
    objectifs:
      'Expertiser la Supply Chain globale et former les hauts dirigeants du secteur des transports, de la logistique et de la distribution.',
  },
]

async function runImport() {
  console.log('=== DEBUT DU SCRIPT D IMPORTATION ENSUP AFRIQUE ===')

  // 1. Localiser ou créer l'Établissement ENSUP Afrique Dakar
  let etablissement = await prisma.etablissement.findFirst({
    where: {
      slug: 'ensup-afrique-dakar',
    },
  })

  if (!etablissement) {
    etablissement = await prisma.etablissement.create({
      data: {
        slug: 'ensup-afrique-dakar',
        nom: "ENSUP Afrique — Enseignement Supérieur de la Gestion, des Finances et de l'Administration",
        ville: 'Dakar',
        accreditation: 'Agréé par l État — Diplômes reconnus CAMES / Ministère',
        site: 'https://www.ensupafrique.com/',
        resume:
          "ENSUP Afrique est un établissement d enseignement supérieur de référence à Dakar, spécialisé dans les sciences de gestion, le droit des affaires, l informatique et le management.",
        coverImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200',
        logoUrl: 'https://www.ensupafrique.com/images/logo.png',
        typeLabel: 'Grande École Privée',
        adresse: 'Dakar, Sénégal',
        phone: '+221 33 825 88 00',
        whatsapp: '+221 77 113 39 26',
        email: 'contact@ensupafrique.com',
        status: 'ACTIVE',
        contactStatus: 'VERIFIED',
      },
    })
    console.log(`[CREATE] Établissement ENSUP Afrique Dakar créé (ID: ${etablissement.id})`)
  } else {
    console.log(`[FOUND] Établissement ENSUP Afrique Dakar trouvé (ID: ${etablissement.id})`)
  }

  // 2. Localiser le Partenaire BourseFi
  let partner = await prisma.partner.findFirst({
    where: {
      slug: 'boursefi-partenaire',
    },
  })

  if (!partner) {
    partner = await prisma.partner.findFirst()
  }

  if (!partner) {
    throw new Error('Aucun partenaire disponible dans la base de données.')
  }

  console.log(`[PARTNER] Partenaire utilisé: "${partner.name}" (ID: ${partner.id})`)

  let createdCount = 0
  let updatedCount = 0
  let boursesCount = 0
  let tarifsCount = 0

  for (const progData of OFFICALL_CATALOGUE) {
    const slug = `ensup-afrique-dakar-${progData.code}`

    const description = `Formation de niveau ${progData.niveau} en ${progData.domain} à ENSUP Afrique Dakar. ${progData.objectifs}`
    const perspectives = `Compétences clés : ${progData.competences.join(', ')}.`
    const eligibilite =
      progData.niveau === 'Master'
        ? 'Titulaires d un diplôme de Licence (Bac+3) ou équivalent.'
        : progData.niveau === 'Licence'
          ? 'Titulaires du Baccalauréat (L1) ou du diplôme de niveau L1/L2 pour les accès directs.'
          : 'Titulaires du Baccalauréat toutes séries.'

    const documentsRequis =
      progData.niveau === 'Master'
        ? 'CNI recto/verso, diplôme de Licence, relevés de notes L1-L2-L3, CV.'
        : 'CNI recto/verso, attestation du Bac ou relevé du Bac.'

    const payloadProgramme = {
      etablissementId: etablissement.id,
      partnerId: partner.id,
      titre: progData.titre,
      ville: 'Dakar',
      duree: progData.duree,
      fraisDossier: 20000,
      fraisDossierEtranger: 30000,
      devise: 'FCFA',
      niveau: progData.niveau,
      description,
      eligibilite,
      perspectives,
      objectifs: progData.objectifs,
      competences: JSON.stringify(progData.competences),
      debouches: JSON.stringify(progData.debouches),
      secteurs: 'Entreprises privées, Administrations publiques, Cabinets de conseil, ONG, Banques, Industrie',
      conditionsAdmission: eligibilite,
      documentsRequis,
      modalites: 'Cours du jour, Cours du soir, Présentiel',
      stage: 'Stage d application ou de fin d études de 3 à 6 mois',
      examens: 'Contrôle continu et examens semestriels',
      poursuiteEtudes: progData.niveau === 'Master' ? 'Doctorat ou Certifications professionnelles' : 'Master professionnel ou recherche',
      sourceType: 'OFFICIAL_ESTABLISHMENT',
      sourceUrl: ENSUP_OFFICIAL_URL,
      verifiedAt: new Date(),
      metaTitle: `${progData.titre} — ENSUP Afrique Dakar`,
      metaDescription: `Découvrez le programme ${progData.titre} à ENSUP Afrique Dakar avec 50 % de prise en charge sur BourseFi.`,
      status: 'ACTIVE',
    }

    let programme = await prisma.programme.findFirst({
      where: {
        slug,
      },
    })

    if (!programme) {
      programme = await prisma.programme.create({
        data: {
          slug,
          ...payloadProgramme,
        },
      })
      createdCount++
      console.log(`+ [PROGRAMME CREATE] ${progData.titre} (Slug: ${slug})`)
    } else {
      programme = await prisma.programme.update({
        where: { id: programme.id },
        data: payloadProgramme,
      })
      updatedCount++
      console.log(`~ [PROGRAMME UPDATE] ${progData.titre} (Slug: ${slug})`)
    }

    // 3. Tarifs (Normal vs Convention BourseFi 50%)
    let tarif = await prisma.tarif.findFirst({
      where: {
        programmeId: programme.id,
        anneeAcademique: '2026-2027',
      },
    })

    const payloadTarif = {
      programmeId: programme.id,
      anneeAcademique: '2026-2027',
      montant: progData.montantNormal,
      montantBourse: progData.montantBourse,
      fraisInscription: progData.fraisInscription,
      mensualite: progData.mensualite,
      nombreMois: progData.nombreMois,
      fraisSoutenance: progData.fraisSoutenance,
      fraisUniforme: progData.fraisUniforme,
      devise: 'FCFA',
      label: 'Tarif officiel conventionné Demi-bourse (50%)',
      isDefault: true,
      source: 'PARTNER',
      isVerified: true,
      verifiedAt: new Date(),
      status: 'ACTIVE',
    }

    if (!tarif) {
      await prisma.tarif.create({
        data: payloadTarif,
      })
      tarifsCount++
    } else {
      await prisma.tarif.update({
        where: { id: tarif.id },
        data: payloadTarif,
      })
      tarifsCount++
    }

    // 4. Bourse associée (Demi-bourse 50%)
    const bourseSlug = `bourse-${slug}`
    let bourse = await prisma.bourse.findFirst({
      where: {
        slug: bourseSlug,
      },
    })

    const payloadBourse = {
      slug: bourseSlug,
      titre: `Bourse ${progData.titre}`,
      programmeId: programme.id,
      partnerId: partner.id,
      coveragePercent: 50,
      montantMax: null,
      quota: 30,
      placesRestantes: 25,
      dateLimite: new Date('2026-12-31T23:59:59.000Z'),
      conditions: 'Étudiant sénégalais ou étranger résidents. Dossier complet avec pièces requises.',
      documentsRequis,
      metaTitle: `Demi-Bourse 50% ${progData.titre} — ENSUP Afrique`,
      metaDescription: `Postulez à la demi-bourse 50 % pour la formation ${progData.titre} à ENSUP Afrique Dakar.`,
      isActive: true,
      status: 'ACTIVE',
    }

    if (!bourse) {
      await prisma.bourse.create({
        data: payloadBourse,
      })
      boursesCount++
    } else {
      await prisma.bourse.update({
        where: { id: bourse.id },
        data: payloadBourse,
      })
      boursesCount++
    }
  }

  console.log('\n==========================================')
  console.log('RAPPORT D IMPORTATION IDEMPOTENT ENSUP AFRIQUE')
  console.log(`- Total programmes traités : ${OFFICALL_CATALOGUE.length}`)
  console.log(`- Nouveaux programmes créés : ${createdCount}`)
  console.log(`- Programmes mis à jour : ${updatedCount}`)
  console.log(`- Tarifs synchronisés : ${tarifsCount}`)
  console.log(`- Bourses synchronisées : ${boursesCount}`)
  console.log('==========================================')
}

runImport()
  .catch((e) => {
    console.error('Erreur lors de l importation :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
