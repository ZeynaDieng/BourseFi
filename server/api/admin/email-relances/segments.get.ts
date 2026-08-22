import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const candidatures = await prisma.candidature.findMany({
    where: { paiement: null },
    include: {
      programme: { include: { etablissement: true } },
    },
  })

  const now = new Date()

  const segments = {
    segmentA: { name: 'Segment A — Paiement en attente (< 7 jours)', count: 0, revenue: 0, items: [] as any[] },
    segmentB: { name: 'Segment B — Paiement en attente (> 7 jours)', count: 0, revenue: 0, items: [] as any[] },
    segmentC: { name: 'Segment C — Paiement en attente (> 15 jours)', count: 0, revenue: 0, items: [] as any[] },
    segmentD: { name: 'Segment D — Paiement en attente (> 30 jours)', count: 0, revenue: 0, items: [] as any[] },
    segmentE: { name: 'Segment E — Paiement échoué / interrompu', count: 0, revenue: 0, items: [] as any[] },
    segmentF: { name: 'Segment F — Dossier incomplet', count: 0, revenue: 0, items: [] as any[] },
  }

  for (const c of candidatures) {
    const ageDays = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    const fee = c.montantFinal ?? c.programme?.fraisDossier ?? c.programme?.etablissement?.fraisDossier ?? 20000

    const item = {
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      formation: c.programme?.titre || 'N/A',
      ecole: c.programme?.etablissement?.nom || 'N/A',
      montant: fee,
      ageDays: Math.floor(ageDays),
    }

    if (!c.field || !c.institution) {
      segments.segmentF.count++
      segments.segmentF.revenue += fee
      segments.segmentF.items.push(item)
    } else if (ageDays < 7) {
      segments.segmentA.count++
      segments.segmentA.revenue += fee
      segments.segmentA.items.push(item)
    } else if (ageDays >= 7 && ageDays < 15) {
      segments.segmentB.count++
      segments.segmentB.revenue += fee
      segments.segmentB.items.push(item)
    } else if (ageDays >= 15 && ageDays < 30) {
      segments.segmentC.count++
      segments.segmentC.revenue += fee
      segments.segmentC.items.push(item)
    } else {
      segments.segmentD.count++
      segments.segmentD.revenue += fee
      segments.segmentD.items.push(item)
    }
  }

  return { ok: true, segments }
})
