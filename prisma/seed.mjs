import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

/** Visuels écoles : Commons (UCAD, ESP Dakar) + Unsplash pour les autres démos. */
const ETAB_IMG = {
  ucadCover:
    'https://upload.wikimedia.org/wikipedia/commons/e/ea/Biblioth%C3%A9que_universit%C3%A9_cheikh_anta_diop_de_dakar_2.JPG',
  ucadLogo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Logo_Universit%C3%A9_Cheikh-Anta-Diop.svg',
  espCover: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/ESPDakar.jpg',
  ismCover:
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
  autoAcademieCover:
    'https://images.unsplash.com/photo-1631543919368-c16e623648cc?auto=format&fit=crop&w=1200&q=80',
  esgibCover:
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=80',
  esmtCover:
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80'
}

async function upsertUser({ name, email, password, role, partnerId = null }) {
  const passwordHash = await hash(password, 10)
  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role, partnerId },
    create: { name, email, passwordHash, role, partnerId }
  })
}

async function seedCmsFromDisk() {
  const root = join(process.cwd(), 'shared')
  const siteSeed = JSON.parse(readFileSync(join(root, 'site-cms-seed.json'), 'utf8'))
  const metiersSeed = JSON.parse(readFileSync(join(root, 'metiers-seed.json'), 'utf8'))

  if ((await prisma.siteContent.count()) === 0) {
    for (const [key, payload] of Object.entries(siteSeed.siteContent)) {
      await prisma.siteContent.create({ data: { key, payload } })
    }
  }

  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({
      data: siteSeed.faq.map((item, i) => ({
        question: item.question,
        answer: item.answer,
        sortOrder: i,
        published: true
      }))
    })
  }

  if ((await prisma.testimonialItem.count()) === 0) {
    await prisma.testimonialItem.createMany({
      data: siteSeed.testimonials.map((item, i) => ({
        sortOrder: i,
        initials: item.initials ?? null,
        name: item.name,
        role: item.role,
        quote: item.quote,
        avatarUrl: item.avatarUrl ?? null,
        published: true
      }))
    })
  }

  if ((await prisma.metierPage.count()) === 0) {
    await prisma.metierPage.createMany({
      data: metiersSeed.map((m) => ({
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

async function main() {
  const mairie = await prisma.partner.upsert({
    where: { slug: 'mairie-dakar-bourses' },
    update: {
      name: 'Mairie de Dakar - Cellule bourses etudes',
      partnerSharePercent: 75,
      contactEmail: 'bourses.etudes@mairie-dakar.sn'
    },
    create: {
      name: 'Mairie de Dakar - Cellule bourses etudes',
      slug: 'mairie-dakar-bourses',
      partnerSharePercent: 75,
      contactEmail: 'bourses.etudes@mairie-dakar.sn',
      logoUrl: null
    }
  })

  const agence = await prisma.partner.upsert({
    where: { slug: 'agence-regionale-solidarite-education' },
    update: {
      name: 'Agence regionale Solidarite Education SN',
      partnerSharePercent: 70,
      contactEmail: 'contact@ARSE.sn'
    },
    create: {
      name: 'Agence regionale Solidarite Education SN',
      slug: 'agence-regionale-solidarite-education',
      partnerSharePercent: 70,
      contactEmail: 'contact@ARSE.sn'
    }
  })

  const ucad = await prisma.etablissement.upsert({
    where: { slug: 'ucad' },
    update: {
      nom: 'Universite Cheikh Anta Diop',
      ville: 'Dakar',
      accreditation: 'CAMES',
      site: 'https://www.ucad.sn',
      resume:
        'Institution de reference en Afrique de l Ouest pour les sciences economiques, sociales et le numerique applique.',
      coverImageUrl: ETAB_IMG.ucadCover,
      logoUrl: ETAB_IMG.ucadLogo,
      typeLabel: 'Universite publique'
    },
    create: {
      slug: 'ucad',
      nom: 'Universite Cheikh Anta Diop',
      ville: 'Dakar',
      accreditation: 'CAMES',
      site: 'https://www.ucad.sn',
      resume:
        'Institution de reference en Afrique de l Ouest pour les sciences economiques, sociales et le numerique applique.',
      coverImageUrl: ETAB_IMG.ucadCover,
      logoUrl: ETAB_IMG.ucadLogo,
      typeLabel: 'Universite publique'
    }
  })

  const esp = await prisma.etablissement.upsert({
    where: { slug: 'esp' },
    update: {
      nom: 'Ecole Superieure Polytechnique',
      ville: 'Dakar',
      accreditation: 'CTI / CAMES',
      site: 'https://esp.sn',
      resume: 'Formation d excellence en ingenierie, data et cybersecurite pour le continent.',
      coverImageUrl: ETAB_IMG.espCover,
      logoUrl: null,
      typeLabel: 'Ecole d ingenieurs'
    },
    create: {
      slug: 'esp',
      nom: 'Ecole Superieure Polytechnique',
      ville: 'Dakar',
      accreditation: 'CTI / CAMES',
      site: 'https://esp.sn',
      resume: 'Formation d excellence en ingenierie, data et cybersecurite pour le continent.',
      coverImageUrl: ETAB_IMG.espCover,
      logoUrl: null,
      typeLabel: 'Ecole d ingenieurs'
    }
  })

  const ism = await prisma.etablissement.upsert({
    where: { slug: 'ism' },
    update: {
      nom: 'Institut superieur de management',
      ville: 'Dakar',
      accreditation: 'CAMES',
      site: 'https://www.grpism.com',
      resume: 'Grande ecole de management et entrepreneurship en Afrique de l Ouest.',
      coverImageUrl: ETAB_IMG.ismCover,
      logoUrl: null,
      typeLabel: 'Grande ecole de management'
    },
    create: {
      slug: 'ism',
      nom: 'Institut superieur de management',
      ville: 'Dakar',
      accreditation: 'CAMES',
      site: 'https://www.grpism.com',
      resume: 'Grande ecole de management et entrepreneurship en Afrique de l Ouest.',
      coverImageUrl: ETAB_IMG.ismCover,
      logoUrl: null,
      typeLabel: 'Grande ecole de management'
    }
  })

  const autoAcademie = await prisma.etablissement.upsert({
    where: { slug: 'auto-academie-keur-massar' },
    update: {
      nom: 'Auto Academie – Centre de formation professionnelle (Keur Massar)',
      ville: 'Keur Massar',
      accreditation: 'Formation professionnelle',
      site: 'https://example.sn/auto-academie',
      resume:
        'Centre de formation aux metiers de la mecanique automobile et de la maintenance pour une insertion rapide.',
      coverImageUrl: ETAB_IMG.autoAcademieCover,
      logoUrl: null,
      typeLabel: 'Centre de formation professionnelle'
    },
    create: {
      slug: 'auto-academie-keur-massar',
      nom: 'Auto Academie – Centre de formation professionnelle (Keur Massar)',
      ville: 'Keur Massar',
      accreditation: 'Formation professionnelle',
      site: 'https://example.sn/auto-academie',
      resume:
        'Centre de formation aux metiers de la mecanique automobile et de la maintenance pour une insertion rapide.',
      coverImageUrl: ETAB_IMG.autoAcademieCover,
      logoUrl: null,
      typeLabel: 'Centre de formation professionnelle'
    }
  })

  const esgib = await prisma.etablissement.upsert({
    where: { slug: 'esgib' },
    update: {
      nom: 'ESGIB - Ecole Superieure de Genie Industriel et Biologique',
      ville: 'Dakar',
      accreditation: 'CAMES',
      site: 'https://example.sn/esgib',
      resume:
        'Formation en genie industriel et biologique : laboratoires, projets applicatifs et debouches dans l industrie.',
      coverImageUrl: ETAB_IMG.esgibCover,
      logoUrl: null,
      typeLabel: 'Ecole d ingenieurs'
    },
    create: {
      slug: 'esgib',
      nom: 'ESGIB - Ecole Superieure de Genie Industriel et Biologique',
      ville: 'Dakar',
      accreditation: 'CAMES',
      site: 'https://example.sn/esgib',
      resume:
        'Formation en genie industriel et biologique : laboratoires, projets applicatifs et debouches dans l industrie.',
      coverImageUrl: ETAB_IMG.esgibCover,
      logoUrl: null,
      typeLabel: 'Ecole d ingenieurs'
    }
  })

  const esmt = await prisma.etablissement.upsert({
    where: { slug: 'esmt' },
    update: {
      nom: 'Ecole Superieure Multinationale des Telecommunications - ESMT',
      ville: 'Dakar',
      accreditation: 'Cooperations internationales',
      site: 'https://www.esmt.sn',
      resume:
        'Cycle ingenieur et formations superieures orientees reseaux, telecommunications et transformation digitale.',
      coverImageUrl: ETAB_IMG.esmtCover,
      logoUrl: null,
      typeLabel: 'Ecole d ingenieurs'
    },
    create: {
      slug: 'esmt',
      nom: 'Ecole Superieure Multinationale des Telecommunications - ESMT',
      ville: 'Dakar',
      accreditation: 'Cooperations internationales',
      site: 'https://www.esmt.sn',
      resume:
        'Cycle ingenieur et formations superieures orientees reseaux, telecommunications et transformation digitale.',
      coverImageUrl: ETAB_IMG.esmtCover,
      logoUrl: null,
      typeLabel: 'Ecole d ingenieurs'
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'master-finance-numerique-ucad' },
    update: {},
    create: {
      slug: 'master-finance-numerique-ucad',
      titre: 'Master Finance Numerique et Inclusion Bancaire',
      ville: 'Dakar',
      duree: '24 mois',
      fraisDossier: 25000,
      fraisScolarite: 950000,
      devise: 'FCFA',
      niveau: 'Master',
      placement: '92%',
      description:
        'Programme axe fintech, mobile money (Orange / Wave / mix) et gestion du risque dans le cadre UEMOA.',
      eligibilite: 'Licence en economie, gestion ou mathematiques appliquees. Dossier CNI / BAC+3.',
      brochureUrl:
        'https://www.ucad.sn/images/docs/brochure-master-finance-numerique-placeholder.pdf',
      perspectives:
        'Emplois a Dakar ou region : analyste financier junior, conformite paiements, mobilite intra-UEMOA. Insertion projetee forte dans les ecoles locales et administrations.',
      etablissementId: ucad.id,
      partnerId: mairie.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'master-data-science-esp' },
    update: {},
    create: {
      slug: 'master-data-science-esp',
      titre: 'Master Data Science pour la Finance',
      ville: 'Dakar',
      duree: '18 mois',
      fraisDossier: 30000,
      fraisScolarite: 1200000,
      devise: 'FCFA',
      niveau: 'Master',
      placement: '89%',
      description:
        'Machine learning applique au credit scoring, lutte contre la fraude transactionnelle et visualisation temps reel.',
      eligibilite: 'BAC+3 scientifique ou ingenierie, maitrise niveau Bac+ des statistiques de base.',
      brochureUrl:
        'https://www.esp.sn/images/brochure-data-finance-sn-placeholder.pdf',
      perspectives:
        'Postes datascience et ingenierie donnees chez assureurs banques mobiles et hubs fintech dakarois sous 24 mois du diplome.',
      etablissementId: esp.id,
      partnerId: mairie.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'mba-fintech-ism' },
    update: {},
    create: {
      slug: 'mba-fintech-ism',
      titre: 'MBA Fintech et Innovation de Paiement',
      ville: 'Dakar',
      duree: '12 mois',
      fraisDossier: 50000,
      fraisScolarite: 2200000,
      devise: 'FCFA',
      niveau: 'MBA',
      placement: '94%',
      description:
        'Parcours executif strategie produit, partenariats avec operateurs mobiles et infrastructures de paiement nationales.',
      eligibilite: 'BAC+4 minimum, 2 ans experience professionnelle, entretien de motivation.',
      brochureUrl:
        'https://www.grpism.com/docs/mba-fintech-sn-placeholder.pdf',
      perspectives:
        'Leadership projet digital chez PMI senegalaises, fonctions CFO adjoint Innovation, conseil pour bailleurs publics.',
      etablissementId: ism.id,
      partnerId: agence.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'ingenieur-developpement-logiciel-esp' },
    update: {},
    create: {
      slug: 'ingenieur-developpement-logiciel-esp',
      titre: 'Ingenieur developpement logiciel et applications web',
      ville: 'Dakar',
      duree: '36 mois',
      fraisDossier: 28000,
      fraisScolarite: 890000,
      devise: 'FCFA',
      niveau: 'Ingenieur',
      placement: '88%',
      description:
        'Cycle ingenieur axe conception de services web et mobiles, API REST, qualite logicielle et deploiement cloud.',
      eligibilite: 'BAC scientific ou technique, concours national ou dossier selon reglement ESP.',
      brochureUrl: 'https://esp.sn/images/brochure-genie-logiciel-placeholder.pdf',
      perspectives:
        'Developpeur fullstack, ingenieur plateforme web et integrations dans les entreprises et la fintech dakaroise.',
      etablissementId: esp.id,
      partnerId: mairie.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'master-cybersecurite-esp' },
    update: {},
    create: {
      slug: 'master-cybersecurite-esp',
      titre: 'Master Cybersecurite des systemes dinformation',
      ville: 'Dakar',
      duree: '24 mois',
      fraisDossier: 35000,
      fraisScolarite: 1150000,
      devise: 'FCFA',
      niveau: 'Master',
      placement: '86%',
      description:
        'Securite des reseaux, detection dincidents, gouvernance SSI et conformite pour banques et administrations.',
      eligibilite: 'BAC+3 informatique, reseaux ou equivalent; entretien technique.',
      brochureUrl: 'https://esp.sn/images/brochure-cyber-placeholder.pdf',
      perspectives:
        'Analyste SOC, ingenieur securite et consultants cyber pour operateurs critiques au Senegal et en UEMOA.',
      etablissementId: esp.id,
      partnerId: agence.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'msc-marketing-digital-ism' },
    update: {},
    create: {
      slug: 'msc-marketing-digital-ism',
      titre: 'MSC Marketing digital et strategie de marque',
      ville: 'Dakar',
      duree: '18 mois',
      fraisDossier: 40000,
      fraisScolarite: 1650000,
      devise: 'FCFA',
      niveau: 'Master',
      placement: '90%',
      description:
        'Acquisition multicanal, contenus, CRM et pilotage de la performance media pour marques en Afrique de lOuest.',
      eligibilite: 'BAC+3 commerce, communication ou SHS avec projet portfolio numerique.',
      brochureUrl: 'https://www.grpism.com/docs/msc-marketing-digital-placeholder.pdf',
      perspectives:
        'Chef de projet acquisition, social media lead et strategie digitale en agences et grands comptes regionaux.',
      etablissementId: ism.id,
      partnerId: agence.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'master-sante-publique-ucad' },
    update: {},
    create: {
      slug: 'master-sante-publique-ucad',
      titre: 'Master Sante publique et systemes de soins',
      ville: 'Dakar',
      duree: '24 mois',
      fraisDossier: 20000,
      fraisScolarite: 720000,
      devise: 'FCFA',
      niveau: 'Master',
      placement: '82%',
      description:
        'Epidemiologie, sante communautaire et pilotage des programmes nationaux pour hopitaux et ONG.',
      eligibilite: 'Licence sciences de la sante, sciences sociales appliquees ou medecine selon filiere dorigine.',
      brochureUrl: 'https://www.ucad.sn/images/docs/brochure-sante-publique-placeholder.pdf',
      perspectives:
        'Coordination programmes sante, recherche appliquee et gestion de projets bailleurs dans le secteur public.',
      etablissementId: ucad.id,
      partnerId: mairie.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'master-ia-appliquee-esp' },
    update: {},
    create: {
      slug: 'master-ia-appliquee-esp',
      titre: 'Master Intelligence artificielle appliquee',
      ville: 'Dakar',
      duree: '24 mois',
      fraisDossier: 32000,
      fraisScolarite: 1300000,
      devise: 'FCFA',
      niveau: 'Master',
      placement: '87%',
      description:
        'Apprentissage automatique, modeles predictifs et deploiement dIA dans la finance et les services numeriques.',
      eligibilite: 'BAC+3 mathematiques, informatique ou physique avec solides bases en programmation.',
      brochureUrl: 'https://esp.sn/images/brochure-ia-appliquee-placeholder.pdf',
      perspectives:
        'Ingenieur ML, data scientist specialise IA et projets innovation au sein des banques et scale-ups.',
      etablissementId: esp.id,
      partnerId: mairie.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'bts-maintenance-automobile-auto-academie' },
    update: {},
    create: {
      slug: 'bts-maintenance-automobile-auto-academie',
      titre: 'BTS Maintenance des vehicules automobiles',
      ville: 'Keur Massar',
      duree: '24 mois',
      fraisDossier: 15000,
      fraisScolarite: 480000,
      devise: 'FCFA',
      niveau: 'BTS',
      placement: '78%',
      description:
        'Diagnostic, entretien courant et preparation aux certifications professionnelles du secteur automobile.',
      eligibilite: 'BAC ou equivalent technique; motivation pour les metiers de garage et carrosserie.',
      brochureUrl: 'https://example.sn/brochures/bts-auto-placeholder.pdf',
      perspectives:
        'Technicien maintenance, atelier agree et montee en responsabilite dans les reseaux de distribution.',
      etablissementId: autoAcademie.id,
      partnerId: mairie.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'ingenieur-genie-biologique-esgib' },
    update: {},
    create: {
      slug: 'ingenieur-genie-biologique-esgib',
      titre: 'Ingenieur genie biologique et procedes industriels',
      ville: 'Dakar',
      duree: '60 mois',
      fraisDossier: 35000,
      fraisScolarite: 980000,
      devise: 'FCFA',
      niveau: 'Ingenieur',
      placement: '84%',
      description:
        'Bioprocedes, qualite et environnement industriel avec sequences laboratoire et projets en entreprise.',
      eligibilite: 'BAC scientifique; concours ou dossier selon reglement de l ecole.',
      brochureUrl: 'https://example.sn/brochures/esgib-genie-bio-placeholder.pdf',
      perspectives:
        'Industries agroalimentaires, pharmaceutiques et controle qualite dans la zone UEMOA.',
      etablissementId: esgib.id,
      partnerId: mairie.id
    }
  })

  await prisma.programme.upsert({
    where: { slug: 'ingenieur-telecom-esmt' },
    update: {},
    create: {
      slug: 'ingenieur-telecom-esmt',
      titre: 'Ingenieur telecommunications et reseaux numeriques',
      ville: 'Dakar',
      duree: '60 mois',
      fraisDossier: 40000,
      fraisScolarite: 1050000,
      devise: 'FCFA',
      niveau: 'Ingenieur',
      placement: '86%',
      description:
        'Reseaux mobiles et fibre, securisation des infrastructures critiques et services cloud pour operateurs.',
      eligibilite: 'BAC scientifique ou technique; selection ecrite et entretien de motivation.',
      brochureUrl: 'https://example.sn/brochures/esmt-telecom-placeholder.pdf',
      perspectives:
        'Operateurs telecom, integrateurs et grandes structures en transformation digitale.',
      etablissementId: esmt.id,
      partnerId: agence.id
    }
  })

  await upsertUser({
    name: 'Admin BourseFi',
    email: 'admin@boursefi.sn',
    password: 'Admin1234!',
    role: 'ADMIN'
  })

  await upsertUser({
    name: 'Partenaire Mairie Dakar',
    email: 'partenaire@boursefi.sn',
    password: 'Partner1234!',
    role: 'PARTNER',
    partnerId: mairie.id
  })

  await upsertUser({
    name: 'Etudiant Demo',
    email: 'etudiant@boursefi.sn',
    password: 'Student1234!',
    role: 'STUDENT'
  })

  await seedCmsFromDisk()

  console.log('Seed catalogue partenaires / ecoles / programmes termine.')
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
