import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Base de connaissances académiques enrichies par domaine
function getRichContent(titre, niveau) {
  const t = titre.toLowerCase()

  if (t.includes('genie civil') || t.includes('génie civil') || t.includes('bâtiments') || t.includes('construction') || t.includes('architecture') || t.includes('topographie')) {
    return {
      description: `La formation en ${titre} forme des cadres techniques et ingénieurs d'excellence capables d'intervenir sur l'ensemble du cycle de vie des projets d'infrastructures de BTP et de génie civil. Le cursus associe enseignements scientifiques rigoureux, logiciels de modélisation de pointe et pratique de terrain.`,
      objectifs: `• Maîtriser le dimensionnement des ouvrages en béton armé, charpente métallique et mécanique des sols.\n• Piloter et planifier la conduite de chantiers complexes dans le respect des délais et des normes de sécurité.\n• Utiliser les outils informatiques d'ingénierie CAO/DAO (AutoCAD, Revit, ROBOT Structural Analysis).\n• Superviser la gestion budgétaire, les métrés et les appels d'offres de projets BTP.`,
      competences: `Calcul de structures & béton armé, Mécanique des sols & géotechnique, Conduite et pilotage de chantiers BTP, Maîtrise des logiciels CAO/DAO (AutoCAD/Revit/ROBOT), Métré et étude de prix, Contrôle qualité & conformité technique`,
      debouches: `Ingénieur BTP, Conducteur de Travaux, Chef de Projet Génie Civil, Ingénieur d'Études Structures, Géomètre Topographe, Inspecteur de Chantiers BTP, Consultant en Bureau d'Études`,
      secteurs: `Bureaux d'études techniques, Entreprises de construction BTP, Ministères des Infrastructures & Équipements, Sociétés immobilières, Agences d'architecture`,
      programmePedagogique: `• Semestre 1/3 : RDM, Mécanique des fluides, Béton armé 1, Topographie, Matériaux de construction\n• Semestre 2/4 : Béton armé 2, Charpente métallique, Géotechnique, Dessin CAO/DAO, Organisation de chantier\n• Semestre 3/5 : Ouvrages d'art, Route & Voirie VRD, Efficacité énergétique des bâtiments, Métré & Étude de prix\n• Semestre 4/6 : Droit du BTP, Sécurité sur chantier (HSE), Projets tutorés BIM, Stage professionnel & Mémoire`,
      conditionsAdmission: niveau === 'Licence'
        ? `• Baccalauréat scientifique ou technique (S1, S2, S3, T1, T2) ou BT BTP.\n• Sélection sur étude du dossier académique et entretien de motivation.`
        : `• Licence (L3) en Génie Civil, BTP, Architecture ou diplôme équivalent homologué.\n• Étude du dossier académique et entretien devant le jury.`,
      documentsRequis: `• 2 Copies légalisées du diplôme du Baccalauréat ou attestation de réussite\n• Relevés de notes des 3 dernières années d'études\n• Copie certifiée de la Pièce d'Identité (CNI ou Passeport)\n• 4 Photos d'identité récentes\n• Extrait d'acte de naissance de moins de 3 mois`,
      modalites: `Cours magistraux, travaux dirigés, TP en laboratoires de matériaux, visites guidées de grands chantiers BTP et séminaires d'experts.`,
      stage: `Stage obligatoire de 3 à 6 mois en bureau d'études ou sur chantier BTP avec rédaction et soutenance d'un mémoire de fin d'études devant un jury d'enseignants et de professionnels.`
    }
  }

  if (t.includes('logiciel') || t.includes('informatique') || t.includes('réseaux') || t.includes('telecom') || t.includes('sécurité') || t.includes('cyber')) {
    return {
      description: `Le cursus ${titre} prépare les futurs experts du numérique, développeurs et administrateurs réseaux aux exigences technologiques des entreprises modernes. La pédagogie axée sur le "Learning by Doing" permet d'acquérir une solide expertise technique immédiatement opérationnelle.`,
      objectifs: `• Concevoir, développer et déployer des applications web, mobiles et distribuées hautement scalables.\n• Administrer et sécuriser les infrastructures réseaux, datacenters et architectures Cloud d'entreprise.\n• Réaliser des audits de cybersécurité, protéger les données et lutter contre les vulnérabilités informatiques.\n• Piloter des projets technologiques complexes selon les méthodologies Agiles (Scrum, DevOps).`,
      competences: `Développement Web & Mobile (JavaScript/TypeScript, Python, Java), Administration système & Cloud Computing, Sécurité réseaux & audit de vulnérabilités, Gestion de bases de données SQL & NoSQL, DevOps & Intégration Continue (CI/CD), Méthodologies Agiles & Scrum`,
      debouches: `Lead Developer Full-Stack, Ingénieur DevOps, Administrateur Réseaux & Datacenters, Consultant en Cybersécurité, Architecte Cloud, Chef de Projet IT, Analyste Sécurité SOC`,
      secteurs: `ESN & Sociétés de conseil IT, Opérateurs de Télécommunications, Startups Tech & FinTechs, Banques & Compagnies d'Assurances, Datacenters, Multinationale`,
      programmePedagogique: `• Algorithmique avancée, Programmation Orientée Objet (Java/Python)\n• Développement Web Moderne (Frontend & Backend API REST)\n• Architecture des Réseaux Cisco, Routage & Commutation\n• Administration Système Linux/Unix & Virtualisation Cloud\n• Cybersécurité, Cryptographie & Sécurité des Applications\n• Gestion de Projet Agile & Stage de Fin d'Études`,
      conditionsAdmission: niveau === 'Licence'
        ? `• Baccalauréat scientifique (S1, S2) ou technique ou informatique.\n• Sélection sur dossier académique et test de logique informatique.`
        : `• Licence (L3) en Informatique, Génie Logiciel, Télécoms ou diplôme équivalent.\n• Sélection sur dossier et entretien technique.`,
      documentsRequis: `• 2 Copies légalisées du Baccalauréat et relevé de notes\n• Relevés de notes universitaires antérieurs\n• Copie certifiée de la CNI ou Passeport\n• 4 Photos d'identité\n• CV détaillé et lettre de motivation`,
      modalites: `Cours magistraux, travaux pratiques intensifs en salles machines équipées, laboratoires réseaux Cisco/Linux, hackathons et projets tutorés.`,
      stage: `Stage en entreprise tech de 3 à 6 mois axé sur la réalisation d'un projet informatique à forte valeur ajoutée, suivi d'une soutenance orale.`
    }
  }

  if (t.includes('finance') || t.includes('comptab') || t.includes('audit') || t.includes('banque') || t.includes('assurance')) {
    return {
      description: `La formation ${titre} prépare aux fonctions clés de la gestion financière, de la comptabilité SYSCOHADA révisée et du contrôle de gestion d'entreprise. Les étudiants développent des compétences pointues pour analyser les risques, optimiser la trésorerie et piloter la performance financière.`,
      objectifs: `• Maîtriser les règles comptables SYSCOHADA révisées et les normes comptables internationales IFRS.\n• Élaborer et analyser les états financiers, bilans et comptes de résultat des entreprises.\n• Effectuer le contrôle budgétaire, l'audit financier et l'évaluation des risques d'entreprise.\n• Gérer la trésorerie, la fiscalité d'entreprise et les relations avec les partenaires bancaires.`,
      competences: `Comptabilité générale & analytique SYSCOHADA, Analyse financière & évaluation d'entreprise, Audit financier & contrôle budgétaire, Gestion de trésorerie & ingénierie financière, Fiscalité d'entreprise & droit des affaires, Maîtrise des progiciels de gestion (SAGE SAARI, Excel avance)`,
      debouches: `Auditeur Financier, Chef Comptable, Contrôleur de Gestion, Analyste Financier, Gestionnaire de Portefeuille Banque, Consultant en Cabinet d'Expertise, Directeur Financier (DAF)`,
      secteurs: `Cabinets d'expertise comptable & d'audit, Banques & Etablissements de crédit, Compagnies d'assurance, Multinationales & PME, Secteur public & agences d'État`,
      programmePedagogique: `• Comptabilité générale approfondie & Mathématiques financières\n• Analyse financière & Diagnostic d'entreprise\n• Comptabilité des sociétés & Normes SYSCOHADA révisées\n• Fiscalité des entreprises & Droit des affaires\n• Audit comptable et financier & Contrôle de gestion\n• Progiciels de comptabilité SAGE & Stage professionnel`,
      conditionsAdmission: niveau === 'Licence'
        ? `• Baccalauréat toutes séries (G2, S, L) ou diplôme homologué.\n• Étude du dossier académique.`
        : `• Licence (L3) en Finance, Comptabilité, Gestion ou diplôme homologué.\n• Sélection sur dossier et entretien devant le jury.`,
      documentsRequis: `• 2 Copies légalisées du Baccalauréat ou diplôme le plus élevé\n• Relevés de notes des 3 dernières années\n• Copie certifiée de la CNI ou Passeport\n• 4 Photos d'identité\n• Extrait de naissance`,
      modalites: `Enseignements théoriques et appliqués, études de cas réels d'entreprises sénégalaises et de la zone UEMOA, séminaires avec des experts comptables.`,
      stage: `Stage obligatoire de 3 à 6 mois en cabinet d'expertise comptable, banque ou direction financière d'entreprise avec rédaction d'un mémoire professionnel.`
    }
  }

  if (t.includes('ressources humaines') || t.includes('grh')) {
    return {
      description: `Le programme ${titre} forme des gestionnaires RH polyvalents et stratégiques capables d'accompagner la transformation des organisations, de piloter le recrutement, la gestion de la paie et de valoriser le capital humain.`,
      objectifs: `• Déployer la gestion prévisionnelle des emplois et compétences (GPEC) au sein des organisations.\n• Piloter le processus complet de recrutement, d'intégration et de fidélisation des talents.\n• Maîtriser le calcul de la paie, la législation du travail sénégalaise et les déclarations sociales.\n• Conduire le dialogue social, négocier avec les partenaires et améliorer la qualité de vie au travail (QVT).`,
      competences: `Gestion de la paie & charges sociales, Recrutement & évaluation des compétences, Droit du travail & relations sociales, GPEC & ingénierie de la formation, Communication interne & marque employeur, Maîtrise des logiciels SIRH (SAGE Paie)`,
      debouches: `Responsable des Ressources Humaines (RRH), Chargé de Recrutement, Gestionnaire de la Paie, Consultant RH, Responsable Formation, Assistant DRH`,
      secteurs: `Entreprises privées de tous secteurs, Cabinets de recrutement & RH, Administrations publiques & agences nationales, ONG & Organisations internationales`,
      programmePedagogique: `• Droit du travail & Législation sociale sénégalaise\n• Gestion administrative du personnel & Paie informatique\n• Recrutement, GPEC & Plan de formation\n• Audit social & Management de la performance\n• Communication interne & Négociation sociale\n• Outils SIRH & Mémoire professionnel`,
      conditionsAdmission: niveau === 'Licence'
        ? `• Baccalauréat toutes séries (L, S, G).\n• Étude du dossier académique.`
        : `• Licence (L3) en GRH, Droit, Management ou Sciences Sociales.\n• Étude de dossier et entretien de motivation.`,
      documentsRequis: `• 2 Copies légalisées du Baccalauréat ou attestation de réussite\n• Relevés de notes de l'année précédente\n• Copie certifiée CNI ou Passeport\n• 4 Photos d'identité`,
      modalites: `Cours interactifs, cas pratiques de droit du travail sénégalais, simulations d'entretiens de recrutement et ateliers sur logiciels SIRH.`,
      stage: `Stage professionnel de 3 à 6 mois au sein d'une Direction des Ressources Humaines avec rapport de stage / mémoire d'études.`
    }
  }

  if (t.includes('transport') || t.includes('logistique') || t.includes('commerce int')) {
    return {
      description: `Le cursus ${titre} répond aux exigences accrues du commerce mondial et des infrastructures maritimes et terrestres d'Afrique de l'Ouest. Il prépare des spécialistes de la Supply Chain, des procédures douanières et du transport international.`,
      objectifs: `• Optimiser les chaînes d'approvisionnement et de distribution nationales et internationales.\n• Maîtriser les incoterms 2020, les réglementations douanières et les procédures de transit portuaire.\n• Piloter la gestion des stocks, la manutention et la gestion des flottes de transport.\n• Négocier les contrats de vente internationale et gérer les risques de transport (assurance maritime/terrestre).`,
      competences: `Gestion de la Supply Chain & stocks, Transit douanier & Incoterms 2020, Transport multimodal (Maritime, Aérien, Terrestre), Négociation commerciale internationale, Gestion de flotte & logistique de distribution, Maîtrise des logiciels ERP logistiques`,
      debouches: `Responsable Logistique & Supply Chain, Transitaire & Déclarant en Douane, Responsable Export/Import, Chef de Projet Transport, Acheteur International, Responsable d'Entrepôt`,
      secteurs: `Port Autonome de Dakar, Sociétés de transit & d'emballage maritime, Compagnies de transport & fret, Multinationale d'exportation/importation, Plateformes logistiques`,
      programmePedagogique: `• Fondamentaux de la logistique & Gestion des stocks\n• Droit douanier & Régimes douaniers sénégalais\n• Incoterms 2020 & Assurance transport\n• Transport maritime, aérien et terrestre multimodal\n• Management de la Supply Chain & ERP\n• Projets professionnels & Stage de fin d'études`,
      conditionsAdmission: niveau === 'Licence'
        ? `• Baccalauréat toutes séries (L, S, G).\n• Étude de dossier académique.`
        : `• Licence (L3) en Transport, Logistique, Commerce International ou Économie.\n• Sélection sur dossier et entretien.`,
      documentsRequis: `• 2 Copies légalisées du Baccalauréat\n• Relevés de notes scolaires / universitaires\n• Copie certifiée CNI ou Passeport\n• 4 Photos d'identité`,
      modalites: `Cours théoriques, séminaires professionnels avec des déclarants en douane, visites du Port Autonome de Dakar et étude de cas pratiques.`,
      stage: `Stage de 3 à 6 mois dans une société de transit, une compagnie maritime ou la direction logistique d'une entreprise industrielle.`
    }
  }

  // Par défaut : Marketing / Management / QHSE / Entreprises
  return {
    description: `La formation en ${titre} prépare des cadres dynamiques et des managers performants capables d'élaborer la stratégie globale des entreprises, d'optimiser l'organisation opérationnelle et de piloter le développement commercial.`,
    objectifs: `• Élaborer et mettre en œuvre la stratégie globale et le plan marketing de l'entreprise.\n• Piloter le management de la qualité, de la sécurité et du développement durable (ISO 9001 / 14001).\n• Analyser les marchés, la concurrence et piloter les campagnes de communication d'entreprise.\n• Manager les équipes opérationnelles et garantir l'atteinte des objectifs de rentabilité.`,
    competences: `Stratégie d'entreprise & Business Plan, Marketing opérationnel & digital, Management de la Qualité & Normes QSE, Négociation commerciale & relation client, Gestion de projets & leadership d'équipe, Communication institutionnelle & marque`,
    debouches: `Responsable Marketing, Chef de Projet Management, Consultant QSE, Directeur d'Agence, Chef de Produit, Manager d'Unité Opérationnelle, Entrepreneur`,
    secteurs: `Grandes entreprises & PME/PMI, Agences de conseil & communication, Organismes de certification QSE, Multinationales, Secteur télécoms & services`,
    programmePedagogique: `• Management stratégique & Théorie des organisations\n• Marketing stratégique, étude de marché & comportement du consommateur\n• Système de Management de la Qualité ISO 9001 & Normes QSE\n• Contrôle de gestion & Pilotage budgétaire\n• Communication globale, marketing digital & réseaux sociaux\n• Projets tutorés & Soutenance de mémoire`,
    conditionsAdmission: niveau === 'Licence'
      ? `• Baccalauréat toutes séries.\n• Étude du dossier académique.`
      : `• Licence (L3) en Management, Gestion, Marketing ou Sciences Économiques.\n• Sélection sur dossier et entretien devant le jury.`,
    documentsRequis: `• 2 Copies légalisées du diplôme le plus élevé\n• Relevés de notes des 3 dernières années d'études\n• Copie certifiée de la CNI ou Passeport\n• 4 Photos d'identité récentes`,
    modalites: `Enseignements théoriques, études de cas réels d'entreprises, ateliers pratiques, travaux de groupes et conférences professionnelles.`,
    stage: `Stage professionnel de 3 à 6 mois en entreprise avec rédaction et soutenance d'un mémoire de fin d'études devant un jury d'enseignants et d'experts.`
  }
}

async function runEnrichment() {
  console.log('🚀 Début de l\'enrichissement des contenus pédagogiques (IPD Thomas Sankara & ESTG)...')

  const programmes = await prisma.programme.findMany({
    where: {
      OR: [
        { etablissement: { slug: 'ipd-thomas-sankara' } },
        { etablissement: { slug: 'estg-dakar' } }
      ]
    },
    include: { etablissement: true }
  })

  console.log(`📚 ${programmes.length} programmes trouvés pour enrichissement.`)

  let updatedCount = 0

  for (const prog of programmes) {
    const richData = getRichContent(prog.titre, prog.niveau)

    await prisma.programme.update({
      where: { id: prog.id },
      data: {
        description: richData.description,
        objectifs: richData.objectifs,
        competences: richData.competences,
        debouches: richData.debouches,
        secteurs: richData.secteurs,
        programmePedagogique: richData.programmePedagogique,
        conditionsAdmission: richData.conditionsAdmission,
        documentsRequis: richData.documentsRequis,
        modalites: richData.modalites,
        stage: richData.stage,
        perspectives: `Diplôme reconnu préparant directement à l'insertion professionnelle immédiate ou à la poursuite d'études supérieures en Master / Doctorat.`,
        eligibilite: `Candidats titulaires du diplôme requis (Baccalauréat pour la Licence, Licence L3 pour le Master). Admission sur étude de dossier académique.`
      }
    })

    updatedCount++
    console.log(`  [${updatedCount}/${programmes.length}] Enrichi : ${prog.titre} (${prog.etablissement.nom})`)
  }

  console.log(`\n ENRICHISSEMENT REUSSI ! ${updatedCount} programmes IPD et ESTG mis à jour avec du contenu académique complet.`)
}

runEnrichment()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('❌ Erreur lors de l\'enrichissement :', err)
    prisma.$disconnect()
    process.exit(1)
  })
