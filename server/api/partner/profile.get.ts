import { createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'
import { assertPartnerPortalEnabled } from '../../utils/product-config'

export default defineEventHandler(async (event) => {
  assertPartnerPortalEnabled()
  const user = await requireRole(event, ['PARTNER'])
  if (!user.partnerId) {
    throw createError({ statusCode: 403, statusMessage: 'Compte partenaire non rattaché.' })
  }

  const partner = await prisma.partner.findUnique({
    where: { id: user.partnerId },
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
      contactEmail: true,
      description: true,
      conditions: true,
    },
  })

  if (!partner) {
    throw createError({ statusCode: 404, statusMessage: 'Partenaire introuvable.' })
  }

  return partner
})
