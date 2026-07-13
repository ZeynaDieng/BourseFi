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
  }>(event)

  const slug = body.slug ? normalizeSlug(body.slug) : ''
  if (
    !slug ||
    !body.etablissementId?.trim() ||
    !body.partnerId?.trim() ||
    !body.titre?.trim() ||
    !body.ville?.trim() ||
    !body.duree?.trim() ||
    !body.niveau?.trim() ||
    !body.description?.trim()
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Champs requis : slug, établissement, partenaire, titre, ville, durée, niveau, description.'
    })
  }

  const existsSlug = await prisma.programme.findUnique({ where: { slug } })
  if (existsSlug) {
    throw createError({ statusCode: 409, statusMessage: 'Ce slug programme est déjà utilisé.' })
  }

  const [etab, partner] = await Promise.all([
    prisma.etablissement.findUnique({ where: { id: body.etablissementId } }),
    prisma.partner.findUnique({ where: { id: body.partnerId } })
  ])
  if (!etab) throw createError({ statusCode: 400, statusMessage: 'Établissement invalide.' })
  if (!partner) throw createError({ statusCode: 400, statusMessage: 'Partenaire invalide.' })

  const fraisDossier = Number(body.fraisDossier ?? 20000)
  const fraisDossierEtranger = Number(body.fraisDossierEtranger ?? 30000)
  if (!Number.isFinite(fraisDossier) || fraisDossier < 0 || !Number.isFinite(fraisDossierEtranger) || fraisDossierEtranger < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Frais invalides.' })
  }

  const row = await prisma.programme.create({
    data: {
      slug,
      etablissementId: body.etablissementId,
      partnerId: body.partnerId,
      titre: body.titre.trim(),
      ville: body.ville.trim(),
      duree: body.duree.trim(),
      fraisDossier: Math.round(fraisDossier),
      fraisDossierEtranger: Math.round(fraisDossierEtranger),
      devise: (body.devise?.trim() || 'FCFA').slice(0, 12),
      niveau: body.niveau.trim(),
      placement: body.placement?.trim() || null,
      description: body.description.trim(),
      eligibilite: body.eligibilite?.trim() || null,
      brochureUrl: body.brochureUrl?.trim() || null,
      perspectives: body.perspectives?.trim() || null
    }
  })

  // Créer automatiquement une bourse liée au programme
  const bourseSlug = `bourse-${slug}`
  const bourseTitre = `Bourse ${row.titre}`
  const dateLimite = new Date()
  dateLimite.setFullYear(dateLimite.getFullYear() + 1) // Date limite 1 an par défaut

  const bourse = await prisma.bourse.create({
    data: {
      slug: bourseSlug,
      titre: bourseTitre,
      programmeId: row.id,
      partnerId: body.partnerId,
      coveragePercent: 50, // 50% de couverture par défaut
      montantMax: null,
      quota: 10, // 10 places par défaut
      dateLimite,
      conditions: null,
      documentsRequis: null,
      isActive: false, // Désactivée par défaut
    }
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'PROGRAMME_CREATE',
    entityType: 'Programme',
    entityId: row.id,
    metadata: { slug: row.slug, titre: row.titre, bourseId: bourse.id }
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'BOURSE_CREATE',
    entityType: 'Bourse',
    entityId: bourse.id,
    metadata: { slug: bourse.slug, titre: bourse.titre, programmeId: row.id, autoCreated: true }
  })

  return { ...row, bourse }
})
