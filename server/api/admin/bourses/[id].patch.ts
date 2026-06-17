import { createError, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis.' })

  const existing = await prisma.bourse.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Bourse introuvable.' })
  }

  const body = await readBody<{
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

  const data: Record<string, unknown> = {}

  if (body.titre?.trim()) data.titre = body.titre.trim()
  if (body.programmeId?.trim()) data.programmeId = body.programmeId
  if (body.partnerId?.trim()) data.partnerId = body.partnerId
  if (body.coveragePercent !== undefined) {
    const pct = Number(body.coveragePercent)
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      throw createError({ statusCode: 400, statusMessage: 'Couverture invalide.' })
    }
    data.coveragePercent = Math.round(pct)
  }
  if (body.montantMax !== undefined) {
    data.montantMax =
      body.montantMax != null && body.montantMax > 0
        ? Math.round(body.montantMax)
        : null
  }
  if (body.quota !== undefined) data.quota = Math.max(0, Math.round(Number(body.quota)))
  if (body.placesRestantes !== undefined) {
    data.placesRestantes = Math.max(0, Math.round(Number(body.placesRestantes)))
  }
  if (body.dateLimite) {
    const d = new Date(body.dateLimite)
    if (Number.isNaN(d.getTime())) {
      throw createError({ statusCode: 400, statusMessage: 'Date limite invalide.' })
    }
    data.dateLimite = d
  }
  if (body.conditions !== undefined) data.conditions = body.conditions?.trim() || null
  if (body.documentsRequis !== undefined) {
    data.documentsRequis = body.documentsRequis?.trim() || null
  }
  if (body.isActive !== undefined) data.isActive = body.isActive

  const row = await prisma.bourse.update({ where: { id }, data })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'BOURSE_UPDATE',
    entityType: 'Bourse',
    entityId: row.id,
    metadata: { slug: row.slug },
  })

  return row
})
