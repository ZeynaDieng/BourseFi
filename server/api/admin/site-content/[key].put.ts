import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Clé manquante.' })
  }
  const body = await readBody<{ payload?: unknown }>(event)
  if (body.payload === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Champ payload requis.' })
  }
  await prisma.siteContent.upsert({
    where: { key },
    update: { payload: body.payload as object },
    create: { key, payload: body.payload as object }
  })
  return { ok: true }
})
