import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function upsertUser({ name, email, password, role, partnerId = null }) {
  const passwordHash = await hash(password, 10)
  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role, partnerId, emailVerified: true },
    create: { name, email, passwordHash, role, partnerId, emailVerified: true }
  })
}

function normalizeUrl(value) {
  if (!value || typeof value !== 'string') return null
  const v = value.trim()
  if (!v) return null
  return v
}

function dedupeArray(arr) {
  return [...new Set((arr || []).map((x) => String(x).trim()).filter(Boolean))]
}

function buildResume(ecoleData) {
  return `${ecoleData.typeLabel} situé à ${ecoleData.adresse || ecoleData.ville}.${ecoleData.contact ? ` Contact: ${ecoleData.contact}` : ''}`
}

async function seedCmsFromDisk() {
  const root = join(process.cwd(), 'shared')
  const siteSeed = JSON.parse(readFileSync(join(root, 'site-cms-seed.json'), 'utf8'))
  const metiersSeed = JSON.parse(readFileSync(join(root, 'metiers-seed.json'), 'utf8'))

  if ((await prisma.siteContent.count()) === 0) {
    for (const [key, payload] of Object.entries(siteSeed.siteContent || {})) {
      await prisma.siteContent.create({ data: { key, payload } })
    }
  }

  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({
      data: (siteSeed.faq || []).map((item, i) => ({
        question: item.question,
        answer: item.answer,
        sortOrder: i,
        published: true
      }))
    })
  }

  if ((await prisma.testimonialItem.count()) === 0) {
    await prisma.testimonialItem.createMany({
      data: (siteSeed.testimonials || []).map((item, i) => ({
        sortOrder: i,
        initials: item.initials ?? null,
        name: item.name,
        role: item.role,
        quote: item.quote,
        avatarUrl: item.avatarUrl ?? null,
        ecoleNom: item.ecoleNom ?? null,
        partenaireNom: item.partenaireNom ?? null,
        published: true
      }))
    })
  }

  if ((await prisma.metierPage.count()) === 0) {
    await prisma.metierPage.createMany({
      data: (metiersSeed || []).map((m) => ({
        slug: m.slug,
        sortOrder: m.sortOrder,
        published: m.published,
        label: m.label,
        shortDescription: m.shortDescription,
        salary: m.salary,
        employability: m.employability,
        salaryNote: m.salaryNote,
        missions: m.missions,
        skills: m.skills,
        career: m.career,
        coverImageUrl: m.coverImageUrl ?? null
      }))
    })
  }
}

const ECOLES_DATA = [
  {
    slug: 'imtech-nelson-mandela',
    nom: 'IMTECH  Institut de Management et de Technologie Nelson Mandela',
    ville: 'Dakar',
    adresse: 'Rond-point Castor x Avenue Bourguiba, Dakar',
    site: 'imtech-nelsonmandela.com',
    contact: '33 825 58 21',
    logoUrl: null,
    coverImageUrl: 'https://www.sencampus.com/api/media/file/imtech-nelson-mandela-1.jpg',
    typeLabel: 'Institut de Management et Technologie',
    formations: [
      { niveau: 'BTS/DT', filieres: ['Management', 'Génie Civil', 'Électromécanique', 'Informatique', 'Marketing', 'Logistique', 'Comptabilité'] },
      { niveau: 'Licence', filieres: ['Management International', 'Banque-Assurance', 'Comptabilité-Contrôle-Audit (CCA)', 'Électronique-Électrotechnique-Automatique (EEA)', 'Marketing/Études'] },
      { niveau: 'Master', filieres: ['Finance et Gestion d\'Entreprises', 'Technologies de l\'Information', 'Innovation et Responsabilité Sociétale (RSE)'] }
    ]
  },
  {
    slug: 'isdb-dakar',
    nom: 'ISDB  Institut Supérieur Dakar Banlieue',
    ville: 'Dakar',
    adresse: 'Parcelles Assainies Unité 6 N°518, à côté du Lycée des Parcelles Assainies (LPA) et station Shell, Dakar',
    site: 'isdb.sn',
    contact: '77 544 52 41',
    logoUrl: 'https://www.sencampus.com/api/media/file/isdb.jpg',
    coverImageUrl: 'https://www.sencampus.com/api/media/file/isdb-institut-superieur-de-formation.webp',
    typeLabel: 'Institut Supérieur',
    formations: [
      { niveau: 'DT/DTS/BEP/BTS', filieres: ['Transit douane (2 ans)', 'Hôtellerie-restauration (2 ans)', 'Comptabilité gestion de caisse', 'Secrétariat bureautique informatique', 'Infographie'] },
      { niveau: 'Licence Professionnelle', filieres: ['Droit des affaires', 'Transport Logistique', 'Gestion des entreprises', 'Marketing-Communication', 'Banque-Finance-Assurance', 'Hôtellerie-Tourisme', 'Comptabilité-Gestion', 'GRH', 'Journalisme-Communication', 'Informatique de gestion', 'Informatique réseaux'] },
      { niveau: 'Master', filieres: ['Gestion de projets et Système d\'Information', 'Gestion et aménagement urbains', 'Marketing-Communication', 'Comptabilité-Contrôle-Audit', 'Gestion des services sanitaires et sociaux'] }
    ]
  },
  {
    slug: 'estg-dakar',
    nom: 'ESTG  École Supérieure des Techniques de Gestion',
    ville: 'Dakar',
    adresse: 'Sicap/Liberté 4, Lot 5001, Dakar (côté camp des sapeurs-pompiers)',
    site: 'estg.sn',
    contact: null,
    logoUrl: 'https://www.sencampus.com/api/media/file/logo-estg-ecole-superieure-des-techniques-de-gestion.jpg',
    coverImageUrl: 'https://www.sencampus.com/api/media/file/ESTG-ecole-superieur-des-techniques-de-gestions.jpg',
    typeLabel: 'École Supérieure de Gestion',
    formations: [
      { niveau: 'BTS/Bachelor', filieres: ['Audit et Contrôle de Gestion', 'Communication et Publicité', 'Banque-Finance-Assurance'] },
      { niveau: 'Licence Professionnelle', filieres: ['Gestion Financière et Comptable', 'Achats et Logistique', 'Transport Logistique', 'Communication et Publicité', 'Marketing Opérationnel et Action Commerciale', 'Assistanat de Gestion', 'Banque-Finance-Assurance', 'GRH', 'Commerce International'] },
      { niveau: 'Master Professionnel', filieres: ['Marketing-Communication', 'Communication et Marketing Numérique', 'Gestion des Ressources Humaines', 'Gestion Financière et Comptable', 'Management et Stratégie d\'Entreprise', 'Qualité Hygiène Sécurité Environnement (QHSE)', 'Transport Logistique'] }
    ]
  },
  {
    slug: 'hecm-dakar',
    nom: 'HECM  Espace HECM – Hautes Études de Coaching et de Management',
    ville: 'Dakar',
    adresse: 'Liberté 4, Allées Khalifa Ababacar Sy, villa 5015, Dakar (près du camp des sapeurs-pompiers)',
    site: 'hecm-dakar.com',
    contact: '33 843 55 39',
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'École de Coaching et Management',
    formations: [
      { niveau: 'BTS', filieres: ['Comptabilité et fiscalité', 'Marketing et Communication Digitale'] },
      { niveau: 'Licence', filieres: ['Comptabilité et fiscalité', 'Finance-Banque-Assurances', 'Journalisme et information', 'Marketing et Communication Digitale', 'Ressources Humaines', 'Services de Transport/Logistique', 'Technologies de l\'Information et de la Communication (TIC)'] },
      { niveau: 'Master', filieres: ['Gestion des Ressources Humaines', 'Marketing-Communication Digitale', 'Finance-Banque-Assurances', 'Transport-Logistique'] }
    ]
  },
  {
    slug: 'abs-school-dakar',
    nom: 'ABS School  African Business School',
    ville: 'Dakar',
    adresse: 'Sicap Liberté 2, derrière le rond-point Jet d\'Eau, villa n°1589, Dakar',
    site: 'abs-ao.com',
    contact: '77 123 41 41',
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Business School',
    formations: [
      { niveau: 'BTS', filieres: ['Filières homologuées par le ministère de la Formation professionnelle (transit-douane, gestion, etc.)'] },
      { niveau: 'Licence', filieres: ['Banque-Assurance', 'Marketing-Communication', 'Commerce International', 'Droit et Contentieux des Affaires', 'Comptabilité-Gestion', 'Transport-Logistique'] },
      { niveau: 'Master', filieres: ['Numérique', 'Finance', 'Commerce', 'Entrepreneuriat'] }
    ]
  },
  {
    slug: 'amdi-afrique',
    nom: 'AMDI  African Millennium Development Institute (AMDI Afrique)',
    ville: 'Dakar',
    adresse: 'VDN, Liberté 6 Extension villa n°05, en face du cimetière Saint-Lazare de Béthanie, Dakar',
    site: 'amdiafrique.com',
    contact: '33 825 72 32',
    logoUrl: null,
    coverImageUrl: 'https://www.sencampus.com/api/media/file/amdi-afrique-sencampus-thumbnail.webp',
    typeLabel: 'Institut de Développement',
    formations: [
      { niveau: 'DT/Diplômes santé d\'État', filieres: ['Infirmier d\'État', 'Sage-femme d\'État', 'Vendeur en Pharmacie', 'Délégation Médicale', 'Secrétaire médicale'] },
      { niveau: 'Licence', filieres: ['Agroalimentaire', 'Géologie-Mines-Pétrochimie', 'Géomatique-Terre-Environnement', 'Génie Électromécanique', 'Génie Électrotechnique-Électronique-Automatique', 'Génie Civil', 'Génie Informatique', 'Technologie des réseaux et télécommunications', 'Électromécanique', 'Économie et Gestion Quantitatives', 'Administration Droit et Fiscalité', 'Journalisme et Communication', 'Marketing Digital et Réseaux Sociaux', 'Transport-Logistique'] },
      { niveau: 'Master', filieres: ['Catalyse en génie pétrochimie', 'Pétrochimie et procédés polymères', 'Automatisation en industries pétrochimiques', 'Analyses Biologiques', 'Banque Privée Internationale', 'Économie Maritime et Portuaire', 'Logistique et Transport International', 'Management de la Qualité', 'GRH', 'Management du Luxe', 'Marketing Digital et Médias Sociaux'] }
    ]
  },
  {
    slug: 'isbd-dakar',
    nom: 'ISBD  International School of Business and Development',
    ville: 'Dakar',
    adresse: 'Mermoz, ancienne piste, Dakar',
    site: 'isbd-school.com',
    contact: null,
    logoUrl: 'https://www.sencampus.com/api/media/file/isbd.jpg',
    coverImageUrl: 'https://www.sencampus.com/api/media/file/isbd-international-school-of-business-and-development-thumbnail.webp',
    typeLabel: 'Business School',
    formations: [
      { niveau: 'Licence', filieres: ['Informatique de gestion', 'Marketing et Communication', 'Ressources Humaines', 'Transport Logistique'] },
      { niveau: 'Master', filieres: ['Comptabilité financière et gestion budgétaire'] }
    ]
  },
  {
    slug: 'cefas-senegal',
    nom: 'CEFAS  Centre de Formation Africain du Sénégal',
    ville: 'Dakar',
    adresse: 'Cité Keur Damel, en face de Yenguoulène, avant le rond-point 26 des Parcelles Assainies, Dakar',
    site: 'cefas-senegal.com',
    contact: '77 868 57 27',
    logoUrl: null,
    coverImageUrl: 'https://www.sencampus.com/api/media/file/cefas-sencampus-thumbnail.webp',
    typeLabel: 'Centre de Formation',
    formations: [
      { niveau: 'BT/BTS/DTS', filieres: ['Analyse Biologique (Santé)', 'Filières Techniques (électricité, mécanique, génie industriel)', 'Département Santé'] },
      { niveau: 'Licence', filieres: ['Banque-Finance-Assurance', 'Commerce International', 'Comptabilité-Gestion', 'Gestion des entreprises', 'GRH', 'Marketing-Communication', 'Transport-Logistique', 'Journalisme et Communication', 'Génie Informatique', 'Informatique de Gestion'] },
      { niveau: 'Master', filieres: ['Gestion des entreprises', 'Génie Informatique', 'Informatique de Gestion'] }
    ]
  },
  {
    slug: 'sup-immo-dakar',
    nom: 'SUP\'IMMO  Sup\'Immo Dakar – École Supérieure de l\'Immobilier',
    ville: 'Dakar',
    adresse: 'Liberté 6 Extension, en face de la pharmacie Leclerc, Dakar',
    site: 'groupesupimmo.com',
    contact: '78 222 90 90',
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'École de l\'Immobilier',
    formations: [
      { niveau: 'Certificat', filieres: ['Certificat Professionnel de l\'Immobilier (CPI, 6 mois)'] },
      { niveau: 'Diplôme d\'école', filieres: ['Diplôme d\'Agent Immobilier (DAI, 9 mois)', 'Diplôme Professionnel de l\'Immobilier (DPI)'] },
      { niveau: 'Licence Professionnelle', filieres: ['Gestion immobilière', 'Droit immobilier et foncier', 'Bâtiment et Génie Civil', 'Fiscalité immobilière'] }
    ]
  },
  {
    slug: 'ipd-thomas-sankara',
    nom: 'IPD Thomas Sankara  Institut Polytechnique de Dakar « Thomas Sankara »',
    ville: 'Dakar',
    adresse: 'N°8477, Sud Foire, Dakar (près du SAMU municipal)',
    site: 'ipd.sn',
    contact: '33 867 90 45',
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Institut Polytechnique',
    formations: [
      { niveau: 'BTS/DTS', filieres: ['Informatique', 'Réseaux/TIC', 'Génie Civil', 'Comptabilité', 'Transport-Logistique'] },
      { niveau: 'Licence', filieres: ['Informatique', 'Génie Logiciel', 'Réseaux/TIC', 'Électrotechnique', 'IA', 'Génie Civil', 'Comptabilité', 'RH', 'Marketing', 'Finance', 'QHSE', 'Commerce International', 'Gestion de projet', 'Audit', 'Transport', 'Transit'] },
      { niveau: 'Master', filieres: ['Mêmes filières que la Licence, poursuivies en 2ᵉ cycle'] }
    ]
  },
  {
    slug: 'esup-dakar',
    nom: 'ESUP Dakar  Groupe ESUP Dakar (Commerce et Gestion / Tech / Santé)',
    ville: 'Dakar',
    adresse: 'Sacré-Cœur III, villas N°9256/9255, VDN, Dakar',
    site: 'esupdakar.sn',
    contact: '33 867 07 90',
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Groupe d\'enseignement supérieur',
    formations: [
      { niveau: 'BTS/DTS', filieres: ['Administration et Gestion des Entreprises', 'Informatique', 'Télécommunications', 'Réseaux et Sécurité informatique', 'Génie Électrique', 'Génie Industriel'] },
      { niveau: 'Licence', filieres: ['Administration et Gestion des Entreprises', 'Communication d\'entreprise', 'Transport-Logistique', 'Banque-Assurance-Finance'] },
      { niveau: 'Santé', filieres: ['Formations aux métiers paramédicaux'] }
    ]
  },
  {
    slug: 'ifaa-dakar',
    nom: 'IFAA  Institut de Formation en Administration des Affaires',
    ville: 'Dakar',
    adresse: 'Cité SIPRES 2, face VDN, villa n°2, Dakar (annexe Parcelles Assainies)',
    site: 'ifaa.sn',
    contact: '33 867 36 35',
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Institut de Formation',
    formations: [
      { niveau: 'BTS/DTS', filieres: ['Banque-Finance-Assurance', 'Comptabilité-Gestion', 'Marketing', 'Commerce International', 'Transport-Logistique'] },
      { niveau: 'Bachelor/Licence', filieres: ['Ressources Humaines', 'Management', 'Agroalimentaire', 'Informatique de Gestion', 'Comptabilité-Gestion', 'Banque-Finance-Assurance'] },
      { niveau: 'Master', filieres: ['Management', 'RH', 'Finance', 'Masters spécialisés santé'] }
    ]
  },
  {
    slug: 'ensup-afrique-dakar',
    nom: 'ENSUP Afrique  Enseignement Supérieur de la Gestion, des Finances et de l\'Administration',
    ville: 'Dakar',
    adresse: 'Liberté 6 Extension, villa n°205, en face du Camp Leclerc, Dakar',
    site: 'ensupafrique.com',
    contact: null,
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'École Supérieure',
    formations: [
      { niveau: 'BTS', filieres: ['Comptabilité-Gestion', 'GRH', 'Marketing', 'Transport-Logistique'] },
      { niveau: 'Licence', filieres: ['Comptabilité-Gestion', 'Communication-Journalisme', 'GRH', 'Gestion du Transport et de la Logistique', 'Banque-Finance-Assurance', 'Administration des biens et Gestion immobilière', 'Marketing', 'Gestion administrative et des collectivités'] },
      { niveau: 'Master', filieres: ['Comptabilité-Gestion', 'Communication-Journalisme', 'Passation des marchés publics GRH', 'Transport-Logistique'] }
    ]
  },
  {
    slug: 'elite-sante',
    nom: 'Élite Santé  Institut Élite Santé (IES)',
    ville: 'Keur Massar',
    adresse: 'Keur Massar (Aïnoumadi) ; campus à Pikine/Guédiawaye, Avenue Bourguiba, Thiès, Kaolack, Touba',
    site: 'groupelitesante.com',
    contact: null,
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Institut de Santé',
    formations: [
      { niveau: 'Diplômes d\'État', filieres: ['Sage-femme d\'État', 'Infirmier d\'État', 'Assistant infirmier'] },
      { niveau: 'Licence', filieres: ['Licence en Sciences infirmières', 'Licence en Sciences obstétricales', 'Licence en Biologie Médicale'] },
      { niveau: 'Spécialisations', filieres: ['Infirmier de bloc opératoire', 'Délégué médical'] }
    ]
  },
  {
    slug: 'img-rufisque',
    nom: 'IMG (Rufisque)  Institut de Management et de Gestion',
    ville: 'Rufisque',
    adresse: 'Rufisque, Cité Santé Yalla, près du rond-point Socabeg, Lot 9591',
    site: 'groupe-img.com',
    contact: '33 836 62 42',
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Institut de Management',
    formations: [
      { niveau: 'DTS/BEP/DEP', filieres: ['Comptabilité de gestion', 'Transport logistique', 'Marketing et communication', 'Journalisme et Communication'] },
      { niveau: 'Licence Professionnelle', filieres: ['Filières de gestion et management'] }
    ]
  },
  {
    slug: 'afpa-dakar',
    nom: 'AFPA  Africaine des Formations Professionnelles en Alternance',
    ville: 'Colobane',
    adresse: 'Colobane, Dakar',
    site: 'afpa.sn',
    contact: null,
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Formation Professionnelle',
    formations: [
      { niveau: 'BTS', filieres: ['Hôtellerie-Restauration', 'Tourisme', 'Santé', 'Gestion Hôtelière'] },
      { niveau: 'Diplôme de qualification professionnelle', filieres: ['Formations courtes en alternance (agro-business, bâtiment, industrie, hôtellerie de luxe)'] }
    ]
  },
  {
    slug: 'isca-dakar',
    nom: 'ISCA  Institut Supérieur de Commerce et d\'Administration des Affaires',
    ville: 'Dakar',
    adresse: 'Avenue Bourguiba, à 25m du Crédit Mutuel de Castors, face au jardin de Dieuppeul II, Dakar',
    site: 'isca.sn',
    contact: '33 825 02 03',
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Institut Supérieur',
    formations: [
      { niveau: 'DT/DU/DTS/BTS/BT/DUT/Certificat/DEUG', filieres: ['Informatique de Gestion', 'Réseaux Informatique'] },
      { niveau: 'Bachelor/Licence/Licence Professionnelle', filieres: ['Informatique de Gestion', 'Gestion Économique et Financière des Entreprises', 'Maintenance-Réseaux Informatique et Télécommunications', 'Multimédia Numérique'] },
      { niveau: 'Master/Master Professionnel/Master Recherche/MBA', filieres: ['Maintenance-Réseaux Informatiques et Télécoms', 'Marketing-Communication et Action Commerciale', 'Gestion Publique', 'Gestion de Projets', 'Ingénierie Financière', 'Banque-Assurance-Assurance', 'Communication', 'Gestion des Ressources Humaines'] }
    ]
  },
  {
    slug: 'ipg-isti-dakar',
    nom: 'IPG/ISTI  Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle',
    ville: 'Dakar',
    adresse: 'Sicap Sacré-Cœur 2, Immeuble IPG-ISTI, BP 10155, Dakar (2ᵉ site Almadies)',
    site: 'ipg-isti.sn',
    contact: null,
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Groupe d\'Instituts',
    formations: [
      { niveau: 'BTS', filieres: ['Électronique', 'Informatique', 'Froid-Climatisation', 'Électrotechnique', 'Électromécanique'] },
      { niveau: 'Licence', filieres: ['Gestion', 'Finance', 'Affaires', 'Ingénierie'] },
      { niveau: 'Master', filieres: ['Ingénierie (électrotechnique/électromécanique/froid-climatisation)', 'Gestion et Affaires'] }
    ]
  },
  {
    slug: 'smi-thies',
    nom: 'SMI  Sup\'Management Intelligentsia',
    ville: 'Thiès',
    adresse: 'Cité Malick Sy, derrière la station Titan Oil, Thiès (siège aussi Dakar Point E ; campus Ziguinchor)',
    site: 'smi.sn',
    contact: '33 951 66 62',
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'École de Management',
    formations: [
      { niveau: 'BT/BTS/DEC', filieres: ['Comptabilité', 'Gestion', 'Management', 'Commerce', 'Logistique', 'Marketing', 'Informatique'] },
      { niveau: 'Licence', filieres: ['Finance-Comptabilité', 'Commerce International', 'Informatique de Gestion', 'Administration Réseaux', 'Assistanat', 'Banque-Assurance', 'Ingénierie des Systèmes & Réseaux'] },
      { niveau: 'Master', filieres: ['Comptabilité', 'Gestion', 'Management'] }
    ]
  },
  {
    slug: 'essem-sante-mbour',
    nom: 'Essem / ESEM Santé (Mbour)  Institut de formation santé',
    ville: 'Mbour',
    adresse: 'Croisement Saly, Mbour',
    site: null,
    contact: null,
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Institut de Santé',
    formations: [
      { niveau: 'Diplômes/certifications', filieres: ['Secrétariat médical', 'Assistant Infirmier', 'Gestionnaire de pharmacie', 'Délégué Médical', 'Orthoprothésiste'] },
      { niveau: 'Licence', filieres: ['Sciences infirmières / paramédicales'] }
    ]
  },
  {
    slug: 'img-mbour',
    nom: 'IM / IMG (Mbour)  Institut de Management et de Gestion  Campus Mbour',
    ville: 'Mbour',
    adresse: 'Après l\'agence Free de Mbour, intersection LDD (ex-IMG)',
    site: 'imgmbour.com',
    contact: null,
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'Institut de Management',
    formations: [
      { niveau: 'DTS', filieres: ['Comptabilité de gestion', 'Transport logistique', 'Marketing et communication'] },
      { niveau: 'BEP', filieres: ['Comptabilité de gestion', 'Transport logistique', 'Marketing et communication'] },
      { niveau: 'DEP', filieres: ['Comptabilité de gestion', 'Transport logistique', 'Marketing et communication'] },
      { niveau: 'Complémentaires', filieres: ['Journalisme et Communication', 'Santé', 'Restauration'] }
    ]
  },
  {
    slug: 'ensup-afrique-mbour',
    nom: 'ENSUP Afrique (Mbour)  ENSUP Afrique  antenne Mbour',
    ville: 'Mbour',
    adresse: 'Croisement Saly, Mbour',
    site: 'ensupafrique.com',
    contact: null,
    logoUrl: null,
    coverImageUrl: null,
    typeLabel: 'École Supérieure',
    formations: [
      { niveau: 'BTS/Licence/Master', filieres: ['Comptabilité-Gestion', 'GRH', 'Transport-Logistique', 'Banque-Finance-Assurance', 'Marketing', 'Gestion immobilière', 'Marchés publics'] }
    ]
  }
]

async function main() {
  console.log('Suppression des données existantes...')

  await prisma.$transaction([
    prisma.candidature.deleteMany({}),
    prisma.bourse.deleteMany({}),
    prisma.programme.deleteMany({}),
    prisma.etablissement.deleteMany({})
  ])

  console.log('Données principales supprimées')

  const partner = await prisma.partner.upsert({
    where: { slug: 'boursefi-partenaire' },
    update: {
      name: 'BourseFi - Partenaire Principal',
      partnerSharePercent: 75,
      contactEmail: 'contact@boursefi.sn',
      description: 'Partenaire principal pour les bourses d\'études au Sénégal',
      conditions: 'Résidence sénégalaise requise. Dossier complet avant date limite.'
    },
    create: {
      name: 'BourseFi - Partenaire Principal',
      slug: 'boursefi-partenaire',
      partnerSharePercent: 75,
      contactEmail: 'contact@boursefi.sn',
      logoUrl: null,
      description: 'Partenaire principal pour les bourses d\'études au Sénégal',
      conditions: 'Résidence sénégalaise requise. Dossier complet avant date limite.'
    }
  })

  for (const ecoleData of ECOLES_DATA) {
    const ecole = await prisma.etablissement.upsert({
      where: { slug: ecoleData.slug },
      update: {
        nom: ecoleData.nom,
        ville: ecoleData.ville,
        site: normalizeUrl(ecoleData.site),
        resume: buildResume(ecoleData),
        typeLabel: ecoleData.typeLabel,
        logoUrl: normalizeUrl(ecoleData.logoUrl),
        coverImageUrl: normalizeUrl(ecoleData.coverImageUrl)
      },
      create: {
        slug: ecoleData.slug,
        nom: ecoleData.nom,
        ville: ecoleData.ville,
        site: normalizeUrl(ecoleData.site),
        resume: buildResume(ecoleData),
        typeLabel: ecoleData.typeLabel,
        logoUrl: normalizeUrl(ecoleData.logoUrl),
        coverImageUrl: normalizeUrl(ecoleData.coverImageUrl)
      }
    })

    for (const formation of ecoleData.formations) {
      const filieres = dedupeArray(formation.filieres)

      for (const filiere of filieres) {
        const slug = `${ecoleData.slug}-${formation.niveau.toLowerCase().replace(/\s+/g, '-')}-${filiere.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 40)}`
        const titre = `${filiere} (${formation.niveau})`
        const duree =
          ['BTS', 'DTS', 'DT'].includes(formation.niveau) ? '2 ans' :
          formation.niveau === 'Licence' || formation.niveau.includes('Licence') ? '3 ans' :
          formation.niveau === 'Master' || formation.niveau.includes('Master') ? '2 ans' :
          'Variable'

        await prisma.programme.upsert({
          where: { slug },
          update: {
            titre,
            ville: ecoleData.ville,
            duree,
            niveau: formation.niveau,
            description: `Formation en ${filiere} à ${ecoleData.nom}.`,
            eligibilite: 'Selon les exigences de la filière. Contactez l\'établissement pour plus d\'informations.',
            perspectives: 'Débouchés selon la filière choisie.'
          },
          create: {
            slug,
            titre,
            ville: ecoleData.ville,
            duree,
            fraisDossier: 20000,
            fraisDossierEtranger: 30000,
            devise: 'FCFA',
            niveau: formation.niveau,
            description: `Formation en ${filiere} à ${ecoleData.nom}.`,
            eligibilite: 'Selon les exigences de la filière. Contactez l\'établissement pour plus d\'informations.',
            perspectives: 'Débouchés selon la filière choisie.',
            etablissementId: ecole.id,
            partnerId: partner.id
          }
        })
      }
    }
  }

  await Promise.all([
    upsertUser({
      name: 'Admin BourseFi',
      email: 'admin@boursefi.sn',
      password: 'Admin1234!',
      role: 'ADMIN'
    }),
    upsertUser({
      name: 'Partenaire BourseFi',
      email: 'partenaire@boursefi.sn',
      password: 'Partner1234!',
      role: 'PARTNER',
      partnerId: partner.id
    }),
    upsertUser({
      name: 'Etudiant Demo',
      email: 'etudiant@boursefi.sn',
      password: 'Student1234!',
      role: 'STUDENT'
    })
  ])

  const programmes = await prisma.programme.findMany({
    orderBy: { titre: 'asc' }
  })

  const dateLimite = new Date('2026-12-31T23:59:59.000Z')

  for (let i = 0; i < programmes.length; i++) {
    const programme = programmes[i]
    const slug = `bourse-${programme.slug}`
    const isFullScholarship = i % 3 === 0
    const coveragePercent = isFullScholarship ? 100 : 50

    await prisma.bourse.upsert({
      where: { slug },
      update: {
        titre: `Bourse ${programme.titre}`,
        coveragePercent,
        quota: 20,
        dateLimite,
        isActive: true,
        conditions: 'Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.',
        documentsRequis: 'CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.'
      },
      create: {
        slug,
        titre: `Bourse ${programme.titre}`,
        programmeId: programme.id,
        partnerId: partner.id,
        coveragePercent,
        quota: 20,
        dateLimite,
        isActive: true,
        conditions: 'Étudiant sénégalais ou résident. Dossier complet avec CNI et relevés de notes.',
        documentsRequis: 'CNI recto/verso, relevé de notes, diplôme ou attestation de niveau.'
      }
    })
  }

  const fullCount = programmes.filter((_, i) => i % 3 === 0).length
  const halfCount = programmes.length - fullCount
  console.log(`${programmes.length} bourses créées : ${fullCount} complètes (100%) et ${halfCount} demi-bourses (50%).`)

  await seedCmsFromDisk()

  console.log('Seed terminé : écoles, programmes, bourses et utilisateurs créés avec nettoyage préalable.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })