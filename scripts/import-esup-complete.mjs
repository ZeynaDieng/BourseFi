import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const esupDakarCommerceLicences = [
  { code: 'AGE', title: 'Administration et Gestion des Entreprises (AGE)', slug: 'esup-dakar-licence-age' },
  { code: 'AD', title: 'Assistantat de Direction (AD)', slug: 'esup-dakar-licence-assistantat-de-direction' },
  { code: 'BAF', title: 'Banque Assurance Finance (BAF)', slug: 'esup-dakar-licence-baf' },
  { code: 'CD', title: 'Commerce International (CD)', slug: 'esup-dakar-licence-commerce-international' },
  { code: 'CG', title: 'Comptabilité - Gestion (CG)', slug: 'esup-dakar-licence-comptabilite-gestion' },
  { code: 'DAF', title: 'Droit des Affaires et Fiscalité', slug: 'esup-dakar-licence-droit-des-affaires-et-fiscalite' },
  { code: 'MCJ', title: 'Marketing-Communication-Journalisme (MC)', slug: 'esup-dakar-licence-marketing-communication-journalisme' },
  { code: 'TL', title: 'Transport-Logistique', slug: 'esup-dakar-licence-transport-logistique' },
  { code: 'GI', title: 'Gestion Informatique', slug: 'esup-dakar-licence-gestion-informatique' },
  { code: 'GCL', title: 'Gestion des collectivités locales', slug: 'esup-dakar-licence-gestion-des-collectivites-locales' },
  { code: 'DN', title: 'Législation notariale / Droit notarial', slug: 'esup-dakar-licence-droit-notarial' },
  { code: 'GIM', title: 'Gestion immobilière', slug: 'esup-dakar-licence-gestion-immobiliere' },
  { code: 'AF', title: 'Assistantat Fiscal', slug: 'esup-dakar-licence-assistantat-fiscal' },
  { code: 'GRH', title: 'Gestion des Ressources Humaines', slug: 'esup-dakar-licence-gestion-des-ressources-humaines' },
  { code: 'MP', title: 'Management des projets', slug: 'esup-dakar-licence-management-des-projets' },
]

export const esupDakarCommerceMasters = [
  { code: 'GF', title: 'Gestion fiscale', slug: 'esup-dakar-master-gestion-fiscale' },
  { code: 'GI', title: 'Gestion Informatique', slug: 'esup-dakar-master-gestion-informatique' },
  { code: 'FI', title: 'Finance Islamique', slug: 'esup-dakar-master-finance-islamique' },
  { code: 'GRH', title: 'Gestion des ressources humaines', slug: 'esup-dakar-master-gestion-des-ressources-humaines' },
  { code: 'CIM', title: 'Commerce international Marketing', slug: 'esup-dakar-master-commerce-international-marketing' },
  { code: 'MQ', title: 'Management par la Qualité', slug: 'esup-dakar-master-management-par-la-qualite' },
  { code: 'CG', title: 'Comptabilité Gestion', slug: 'esup-dakar-master-comptabilite-gestion' },
  { code: 'ACG', title: 'Audit et Contrôle de gestion', slug: 'esup-dakar-master-audit-et-controle-de-gestion' },
  { code: 'MP', title: 'Management des Projets', slug: 'esup-dakar-master-management-des-projets' },
  { code: 'DAF', title: 'Droit des Affaires et Fiscalité', slug: 'esup-dakar-master-droit-des-affaires-et-fiscalite' },
  { code: 'BAF', title: 'Banque - Assurance - Finance', slug: 'esup-dakar-master-banque-assurance-finance' },
  { code: 'TL', title: 'Transport Logistique', slug: 'esup-dakar-master-transport-logistique' },
  { code: 'CE', title: 'Communication des entreprises', slug: 'esup-dakar-master-communication-des-entreprises' },
]

export const esupDakarTechProgrammes = [
  { title: 'Agroalimentaire', slug: 'esup-dakar-tech-agroalimentaire', debouches: ['Assistant qualité agroalimentaire', 'Technicien de contrôle hygiène', 'Responsable de ligne de production'] },
  { title: 'Génie civil', slug: 'esup-dakar-tech-genie-civil', debouches: ['Chef d équipe', 'Assistant conducteur de travaux', 'Conducteur de travaux', 'Chef canalisateur', 'Assistant d ingénieur', 'Chef de chantier', 'Dessinateur', 'Projeteur BTP', 'Assistant géomètre'] },
  { title: 'Informatique de gestion', slug: 'esup-dakar-tech-informatique-de-gestion', debouches: ['Analyste programmeur', 'Assistant gestionnaire de bases de données', 'Producteur de sites Web & applications multimédias', 'Technicien en charge de la programmation', 'Assistant chef de projet', 'Assistant comptable', 'Assistant financier', 'Assistant support IT'] },
  { title: 'Webmaster et réseaux sociaux', slug: 'esup-dakar-tech-webmaster-reseaux-sociaux', debouches: ['Développeur multimédia', 'Webmaster', 'Analyste développeur', 'Chargé de production web et digital', 'Webmaster / métiers de l Internet', 'Services informatiques aux organisations'] },
  { title: 'Productions audiovisuelles', slug: 'esup-dakar-tech-productions-audiovisuelles', debouches: ['Opérateur de prises de vue', 'Cadreur', 'Caméraman', 'Opérateur son', 'Monteur son', 'Mixeur', 'Sonorisateur', 'Assistant son', 'Monteur postproduction', 'Truquiste', 'Vidéographiste', 'Technicien duplication', 'Assistant de production', 'Responsable planning', 'Régisseur'] },
  { title: 'Infographie', slug: 'esup-dakar-tech-infographie', debouches: ['Game designer', 'Graphiste multimédia', 'Chef de projet multimédia', 'Infographiste effets spéciaux', 'Webdesigner', 'Infographiste images de synthèse', 'Réalisateur 3D', 'Animateur 3D', 'Infographiste de rendu', 'Character designer', 'Designer', 'Créateur concepteur design', 'Concepteur et modélisateur sur ordinateur'] },
  { title: 'Géomatique', slug: 'esup-dakar-tech-geomatique', debouches: ['Technicien géomètre-topographe', 'Modélisateur numérique', 'Génie géomatique pour l aménagement du territoire', 'Cartographe', 'Topographe', 'spécialiste des systèmes d information géographique'] },
  { title: 'Assurance', slug: 'esup-dakar-tech-assurance', debouches: ['Assureur', 'Chargé de clientèle', 'Assistant-assureur', 'Gestionnaire de compte', 'Vendeur en assurances', 'Rédacteur de contrats', 'Expert d assurances', 'Gestionnaire d actifs', 'Chargé d indemnisation', 'Conseiller en produits bancaires ou en finance', 'Commercial technique et de gestion'] },
]

export const esupDakarSanteProgrammes = [
  {
    title: "Infirmier d État",
    slug: "esup-dakar-sante-infirmier-d-etat",
    diploma: "Diplôme d État d Infirmier",
    level: "Licence",
    duration: "3 ans (11 mois / an)",
    description: "Formation certifiante préparant au Diplôme d État d Infirmier pour dispenser des soins préventifs, éducatifs ou curatifs.",
    objectifs: "Former un futur infirmier capable de prendre en charge la santé de l individu, de la famille et de la communauté.",
    competences: JSON.stringify([
      "Prise en charge du malade",
      "Compréhension des problèmes de santé liés à l environnement physique et sociologique",
      "Gestion d une équipe de santé",
      "Accompagnement psychologique des patients",
      "Assistance au personnel médical",
      "Participation à l élaboration du diagnostic et aux interventions",
      "Réalisation des soins infirmiers, gestion de stocks et rédaction administrative"
    ]),
    debouches: JSON.stringify(["Secteur hospitalier public et privé", "Cliniques et centres de santé", "Milieu extrahospitalier, ONG et humanitaire", "Soins à domicile et médecine du travail"]),
    inscription: 150000,
    mensualite: 45000,
    nombreMois: 11,
    scolarite: 600000,
    fraisAnnexes: "Tenue 15 000 FCFA, Vaccination 8 000 FCFA, Stage LSIO1 35 000 FCFA (LSIO2/3 50 000 FCFA)"
  },
  {
    title: "Sage-Femme d État",
    slug: "esup-dakar-sante-sage-femme-d-etat",
    diploma: "Diplôme d État de Sage-Femme",
    level: "Licence",
    duration: "3 ans (11 mois / an)",
    description: "Formation officielle préparant au Diplôme d État de Sage-Femme pour l accompagnement de la grossesse, de l accouchement et de la santé néonatale.",
    objectifs: "Prise en charge des soins pendant la grossesse, accompagnement de l accouchement, soins du post-partum et santé de la mère et de l enfant.",
    competences: JSON.stringify([
      "Suivi prénatal et accouchement",
      "Prévention des pathologies de la grossesse",
      "Soins aux nouveau-nés",
      "Gestion des urgences obstétricales et management d équipe de santé"
    ]),
    debouches: JSON.stringify(["Maternités publiques et privées", "Centres hospitaliers et cliniques", "Cabinets privés et exercice libéral"]),
    inscription: 150000,
    mensualite: 45000,
    nombreMois: 11,
    scolarite: 600000,
    fraisAnnexes: "Tenue 15 000 FCFA, Vaccination 8 000 FCFA, Stage LSIO1 35 000 FCFA (LSIO2/3 50 000 FCFA)"
  },
  {
    title: "Assistant Infirmier",
    slug: "esup-dakar-sante-assistant-infirmier",
    diploma: "Diplôme d État d Assistant Infirmier",
    level: "BT",
    duration: "2 ans",
    description: "Formation diplômante d Assistant Infirmier pour seconder l équipe médicale et apporter les soins de base aux patients.",
    objectifs: "Assister les infirmiers d État et les médecins dans l administration des soins et le confort des malades.",
    competences: JSON.stringify(["Soins de base et d hygiène", "Prise des constantes", "Assistance au brancardage et confort des patients"]),
    debouches: JSON.stringify(["Postes de santé", "Centres de santé", "Cliniques privées"]),
    inscription: 120000,
    mensualite: 35000,
    nombreMois: 10,
    scolarite: 470000,
    fraisAnnexes: "Tenue 15 000 FCFA, Vaccination 8 000 FCFA, Stage AI1 35 000 FCFA (AI2 40 000 FCFA)"
  },
  {
    title: "BTS / Secrétaire Médical",
    slug: "esup-dakar-sante-bts-secretaire-medical",
    diploma: "BTS Secrétariat Médical",
    level: "BTS",
    duration: "2 ans (10 mois / an)",
    description: "Formation supérieure en secrétariat et gestion administrative médicale.",
    objectifs: "Assurer la gestion de l accueil, des dossiers médicaux et du secrétariat dans les structures de santé.",
    competences: JSON.stringify(["Gestion du dossier médical", "Accueil physique et téléphonique", "Terminologie médicale et informatique santé"]),
    debouches: JSON.stringify(["Secrétaire médical en cabinet ou clinique", "Gestionnaire d accueil hospitalier", "Assistant de laboratoire"]),
    inscription: 150000,
    mensualite: 50000,
    nombreMois: 10,
    scolarite: 650000,
    fraisAnnexes: "Blouse blanche, Vaccination, Assurance, Frais de stage 60 000 FCFA"
  },
  {
    title: "Assistant Sanitaire & Métiers Paramédicaux",
    slug: "esup-dakar-sante-assistant-sanitaire",
    diploma: "Certificat Paramédical",
    level: "BT",
    duration: "2 ans",
    description: "Formation pratique préparant aux métiers d assistance sanitaire et secours de proximité.",
    objectifs: "Fournir un appui sanitaire de premier niveau dans les collectivités et structures de santé.",
    competences: JSON.stringify(["Premiers secours", "Hygiène publique", "Sensibilisation communautaire"]),
    debouches: JSON.stringify(["Centres communautaires", "ONG paramédicales", "Structures d aide à domicile"]),
    inscription: 100000,
    mensualite: 30000,
    nombreMois: 10,
    scolarite: 400000,
    fraisAnnexes: "Tenue et vaccination"
  }
]

async function importEsupComplete() {
  console.log('=== DÉBUT DE L IMPORTATION EXHAUSTIVE DE L ÉCOSYSTÈME ESUP DAKAR ===\n')

  const partner = await prisma.partner.findFirst()
  if (!partner) throw new Error('Partenaire non trouvé.')

  // 1. ESUP Dakar (Commerce, Management, Gestion)
  let etabDakar = await prisma.etablissement.findFirst({
    where: { OR: [{ slug: 'esup-dakar' }, { nom: { contains: 'ESUP Dakar', mode: 'insensitive' } }] }
  })

  const etabDakarData = {
    nom: "ESUP Dakar — École Supérieure de Commerce et de Management",
    slug: "esup-dakar",
    ville: "Dakar",
    adresse: "Point E, Avenue Cheikh Anta Diop, Dakar",
    site: "https://esupdakar.sn/",
    phone: "+221338250000",
    email: "contact@esupdakar.sn",
    status: "ACTIVE",
    contactStatus: "VERIFIED",
    resume: "Grande École Supérieure privée de Commerce, Gestion, Droit et Management à Dakar.",
    source: "ESTABLISHMENT"
  }

  if (!etabDakar) {
    etabDakar = await prisma.etablissement.create({ data: etabDakarData })
  } else {
    etabDakar = await prisma.etablissement.update({ where: { id: etabDakar.id }, data: etabDakarData })
  }

  // 2. ESUP Dakar Tech
  let etabTech = await prisma.etablissement.findFirst({
    where: { OR: [{ slug: 'esup-dakar-tech' }, { nom: { contains: 'ESUP Dakar Tech', mode: 'insensitive' } }] }
  })

  const etabTechData = {
    nom: "ESUP Dakar Tech — École Supérieure des Technologies",
    slug: "esup-dakar-tech",
    ville: "Dakar",
    adresse: "Point E / VDN, Dakar",
    site: "https://esupdakar.sn/",
    phone: "+221338250000",
    email: "tech@esupdakar.sn",
    status: "ACTIVE",
    contactStatus: "VERIFIED",
    resume: "École Supérieure spécialisée dans les nouvelles technologies, le génie civil, l infographie, la géomatique et l audiovisuel.",
    source: "ESTABLISHMENT"
  }

  if (!etabTech) {
    etabTech = await prisma.etablissement.create({ data: etabTechData })
  } else {
    etabTech = await prisma.etablissement.update({ where: { id: etabTech.id }, data: etabTechData })
  }

  // 3. ESUP Dakar Santé
  let etabSante = await prisma.etablissement.findFirst({
    where: { OR: [{ slug: 'esup-dakar-sante' }, { nom: { contains: 'ESUP Dakar Santé', mode: 'insensitive' } }] }
  })

  const etabSanteData = {
    nom: "ESUP Dakar Santé — École Supérieure des Sciences de la Santé",
    slug: "esup-dakar-sante",
    ville: "Dakar",
    adresse: "Point E, Dakar",
    site: "https://esupdakar.sn/",
    phone: "+221338250000",
    email: "sante@esupdakar.sn",
    status: "ACTIVE",
    contactStatus: "VERIFIED",
    resume: "École de référence formant les Infirmiers d État, Sages-Femmes d État, Assistants Infirmiers et professionnels paramédicaux.",
    source: "ESTABLISHMENT"
  }

  if (!etabSante) {
    etabSante = await prisma.etablissement.create({ data: etabSanteData })
  } else {
    etabSante = await prisma.etablissement.update({ where: { id: etabSante.id }, data: etabSanteData })
  }

  console.log(`Établissements prêts :`)
  console.log(`- ${etabDakar.nom} (${etabDakar.slug})`)
  console.log(`- ${etabTech.nom} (${etabTech.slug})`)
  console.log(`- ${etabSante.nom} (${etabSante.slug})\n`)

  let createdProgCount = 0
  let updatedProgCount = 0

  // A. Import Licences ESUP Dakar Commerce
  for (const item of esupDakarCommerceLicences) {
    const progData = {
      etablissementId: etabDakar.id,
      partnerId: partner.id,
      slug: item.slug,
      titre: item.title,
      ville: 'Dakar',
      niveau: 'Licence',
      duree: '3 ans',
      devise: 'FCFA',
      fraisDossier: 20000,
      fraisDossierEtranger: 30000,
      description: `Formation supérieure en ${item.title} dispensée à ESUP Dakar.`,
      objectifs: `Former des cadres compétents en ${item.title} adaptés aux entreprises africaines et internationales.`,
      competences: JSON.stringify([`Maîtrise opérationnelle en ${item.title}`, 'Gestion de projet et management d équipe', 'Capacité d analyse et de décision']),
      debouches: JSON.stringify([`Cadre / Assistant en ${item.title}`, 'Gestionnaire de projet', 'Consultant junior']),
      secteurs: 'Commerce, Gestion, Services, Entreprises privées et Administrations',
      conditionsAdmission: 'Admission sur étude de dossier et entretien. Titulaire du BAC toutes séries ou équivalent.',
      documentsRequis: 'Copie légalisée CNI, Relevé et Attestation du BAC, Bulletins de Terminale, Extrait d acte de naissance, 2 photos d identité.',
      modalites: 'Cours du jour et cours du soir.',
      stage: 'Stage professionnel obligatoire.',
      examens: 'Contrôle continu + Examens semestriels + Soutenance de mémoire en L3.',
      poursuiteEtudes: 'Master Professionnel ou Master Spécialisé.',
      sourceType: 'DOCUMENT_OFFICIEL_ETABLISSEMENT',
      sourceUrl: 'https://esupdakar.sn/',
      status: 'ACTIVE'
    }

    let p = await prisma.programme.findFirst({ where: { etablissementId: etabDakar.id, slug: item.slug } })
    if (!p) {
      p = await prisma.programme.create({ data: progData })
      createdProgCount++
    } else {
      p = await prisma.programme.update({ where: { id: p.id }, data: progData })
      updatedProgCount++
    }

    // Tarifs et Bourse Entière 2026-2027
    const tarifData = {
      programmeId: p.id,
      anneeAcademique: '2026-2027',
      label: 'Bourse Entière 2026-2027 (Licence 1/2/3)',
      montant: 600000, // Tarif public référence
      montantBourse: 375000, // Scolarité boursière L2/L3
      fraisInscription: 150000,
      mensualite: 45000,
      nombreMois: 10,
      fraisSoutenance: 75000,
      fraisUniforme: 60000,
      isDefault: true,
      status: 'ACTIVE'
    }

    let t = await prisma.tarif.findFirst({ where: { programmeId: p.id, anneeAcademique: '2026-2027' } })
    if (!t) await prisma.tarif.create({ data: tarifData })
    else await prisma.tarif.update({ where: { id: t.id }, data: tarifData })

    let b = await prisma.bourse.findFirst({ where: { programmeId: p.id } })
    const bourseData = {
      slug: `bourse-${item.slug}`,
      programmeId: p.id,
      partnerId: partner.id,
      titre: `Bourse ${item.title}`,
      coveragePercent: 38, // 375k vs 600k (37.5% economie)
      montantMax: 375000,
      quota: 50,
      dateLimite: new Date('2026-11-30'),
      conditions: 'Bourse Entière accordée sur étude de dossier par la commission ESUP Dakar & BourseFi.',
      documentsRequis: 'Copie CNI, Relevé de BAC, 2 photos d identité.',
      status: 'ACTIVE',
      isActive: true
    }
    if (!b) await prisma.bourse.create({ data: bourseData })
    else await prisma.bourse.update({ where: { id: b.id }, data: bourseData })
  }

  // B. Import Masters ESUP Dakar Commerce
  for (const item of esupDakarCommerceMasters) {
    const progData = {
      etablissementId: etabDakar.id,
      partnerId: partner.id,
      slug: item.slug,
      titre: item.title,
      ville: 'Dakar',
      niveau: 'Master',
      duree: '2 ans',
      devise: 'FCFA',
      fraisDossier: 20000,
      fraisDossierEtranger: 30000,
      description: `Formation Master Professionnel en ${item.title} dispensée à ESUP Dakar.`,
      objectifs: `Former des experts hautement qualifiés et futurs dirigeants en ${item.title}.`,
      competences: JSON.stringify([`Expertise stratégique en ${item.title}`, 'Pilotage d organisation et prise de décision', 'Audit, conseil et stratégie d entreprise']),
      debouches: JSON.stringify([`Directeur / Responsable en ${item.title}`, 'Consultant senior', 'Chef de département']),
      secteurs: 'Banque, Finance, Multionales, Cabinet d audit et Grandes entreprises',
      conditionsAdmission: 'Étude de dossier, CV, diplômes à partir du BAC, relevés des 3 dernières années d études supérieures et entretien.',
      documentsRequis: 'CV, copies légalisées diplômes et relevés post-bac, CNI ou passeport, attestation expérience professionnelle le cas échéant.',
      modalites: 'Cours du soir et séminaires professionnels.',
      stage: 'Stage stratégique ou projet professionnel en entreprise.',
      examens: 'Évaluations modulaires + Grand Oral + Soutenance de mémoire en M2.',
      poursuiteEtudes: 'Doctorat, MBA International ou Certifications d expertise.',
      sourceType: 'DOCUMENT_OFFICIEL_ETABLISSEMENT',
      sourceUrl: 'https://esupdakar.sn/',
      status: 'ACTIVE'
    }

    let p = await prisma.programme.findFirst({ where: { etablissementId: etabDakar.id, slug: item.slug } })
    if (!p) {
      p = await prisma.programme.create({ data: progData })
      createdProgCount++
    } else {
      p = await prisma.programme.update({ where: { id: p.id }, data: progData })
      updatedProgCount++
    }

    // Tarifs Master Bourse Entière 2026-2027
    const tarifData = {
      programmeId: p.id,
      anneeAcademique: '2026-2027',
      label: 'Bourse Entière Master 2026-2027',
      montant: 850000,
      montantBourse: 625000, // M2 (inc. 100k soutenance)
      fraisInscription: 200000,
      mensualite: 60000,
      nombreMois: 7,
      fraisSoutenance: 100000,
      isDefault: true,
      status: 'ACTIVE'
    }

    let t = await prisma.tarif.findFirst({ where: { programmeId: p.id, anneeAcademique: '2026-2027' } })
    if (!t) await prisma.tarif.create({ data: tarifData })
    else await prisma.tarif.update({ where: { id: t.id }, data: tarifData })

    let b = await prisma.bourse.findFirst({ where: { programmeId: p.id } })
    const bourseData = {
      slug: `bourse-${item.slug}`,
      programmeId: p.id,
      partnerId: partner.id,
      titre: `Bourse ${item.title}`,
      coveragePercent: 26, // 625k vs 850k (26.47%)
      montantMax: 625000,
      quota: 50,
      dateLimite: new Date('2026-11-30'),
      conditions: 'Bourse Entière Master attribuée sur dossier académique et projet professionnel.',
      documentsRequis: 'CV, Diplômes post-bac, Relevés de notes, 2 photos d identité.',
      status: 'ACTIVE',
      isActive: true
    }
    if (!b) await prisma.bourse.create({ data: bourseData })
    else await prisma.bourse.update({ where: { id: b.id }, data: bourseData })
  }

  // C. Import ESUP Dakar Tech (8 programmes)
  for (const item of esupDakarTechProgrammes) {
    const progData = {
      etablissementId: etabTech.id,
      partnerId: partner.id,
      slug: item.slug,
      titre: item.title,
      ville: 'Dakar',
      niveau: 'Licence',
      duree: '3 ans (10 mois / an)',
      devise: 'FCFA',
      fraisDossier: 20000,
      fraisDossierEtranger: 30000,
      description: `Formation technologique de pointe en ${item.title} dispensée par ESUP Dakar Tech. Ordinateur offert en spécialisation.`,
      objectifs: `Transmettre des compétences opérationnelles directes en ${item.title} avec ateliers pratiques et projets d entreprise.`,
      competences: JSON.stringify([`Maîtrise technique et outils spécialisés en ${item.title}`, 'Conception, réalisation et maintenance', 'Gestion de projet technique']),
      debouches: JSON.stringify(item.debouches),
      secteurs: 'Technologies, Ingénierie, Entreprises de services du numérique, BTP et Industries',
      conditionsAdmission: 'Examen de dossier et entretien. Titulaire du BAC S, T, L ou diplôme équivalent.',
      documentsRequis: 'Copie légalisée CNI, Attestation BAC, Relevé de notes, 2 photos d identité.',
      modalites: 'Cours du jour avec ateliers informatiques / laboratoires techniques.',
      stage: 'Stage technique obligatoire en entreprise.',
      examens: 'Contrôle continu (40%) + Projets pratiques & Examens (60%).',
      poursuiteEtudes: 'Licence 3 Spécialisée, Master Tech ou Certifications internationales.',
      sourceType: 'DOCUMENT_OFFICIEL_ETABLISSEMENT',
      sourceUrl: 'https://esupdakar.sn/',
      status: 'ACTIVE'
    }

    let p = await prisma.programme.findFirst({ where: { etablissementId: etabTech.id, slug: item.slug } })
    if (!p) {
      p = await prisma.programme.create({ data: progData })
      createdProgCount++
    } else {
      p = await prisma.programme.update({ where: { id: p.id }, data: progData })
      updatedProgCount++
    }

    // Tarifs ESUP Tech 2026-2027 (700 000 FCFA scolarité + 60 000 uniforme)
    const tarifData = {
      programmeId: p.id,
      anneeAcademique: '2026-2027',
      label: 'Grille Officielle 2026-2027 ESUP Tech',
      montant: 700000,
      montantBourse: 700000,
      fraisInscription: 140000,
      mensualite: 80000,
      nombreMois: 7,
      fraisUniforme: 60000,
      isDefault: true,
      status: 'ACTIVE'
    }

    let t = await prisma.tarif.findFirst({ where: { programmeId: p.id, anneeAcademique: '2026-2027' } })
    if (!t) await prisma.tarif.create({ data: tarifData })
    else await prisma.tarif.update({ where: { id: t.id }, data: tarifData })

    let b = await prisma.bourse.findFirst({ where: { programmeId: p.id } })
    const bourseData = {
      slug: `bourse-${item.slug}`,
      programmeId: p.id,
      partnerId: partner.id,
      titre: `Financement Conventionné ${item.title}`,
      coveragePercent: 0, // Ordinateur offert + Tarif officiel direct sans fausse réduction
      montantMax: 700000,
      quota: 50,
      dateLimite: new Date('2026-11-30'),
      conditions: 'Admission sur dossier. Ordinateur portable offert au moment des cours de spécialisation.',
      documentsRequis: 'Copie CNI, Relevé de BAC, 2 photos.',
      status: 'ACTIVE',
      isActive: true
    }
    if (!b) await prisma.bourse.create({ data: bourseData })
    else await prisma.bourse.update({ where: { id: b.id }, data: bourseData })
  }

  // D. Import ESUP Dakar Santé (5 programmes)
  for (const item of esupDakarSanteProgrammes) {
    const progData = {
      etablissementId: etabSante.id,
      partnerId: partner.id,
      slug: item.slug,
      titre: item.title,
      ville: 'Dakar',
      niveau: item.level,
      duree: item.duration,
      devise: 'FCFA',
      fraisDossier: 20000,
      fraisDossierEtranger: 30000,
      description: item.description,
      objectifs: item.objectifs,
      competences: item.competences,
      debouches: item.debouches,
      secteurs: 'Santé publique et privée, Hôpitaux, Maternités, Cliniques et Humanitaire',
      conditionsAdmission: 'Deux photocopies légalisées du diplôme requis (BAC ou BFEM), extrait de naissance, casier judiciaire, certificat de nationalité, certificat de visite et contre-visite médical.',
      documentsRequis: '2 photocopies légalisées diplôme, Extrait de naissance, Casier judiciaire, Certificat de nationalité, Certificat médical visite/contre-visite, CNI, 4 photos d identité.',
      modalites: 'Enseignements théoriques, travaux pratiques en laboratoires de simulation et stages hospitaliers / ruraux.',
      stage: 'Stages hospitaliers et ruraux obligatoires à chaque année d études.',
      examens: 'Évaluations théoriques + Épreuves pratiques cliniques + Examen d État / Soutenance.',
      poursuiteEtudes: 'Spécialisations paramédicales, Licence / Master en Sciences Infirmières et de Maïeutique.',
      sourceType: 'DOCUMENT_OFFICIEL_ETABLISSEMENT',
      sourceUrl: 'https://esupdakar.sn/',
      status: 'ACTIVE'
    }

    let p = await prisma.programme.findFirst({ where: { etablissementId: etabSante.id, slug: item.slug } })
    if (!p) {
      p = await prisma.programme.create({ data: progData })
      createdProgCount++
    } else {
      p = await prisma.programme.update({ where: { id: p.id }, data: progData })
      updatedProgCount++
    }

    // Tarifs Santé
    const tarifData = {
      programmeId: p.id,
      anneeAcademique: '2026-2027',
      label: `Grille Officielle Santé 2026-2027 (${item.title})`,
      montant: item.scolarite,
      montantBourse: item.scolarite,
      fraisInscription: item.inscription,
      mensualite: item.mensualite,
      nombreMois: item.nombreMois,
      isDefault: true,
      status: 'ACTIVE'
    }

    let t = await prisma.tarif.findFirst({ where: { programmeId: p.id, anneeAcademique: '2026-2027' } })
    if (!t) await prisma.tarif.create({ data: tarifData })
    else await prisma.tarif.update({ where: { id: t.id }, data: tarifData })

    let b = await prisma.bourse.findFirst({ where: { programmeId: p.id } })
    const bourseData = {
      slug: `bourse-${item.slug}`,
      programmeId: p.id,
      partnerId: partner.id,
      titre: `Formation Santé - ${item.title}`,
      coveragePercent: 0, // Inscription directe avec grille officielle Santé
      montantMax: item.scolarite,
      quota: 40,
      dateLimite: new Date('2026-11-30'),
      conditions: `Admission sur dossier médical et diplôme. Frais annexes : ${item.fraisAnnexes}.`,
      documentsRequis: 'Diplômes légalisés, Casier judiciaire, Certificat médical, CNI, Photos.',
      status: 'ACTIVE',
      isActive: true
    }
    if (!b) await prisma.bourse.create({ data: bourseData })
    else await prisma.bourse.update({ where: { id: b.id }, data: bourseData })
  }

  // Nettoyage des bourses externes et anciennes fiches génériques
  await prisma.bourse.deleteMany({ where: { slug: { startsWith: 'bourse-externe-' } } })
  await prisma.tarif.deleteMany({ where: { label: { contains: 'Bourse Externe' } } })
  const officialSlugs = new Set([
    ...esupDakarCommerceLicences.map(i => i.slug),
    ...esupDakarCommerceMasters.map(i => i.slug),
    ...esupDakarTechProgrammes.map(i => i.slug),
    ...esupDakarSanteProgrammes.map(i => i.slug),
  ])

  const allEsupProgs = await prisma.programme.findMany({
    where: { etablissementId: etabDakar.id },
    include: { bourses: true, tarifs: true, candidatures: true },
  })

  let cleanedOldCount = 0
  for (const p of allEsupProgs) {
    if (!officialSlugs.has(p.slug)) {
      if (p.candidatures.length > 0) {
        console.log(`⚠️ ANCIEN PROGRAMME CONSERVÉ car candidatures rattachées : ${p.titre}`)
      } else {
        for (const b of p.bourses) await prisma.bourse.delete({ where: { id: b.id } })
        for (const t of p.tarifs) await prisma.tarif.delete({ where: { id: t.id } })
        await prisma.programme.delete({ where: { id: p.id } })
        cleanedOldCount++
      }
    }
  }

  const finalTotalProgs = await prisma.programme.count({
    where: { etablissement: { slug: { in: ['esup-dakar', 'esup-dakar-tech', 'esup-dakar-sante'] } } }
  })
  const finalTotalBourses = await prisma.bourse.count({
    where: { programme: { etablissement: { slug: { in: ['esup-dakar', 'esup-dakar-tech', 'esup-dakar-sante'] } } } }
  })

  console.log('\n==========================================')
  console.log('RAPPORT D IMPORTATION EXHAUSTIF ESUP DAKAR')
  console.log(`- Nouveaux programmes créés           : ${createdProgCount}`)
  console.log(`- Programmes mis à jour               : ${updatedProgCount}`)
  console.log(`- Anciennes fiches génériques purgées : ${cleanedOldCount}`)
  console.log(`- TOTAL FINAL PROGRAMMES ESUP BDD     : ${finalTotalProgs}`)
  console.log(`- TOTAL FINAL BOURSES ESUP BDD        : ${finalTotalBourses}`)
  console.log('==========================================')
}

importEsupComplete()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
