import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID contact manquant.' })

  const body = await readBody<{
    type?: 'PHONE' | 'WHATSAPP' | 'EMAIL' | 'WEBSITE'
    valeur?: string
    label?: string | null
    isPrincipal?: boolean
    isWhatsapp?: boolean
    status?: 'VERIFIED' | 'TO_VERIFY' | 'UNVERIFIED'
    source?: 'OFFICIAL_WEBSITE' | 'ESTABLISHMENT' | 'DIRECTORY' | 'OTHER' | null
    isActive?: boolean
  }>(event)

  const updated = await prisma.etablissementContact.update({
    where: { id },
    data: {
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.valeur !== undefined ? { valeur: body.valeur.trim() } : {}),
      ...(body.label !== undefined ? { label: body.label?.trim() || null } : {}),
      ...(body.isPrincipal !== undefined ? { isPrincipal: body.isPrincipal } : {}),
      ...(body.isWhatsapp !== undefined ? { isWhatsapp: body.isWhatsapp } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.source !== undefined ? { source: body.source } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
  })

  return updated
})
