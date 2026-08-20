import { requireRole } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'
import { z } from 'zod'

const createPromoSchema = z.object({
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères.').trim(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  valeur: z.number().positive('La valeur de la réduction doit être supérieure à 0.'),
  maxUses: z.number().int().min(1).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  etablissementId: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const body = await readBody(event)
  const parsed = createPromoSchema.safeParse(body)

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || 'Données du code promo invalides.'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  const codeFormatted = parsed.data.code.toUpperCase()

  const existing = await prisma.promoCode.findUnique({
    where: { code: codeFormatted }
  })

  if (existing) {
    throw createError({ statusCode: 400, statusMessage: `Le code promo "${codeFormatted}" existe déjà.` })
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: codeFormatted,
      type: parsed.data.type,
      valeur: parsed.data.valeur,
      maxUses: parsed.data.maxUses ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isActive: parsed.data.isActive ?? true,
      etablissementId: parsed.data.etablissementId ?? null
    }
  })

  return promo
})
