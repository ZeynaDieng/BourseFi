import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })

  const body = await readBody<{
    name?: string
    slug?: string
    logoUrl?: string | null
    contactEmail?: string | null
    partnerSharePercent?: number
  }>(event)

  if (body.slug !== undefined) {
    const s = normalizeSlug(body.slug)
    if (!s) throw createError({ statusCode: 400, statusMessage: 'Slug invalide.' })
    const clash = await prisma.partner.findFirst({
      where: { slug: s, NOT: { id } }
    })
    if (clash) {
      throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
    }
  }

  if (body.partnerSharePercent !== undefined) {
    const pct = Number(body.partnerSharePercent)
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      throw createError({ statusCode: 400, statusMessage: 'Part partenaire invalide (0–100).' })
    }
  }

  const row = await prisma.partner.update({
    where: { id },
    data: {
      ...(body.slug !== undefined ? { slug: normalizeSlug(body.slug) } : {}),
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl?.trim() || null } : {}),
      ...(body.contactEmail !== undefined ? { contactEmail: body.contactEmail?.trim() || null } : {}),
      ...(body.partnerSharePercent !== undefined
        ? { partnerSharePercent: Math.round(Number(body.partnerSharePercent)) }
        : {})
    }
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'PARTNER_UPDATE',
    entityType: 'Partner',
    entityId: row.id,
    metadata: { slug: row.slug }
  })

  return row
})
