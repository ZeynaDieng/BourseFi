import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  const p = await prisma.paiement.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      candidature: {
        select: {
          id: true,
          fullName: true,
          status: true,
          targetProgram: true,
          programme: { select: { titre: true, slug: true } },
          partner: { select: { name: true, slug: true } },
        },
      },
    },
  })

  if (!p) {
    throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable.' })
  }

  return {
    id: p.id,
    fullName: p.fullName,
    email: p.email,
    phone: p.phone,
    amount: p.amount,
    amountPartner: p.amountPartner,
    amountPlatform: p.amountPlatform,
    currency: p.currency,
    method: p.method,
    status: p.status,
    provider: p.provider,
    refCommand: p.refCommand,
    token: p.token,
    createdAt: p.createdAt.toISOString(),
    userId: p.userId,
    candidatureId: p.candidatureId,
    user: p.user,
    candidature: p.candidature,
  }
})
