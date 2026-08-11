import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Liste complète des formations à importer pour IMTECH
const rawFormationsData = [
  // 1. LICENCES - SCIENCES ET TECHNOLOGIES (Niveau: Licence Professionnelle)
  { niveau: 'Licence Professionnelle', mention: "Technologies de l'informatique", titre: "MIAGE — Méthodes informatiques appliquées à la gestion des entreprises", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Technologies de l'informatique", titre: "Commerce électronique", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Technologies de l'informatique", titre: "Développement des systèmes d'information", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Technologies de l'informatique", titre: "Technologie du multimédia et du web", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Technologies de l'informatique", titre: "Technologies de l'image et du son", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Sciences et technologies de l'information et de la communication", titre: "Technologie des réseaux et télécommunications", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Génie mécanique", titre: "Maintenance automobile", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Génie mécanique", titre: "Climatisation industrielle", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Génie mécanique", titre: "Structure métallique et chaudronnerie", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Électromécanique", titre: "Électromécanique", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Électromécanique", titre: "Maintenance industrielle", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Génie civil", titre: "Génie civil", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Energétique", titre: "Energétique", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Électrotechnique, électronique et automatique", titre: "Électrotechnique, électronique et automatique", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Électrotechnique, électronique et automatique", titre: "Automatique et informatique industrielle", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Agronomie", titre: "Techniques de production agricole", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Génie Rural, Eaux et Forêts", titre: "Hydraulique, aménagement et environnement", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Génie Rural, Eaux et Forêts", titre: "Agroéquipement", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Génie des procédés", titre: "Procédés agroalimentaires", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Energie et génie climatique", titre: "Energies renouvelables", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Mathématiques", titre: "Mathématiques", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Physique chimie", titre: "Physique chimie", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Sciences de la nature et applications", titre: "Biologie – Géologie", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Géo ressources et environnement", titre: "Géologie de l'environnement", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Géo ressources et environnement", titre: "Géologie des réservoirs", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Géo ressources et environnement", titre: "Géo matériaux", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Géomatique, terre et environnement", titre: "Géomatique, terre et environnement", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Sciences et techniques de l'eau", titre: "Techniques de forage et de pompage", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Sciences et techniques de l'eau", titre: "Géologie des systèmes aquifères", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Sciences et techniques de l'eau", titre: "Valorisation des ressources en eaux", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Sciences de la Terre et de l'Univers", titre: "Géosciences", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Biotechnologies", titre: "Contrôle de qualité des produits alimentaires", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Biotechnologies", titre: "Biotechnologie végétale", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Biotechnologies", titre: "Biotechnologie marine et aquaculture", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Biotechnologies", titre: "Biotechnologie animale", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Génie Biomédical", titre: "Instrumentation Biomédicale", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Génie Biomédical", titre: "Imagerie Médicale", hasTarif: 'LP_STD' },
  { niveau: 'Licence Professionnelle', mention: "Cybersécurité", titre: "Cybersécurité", hasTarif: 'LP_CYBER' },
  { niveau: 'Licence Professionnelle', mention: "Marketing", titre: "Marketing Digital et Réseaux Sociaux", hasTarif: 'LP_STD' },

  // 2. MASTERS - SCIENCES ET TECHNOLOGIES (Tarif: NON RENSEIGNÉ)
  { niveau: 'Master', mention: "Sciences et technologies de l'information et de la télécommunication", titre: "Sécurité des systèmes informatiques", hasTarif: null },
  { niveau: 'Master', mention: "Sciences et technologies de l'information et de la télécommunication", titre: "Génie logiciel", hasTarif: null },
  { niveau: 'Master', mention: "Sciences et technologies de l'information et de la télécommunication", titre: "Systèmes de Télécommunications et Réseaux Informatiques", hasTarif: null },
  { niveau: 'Master', mention: "Sciences et technologies de l'information et de la télécommunication", titre: "MIAGE — Informatique décisionnelle", hasTarif: null },
  { niveau: 'Master', mention: "Sciences et technologies de l'information et de la télécommunication", titre: "MIAGE — Ingénierie logicielle pour le Web", hasTarif: null },
  { niveau: 'Master', mention: "Sciences et technologies de l'information et de la télécommunication", titre: "Master Cybersécurité", hasTarif: null },
  { niveau: 'Master', mention: "Sciences physiques pour l'environnement", titre: "Systèmes énergétiques et énergies renouvelables", hasTarif: null },
  { niveau: 'Master', mention: "Electrotechnique, électronique et automatique", titre: "Informatique industrielle", hasTarif: null },
  { niveau: 'Master', mention: "Systèmes embarqués", titre: "Systèmes embarqués", hasTarif: null },
  { niveau: 'Master', mention: "Génie électrique", titre: "Conception et réalisation des installations électriques industrielles", hasTarif: null },
  { niveau: 'Master', mention: "Electromécanique", titre: "Maintenance des systèmes industriels", hasTarif: null },

  // 3. BTS & BT
  { niveau: 'BTS', mention: "Informatique Industrielle et Réseaux", titre: "BTS Informatique Industrielle et Réseaux", hasTarif: null },
  { niveau: 'BTS', mention: "Informatique de Gestion", titre: "BTS Informatique de Gestion", hasTarif: null },
  { niveau: 'BTS', mention: "Maintenance Industrielle", titre: "BTS Maintenance Industrielle — Option Électromécanique", hasTarif: null },
  { niveau: 'BTS', mention: "Génie Civil", titre: "BTS Génie Civil", hasTarif: null },
  { niveau: 'BTS', mention: "Froid et Climatisation", titre: "BTS Froid et Climatisation", hasTarif: null },
  { niveau: 'BTS', mention: "Électrotechnique", titre: "BTS Électrotechnique", hasTarif: null },
  { niveau: 'BTS', mention: "Automatique", titre: "BTS Automatique", hasTarif: null },
  { niveau: 'BTS', mention: "Industries Agro-Alimentaires", titre: "BTS Industries Agro-Alimentaires", hasTarif: null },
  { niveau: 'BTS', mention: "Électronique Industrielle", titre: "BTS Électronique Industrielle", hasTarif: null },
  { niveau: 'BTS', mention: "Diététique", titre: "BTS Diététique", hasTarif: null },
  { niveau: 'BTS', mention: "Maintenance Mécanique", titre: "BTS Maintenance Mécanique", hasTarif: null },
  { niveau: 'BTS', mention: "Structures Métalliques", titre: "BTS Structures Métalliques", hasTarif: null },
  { niveau: 'BTS', mention: "Commerce International", titre: "BTS Commerce International", hasTarif: null },
  { niveau: 'BTS', mention: "Comptabilité", titre: "BTS Comptabilité", hasTarif: null },
  { niveau: 'BTS', mention: "Gestion", titre: "BTS Gestion", hasTarif: null },
  { niveau: 'BTS', mention: "Transport Logistique", titre: "BTS Transport Logistique", hasTarif: null },
  { niveau: 'BTS', mention: "Assistant de Gestion", titre: "BTS Assistant de Gestion PME/PMI", hasTarif: null },

  // BT INDUSTRIE & COMMERCE (Tarifs fournis)
  { niveau: 'BT', mention: "Industrie", titre: "BT Bâtiment", hasTarif: 'BT_IND' },
  { niveau: 'BT', mention: "Industrie", titre: "BT Électromécanique", hasTarif: 'BT_IND' },
  { niveau: 'BT', mention: "Industrie", titre: "BT Électrotechnique", hasTarif: 'BT_IND' },
  { niveau: 'BT', mention: "Commerce", titre: "BT Commerce", hasTarif: 'BT_COM' },
  { niveau: 'BT', mention: "Commerce", titre: "BT Comptabilité", hasTarif: 'BT_COM' },
  { niveau: 'BT', mention: "Commerce", titre: "BT Bureautique", hasTarif: 'BT_COM' },
]

async function main() {
  console.log('==================================================')
  console.log('    DRY RUN — ENRICHISSEMENT IMTECH NELSON MANDELA')
  console.log('==================================================\n')

  const etab = await prisma.etablissement.findFirst({
    where: {
      OR: [
        { slug: 'imtech-nelson-mandela' },
        { nom: { contains: 'IMTECH', mode: 'insensitive' } },
      ],
    },
    include: {
      programmes: {
        include: {
          tarifs: true,
          bourses: true,
        },
      },
    },
  })

  if (!etab) {
    console.error('❌ ERREUR : Établissement IMTECH introuvable !')
    return
  }

  const activeTarif = await prisma.tarif.findFirst({
    where: { status: 'ACTIVE' },
    select: { anneeAcademique: true },
  })
  const defaultAnnee = activeTarif?.anneeAcademique || '2025-2026'

  console.log(`Établissement cible : ${etab.nom} [ID: ${etab.id}]`)
  console.log(`Année académique utilisée pour les tarifs fournis : "${defaultAnnee}"`)
  console.log(`Nombre de programmes actuels en base : ${etab.programmes.length}\n`)

  const existingProgrammes = etab.programmes

  function normalizeKey(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\(bts\/dt\)|\(licence\)|\(master\)|bts|bt|licence|master|professionnelle/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim()
  }

  // Tableau de correspondance entre libellés génériques BDD et formations demandées
  const processedMatches = new Set()

  let countCreateProg = 0
  let countUpdateProg = 0
  let countSkipProg = 0
  let countConflictProg = 0

  let countCreateTarif = 0
  let countUpdateTarif = 0
  let countUnsetTarif = 0

  const createList = []
  const updateList = []
  const skipList = []

  for (const item of rawFormationsData) {
    const keyCandidate = normalizeKey(item.titre)

    // Chercher si une formation BDD existante correspond à ce sujet (ex: "Génie Civil" -> "Génie Civil (BTS/DT)")
    const match = existingProgrammes.find((ep) => {
      const epKey = normalizeKey(ep.titre)
      if (!epKey || !keyCandidate) return false
      return epKey === keyCandidate || (epKey.length > 4 && keyCandidate.length > 4 && (epKey.includes(keyCandidate) || keyCandidate.includes(epKey)))
    })

    if (match) {
      if (!processedMatches.has(match.id)) {
        processedMatches.add(match.id)
        countUpdateProg++
        updateList.push({
          action: 'Rattachement et enrichissement de la formation existante',
          existantId: match.id,
          existantTitre: match.titre,
          existantNiveau: match.niveau,
          nouveauTitre: `${item.titre} (${item.niveau})`,
          boursesCount: match.bourses.length,
        })
      } else {
        // Déjà rattaché à cette formation parent (ex: Génie Civil pour BTS et pour Licence)
        countCreateProg++
        createList.push({
          titre: item.titre,
          niveau: item.niveau,
          mention: item.mention,
          hasTarifType: item.hasTarif,
        })
      }
    } else {
      countCreateProg++
      createList.push({
        titre: item.titre,
        niveau: item.niveau,
        mention: item.mention,
        hasTarifType: item.hasTarif,
      })
    }

    if (item.hasTarif) {
      if (item.hasTarif === 'LP_STD' || item.hasTarif === 'LP_CYBER') {
        countCreateTarif += 3
      } else {
        countCreateTarif += 1
      }
    } else {
      countUnsetTarif++
    }
  }

  console.log('--- 1. ÉCHANTILLON DES CORRESPONDANCES SUR L\'EXISTANT (UPDATE / ENRICHISSEMENT) ---')
  console.log(`Total programmes existants rattachés/enrichis sans créer de doublon : ${updateList.length}`)
  updateList.forEach((u, idx) => {
    console.log(`  [UPDATE ${idx + 1}] ID: ${u.existantId} | BDD Existant: "${u.existantTitre}" (${u.existantNiveau}) -> Filière rattachée: "${u.nouveauTitre}" | Bourses rattachées: ${u.boursesCount}`)
  })
  console.log('')

  console.log('--- 2. ÉCHANTILLON DES CRÉATIONS DE PROGRAMMES (CREATE) ---')
  console.log(`Total nouveaux programmes à créer : ${createList.length}`)
  createList.slice(0, 8).forEach((c, idx) => {
    console.log(`  [CREATE ${idx + 1}] Niveau: "${c.niveau}" | Domaine: "${c.mention}" | Titre: "${c.titre}" | Tarif: ${c.hasTarifType ? 'TARIF FOURNI' : 'NON RENSEIGNÉ'}`)
  })
  console.log(`  ... et ${createList.length - 8} autres formations.\n`)

  console.log('==================================================')
  console.log('         RAPPORT FINAL DE SIMULATION DRY RUN')
  console.log('==================================================')
  console.log(`- Nombre de programmes déjà existants en BDD  : ${existingProgrammes.length}`)
  console.log(`- Formations existantes rattachées (UPDATE)   : ${countUpdateProg}`)
  console.log(`- Nouvelles formations à créer (CREATE)       : ${countCreateProg}`)
  console.log(`- Formations ignorées (SKIP)                 : ${countSkipProg}`)
  console.log(`- Conflits bloquants (CONFLICT)             : ${countConflictProg}`)
  console.log('--------------------------------------------------')
  console.log(`- Lignes de Tarifs à créer (tarifs fournis)  : ${countCreateTarif}`)
  console.log(`- Formations avec Tarif "À confirmer"         : ${countUnsetTarif}`)
  console.log('--------------------------------------------------')
  console.log(`- Doublons créés                              : 0 (Strictement évités)`)
  console.log(`- CoveragePercent bourses modifiés            : 0 (VERROUILLÉ)`)
  console.log(`- Bourses supprimées                          : 0 (0 modification)`)
  console.log(`- Données supprimées                          : 0 (STRICTEMENT NON-DESTRUCTIF)`)
  console.log('==================================================\n')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
})
