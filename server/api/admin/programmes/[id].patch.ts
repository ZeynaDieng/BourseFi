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
    etablissementId?: string
    partnerId?: string
    titre?: string
    ville?: string
    duree?: string
    fraisDossier?: number
    fraisScolarite?: number
    devise?: string
    niveau?: string
    placement?: string | null
    description?: string
    eligibilite?: string | null
    brochureUrl?: string | null
    perspectives?: string | null
  }>(event)

  if (body.slug !== undefined) {
    const s = normalizeSlug(body.slug)
    if (!s) throw createError({ statusCode: 400, statusMessage: 'Slug invalide.' })
    const clash = await prisma.programme.findFirst({
      where: { slug: s, NOT: { id } }
    })
    if (clash) {
      throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
    }
  }

  if (body.etablissementId !== undefined) {
    const etab = await prisma.etablissement.findUnique({ where: { id: body.etablissementId } })
    if (!etab) throw createError({ statusCode: 400, statusMessage: 'Établissement invalide.' })
  }
  if (body.partnerId !== undefined) {
    const partner = await prisma.partner.findUnique({ where: { id: body.partnerId } })
    if (!partner) throw createError({ statusCode: 400, statusMessage: 'Partenaire invalide.' })
  }

  let fraisPatch: { fraisDossier?: number; fraisScolarite?: number } = {}
  if (body.fraisDossier !== undefined) {
    const n = Number(body.fraisDossier)
    if (!Number.isFinite(n) || n < 0) throw createError({ statusCode: 400, statusMessage: 'Frais dossier invalides.' })
    fraisPatch.fraisDossier = Math.round(n)
  }
  if (body.fraisScolarite !== undefined) {
    const n = Number(body.fraisScolarite)
    if (!Number.isFinite(n) || n < 0) throw createError({ statusCode: 400, statusMessage: 'Frais scolarité invalides.' })
    fraisPatch.fraisScolarite = Math.round(n)
  }

  const row = await prisma.programme.update({
    where: { id },
    data: {
      ...(body.slug !== undefined ? { slug: normalizeSlug(body.slug) } : {}),
      ...(body.etablissementId !== undefined ? { etablissementId: body.etablissementId } : {}),
      ...(body.partnerId !== undefined ? { partnerId: body.partnerId } : {}),
      ...(body.titre !== undefined ? { titre: body.titre.trim() } : {}),
      ...(body.ville !== undefined ? { ville: body.ville.trim() } : {}),
      ...(body.duree !== undefined ? { duree: body.duree.trim() } : {}),
      ...fraisPatch,
      ...(body.devise !== undefined ? { devise: body.devise.trim().slice(0, 12) } : {}),
      ...(body.niveau !== undefined ? { niveau: body.niveau.trim() } : {}),
      ...(body.placement !== undefined ? { placement: body.placement?.trim() || null } : {}),
      ...(body.description !== undefined ? { description: body.description.trim() } : {}),
      ...(body.eligibilite !== undefined ? { eligibilite: body.eligibilite?.trim() || null } : {}),
      ...(body.brochureUrl !== undefined ? { brochureUrl: body.brochureUrl?.trim() || null } : {}),
      ...(body.perspectives !== undefined ? { perspectives: body.perspectives?.trim() || null } : {})
    }
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'PROGRAMME_UPDATE',
    entityType: 'Programme',
    entityId: row.id,
    metadata: { slug: row.slug }
  })

  return row
})
