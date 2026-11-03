import { Prisma } from '@prisma/client'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { parseApplicationDraft } from '../../../utils/application-draft'
import { DRAFT_WHATSAPP_ACTION } from '../../../utils/whatsapp'

/** Candidatures commencées mais jamais envoyées (brouillons), pour une relance WhatsApp manuelle. */
export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const users = await prisma.user.findMany({
    where: { role: 'STUDENT', deactivatedAt: null, applicationDraft: { not: Prisma.DbNull } },
    orderBy: { updatedAt: 'desc' },
    take: 100,
    select: {
      id: true, name: true, firstName: true, lastName: true, email: true, phone: true,
      emailVerified: true, createdAt: true, applicationDraft: true,
    },
  })

  const drafts = users
    .map((u) => ({ user: u, draft: parseApplicationDraft(u.applicationDraft) }))
    .filter((d): d is { user: typeof users[number]; draft: NonNullable<typeof d.draft> } => d.draft !== null)

  const bourses = await prisma.bourse.findMany({
    where: { slug: { in: [...new Set(drafts.map((d) => d.draft.bourseSlug))] } },
    select: { slug: true, isActive: true, programme: { select: { titre: true, etablissement: { select: { nom: true } } } } },
  })
  const bourseBySlug = new Map(bourses.map((b) => [b.slug, b]))

  const contacts = await prisma.auditLog.findMany({
    where: { action: DRAFT_WHATSAPP_ACTION, entityId: { in: drafts.map((d) => d.user.id) } },
    orderBy: { createdAt: 'desc' },
    select: { entityId: true, createdAt: true },
  })
  const lastContact = new Map<string, Date>()
  for (const c of contacts) if (c.entityId && !lastContact.has(c.entityId)) lastContact.set(c.entityId, c.createdAt)

  return {
    ok: true,
    brouillons: drafts.map(({ user, draft }) => {
      const bourse = bourseBySlug.get(draft.bourseSlug)
      return {
        userId: user.id,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name,
        email: user.email,
        phone: draft.fields.phone || user.phone || '',
        emailVerified: user.emailVerified,
        formation: bourse?.programme.titre ?? null,
        etablissement: bourse?.programme.etablissement.nom ?? null,
        bourseActive: Boolean(bourse?.isActive),
        startedAt: user.createdAt,
        updatedAt: draft.updatedAt,
        lastWhatsappAt: lastContact.get(user.id) ?? null,
      }
    }),
  }
})
