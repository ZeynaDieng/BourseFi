import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { statusLabel } from '../../../utils/candidature-status'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      partner: { select: { id: true, name: true, slug: true } },
      candidatures: {
        include: {
          programme: { select: { titre: true, slug: true } },
          bourse: { select: { titre: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      paiements: {
        select: { id: true, amount: true, status: true, method: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { candidatures: true, paiements: true, notifications: true } },
    },
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    address: user.address,
    identityCardRectoUrl: user.identityCardRectoUrl,
    identityCardVersoUrl: user.identityCardVersoUrl,
    profileComplete: Boolean(
      user.firstName &&
        user.lastName &&
        user.phone &&
        user.address &&
        user.identityCardRectoUrl &&
        user.identityCardVersoUrl
    ),
    partner: user.partner,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    counts: user._count,
    candidatures: user.candidatures.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      status: c.status,
      statusLabel: statusLabel(c.status),
      programmeTitre: c.programme.titre,
      programmeSlug: c.programme.slug,
      bourseTitre: c.bourse?.titre ?? null,
      documentUrl: c.documentUrl,
      createdAt: c.createdAt.toISOString(),
    })),
    paiements: user.paiements.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      method: p.method,
      createdAt: p.createdAt.toISOString(),
    })),
  }
})
