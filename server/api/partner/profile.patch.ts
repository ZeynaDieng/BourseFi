import { createError, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'
import { assertPartnerPortalEnabled } from '../../utils/product-config'

export default defineEventHandler(async (event) => {
  assertPartnerPortalEnabled()
  const user = await requireRole(event, ['PARTNER'])
  if (!user.partnerId) {
    throw createError({ statusCode: 403, statusMessage: 'Compte partenaire non rattaché.' })
  }

  const body = await readBody<{
    description?: string | null
    conditions?: string | null
    contactEmail?: string | null
  }>(event)

  return prisma.partner.update({
    where: { id: user.partnerId },
    data: {
      ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
      ...(body.conditions !== undefined ? { conditions: body.conditions?.trim() || null } : {}),
      ...(body.contactEmail !== undefined ? { contactEmail: body.contactEmail?.trim() || null } : {}),
    },
  })
})
