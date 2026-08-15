import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const activeOnly = query.active !== 'false'

  const ecoles = await prisma.etablissement.findMany({
    where: {
      ...(activeOnly ? { status: 'ACTIVE' } : {}),
    },
    include: {
      contacts: {
        where: { isActive: true },
      },
      programmes: {
        where: {
          ...(activeOnly ? { status: 'ACTIVE' } : {}),
        },
        select: {
          slug: true,
          titre: true,
          fraisDossier: true,
          fraisDossierEtranger: true,
          devise: true,
          duree: true,
          niveau: true,
          placement: true,
          partner: { select: { name: true, slug: true } },
          bourses: {
            where: {
              ...(activeOnly ? { isActive: true, status: 'ACTIVE' } : {}),
            },
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
      id: e.id,
      slug: e.slug,
      nom: e.nom,
      ville: e.ville,
      adresse: e.adresse,
      accreditation: e.accreditation,
      site: e.site,
      phone: e.phone,
      phoneSecondary: e.phoneSecondary,
      whatsapp: e.whatsapp,
      email: e.email,
      status: e.status,
      contactStatus: e.contactStatus,
      contactVerifiedAt: e.contactVerifiedAt ? e.contactVerifiedAt.toISOString() : null,
      source: e.source,
      isDirectPartner: e.isDirectPartner,
      fraisDossier: e.fraisDossier,
      resume: e.resume,
      coverImageUrl: e.coverImageUrl,
      logoUrl: e.logoUrl,
      typeLabel: e.typeLabel,
      formationsCount: e.programmes.length,
      boursesCount,
      tauxInsertion,
      partenairePrincipal,
      contacts: e.contacts,
      programmes: e.programmes.map((p) => {
        const effectiveFrais = e.isDirectPartner && e.fraisDossier !== undefined && e.fraisDossier !== null
          ? e.fraisDossier
          : p.fraisDossier
        return {
          slug: p.slug,
          titre: p.titre,
          fraisDossier: effectiveFrais,
          fraisDossierEtranger: p.fraisDossierEtranger ?? effectiveFrais,
          devise: p.devise,
          duree: p.duree,
          niveau: p.niveau,
          placement: p.placement,
          partnerName: p.partner.name,
          boursesCount: p.bourses.length,
        }
      }),
    }
  })
})
