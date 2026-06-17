import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  const partners = await prisma.partner.findMany({
    include: {
      _count: {
        select: {
          bourses: { where: { isActive: true } },
          programmes: true,
        },
      },
      bourses: {
        where: { isActive: true },
        select: { coveragePercent: true, montantMax: true, programme: { select: { fraisScolarite: true } } },
      },
    },
    orderBy: { name: 'asc' },
  })

  return partners.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    logoUrl: p.logoUrl,
    contactEmail: p.contactEmail,
    description: p.description,
    boursesCount: p._count.bourses,
    ecolesCount: p._count.programmes,
  }))
})
