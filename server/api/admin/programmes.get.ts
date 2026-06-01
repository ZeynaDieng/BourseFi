import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const rows = await prisma.programme.findMany({
    include: {
      etablissement: { select: { id: true, slug: true, nom: true } },
      partner: { select: { id: true, slug: true, name: true } },
      _count: { select: { candidatures: true } }
    },
    orderBy: [{ etablissement: { nom: 'asc' } }, { titre: 'asc' }]
  })
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    titre: p.titre,
    ville: p.ville,
    duree: p.duree,
    fraisDossier: p.fraisDossier,
    fraisScolarite: p.fraisScolarite,
    devise: p.devise,
    niveau: p.niveau,
    placement: p.placement,
    description: p.description,
    eligibilite: p.eligibilite,
    brochureUrl: p.brochureUrl,
    perspectives: p.perspectives,
    etablissementId: p.etablissementId,
    partnerId: p.partnerId,
    etablissement: p.etablissement,
    partner: p.partner,
    candidaturesCount: p._count.candidatures
  }))
})
