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
    fraisDossierEtranger?: number
    devise?: string
    niveau?: string
    placement?: string | null
    description?: string
    eligibilite?: string | null
    brochureUrl?: string | null
    perspectives?: string | null
    objectifs?: string | null
    competences?: string | null
    programmePedagogique?: string | null
    debouches?: string | null
    secteurs?: string | null
    conditionsAdmission?: string | null
    documentsRequis?: string | null
    modalites?: string | null
    stage?: string | null
    examens?: string | null
    poursuiteEtudes?: string | null
    sourceType?: string | null
    sourceUrl?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    ogImageUrl?: string | null
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

  let fraisPatch: { fraisDossier?: number; fraisDossierEtranger?: number } = {}
  if (body.fraisDossier !== undefined) {
    const n = Number(body.fraisDossier)
    if (!Number.isFinite(n) || n < 0) throw createError({ statusCode: 400, statusMessage: 'Frais dossier invalides.' })
    fraisPatch.fraisDossier = Math.round(n)
  }
  if (body.fraisDossierEtranger !== undefined) {
    const n = Number(body.fraisDossierEtranger)
    if (!Number.isFinite(n) || n < 0) throw createError({ statusCode: 400, statusMessage: 'Frais dossier étranger invalides.' })
    fraisPatch.fraisDossierEtranger = Math.round(n)
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
      ...(body.perspectives !== undefined ? { perspectives: body.perspectives?.trim() || null } : {}),
      ...(body.objectifs !== undefined ? { objectifs: body.objectifs?.trim() || null } : {}),
      ...(body.competences !== undefined ? { competences: body.competences?.trim() || null } : {}),
      ...(body.programmePedagogique !== undefined ? { programmePedagogique: body.programmePedagogique?.trim() || null } : {}),
      ...(body.debouches !== undefined ? { debouches: body.debouches?.trim() || null } : {}),
      ...(body.secteurs !== undefined ? { secteurs: body.secteurs?.trim() || null } : {}),
      ...(body.conditionsAdmission !== undefined ? { conditionsAdmission: body.conditionsAdmission?.trim() || null } : {}),
      ...(body.documentsRequis !== undefined ? { documentsRequis: body.documentsRequis?.trim() || null } : {}),
      ...(body.modalites !== undefined ? { modalites: body.modalites?.trim() || null } : {}),
      ...(body.stage !== undefined ? { stage: body.stage?.trim() || null } : {}),
      ...(body.examens !== undefined ? { examens: body.examens?.trim() || null } : {}),
      ...(body.poursuiteEtudes !== undefined ? { poursuiteEtudes: body.poursuiteEtudes?.trim() || null } : {}),
      ...(body.sourceType !== undefined ? { sourceType: body.sourceType?.trim() || null } : {}),
      ...(body.sourceUrl !== undefined ? { sourceUrl: body.sourceUrl?.trim() || null } : {}),
      ...(body.metaTitle !== undefined ? { metaTitle: body.metaTitle?.trim() || null } : {}),
      ...(body.metaDescription !== undefined ? { metaDescription: body.metaDescription?.trim() || null } : {}),
      ...(body.ogImageUrl !== undefined ? { ogImageUrl: body.ogImageUrl?.trim() || null } : {}),
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
