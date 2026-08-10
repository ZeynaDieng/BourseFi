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
    slug?: string
    nom?: string
    ville?: string
    adresse?: string | null
    accreditation?: string | null
    site?: string | null
    phone?: string | null
    phoneSecondary?: string | null
    whatsapp?: string | null
    email?: string | null
    resume?: string | null
    coverImageUrl?: string | null
    logoUrl?: string | null
    typeLabel?: string | null
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    source?: 'OFFICIAL_WEBSITE' | 'ESTABLISHMENT' | 'DIRECTORY' | 'OTHER' | null
    contactStatus?: 'VERIFIED' | 'TO_VERIFY' | 'UNVERIFIED'
  }>(event)

  const slug = body.slug ? normalizeSlug(body.slug) : ''
  if (!slug || !body.nom?.trim() || !body.ville?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Slug, nom et ville sont requis.' })
  }

  const exists = await prisma.etablissement.findUnique({ where: { slug } })
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
  }

  const contactStatus = body.contactStatus || 'TO_VERIFY'
  const contactVerifiedAt = contactStatus === 'VERIFIED' ? new Date() : null

  const row = await prisma.etablissement.create({
    data: {
      slug,
      nom: body.nom.trim(),
      ville: body.ville.trim(),
      adresse: body.adresse?.trim() || null,
      accreditation: body.accreditation?.trim() || null,
      site: body.site?.trim() || null,
      phone: body.phone?.trim() || null,
      phoneSecondary: body.phoneSecondary?.trim() || null,
      whatsapp: body.whatsapp?.trim() || null,
      email: body.email?.trim() || null,
      resume: body.resume?.trim() || null,
      coverImageUrl: body.coverImageUrl?.trim() || null,
      logoUrl: body.logoUrl?.trim() || null,
      typeLabel: body.typeLabel?.trim() || null,
      status: body.status || 'ACTIVE',
      source: body.source || null,
      contactStatus,
      contactVerifiedAt,
      updatedBy: user.email,
    },
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'ETABLISSEMENT_CREATE',
    entityType: 'Etablissement',
    entityId: row.id,
    metadata: { slug: row.slug },
  })

  return row
})
