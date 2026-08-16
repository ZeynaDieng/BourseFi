import { PrismaClient } from '@prisma/client'
import assert from 'node:assert'

const prisma = new PrismaClient()

// Formations officielles issues du document officiel "ABS African Business School - Grille Tarifaire 2025-2026"
const OFFICIAL_ABS_PROGRAMMES = [
  {
    slug: 'abs-infographie-maquettiste',
    titre: 'Infographie Maquettiste (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '4 mois',
    description: 'Design graphique, PAO, création visuelle, suite Adobe (Photoshop, Illustrator, InDesign) et maquettisme professionnel.',
    tarifsBourse: {
      default: { montant: 150000, montantBourse: 150000, inscription: 50000, mensualite: 25000, mois: 4 }
    }
  },
  {
    slug: 'abs-developpement-web-mobile',
    titre: 'Développement Web et Mobile (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '6 mois',
    description: 'Programmation web frontend/backend, applications mobiles, HTML/CSS, JavaScript, PHP, MySQL, React & Flutter.',
    tarifsBourse: {
      default: { montant: 250000, montantBourse: 250000, inscription: 50000, mensualite: 50000, mois: 4 }
    }
  },
  {
    slug: 'abs-marketing-digital',
    titre: 'Marketing Digital (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '6 mois',
    description: 'Stratégie digitale, Community Management, Social Media Ads, SEO/SEA, e-mailing et Growth Hacking.',
    tarifsBourse: {
      default: { montant: 250000, montantBourse: 250000, inscription: 50000, mensualite: 50000, mois: 4 }
    }
  },
  {
    slug: 'abs-audiovisuel',
    titre: 'Audiovisuel (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '6 mois',
    description: 'Prise de vue, cadrage, montage vidéo professionnel, réalisation audiovisuelle et traitement sonore.',
    tarifsBourse: {
      default: { montant: 300000, montantBourse: 300000, inscription: 50000, mensualite: 50000, mois: 5 }
    }
  },
  {
    slug: 'abs-employe-station-service',
    titre: 'Employé Station de Service (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '3 mois',
    description: 'Gestion des opérations de volucompteur, sécurité pétrolière, accueil client, caisse et maintenance de station.',
    tarifsBourse: {
      default: { montant: 150000, montantBourse: 150000, inscription: 50000, mensualite: 50000, mois: 2 }
    }
  },
  {
    slug: 'abs-assistanat-direction',
    titre: 'Assistanat de Direction (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '3 mois',
    description: 'Secrétariat avancé, gestion de plannings, organisation de réunions, rédaction administrative et bureautique.',
    tarifsBourse: {
      default: { montant: 75000, montantBourse: 75000, inscription: 25000, mensualite: 25000, mois: 2 }
    }
  },
  {
    slug: 'abs-gestion-caisse',
    titre: 'Gestion de Caisse (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '3 mois',
    description: 'Techniques d\'encaissement, comptabilité de caisse, détection de faux billets, clôture journalière et relation client.',
    tarifsBourse: {
      default: { montant: 75000, montantBourse: 75000, inscription: 25000, mensualite: 25000, mois: 2 }
    }
  },
  {
    slug: 'abs-mediation-numerique',
    titre: 'Médiation Numérique (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '3 mois',
    description: 'Accompagnement aux usages digitaux, facilitation numérique, assistance administrative en ligne et outils collaboratifs.',
    tarifsBourse: {
      default: { montant: 75000, montantBourse: 75000, inscription: 25000, mensualite: 25000, mois: 2 }
    }
  },
  {
    slug: 'abs-attache-passation-marches',
    titre: 'Attaché Chargé de la Passation des Marchés (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '6 mois',
    description: 'Réglementation des marchés publics, élaboration de dossiers d\'appel d\'offres (DAO), dépouillement et suivi des contrats.',
    tarifsBourse: {
      default: { montant: 300000, montantBourse: 300000, inscription: 50000, mensualite: 50000, mois: 5 }
    }
  },
  {
    slug: 'abs-douane-transit-cotation',
    titre: 'Douane Transit - Cotation (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '6 mois',
    description: 'Procédures douanières, cotation fret, tarification GAINDE, dédouanement import/export et logistique portuaire.',
    tarifsBourse: {
      default: { montant: 300000, montantBourse: 300000, inscription: 50000, mensualite: 50000, mois: 5 }
    }
  },
  {
    slug: 'abs-cablage-reseaux-informatique',
    titre: 'Câblage Réseaux et Réseaux Informatique (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '6 mois',
    description: 'Architecture réseau, câblage structuré, baies de brassage, routage/commutation Cisco, Wi-Fi d\'entreprise et maintenance.',
    tarifsBourse: {
      default: { montant: 300000, montantBourse: 300000, inscription: 50000, mensualite: 50000, mois: 5 }
    }
  },
  {
    slug: 'abs-anglais-affaires',
    titre: 'Anglais des Affaires (Formation Certifiante / Pratique)',
    niveau: 'Certificat',
    duree: '3 mois',
    description: 'Business English, communication professionnelle orale et écrite, négociations, présentations et réunions d\'affaires.',
    tarifsBourse: {
      default: { montant: 85000, montantBourse: 85000, inscription: 25000, mensualite: 25000, mois: 2 }
    }
  }
]

async function runImport() {
  console.log('🚀 Début de l\'importation officielle ABS (Transaction Prisma)...')

  const stats = {
    updateCount: 0,
    createCount: 0,
    tarifsCreatedCount: 0,
    boursesCreatedCount: 0,
    boursesUpdatedCount: 0,
  }

  await prisma.$transaction(async (tx) => {
    // 1. Récupérer ou créer le partenaire ABS
    let partner = await tx.partner.findFirst({
      where: {
        OR: [
          { slug: 'abs-school-dakar' },
          { name: { contains: 'African Business School', mode: 'insensitive' } }
        ]
      }
    })

    if (!partner) {
      partner = await tx.partner.create({
        data: {
          name: 'ABS School — African Business School',
          slug: 'abs-school-dakar',
          partnerSharePercent: 75
        }
      })
    }

    // 2. Mettre à jour la fiche établissement ABS
    let etab = await tx.etablissement.findFirst({
      where: {
        OR: [
          { id: 'cmrghucgx003xgny493y1lt7l' },
          { slug: 'abs-school-dakar' },
          { nom: { contains: 'African Business School', mode: 'insensitive' } }
        ]
      }
    })

    if (etab) {
      etab = await tx.etablissement.update({
        where: { id: etab.id },
        data: {
          nom: 'ABS School — African Business School',
          slug: 'abs-school-dakar',
          ville: 'Dakar',
          adresse: 'Sicap Liberté 2, Dakar',
          phone: '+221 33 822 82 45',
          phoneSecondary: '+221 77 123 41 41',
          whatsapp: '+221 77 764 25 51',
          email: 'contact@abs-ao.com',
          site: 'https://www.abs-ao.com/',
          fraisDossier: 10000,
          isDirectPartner: true,
          autoIssueAttestation: true,
          status: 'ACTIVE',
        }
      })
      stats.updateCount++
    } else {
      etab = await tx.etablissement.create({
        data: {
          id: 'cmrghucgx003xgny493y1lt7l',
          nom: 'ABS School — African Business School',
          slug: 'abs-school-dakar',
          ville: 'Dakar',
          adresse: 'Sicap Liberté 2, Dakar',
          phone: '+221 33 822 82 45',
          phoneSecondary: '+221 77 123 41 41',
          whatsapp: '+221 77 764 25 51',
          email: 'contact@abs-ao.com',
          site: 'https://www.abs-ao.com/',
          fraisDossier: 10000,
          isDirectPartner: true,
          autoIssueAttestation: true,
          status: 'ACTIVE',
        }
      })
      stats.createCount++
    }

    console.log(`✅ Établissement prêt : ${etab.nom} (${etab.id})`)

    // 3. Importer les 12 programmes certifiants officiels ABS
    for (const progData of OFFICIAL_ABS_PROGRAMMES) {
      let prog = await tx.programme.findFirst({
        where: { slug: progData.slug }
      })

      if (!prog) {
        prog = await tx.programme.findFirst({
          where: {
            etablissementId: etab.id,
            titre: { contains: progData.titre.slice(0, 10), mode: 'insensitive' }
          }
        })
      }

      if (prog) {
        prog = await tx.programme.update({
          where: { id: prog.id },
          data: {
            titre: progData.titre,
            slug: progData.slug,
            niveau: progData.niveau,
            duree: progData.duree,
            ville: 'Dakar',
            fraisDossier: null, // Hérite de l'école (10 000 FCFA)
            fraisDossierEtranger: 20000,
            devise: 'FCFA',
            description: progData.description,
            status: 'ACTIVE'
          }
        })
        stats.updateCount++
      } else {
        prog = await tx.programme.create({
          data: {
            etablissementId: etab.id,
            partnerId: partner.id,
            titre: progData.titre,
            slug: progData.slug,
            niveau: progData.niveau,
            duree: progData.duree,
            ville: 'Dakar',
            fraisDossier: null,
            fraisDossierEtranger: 20000,
            devise: 'FCFA',
            description: progData.description,
            status: 'ACTIVE'
          }
        })
        stats.createCount++
      }

      // 4. Créer / Mettre à jour la Grille Tarifaire Officielle 2025-2026
      const tarifConfig = progData.tarifsBourse.default

      const existingTarif = await tx.tarif.findFirst({
        where: { programmeId: prog.id, anneeAcademique: '2025-2026' }
      })

      let activeTarif
      if (existingTarif) {
        activeTarif = await tx.tarif.update({
          where: { id: existingTarif.id },
          data: {
            montant: tarifConfig.montant,
            montantBourse: tarifConfig.montantBourse,
            fraisInscription: tarifConfig.inscription,
            mensualite: tarifConfig.mensualite,
            nombreMois: tarifConfig.mois,
            frequence: 'CHOIX_ETUDIANT',
            isDefault: true,
            isVerified: true,
            source: 'ESTABLISHMENT',
            status: 'ACTIVE'
          }
        })
      } else {
        activeTarif = await tx.tarif.create({
          data: {
            programmeId: prog.id,
            anneeAcademique: '2025-2026',
            label: 'Tarif Certifiant Officiel ABS 2025-2026',
            montant: tarifConfig.montant,
            montantBourse: tarifConfig.montantBourse,
            fraisInscription: tarifConfig.inscription,
            mensualite: tarifConfig.mensualite,
            nombreMois: tarifConfig.mois,
            frequence: 'CHOIX_ETUDIANT',
            devise: 'FCFA',
            isDefault: true,
            isVerified: true,
            source: 'ESTABLISHMENT',
            status: 'ACTIVE'
          }
        })
        stats.tarifsCreatedCount++
      }

      // 5. Créer / Mettre à jour la Bourse Officielle ABS
      const existingBourse = await tx.bourse.findFirst({
        where: { programmeId: prog.id }
      })

      const bourseTitle = `Bourse Certifiante ABS 2025-2026 — ${progData.titre}`

      if (existingBourse) {
        await tx.bourse.update({
          where: { id: existingBourse.id },
          data: {
            titre: bourseTitle,
            slug: `bourse-${progData.slug}`,
            partnerId: partner.id,
            coveragePercent: 50,
            montantMax: tarifConfig.montantBourse,
            dateLimite: new Date('2026-11-30'),
            isActive: true,
            status: 'ACTIVE'
          }
        })
        stats.boursesUpdatedCount++
      } else {
        await tx.bourse.create({
          data: {
            programmeId: prog.id,
            partnerId: partner.id,
            titre: bourseTitle,
            slug: `bourse-${progData.slug}`,
            coveragePercent: 50,
            montantMax: tarifConfig.montantBourse,
            dateLimite: new Date('2026-11-30'),
            isActive: true,
            status: 'ACTIVE'
          }
        })
        stats.boursesCreatedCount++
      }
    }
  })

  console.log('✅ Importation ABS terminée avec succès dans la transaction Prisma.')
  return stats
}

async function verifyAssertions() {
  console.log('\n🧪 DÉBUT DES VERIFICATIONS AUTOMATISÉES POST-IMPORT ABS...')

  const etab = await prisma.etablissement.findFirst({
    where: { slug: 'abs-school-dakar' },
    include: {
      programmes: {
        include: { bourses: true, tarifs: true }
      }
    }
  })

  assert(etab !== null, 'L\'établissement ABS doit exister')
  assert(etab.isDirectPartner === true, 'ABS doit être un Partenaire Direct')
  assert(etab.fraisDossier === 10000, 'ABS doit avoir des frais de dossier globaux de 10 000 FCFA')

  // Vérifier la présence des 12 programmes certifiants
  for (const progData of OFFICIAL_ABS_PROGRAMMES) {
    const prog = etab.programmes.find((p) => p.slug === progData.slug)
    assert(prog !== undefined, `Le programme "${progData.titre}" doit exister`)
    assert(prog.status === 'ACTIVE', `Le programme "${progData.titre}" doit être ACTIVE`)

    const defaultTarif = progData.tarifsBourse.default
    const activeTarif = prog.tarifs.find((t) => t.anneeAcademique === '2025-2026' && t.isDefault)
    assert(activeTarif !== undefined, `Le tarif 2025-2026 doit exister pour "${progData.titre}"`)
    assert.strictEqual(activeTarif.montant, defaultTarif.montant, `Montant global incorrect pour ${progData.titre}`)
    assert.strictEqual(activeTarif.fraisInscription, defaultTarif.inscription, `Frais d'inscription incorrects pour ${progData.titre}`)
    assert.strictEqual(activeTarif.mensualite, defaultTarif.mensualite, `Mensualité incorrecte pour ${progData.titre}`)
    assert.strictEqual(activeTarif.nombreMois, defaultTarif.mois, `Nombre de mois incorrect pour ${progData.titre}`)

    const activeBourse = prog.bourses.find((b) => b.isActive)
    assert(activeBourse !== undefined, `La bourse active doit exister pour "${progData.titre}"`)
  }

  console.log('🎉 TOUTES LES ASSERTIONS POST-IMPORT ABS ONT RÉUSSI AVEC SUCCÈS !')
}

async function main() {
  const stats1 = await runImport()
  await verifyAssertions()
  console.log('\n📊 RAPPORT D\'EXÉCUTION 1ER PASSAGE ABS :', stats1)

  console.log('\n🔁 DEUXIÈME PASSAGE IDEMPOTENCE ABS...')
  const stats2 = await runImport()
  await verifyAssertions()
  console.log('📊 RAPPORT D\'EXÉCUTION 2ÈME PASSAGE ABS :', stats2)

  assert.strictEqual(stats2.createCount, 0, 'Le 2ème passage ne doit créer aucun nouveau programme')
  assert.strictEqual(stats2.tarifsCreatedCount, 0, 'Le 2ème passage ne doit créer aucun nouveau tarif')
  assert.strictEqual(stats2.boursesCreatedCount, 0, 'Le 2ème passage ne doit créer aucune nouvelle bourse')

  console.log('\n🏆 TEST D\'IDEMPOTENCE VALIDE : 100% IDEMPOTENT !')
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('\n❌ ERREUR D\'IMPORT ABS (ROLLBACK DÉCLENCHÉ) :', err)
    prisma.$disconnect()
    process.exit(1)
  })
