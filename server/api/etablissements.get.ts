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
          partner: { select: { name: true, slug: true } }
        }
      }
    },
    orderBy: { nom: 'asc' }
  })

  return ecoles.map((e) => ({
    slug: e.slug,
    nom: e.nom,
    ville: e.ville,
    accreditation: e.accreditation,
    site: e.site,
    resume: e.resume,
    coverImageUrl: e.coverImageUrl,
    logoUrl: e.logoUrl,
    typeLabel: e.typeLabel,
    programmes: e.programmes.map((p) => ({
      slug: p.slug,
      titre: p.titre,
      frais: p.fraisScolarite,
      fraisDossier: p.fraisDossier,
      devise: p.devise,
      duree: p.duree,
      niveau: p.niveau,
      placement: p.placement,
      partnerName: p.partner.name
    }))
  }))
})
