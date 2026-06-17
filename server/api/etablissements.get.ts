import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  const ecoles = await prisma.etablissement.findMany({
    include: {
      programmes: {
        select: {
          slug: true,
          titre: true,
          fraisScolarite: true,
          fraisDossier: true,
          devise: true,
          duree: true,
          niveau: true,
          placement: true,
          partner: { select: { name: true, slug: true } },
          bourses: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { nom: 'asc' },
  })

  return ecoles.map((e) => {
    const boursesCount = e.programmes.reduce((acc, p) => acc + p.bourses.length, 0)
    const placements = e.programmes
      .map((p) => parseInt(String(p.placement ?? '').replace(/\D/g, ''), 10))
      .filter((n) => Number.isFinite(n) && n > 0)
    const tauxInsertion =
      placements.length > 0
        ? `${Math.round(placements.reduce((a, b) => a + b, 0) / placements.length)}%`
        : null

    const partnerFreq = new Map<string, number>()
    for (const p of e.programmes) {
      partnerFreq.set(p.partner.name, (partnerFreq.get(p.partner.name) ?? 0) + 1)
    }
    const partenairePrincipal =
      [...partnerFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    return {
      slug: e.slug,
      nom: e.nom,
      ville: e.ville,
      accreditation: e.accreditation,
      site: e.site,
      resume: e.resume,
      coverImageUrl: e.coverImageUrl,
      logoUrl: e.logoUrl,
      typeLabel: e.typeLabel,
      formationsCount: e.programmes.length,
      boursesCount,
      tauxInsertion,
      partenairePrincipal,
      programmes: e.programmes.map((p) => ({
        slug: p.slug,
        titre: p.titre,
        frais: p.fraisScolarite,
        fraisDossier: p.fraisDossier,
        devise: p.devise,
        duree: p.duree,
        niveau: p.niveau,
        placement: p.placement,
        partnerName: p.partner.name,
        boursesCount: p.bourses.length,
      })),
    }
  })
})
