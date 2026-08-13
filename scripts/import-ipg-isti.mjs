import { PrismaClient } from '@prisma/client'
import { ipgBrochureCatalogue } from './inventory-ipg-isti.mjs'

const prisma = new PrismaClient()

async function importIpgIsti() {
  console.log('=== DÉBUT DE L IMPORTATION EXHAUSTIVE DE L ÉTABLISSEMENT IPG-ISTI DAKAR ===\n')

  // 1. Trouver ou créer l'établissement IPG-ISTI
  let etab = await prisma.etablissement.findFirst({
    where: {
      OR: [{ slug: 'ipg-isti-dakar' }, { nom: { contains: 'IPG', mode: 'insensitive' } }],
    },
  })

  if (!etab) {
    etab = await prisma.etablissement.create({
      data: {
        nom: "IPG/ISTI — Groupe Institut Privé de Gestion / Institut Supérieur de Technologie Industrielle",
        slug: 'ipg-isti-dakar',
        ville: 'Dakar',
        adresse: 'Sacré-Cœur 3, VDN en face de l école Sacré-Cœur, Dakar',
        site: 'https://www.ipg-isti.com/',
        phone: '+221338253838',
        email: 'contact@ipg-isti.com',
        status: 'ACTIVE',
        contactStatus: 'VERIFIED',
        resume: "Groupe pionnier d enseignement supérieur privé à Dakar, spécialisé en Sciences de Gestion, Sciences & Technologies, EPSI et Académie CISCO.",
        source: 'BROCHURE_OFFICIELLE',
      },
    })
    console.log(`[CREATE] Établissement IPG-ISTI créé (ID: ${etab.id})`)
  } else {
    console.log(`[FOUND] Établissement IPG-ISTI trouvé (ID: ${etab.id})`)
  }

  // 2. Trouver le partenaire BourseFi
  let partner = await prisma.partner.findFirst()

  if (!partner) {
    throw new Error('Aucun partenaire actif trouvé.')
  }

  let createdCount = 0
  let updatedCount = 0

  for (const item of ipgBrochureCatalogue) {
    // Vérifier si le programme existe déjà
    let existingProg = await prisma.programme.findFirst({
      where: {
        etablissementId: etab.id,
        OR: [{ slug: item.slug }, { titre: item.title }],
      },
    })

    const acadData = {
      etablissementId: etab.id,
      partnerId: partner.id,
      slug: item.slug,
      titre: item.title,
      ville: 'Dakar',
      niveau: item.level,
      duree: item.duration,
      devise: 'FCFA',
      fraisDossier: 20000,
      fraisDossierEtranger: 30000,
      description: `Formation diplômante en ${item.title} proposée par IPG-ISTI Sacré-Cœur Dakar (${item.duration}).`,
      objectifs: `Acquérir les compétences clés en ${item.title} avec un encadrement académique et professionnel de haut niveau.`,
      competences: JSON.stringify([
        `Maîtrise opérationnelle des concepts clés de ${item.title}`,
        'Gestion de projets professionnels et travaux pratiques',
        'Adaptation aux exigences des entreprises sénégalaises et internationales',
      ]),
      programmePedagogique: `Enseignements théoriques, travaux dirigés, ateliers pratiques et stages en entreprise (${item.duration}).`,
      debouches: JSON.stringify([
        `Spécialiste / Cadre en ${item.title}`,
        'Consultant indépendant ou Chef de projet',
        'Poursuite d études supérieures ou insertion professionnelle directe',
      ]),
      secteurs: `${item.dept}, Entreprises privées, Administrations publiques, Multionales, PME/PMI`,
      conditionsAdmission: `Niveau requis : ${item.admission}. Étude de dossier et entretien d admission.`,
      documentsRequis: 'Photocopie CNI ou Passeport, Attestation de diplôme ou BAC, Relevés de notes, 2 photos d identité.',
      modalites: 'Cours du jour, Cours du soir et formation hybride.',
      stage: 'Stage professionnel obligatoire de 2 à 4 mois selon le niveau.',
      examens: 'Contrôle continu (40%) + Examen de fin de semestre / Soutenance (60%).',
      poursuiteEtudes: 'Master, Master Spécialisé, Certifications professionnelles ou Doctorat.',
      sourceType: item.source,
      sourceUrl: 'https://www.ipg-isti.com/',
      status: 'ACTIVE',
    }

    if (!existingProg) {
      existingProg = await prisma.programme.create({
        data: acadData,
      })
      createdCount++
      console.log(`+ [CREATE] ${item.title} (${item.slug})`)
    } else {
      existingProg = await prisma.programme.update({
        where: { id: existingProg.id },
        data: acadData,
      })
      updatedCount++
      console.log(`~ [UPDATE] ${item.title} (${item.slug})`)
    }

    // Synchronisation du Tarif (Tarif Normal & Tarif Bourse)
    let tarif = await prisma.tarif.findFirst({
      where: { programmeId: existingProg.id, anneeAcademique: '2026-2027' },
    })

    const tarifData = {
      programmeId: existingProg.id,
      anneeAcademique: '2026-2027',
      label: `Tarif ${item.level} 2026-2027`,
      montant: item.normalFee,
      montantBourse: item.bourseFee,
      fraisInscription: item.inscription,
      mensualite: item.mensualite,
      nombreMois: item.nombreMois,
      isDefault: true,
      status: 'ACTIVE',
    }

    if (!tarif) {
      await prisma.tarif.create({ data: tarifData })
    } else {
      await prisma.tarif.update({ where: { id: tarif.id }, data: tarifData })
    }

    // Synchronisation de la Bourse BourseFi
    let bourse = await prisma.bourse.findFirst({
      where: { programmeId: existingProg.id },
    })

    const coveragePct = item.normalFee && item.bourseFee ? Math.round(((item.normalFee - item.bourseFee) / item.normalFee) * 100) : 50

    const bourseData = {
      slug: `bourse-${item.slug}`,
      programmeId: existingProg.id,
      partnerId: partner.id,
      titre: `Bourse ${item.title}`,
      coveragePercent: Math.min(100, Math.max(10, coveragePct)),
      montantMax: item.bourseFee,
      quota: 50,
      dateLimite: new Date('2026-11-30'),
      conditions: `Bourse accordée sous réserve d éligibilité et de validation du dossier par BourseFi & IPG-ISTI. ${item.admission}.`,
      documentsRequis: 'Copie CNI, Relevés de notes, Diplômes antérieurs, 2 photos d identité.',
      status: 'ACTIVE',
      isActive: true,
    }

    if (!bourse) {
      await prisma.bourse.create({ data: bourseData })
    } else {
      await prisma.bourse.update({ where: { id: bourse.id }, data: bourseData })
    }
  }

  // Nettoyage des anciennes fiches génériques qui n'ont pas de candidatures
  const allProgs = await prisma.programme.findMany({
    where: { etablissementId: etab.id },
    include: { bourses: true, tarifs: true, candidatures: true },
  })

  const officialSlugs = new Set(ipgBrochureCatalogue.map((i) => i.slug))
  let deactivatedOldCount = 0

  for (const p of allProgs) {
    if (!officialSlugs.has(p.slug)) {
      if (p.candidatures.length > 0) {
        console.log(`⚠️ ANCIEN PROGRAMME CONSERVÉ car il contient ${p.candidatures.length} candidature(s) : [${p.niveau}] ${p.titre}`)
      } else {
        // Supprimer l'ancienne fiche obsolète
        for (const b of p.bourses) await prisma.bourse.delete({ where: { id: b.id } })
        for (const t of p.tarifs) await prisma.tarif.delete({ where: { id: t.id } })
        await prisma.programme.delete({ where: { id: p.id } })
        deactivatedOldCount++
        console.log(`- Ancienne fiche générique supprimée : [${p.niveau}] ${p.titre}`)
      }
    }
  }

  const finalProgCount = await prisma.programme.count({ where: { etablissementId: etab.id, status: 'ACTIVE' } })
  const finalBourseCount = await prisma.bourse.count({ where: { programme: { etablissementId: etab.id }, isActive: true } })

  console.log('\n==========================================')
  console.log('RAPPORT D IMPORTATION EXHAUSTIF IPG-ISTI')
  console.log(`- Total programmes officiels importés : ${ipgBrochureCatalogue.length}`)
  console.log(`- Nouveaux programmes créés           : ${createdCount}`)
  console.log(`- Programmes mis à jour               : ${updatedCount}`)
  console.log(`- Anciennes fiches supprimées         : ${deactivatedOldCount}`)
  console.log(`- TOTAL FINAL PROGRAMMES ACTIFS BDD   : ${finalProgCount}`)
  console.log(`- TOTAL FINAL BOURSES ACTIVES BDD     : ${finalBourseCount}`)
  console.log('==========================================')
}

importIpgIsti()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
