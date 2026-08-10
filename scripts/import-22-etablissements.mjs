import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DATA_22 = [
  {
    targetSlug: 'abs-school',
    aliasSlug: 'abs-school-dakar',
    nom: 'ABS — AFRICAN BUSINESS SCHOOL',
    ville: 'Dakar',
    phone: '+221338228245',
    phoneSecondary: '+221777642551',
    whatsapp: null,
    email: null,
    site: 'https://abs-ao.com/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221338228245', label: 'Téléphone principal', isPrincipal: true },
      { type: 'PHONE', valeur: '+221777642551', label: 'Téléphone secondaire', isPrincipal: false },
      { type: 'WEBSITE', valeur: 'https://abs-ao.com/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'afpa-dakar',
    nom: 'AFPA — AFRICAINE DES FORMATIONS PROFESSIONNELLES EN ALTERNANCE',
    ville: 'Colobane',
    phone: '+221338230909',
    phoneSecondary: '+221775894646',
    whatsapp: null,
    email: null,
    site: 'https://www.afpa.sn/',
    contactStatus: 'VERIFIED',
    source: 'OFFICIAL_WEBSITE',
    contacts: [
      { type: 'PHONE', valeur: '+221338230909', label: 'Téléphone principal', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'PHONE', valeur: '+221775894646', label: 'Téléphone secondaire', isPrincipal: false, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'WEBSITE', valeur: 'https://www.afpa.sn/', label: 'Site officiel', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' }
    ]
  },
  {
    targetSlug: 'amdi-afrique',
    nom: 'AMDI — AFRICAN MILLENNIUM DEVELOPMENT INSTITUTE',
    ville: 'Dakar',
    phone: '+221338257232',
    phoneSecondary: '+221777097816',
    whatsapp: null,
    email: null,
    site: 'https://amdiafrique.com/',
    contactStatus: 'VERIFIED',
    source: 'OFFICIAL_WEBSITE',
    contacts: [
      { type: 'PHONE', valeur: '+221338257232', label: 'Téléphone principal', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'PHONE', valeur: '+221777097816', label: 'Téléphone secondaire', isPrincipal: false, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'PHONE', valeur: '+221776241060', label: 'Autre téléphone', isPrincipal: false, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'WEBSITE', valeur: 'https://amdiafrique.com/', label: 'Site officiel', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' }
    ]
  },
  {
    targetSlug: 'cefas-senegal',
    nom: 'CEFAS — Centre de Formation Africain du Sénégal',
    ville: 'Dakar',
    phone: '+221779960808',
    phoneSecondary: '+221779194949',
    whatsapp: null,
    email: null,
    site: 'https://cefas-senegal.com/',
    contactStatus: 'VERIFIED',
    source: 'OFFICIAL_WEBSITE',
    contacts: [
      { type: 'PHONE', valeur: '+221779960808', label: 'Téléphone principal', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'PHONE', valeur: '+221779194949', label: 'Téléphone secondaire', isPrincipal: false, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'PHONE', valeur: '+221770775757', label: 'Autre téléphone', isPrincipal: false, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'WEBSITE', valeur: 'https://cefas-senegal.com/', label: 'Site officiel', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' }
    ]
  },
  {
    targetSlug: 'ensup-afrique-mbour',
    nom: 'ENSUP AFRIQUE — MBOUR',
    ville: 'Mbour',
    phone: '+221338673632',
    phoneSecondary: null,
    whatsapp: null,
    email: null,
    site: 'https://www.ensupafrique.com/',
    contactStatus: 'TO_VERIFY',
    source: null,
    remarque: 'Contact général ENSUP — À confirmer pour campus Mbour',
    contacts: [
      { type: 'PHONE', valeur: '+221338673632', label: 'Contact général ENSUP', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://www.ensupafrique.com/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'ensup-afrique-dakar',
    nom: 'ENSUP AFRIQUE — DAKAR',
    ville: 'Dakar',
    phone: '+221338673632',
    phoneSecondary: null,
    whatsapp: null,
    email: null,
    site: 'https://www.ensupafrique.com/',
    contactStatus: 'VERIFIED',
    source: 'OFFICIAL_WEBSITE',
    contacts: [
      { type: 'PHONE', valeur: '+221338673632', label: 'Contact général Dakar', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'WEBSITE', valeur: 'https://www.ensupafrique.com/', label: 'Site officiel', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' }
    ]
  },
  {
    targetSlug: 'estg-dakar',
    nom: 'ESTG — École Supérieure des Techniques de Gestion',
    ville: 'Dakar',
    phone: '+221338675757',
    phoneSecondary: '+221778644747',
    whatsapp: null,
    email: null,
    site: 'https://www.estg.sn/',
    contactStatus: 'VERIFIED',
    source: 'OFFICIAL_WEBSITE',
    contacts: [
      { type: 'PHONE', valeur: '+221338675757', label: 'Téléphone principal', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'PHONE', valeur: '+221778644747', label: 'Téléphone secondaire', isPrincipal: false, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'WEBSITE', valeur: 'https://www.estg.sn/', label: 'Site officiel', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' }
    ]
  },
  {
    targetSlug: 'esup-dakar',
    nom: 'ESUP DAKAR',
    ville: 'Dakar',
    phone: '+221766386008',
    phoneSecondary: null,
    whatsapp: null,
    email: null,
    site: 'https://esupdakar.sn/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221766386008', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://esupdakar.sn/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'essem-sante-mbour',
    nom: 'ESEM / ESSEM SANTÉ MBOUR',
    ville: 'Mbour',
    phone: null,
    phoneSecondary: null,
    whatsapp: null,
    email: null,
    site: null,
    contactStatus: 'TO_VERIFY',
    source: null,
    remarque: 'Aucune coordonnée inventée — À collecter',
    contacts: []
  },
  {
    targetSlug: 'hecm-dakar',
    nom: 'HECM',
    ville: 'Dakar',
    phone: '+221338254018',
    phoneSecondary: '+221772012715',
    whatsapp: null,
    email: null,
    site: 'https://hecm-dakar.com/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221338254018', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221772012715', label: 'Téléphone secondaire', isPrincipal: false, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://hecm-dakar.com/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'ifaa-dakar',
    nom: 'IFAA',
    ville: 'Dakar',
    phone: '+221775660191',
    phoneSecondary: '+221781124718',
    whatsapp: null,
    email: null,
    site: 'https://ifaa.sn/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221775660191', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221781124718', label: 'Téléphone secondaire', isPrincipal: false, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://ifaa.sn/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'img-mbour',
    nom: 'IMG MBOUR',
    ville: 'Mbour',
    phone: '+221784654831',
    phoneSecondary: '+221782952065',
    whatsapp: null,
    email: null,
    site: null,
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221784654831', label: 'Téléphone principal Mbour', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221782952065', label: 'Téléphone secondaire Mbour', isPrincipal: false, status: 'TO_VERIFY' }
    ]
  },
  {
    targetSlug: 'img-rufisque',
    nom: 'IMG RUFISQUE',
    ville: 'Rufisque',
    phone: '+221782212121',
    phoneSecondary: '+221703669595',
    whatsapp: null,
    email: null,
    site: 'https://www.groupe-img.com/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221782212121', label: 'Téléphone principal Rufisque', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221703669595', label: 'Téléphone secondaire Rufisque', isPrincipal: false, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://www.groupe-img.com/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'imtech-nelson-mandela',
    nom: 'IMTECH',
    ville: 'Dakar',
    phone: '+221338255821',
    phoneSecondary: null,
    whatsapp: null,
    email: null,
    site: 'https://imtech-nelsonmandela.com/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221338255821', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://imtech-nelsonmandela.com/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'ipd-thomas-sankara',
    nom: 'IPD THOMAS SANKARA',
    ville: 'Dakar',
    phone: '+221338679045',
    phoneSecondary: null,
    whatsapp: null,
    email: null,
    site: null,
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221338679045', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' }
    ]
  },
  {
    targetSlug: 'ipg-isti-dakar',
    nom: 'IPG / ISTI',
    ville: 'Dakar',
    phone: '+221338242839',
    phoneSecondary: null,
    whatsapp: '+221774696961',
    email: null,
    site: 'https://daara.ipg-isti.com/',
    contactStatus: 'VERIFIED',
    source: 'OFFICIAL_WEBSITE',
    contacts: [
      { type: 'PHONE', valeur: '+221338242839', label: 'Téléphone principal', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'WHATSAPP', valeur: '+221774696961', label: 'WhatsApp Officiel', isPrincipal: false, isWhatsapp: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' },
      { type: 'WEBSITE', valeur: 'https://daara.ipg-isti.com/', label: 'Site officiel', isPrincipal: true, status: 'VERIFIED', source: 'OFFICIAL_WEBSITE' }
    ]
  },
  {
    targetSlug: 'isbd-dakar',
    nom: 'ISBD',
    ville: 'Dakar',
    phone: '+221772646402',
    phoneSecondary: null,
    whatsapp: null,
    email: null,
    site: null,
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221772646402', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' }
    ]
  },
  {
    targetSlug: 'isca-dakar',
    nom: 'ISCA',
    ville: 'Dakar',
    phone: '+221338250203',
    phoneSecondary: '+221774999595',
    whatsapp: null,
    email: null,
    site: 'https://isca.sn/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221338250203', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221774999595', label: 'Téléphone secondaire', isPrincipal: false, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://isca.sn/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'isdb-dakar',
    nom: 'ISDB',
    ville: 'Dakar',
    phone: '+221338559656',
    phoneSecondary: '+221338359658',
    whatsapp: null,
    email: null,
    site: 'https://isdb.sn/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221338559656', label: 'Téléphone fixe 1', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221338359658', label: 'Téléphone fixe 2', isPrincipal: false, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221775445241', label: 'Mobile / WhatsApp 1', isPrincipal: false, isWhatsapp: true, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221778367459', label: 'Mobile 2', isPrincipal: false, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://isdb.sn/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'smi-thies',
    nom: 'SMI — SUP\'MANAGEMENT INTELLIGENTSIA',
    ville: 'Thiès',
    phone: '+221339510379',
    phoneSecondary: null,
    whatsapp: null,
    email: null,
    site: 'https://smi.sn/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221339510379', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://smi.sn/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'sup-immo-dakar',
    nom: 'SUP\'IMMO',
    ville: 'Dakar',
    phone: '+221338276868',
    phoneSecondary: '+221782229090',
    whatsapp: null,
    email: null,
    site: 'https://sup-immo.com/',
    contactStatus: 'TO_VERIFY',
    source: null,
    contacts: [
      { type: 'PHONE', valeur: '+221338276868', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221782229090', label: 'Téléphone secondaire', isPrincipal: false, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://sup-immo.com/', label: 'Site officiel', isPrincipal: true }
    ]
  },
  {
    targetSlug: 'elite-sante',
    nom: 'ÉLITE SANTÉ',
    ville: null, // RÈGLE : Ne pas écraser la ville "Keur Massar" existante
    phone: '+221338783212',
    phoneSecondary: '+221771355353',
    whatsapp: null,
    email: null,
    site: 'https://elitesante.sunuformation.sn/',
    contactStatus: 'TO_VERIFY',
    source: null,
    remarque: 'Ville NULL dans import — Conservation de Keur Massar existante',
    contacts: [
      { type: 'PHONE', valeur: '+221338783212', label: 'Téléphone principal', isPrincipal: true, status: 'TO_VERIFY' },
      { type: 'PHONE', valeur: '+221771355353', label: 'Téléphone secondaire', isPrincipal: false, status: 'TO_VERIFY' },
      { type: 'WEBSITE', valeur: 'https://elitesante.sunuformation.sn/', label: 'Site officiel', isPrincipal: true }
    ]
  }
]

async function main() {
  console.log('=== DEBUT IMPORT IDEMPOTENT DES 22 ETABLISSEMENTS ===\n')

  const report = []

  for (let i = 0; i < DATA_22.length; i++) {
    const item = DATA_22[i]
    const searchSlug = item.aliasSlug || item.targetSlug

    const existing = await prisma.etablissement.findUnique({
      where: { slug: searchSlug }
    })

    if (!existing) {
      report.push({
        index: i + 1,
        etablissement: item.nom,
        slug: searchSlug,
        trouveDb: 'NON',
        statutImport: 'NOT_FOUND',
        coordonnees: 'Aucune',
        verification: item.contactStatus,
        remarque: 'Établissement introuvable en base par slug ou alias'
      })
      continue
    }

    // RÈGLE ANTI-ÉCRASEMENT : Seules les valeurs non NULL remplacent les existantes
    const updateData = {}
    if (item.phone) updateData.phone = item.phone
    if (item.phoneSecondary) updateData.phoneSecondary = item.phoneSecondary
    if (item.whatsapp) updateData.whatsapp = item.whatsapp
    if (item.email) updateData.email = item.email
    if (item.site) updateData.site = item.site
    if (item.ville && item.ville !== 'NULL') updateData.ville = item.ville
    updateData.contactStatus = item.contactStatus
    if (item.source) updateData.source = item.source
    if (item.contactStatus === 'VERIFIED') updateData.contactVerifiedAt = new Date()

    const updatedEtab = await prisma.etablissement.update({
      where: { id: existing.id },
      data: updateData
    })

    // GESTION IDEMPOTENTE DES CONTACTS MULTIPLES
    for (const c of item.contacts) {
      const existingContact = await prisma.etablissementContact.findFirst({
        where: {
          etablissementId: existing.id,
          type: c.type,
          valeur: c.valeur
        }
      })

      if (!existingContact) {
        await prisma.etablissementContact.create({
          data: {
            etablissementId: existing.id,
            type: c.type,
            valeur: c.valeur,
            label: c.label || null,
            isPrincipal: c.isPrincipal || false,
            isWhatsapp: c.isWhatsapp || false,
            status: c.status || item.contactStatus,
            source: c.source || item.source || null,
            isActive: true
          }
        })
      } else {
        await prisma.etablissementContact.update({
          where: { id: existingContact.id },
          data: {
            label: c.label || existingContact.label,
            isPrincipal: c.isPrincipal ?? existingContact.isPrincipal,
            isWhatsapp: c.isWhatsapp ?? existingContact.isWhatsapp,
            status: c.status || existingContact.status,
            source: c.source || existingContact.source
          }
        })
      }
    }

    const contactsCount = await prisma.etablissementContact.count({
      where: { etablissementId: existing.id }
    })

    report.push({
      index: i + 1,
      etablissement: updatedEtab.nom,
      slug: updatedEtab.slug,
      trouveDb: 'OUI',
      statutImport: 'UPDATED',
      coordonnees: `Phone: ${updatedEtab.phone || 'N/A'}, Site: ${updatedEtab.site ? 'OUI' : 'N/A'}, Contacts DB: ${contactsCount}`,
      verification: updatedEtab.contactStatus,
      remarque: item.remarque || 'Import réussi sans écrasement NULL'
    })
  }

  console.log('=== RAPPORT D\'IMPORT DES 22 ÉTABLISSEMENTS ===\n')
  console.table(report)

  return report
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err)
    prisma.$disconnect()
  })
