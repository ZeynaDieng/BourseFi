import { createError, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { createNotification } from '../../utils/notifications'

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
    titre?: string
    programmeId?: string
    partnerId?: string
    coveragePercent?: number
    montantMax?: number | null
    quota?: number
    placesRestantes?: number
    dateLimite?: string
    conditions?: string | null
    documentsRequis?: string | null
    isActive?: boolean
  }>(event)

  const slug = body.slug ? normalizeSlug(body.slug) : ''
  if (
    !slug ||
    !body.titre?.trim() ||
    !body.programmeId?.trim() ||
    !body.partnerId?.trim() ||
    body.coveragePercent === undefined ||
    !body.dateLimite
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Champs requis : slug, titre, programme, partenaire, couverture %, date limite.',
    })
  }

  const coveragePercent = Number(body.coveragePercent)
  if (
    !Number.isFinite(coveragePercent) ||
    coveragePercent < 0 ||
    coveragePercent > 100
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Couverture invalide.' })
  }

  const existsSlug = await prisma.bourse.findUnique({ where: { slug } })
  if (existsSlug) {
    throw createError({ statusCode: 409, statusMessage: 'Ce slug bourse est déjà utilisé.' })
  }

  const [programme, partner] = await Promise.all([
    prisma.programme.findUnique({ where: { id: body.programmeId } }),
    prisma.partner.findUnique({ where: { id: body.partnerId } }),
  ])
  if (!programme) throw createError({ statusCode: 400, statusMessage: 'Programme invalide.' })
  if (!partner) throw createError({ statusCode: 400, statusMessage: 'Partenaire invalide.' })

  const dateLimite = new Date(body.dateLimite)
  if (Number.isNaN(dateLimite.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Date limite invalide.' })
  }

  const quota = Math.max(0, Math.round(Number(body.quota ?? 0)))
  const placesRestantes = Math.max(
    0,
    Math.round(Number(body.placesRestantes ?? quota)),
  )

  const row = await prisma.bourse.create({
    data: {
      slug,
      titre: body.titre.trim(),
      programmeId: body.programmeId,
      partnerId: body.partnerId,
      coveragePercent: Math.round(coveragePercent),
      montantMax:
        body.montantMax != null && body.montantMax > 0
          ? Math.round(body.montantMax)
          : null,
      quota,
      placesRestantes,
      dateLimite,
      conditions: body.conditions?.trim() || null,
      documentsRequis: body.documentsRequis?.trim() || null,
      isActive: body.isActive !== false,
    },
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'BOURSE_CREATE',
    entityType: 'Bourse',
    entityId: row.id,
    metadata: { slug: row.slug, titre: row.titre },
  })

  if (row.isActive) {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    })
    await Promise.all(
      students.map((s) =>
        createNotification({
          userId: s.id,
          type: 'new_scholarship',
          title: 'Nouvelle bourse disponible',
          body: `${row.titre} — postulez avant la date limite.`,
          bourseId: row.id,
        }),
      ),
    )
  }

  return row
})
