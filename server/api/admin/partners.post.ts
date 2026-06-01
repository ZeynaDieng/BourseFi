import { createError, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'

function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const body = await readBody<{
    name?: string
    slug?: string
    logoUrl?: string | null
    contactEmail?: string | null
    partnerSharePercent?: number
  }>(event)

  const slug = body.slug ? normalizeSlug(body.slug) : ''
  if (!slug || !body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Slug et nom sont requis.' })
  }

  const pct = Number(body.partnerSharePercent ?? 75)
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Part partenaire invalide (0–100).' })
  }

  const exists = await prisma.partner.findUnique({ where: { slug } })
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
  }

  const row = await prisma.partner.create({
    data: {
      slug,
      name: body.name.trim(),
      logoUrl: body.logoUrl?.trim() || null,
      contactEmail: body.contactEmail?.trim() || null,
      partnerSharePercent: Math.round(pct)
    }
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'PARTNER_CREATE',
    entityType: 'Partner',
    entityId: row.id,
    metadata: { slug: row.slug }
  })

  return row
})
