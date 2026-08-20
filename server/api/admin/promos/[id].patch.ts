import { requireRole } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'
import { z } from 'zod'

const updatePromoSchema = z.object({
  code: z.string().min(2).trim().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  valeur: z.number().positive().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  etablissementId: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Identifiant requis.' })

  const body = await readBody(event)
  const parsed = updatePromoSchema.safeParse(body)

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || 'Données invalides.'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  const existing = await prisma.promoCode.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Code promo introuvable.' })
  }

  let codeFormatted: string | undefined = undefined
  if (parsed.data.code) {
    codeFormatted = parsed.data.code.toUpperCase()
    if (codeFormatted !== existing.code) {
      const duplicate = await prisma.promoCode.findUnique({ where: { code: codeFormatted } })
      if (duplicate) {
        throw createError({ statusCode: 400, statusMessage: `Le code "${codeFormatted}" existe déjà.` })
      }
    }
  }

  const updated = await prisma.promoCode.update({
    where: { id },
    data: {
      ...(codeFormatted ? { code: codeFormatted } : {}),
      ...(parsed.data.type ? { type: parsed.data.type } : {}),
      ...(parsed.data.valeur !== undefined ? { valeur: parsed.data.valeur } : {}),
      ...(parsed.data.maxUses !== undefined ? { maxUses: parsed.data.maxUses } : {}),
      ...(parsed.data.expiresAt !== undefined ? { expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
      ...(parsed.data.etablissementId !== undefined ? { etablissementId: parsed.data.etablissementId } : {})
    }
  })

  return updated
})
