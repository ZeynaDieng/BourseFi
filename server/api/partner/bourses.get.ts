import { createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'
import { bourseInclude, serializeBourse } from '../../utils/bourse-serialize'
import { assertPartnerPortalEnabled } from '../../utils/product-config'

export default defineEventHandler(async (event) => {
  assertPartnerPortalEnabled()
  const user = await requireRole(event, ['PARTNER'])
  if (!user.partnerId) {
    throw createError({ statusCode: 403, statusMessage: 'Compte partenaire non rattaché.' })
  }

  const rows = await prisma.bourse.findMany({
    where: { partnerId: user.partnerId },
    include: {
      ...bourseInclude,
      _count: { select: { candidatures: true } },
    },
    orderBy: [{ isActive: 'desc' }, { dateLimite: 'asc' }],
  })

  return rows.map((b) => ({
    ...serializeBourse(b),
    candidaturesCount: b._count.candidatures,
  }))
})
