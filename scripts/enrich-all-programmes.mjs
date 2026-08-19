import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Moteur de génération de contenus académiques riches par domaine & discipline
function getRichAcademicContent(titre, niveau, etabNom, etabVille) {
  const t = (titre || '').toLowerCase()
  const n = (niveau || 'Licence').toLowerCase()
  const ville = etabVille || 'Dakar'

  // 1. INFORMATIQUE / GRAPHISME / TECH / CYBERSECURITY
  if (t.includes('informatique') || t.includes('logiciel') || t.includes('réseau') || t.includes('telecom') || t.includes('sécurité') || t.includes('cyber') || t.includes('web') || t.includes('data') || t.includes('développe')) {
    return {
      description: `Le programme ${titre} dispensé à ${etabNom} forme des spécialistes du numérique hautement qualifiés. Combinant enseignements théoriques rigoureux et pratique intensive sur des technologies de pointe, ce cursus prépare aux enjeux de la transformation digitale et des systèmes d'information modernes.`,
      objectifs: `• Concevoir, développer et déployer des applications web, mobiles et d'entreprise performantes.\n• Administrer et sécuriser les réseaux informatiques, serveurs et infrastructures Cloud.\n• Gérer les bases de données relationnelles et NoSQL et garantir l'intégrité des données d'entreprise.\n• Réaliser des audits de sécurité informatique et appliquer les normes de cybersécurité.\n• Piloter des projets informatiques selon les méthodologies Agiles (Scrum, DevOps).`,
      competences: `Développement Web & Mobile (JavaScript, Python, Java), Administration Système Linux/Windows & Cloud, Sécurité Réseaux & Audit de Vulnérabilités, Gestion de Bases de Données (SQL/NoSQL), DevOps & Intégration Continue (CI/CD), Gestion de Projet Agile & Scrum`,
      debouches: `Lead Developer Full-Stack, Ingénieur DevOps, Administrateur Système & Réseaux, Consultant en Cybersécurité, Architecte Cloud, Chef de Projet Informatique, Analyste de Données (Data Analyst)`,
      secteurs: `ESN & Sociétés de Conseil IT, Opérateurs de Télécommunications, Startups & FinTechs, Banques & Compagnies d'Assurance, Datacenters, Grandes Entreprises & Multinationale`,
      programmePedagogique: `• Semestre 1/3 : Algorithmique, Programmation Orientée Objet, Mathématiques Informatiques, Architecture des Ordinateurs\n• Semestre 2/4 : Développement Web Frontend/Backend, Administration Réseaux Cisco, Bases de Données SQL\n• Semestre 3/5 : Sécurité Informatique, Virtualisation Cloud, Développements Mobiles, DevOps & CI/CD\n• Semestre 4/6 : Management de Projets Agiles, Droit du Numérique, Projets Tutorés & Stage Professionnel`,
      conditionsAdmission: n.includes('master')
        ? `• Titulaire d'une Licence (L3) en Informatique, Génie Logiciel, Réseaux ou diplôme homologué équivalent.\n• Sélection sur étude du dossier académique et entretien technique devant le jury.`
        : `• Titulaire du Baccalauréat scientifique (S1, S2), technique ou général.\n• Sélection sur étude du dossier académique et test de logique.`,
      documentsRequis: `• 2 Copies certifiées conformes du Baccalauréat ou attestation de réussite\n• Relevés de notes des 3 dernières années d'études\n• Copie certifiée conforme de la Pièce d'Identité (CNI ou Passeport)\n• 4 Photos d'identité récentes\n• Extrait d'acte de naissance de moins de 3 mois`,
      modalites: `Enseignements théoriques, ateliers pratiques intensifs en salles informatiques équipées, laboratoires réseaux, hackathons et travaux de groupes tutorés.`,
      stage: `Stage professionnel obligatoire de 3 à 6 mois au sein d'une entreprise technologique ou d'une DSI avec rédaction et soutenance d'un mémoire de fin d'études.`
    }
  }

  // 2. GÉNIE CIVIL / BTP / ARCHITECTURE / ÉLECTROTECHNIQUE / MÉCANIQUE
  if (t.includes('civil') || t.includes('btp') || t.includes('bâtiment') || t.includes('construction') || t.includes('architecture') || t.includes('topograph') || t.includes('électro') || t.includes('mécanique') || t.includes('industri')) {
    return {
      description: `La formation en ${titre} dispensée par ${etabNom} prépare des cadres techniques et ingénieurs de terrain capables de concevoir, réaliser et superviser de grands projets d'infrastructures, de construction et d'installations industrielles.`,
      objectifs: `• Dimensionner et calculer les structures en béton armé, charpente métallique et mécanique des sols.\n• Organiser, planifier et diriger l'exécution de chantiers complexes dans le respect des coûts et délais.\n• Maîtriser les logiciels d'ingénierie et de modélisation CAO/DAO (AutoCAD, Revit, ROBOT Structural Analysis).\n• Veiller à l'application stricte des normes de sécurité (HSE), de qualité et d'efficacité énergétique.`,
      competences: `Calcul de structures & Béton armé, Mécanique des sols & Géotechnique, Conduite & Gestion de chantiers BTP, Maîtrise des logiciels CAO/DAO (AutoCAD/Revit/ROBOT), Métré, étude de prix & appels d'offres, Contrôle qualité & conformité technique`,
      debouches: `Ingénieur BTP, Conducteur de Travaux, Chef de Projet Génie Civil, Ingénieur d'Études Structures, Géomètre Topographe, Responsable HSE, Inspecteur de Chantiers`,
      secteurs: `Bureaux d'études techniques, Entreprises de construction & BTP, Ministères des Infrastructures, Sociétés immobilières, Agences d'architecture`,
      programmePedagogique: `• Semestre 1/3 : RDM, Mécanique des fluides, Matériaux de construction, Topographie\n• Semestre 2/4 : Béton armé 1, Charpente métallique, Géotechnique, Dessin CAO/DAO\n• Semestre 3/5 : Béton armé 2, Voirie VRD, Métré & Étude de prix, Efficacité énergétique\n• Semestre 4/6 : Sécurité sur chantier (HSE), Projets BIM tutorés, Stage professionnel & Mémoire`,
      conditionsAdmission: n.includes('master')
        ? `• Titulaire d'une Licence (L3) en Génie Civil, BTP, Architecture ou diplôme équivalent.\n• Sélection sur dossier et entretien devant le jury.`
        : `• Titulaire du Baccalauréat scientifique ou technique (S1, S2, S3, T1, T2) ou BT BTP.\n• Sélection sur étude du dossier académique.`,
      documentsRequis: `• 2 Copies certifiées du diplôme du Baccalauréat ou attestation de réussite\n• Relevés de notes des 3 dernières années d'études\n• Copie certifiée de la CNI ou Passeport\n• 4 Photos d'identité récentes\n• Extrait d'acte de naissance`,
      modalites: `Cours magistraux, travaux pratiques en laboratoires de matériaux, visites guidées de chantiers de construction et ateliers de modélisation 3D/BIM.`,
      stage: `Stage obligatoire de 3 à 6 mois sur chantier ou en bureau d'études techniques avec rédaction et soutenance d'un mémoire d'études devant un jury professionnel.`
    }
  }

  // 3. FINANCE / COMPTABILITÉ / AUDIT / BANQUE / ASSURANCE
  if (t.includes('finance') || t.includes('comptab') || t.includes('audit') || t.includes('banque') || t.includes('assurance') || t.includes('fiscal') || t.includes('trésor')) {
    return {
      description: `Le cursus ${titre} à ${etabNom} offre une expertise complète en gestion financière, comptabilité selon les normes SYSCOHADA révisées, audit et contrôle budgétaire, indispensables au pilotage de la performance des entreprises.`,
      objectifs: `• Maîtriser l'élaboration et l'analyse des états financiers d'entreprise conformément au SYSCOHADA révisé.\n• Mener des missions d'audit financier, de contrôle de gestion et d'évaluation des risques.\n• Assurer la gestion optimale de la trésorerie, de la fiscalité et des relations bancaires.\n• Élaborer des choix d'investissement stratégiques et des montages financiers complexes.`,
      competences: `Comptabilité générale & analytique SYSCOHADA, Analyse financière & évaluation d'entreprise, Audit financier & contrôle budgétaire, Gestion de trésorerie & ingénierie financière, Fiscalité d'entreprise & droit des affaires, Maîtrise des progiciels (SAGE SAARI, Excel avancé)`,
      debouches: `Auditeur Financier, Chef Comptable, Contrôleur de Gestion, Analyste Financier, Gestionnaire de Portefeuille, Consultant en Cabinet d'Expertise, Directeur Financier (DAF)`,
      secteurs: `Cabinets d'expertise comptable & d'audit, Banques & Établissements financiers, Compagnies d'assurance, Multinationales & PME, Secteur public & agences d'État`,
      programmePedagogique: `• Semestre 1/3 : Comptabilité générale approfondie, Mathématiques financières, Droit des affaires\n• Semestre 2/4 : Analyse financière, Fiscalité d'entreprise, Comptabilité des sociétés\n• Semestre 3/5 : Audit comptable & financier, Contrôle de gestion, Normes IFRS/SYSCOHADA\n• Semestre 4/6 : Progiciels SAGE SAARI, Diagnostic financier stratégique, Stage professionnel & Mémoire`,
      conditionsAdmission: n.includes('master')
        ? `• Licence (L3) en Finance, Comptabilité, Gestion ou diplôme homologué.\n• Étude de dossier et entretien de sélection devant le jury.`
        : `• Baccalauréat toutes séries (G2, S, L) ou diplôme homologué équivalent.\n• Étude du dossier académique.`,
      documentsRequis: `• 2 Copies certifiées conformes du Baccalauréat\n• Relevés de notes universitaires / scolaires antérieurs\n• Copie certifiée de la CNI ou Passeport\n• 4 Photos d'identité récentes`,
      modalites: `Cours magistraux, travaux dirigés, étude de cas réels d'entreprises de la zone UEMOA et séminaires animés par des experts-comptables certifiés.`,
      stage: `Stage professionnel de 3 à 6 mois en cabinet d'expertise comptable, banque ou direction financière d'entreprise avec soutien de mémoire.`
    }
  }

  // 4. RESSOURCES HUMAINES / DROIT / MANAGEMENT / ADMINISTRATION
  if (t.includes('ressource') || t.includes('rh') || t.includes('droit') || t.includes('jurid') || t.includes('administration') || t.includes('entreprise') || t.includes('management')) {
    return {
      description: `La formation ${titre} dispensée par ${etabNom} prépare des cadres dirigeants et spécialistes des Ressources Humaines capables de piloter le capital humain, la gestion de la paie, le droit du travail et la stratégie organisationnelle.`,
      objectifs: `• Piloter la gestion prévisionnelle des emplois et des compétences (GPEC) et le recrutement des talents.\n• Maîtriser le calcul de la paie, la législation sociale sénégalaise et la gestion des contrats.\n• Conduire le dialogue social, la négociation d'entreprise et l'amélioration de la qualité de vie au travail.\n• Élaborer la stratégie d'organisation, la conduite du changement et le développement de la marque employeur.`,
      competences: `Gestion de la paie & charges sociales, Recrutement & ingénierie de formation, Droit du travail & relations sociales, GPEC & évaluation de la performance, Communication interne & conduite du changement, Maîtrise des logiciels SIRH (SAGE Paie)`,
      debouches: `Responsable des Ressources Humaines (RRH), Chargé de Recrutement, Gestionnaire de la Paie, Consultant en Organisation, Responsable Formation, Assistant DRH`,
      secteurs: `Entreprises privées de tous secteurs, Cabinets de recrutement & RH, Administrations publiques, ONG & Organisations internationales`,
      programmePedagogique: `• Semestre 1/3 : Droit du travail sénégalais, Gestion administrative du personnel, Psychologie du travail\n• Semestre 2/4 : Technique de paie sur SAGE, Recrutement & Intégration, GPEC\n• Semestre 3/5 : Ingénierie de la formation, Audit social, Négociation & Climat social\n• Semestre 4/6 : SIRH, Conduite du changement, Stage professionnel & Mémoire`,
      conditionsAdmission: n.includes('master')
        ? `• Licence (L3) en GRH, Droit, Management, Administration ou Sciences Sociales.\n• Étude du dossier académique et entretien de motivation.`
        : `• Baccalauréat toutes séries (L, S, G).\n• Sélection sur étude du dossier.`,
      documentsRequis: `• 2 Copies certifiées conformes du Baccalauréat\n• Relevés de notes des 3 dernières années d'études\n• Copie certifiée de la CNI ou Passeport\n• 4 Photos d'identité`,
      modalites: `Cours interactifs, cas pratiques de droit du travail, simulations d'entretiens de recrutement et ateliers pratiques sur SIRH.`,
      stage: `Stage professionnel de 3 à 6 mois en Direction des Ressources Humaines ou cabinet RH avec rédaction et soutenance de mémoire.`
    }
  }

  // 5. TRANSPORT / LOGISTIQUE / COMMERCE INTERNATIONAL / TRANSIT / DOUANE
  if (t.includes('transport') || t.includes('logisti') || t.includes('commerce int') || t.includes('douane') || t.includes('transit') || t.includes('supply chain')) {
    return {
      description: `Le cursus ${titre} à ${etabNom} prépare des experts de la Supply Chain globale, de la gestion des flux de marchandises, des réglementations douanières et du transport multimodal national et international.`,
      objectifs: `• Optimiser l'ensemble des maillons de la chaîne d'approvisionnement (Supply Chain) et de stockage.\n• Maîtriser les incoterms 2020, les régimes douaniers sénégalais et le transit maritime/aérien/terrestre.\n• Négocier les contrats de vente et de transport internationaux et gérer l'assurance du fret.\n• Piloter la gestion des flottes de transport, des entrepôts et les expéditions de marchandises.`,
      competences: `Gestion de la Supply Chain & entrepôts, Transit douanier & Incoterms 2020, Transport multimodal (Maritime, Aérien, Terrestre), Négociation commerciale internationale, Gestion de flotte & logistique de distribution, Maîtrise des ERP logistiques`,
      debouches: `Responsable Logistique & Supply Chain, Transitaire & Déclarant en Douane, Responsable Export/Import, Chef de Projet Transport, Acheteur International, Responsable d'Entrepôt`,
      secteurs: `Port Autonome de Dakar, Sociétés de transit & fret international, Compagnies maritimes & aériennes, Multinationales d'import/export, Plateformes logistiques`,
      programmePedagogique: `• Semestre 1/3 : Fondamentaux de la logistique, Gestion des stocks, Droit des transports\n• Semestre 2/4 : Régimes douaniers sénégalais, Incoterms 2020, Assurance maritime & terrestre\n• Semestre 3/5 : Transport multimodal, Management de la Supply Chain, ERP Logistique\n• Semestre 4/6 : Commerce international approfondi, Projets de transit, Stage professionnel & Mémoire`,
      conditionsAdmission: n.includes('master')
        ? `• Licence (L3) en Transport, Logistique, Commerce International, Économie ou Gestion.\n• Sélection sur dossier et entretien devant le jury.`
        : `• Baccalauréat toutes séries (L, S, G).\n• Sélection sur étude du dossier.`,
      documentsRequis: `• 2 Copies certifiées du diplôme du Baccalauréat\n• Relevés de notes scolaires / universitaires\n• Copie certifiée CNI ou Passeport\n• 4 Photos d'identité`,
      modalites: `Cours théoriques, séminaires professionnels avec des transitaires et déclarants en douane, visites guidées du Port Autonome de Dakar.`,
      stage: `Stage professionnel de 3 à 6 mois au sein d'une société de transit, compagnie maritime ou service logistique d'entreprise.`
    }
  }

  // 6. MARKETING / COMMUNICATION / QHSE / SANTÉ / AGRO / AUTRES DISCIPLINES
  return {
    description: `La formation ${titre} dispensée à ${etabNom} offre un enseignement d'excellence conçu pour répondre aux besoins opérationnels et stratégiques des entreprises et organisations au Sénégal et à l'international.`,
    objectifs: `• Acquérir une maîtrise approfondie des fondamentaux théoriques et pratiques de la discipline.\n• Élaborer et piloter des stratégies d'action adaptées aux réalités économiques contemporaines.\n• Développer la capacité d'analyse, de diagnostic et de résolution de problèmes complexes.\n• Manager efficacement des projets et coordonner les équipes opérationnelles sur le terrain.`,
    competences: `Analyse stratégique & diagnostic organisationnel, Gestion de projets & suivi opérationnel, Maîtrise des outils informatiques professionnels, Communication professionnelle & négociation, Évaluation de la performance & contrôle de qualité, Management d'équipe & leadership`,
    debouches: `Chef de Projet, Responsable Opérationnel, Consultant en Organisation, Manager de Service, Chargé de Missions, Consultant Indépendant, Entrepreneur`,
    secteurs: `Entreprises privées (PME & Multinationales), Agences spécialisées & Cabinets de conseil, Organisations non gouvernementales (ONG), Administration publique`,
    programmePedagogique: `• Semestre 1/3 : Fondamentaux théoriques, Méthodologie générale, Outils informatiques\n• Semestre 2/4 : Enseignements de spécialité 1, Analyse de cas pratiques, Communication\n• Semestre 3/5 : Enseignements de spécialité 2, Management de projet, Éthique & Droit\n• Semestre 4/6 : Séminaires professionnels, Projets tutorés, Stage professionnel & Soutenance de mémoire`,
    conditionsAdmission: n.includes('master')
      ? `• Titulaire d'une Licence (L3) dans la spécialité ou un domaine connexe homologué.\n• Sélection sur étude du dossier académique et entretien.`
      : `• Titulaire du Baccalauréat toutes séries ou d'un diplôme équivalent reconnu.\n• Sélection sur étude du dossier académique.`,
    documentsRequis: `• 2 Copies certifiées du diplôme le plus élevé\n• Relevés de notes des 3 dernières années d'études\n• Copie certifiée de la CNI ou du Passeport\n• 4 Photos d'identité récentes`,
    modalites: `Enseignements théoriques, études de cas d'entreprises, ateliers pratiques, travaux de groupes et conférences d'experts du secteur.`,
    stage: `Stage professionnel d'immersion de 3 à 6 mois en entreprise ou organisation avec rédaction et soutenance d'un mémoire de fin d'études.`
  }
}

async function runEnrichAll() {
  console.log('🚀 Début de l\'enrichissement global de TOUS les programmes de BourseFi...')

  const allProgs = await prisma.programme.findMany({
    include: { etablissement: true }
  })

  console.log(`📚 Total programmes en BDD : ${allProgs.length}`)

  let enrichedCount = 0

  for (const prog of allProgs) {
    const etabNom = prog.etablissement?.nom || 'Établissement Partenaire'
    const etabVille = prog.etablissement?.ville || 'Dakar'

    const rich = getRichAcademicContent(prog.titre, prog.niveau, etabNom, etabVille)

    await prisma.programme.update({
      where: { id: prog.id },
      data: {
        description: prog.description && prog.description.length > 80 ? prog.description : rich.description,
        objectifs: rich.objectifs,
        competences: rich.competences,
        debouches: rich.debouches,
        secteurs: rich.secteurs,
        programmePedagogique: rich.programmePedagogique,
        conditionsAdmission: prog.conditionsAdmission && prog.conditionsAdmission.length > 50 ? prog.conditionsAdmission : rich.conditionsAdmission,
        documentsRequis: prog.documentsRequis && prog.documentsRequis.length > 30 ? prog.documentsRequis : rich.documentsRequis,
        modalites: rich.modalites,
        stage: rich.stage,
        perspectives: `Diplôme certifiant prédisposant à une insertion professionnelle rapide dans le secteur ou à une poursuite d'études supérieures de niveau Master ou Doctorat.`,
        eligibilite: `Admission ouverte aux candidats titulaires des diplômes requis. Sélection rigoureuse sur étude du dossier académique.`
      }
    })

    enrichedCount++
    if (enrichedCount % 50 === 0 || enrichedCount === allProgs.length) {
      console.log(`  [${enrichedCount}/${allProgs.length}] Programmes enrichis avec succès...`)
    }
  }

  console.log(`\n ENRICHISSEMENT GLOBAL RÉUSSI ! ${enrichedCount} programmes BourseFi disposent désormais d'un contenu académique 100% complet et illustré.`)
}

runEnrichAll()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('❌ Erreur lors de l\'enrichissement :', err)
    prisma.$disconnect()
    process.exit(1)
  })
