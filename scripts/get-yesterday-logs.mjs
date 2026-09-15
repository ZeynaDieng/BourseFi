import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('============================================================')
  console.log('JOURNAL DE BORD (LOGS D\'ACTIVITÉ & AUDIT BOURSEFI)')
  console.log('============================================================')

  // Date d'hier et aujourd'hui
  const now = new Date()
  const last48h = new Date(now.getTime() - 48 * 3600 * 1000)

  console.log(`\n📅 Recherche de l'activité sur les dernières 48 heures (Depuis: ${last48h.toISOString()})...\n`)

  // 1. Audit Logs (Inscriptions, Paiements, etc.)
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: { gte: last48h }
    },
    include: { actor: true },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`--- [1/4] AUDIT LOGS (Dernières 48h) : ${auditLogs.length} évènement(s) ---`)
  if (auditLogs.length === 0) {
    console.log('  (Aucun évènement enregistré dans AuditLog sur les dernières 48h)')
  } else {
    auditLogs.forEach(log => {
      console.log(`  • [${log.createdAt.toISOString()}] Action: ${log.action} | Role: ${log.actorRole} | Entity: ${log.entityType} (${log.entityId || 'N/A'})`)
      if (log.metadata) console.log(`    Metadata: ${log.metadata}`)
    })
  }

  // 2. Dernières Inscriptions Utilisateurs
  const recentUsers = await prisma.user.findMany({
    where: {
      createdAt: { gte: last48h }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`\n--- [2/4] INSCRIPTIONS UTILISATEURS (Dernières 48h) : ${recentUsers.length} inscription(s) ---`)
  if (recentUsers.length === 0) {
    console.log('  (Aucune nouvelle inscription sur les dernières 48h)')
  } else {
    recentUsers.forEach(u => {
      console.log(`  • [${u.createdAt.toISOString()}] ${u.name} (${u.email}) - Téléphone: ${u.phone || 'Non renseigné'}`)
    })
  }

  // 3. Dernières Candidatures
  const recentCandidatures = await prisma.candidature.findMany({
    where: {
      createdAt: { gte: last48h }
    },
    include: { programme: true },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`\n--- [3/4] DOSSIERS DE CANDIDATURE (Dernières 48h) : ${recentCandidatures.length} dossier(s) ---`)
  if (recentCandidatures.length === 0) {
    console.log('  (Aucun nouveau dossier déposé sur les dernières 48h)')
  } else {
    recentCandidatures.forEach(c => {
      console.log(`  • [${c.createdAt.toISOString()}] Dossier ${c.id.slice(0, 8)} | ${c.fullName} (${c.email}) | Statut: ${c.status} | Programme: ${c.targetProgram}`)
    })
  }

  // 4. Derniers Paiements
  const recentPaiements = await prisma.paiement.findMany({
    where: {
      createdAt: { gte: last48h }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`\n--- [4/4] TRANSACTIONS / PAIEMENTS (Dernières 48h) : ${recentPaiements.length} paiement(s) ---`)
  if (recentPaiements.length === 0) {
    console.log('  (Aucun paiement initié sur les dernières 48h)')
  } else {
    recentPaiements.forEach(p => {
      console.log(`  • [${p.createdAt.toISOString()}] Paiement ${p.id.slice(0, 8)} | ${p.fullName} (${p.email}) | Montant: ${p.amount} ${p.currency} | Statut: ${p.status} | Réf: ${p.refCommand}`)
    })
  }

  // S'il n'y a rien sur 48h, affichons le dernier évènement enregistré globalement pour être 100% transparent !
  if (auditLogs.length === 0 && recentUsers.length === 0 && recentCandidatures.length === 0 && recentPaiements.length === 0) {
    console.log('\n============================================================')
    console.log('RECHERCHE DES DERNIERS ÉVÈNEMENTS ENREGISTRÉS EN BASE (TOUTES DATES CONDUITES)')
    console.log('============================================================')
    const lastAudit = await prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    const lastPaiement = await prisma.paiement.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    const lastUser = await prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    
    console.log('\n📌 Derniers AuditLogs enregistrés :')
    console.log(JSON.stringify(lastAudit, null, 2))

    console.log('\n📌 Derniers Paiements enregistrés :')
    console.log(JSON.stringify(lastPaiement.map(p => ({ id: p.id, name: p.fullName, email: p.email, amount: p.amount, status: p.status, date: p.createdAt })), null, 2))

    console.log('\n📌 Derniers Utilisateurs enregistrés :')
    console.log(JSON.stringify(lastUser.map(u => ({ id: u.id, name: u.name, email: u.email, date: u.createdAt })), null, 2))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
