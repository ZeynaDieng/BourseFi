import { z } from 'zod'
import { CANDIDATURE_STATUSES, type CandidatureStatus } from '../../utils/candidature-types'
import { requireRole } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { writeAuditLog } from '../../utils/audit'

const candidatureStatusZod = z.enum(CANDIDATURE_STATUSES)

const patchSchema = z.object({
  status: candidatureStatusZod.optional(),
  documentUrl: z.union([z.string().url(), z.literal('')]).optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN', 'PARTNER'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  const body = await readBody(event)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Corps invalide.' })
  }

  const dossier = await prisma.candidature.findUnique({ where: { id } })
  if (!dossier) {
    throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })
  }

  if (user.role === 'PARTNER') {
    if (!user.partnerId || dossier.partnerId !== user.partnerId) {
      throw createError({ statusCode: 403, statusMessage: 'Acces refuse a ce dossier.' })
    }
  }

  const nextStatus = parsed.data.status
  const docInput = parsed.data.documentUrl

  const data: {
    status?: CandidatureStatus
    documentUrl?: string | null
    documentIssuedAt?: Date | null
  } = {}

  if (docInput !== undefined) {
    data.documentUrl = docInput === '' ? null : docInput
    if (typeof data.documentUrl === 'string' && data.documentUrl.length > 0) {
      data.documentIssuedAt = new Date()
    }
    if (data.documentUrl === null) {
      data.documentIssuedAt = null
    }
  }

  if (nextStatus !== undefined) {
    data.status = nextStatus
  }

  if (data.status === 'DOCUMENT_EMIS') {
    const url = docInput !== undefined ? (docInput === '' ? '' : docInput) : dossier.documentUrl
    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'documentUrl obligatoire pour DOCUMENT_EMIS.'
      })
    }
  }

  const updated =
    Object.keys(data).length > 0
      ? await prisma.candidature.update({
          where: { id },
          data
        })
      : dossier

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'CANDIDATURE_UPDATED',
    entityType: 'Candidature',
    entityId: id,
    metadata: { ...parsed.data }
  })

  return { ok: true, candidature: updated }
})
