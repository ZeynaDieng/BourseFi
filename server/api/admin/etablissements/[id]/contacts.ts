import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { requireRole } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID établissement manquant.' })

  const method = event.method

  if (method === 'GET') {
    return prisma.etablissementContact.findMany({
      where: { etablissementId: id },
      orderBy: { createdAt: 'desc' },
    })
  }

  if (method === 'POST') {
    const body = await readBody<{
      type: 'PHONE' | 'WHATSAPP' | 'EMAIL' | 'WEBSITE'
      valeur: string
      label?: string | null
      isPrincipal?: boolean
      isWhatsapp?: boolean
      status?: 'VERIFIED' | 'TO_VERIFY' | 'UNVERIFIED'
      source?: 'OFFICIAL_WEBSITE' | 'ESTABLISHMENT' | 'DIRECTORY' | 'OTHER' | null
    }>(event)

    if (!body.type || !body.valeur?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Type et valeur requis.' })
    }

    const contact = await prisma.etablissementContact.create({
      data: {
        etablissementId: id,
        type: body.type,
        valeur: body.valeur.trim(),
        label: body.label?.trim() || null,
        isPrincipal: body.isPrincipal || false,
        isWhatsapp: body.isWhatsapp || body.type === 'WHATSAPP',
        status: body.status || 'TO_VERIFY',
        source: body.source || null,
        isActive: true,
      },
    })

    return contact
  }

  throw createError({ statusCode: 405, statusMessage: 'Méthode non autorisée.' })
})
