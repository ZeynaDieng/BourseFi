import { createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { computeScholarshipEconomy } from '../../../app/utils/scholarship-math'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug requis.' })

  const partner = await prisma.partner.findUnique({
    where: { slug },
    include: {
      bourses: {
        where: { isActive: true },
        include: {
          programme: {
            include: { etablissement: true },
          },
        },
      },
      programmes: {
        include: { etablissement: true },
      },
    },
  })

  if (!partner) {
    throw createError({ statusCode: 404, statusMessage: 'Partenaire introuvable.' })
  }

  const ecolesMap = new Map<string, { slug: string; nom: string; ville: string }>()
  for (const b of partner.bourses) {
    ecolesMap.set(partner.programmes.find((p) => p.id === b.programmeId)?.etablissement.slug ?? b.programme.etablissement.slug, {
      slug: b.programme.etablissement.slug,
      nom: b.programme.etablissement.nom,
      ville: b.programme.etablissement.ville,
    })
  }

  let montantDistribue = 0
  for (const b of partner.bourses) {
    const eco = computeScholarshipEconomy(
      b.programme.fraisScolarite,
      b.coveragePercent,
      b.montantMax,
    )
    montantDistribue += eco.montantBourse * Math.max(0, b.quota - b.placesRestantes)
  }

  const paiements = await prisma.paiement.aggregate({
    where: { candidature: { partnerId: partner.id } },
    _sum: { amountPartner: true },
  })

  return {
    id: partner.id,
    slug: partner.slug,
    name: partner.name,
    logoUrl: partner.logoUrl,
    contactEmail: partner.contactEmail,
    description: partner.description,
    conditions: partner.conditions,
    boursesCount: partner.bourses.length,
    ecoles: [...ecolesMap.values()],
    montantDistribue: paiements._sum.amountPartner ?? montantDistribue,
    bourses: partner.bourses.map((b) => ({
      slug: b.slug,
      titre: b.titre,
      coveragePercent: b.coveragePercent,
      placesRestantes: b.placesRestantes,
      dateLimite: b.dateLimite.toISOString(),
      etablissement: b.programme.etablissement.nom,
      programmeSlug: b.programme.slug,
    })),
  }
})
