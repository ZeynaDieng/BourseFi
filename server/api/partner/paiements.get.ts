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

  const rows = await prisma.paiement.findMany({
    where: { candidature: { partnerId: user.partnerId } },
    include: {
      candidature: {
        select: { targetProgram: true, fullName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return rows.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    programme: p.candidature?.targetProgram ?? null,
    amount: p.amount,
    amountPartner: p.amountPartner,
    currency: p.currency,
    method: p.method,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }))
})
