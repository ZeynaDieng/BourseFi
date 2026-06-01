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
    slug?: string
    nom?: string
    ville?: string
    accreditation?: string | null
    site?: string | null
    resume?: string | null
    coverImageUrl?: string | null
    logoUrl?: string | null
    typeLabel?: string | null
  }>(event)

  if (body.slug !== undefined) {
    const s = normalizeSlug(body.slug)
    if (!s) throw createError({ statusCode: 400, statusMessage: 'Slug invalide.' })
    const clash = await prisma.etablissement.findFirst({
      where: { slug: s, NOT: { id } }
    })
    if (clash) {
      throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
    }
  }

  const row = await prisma.etablissement.update({
    where: { id },
    data: {
      ...(body.slug !== undefined ? { slug: normalizeSlug(body.slug) } : {}),
      ...(body.nom !== undefined ? { nom: body.nom.trim() } : {}),
      ...(body.ville !== undefined ? { ville: body.ville.trim() } : {}),
      ...(body.accreditation !== undefined ? { accreditation: body.accreditation?.trim() || null } : {}),
      ...(body.site !== undefined ? { site: body.site?.trim() || null } : {}),
      ...(body.resume !== undefined ? { resume: body.resume?.trim() || null } : {}),
      ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl?.trim() || null } : {}),
      ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl?.trim() || null } : {}),
      ...(body.typeLabel !== undefined ? { typeLabel: body.typeLabel?.trim() || null } : {})
    }
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'ETABLISSEMENT_UPDATE',
    entityType: 'Etablissement',
    entityId: row.id,
    metadata: { slug: row.slug }
  })

  return row
})
