import { prisma } from '../../utils/prisma'
import { z } from 'zod'

const validateSchema = z.object({
  code: z.string().min(1, 'Veuillez saisir un code promo.').trim(),
  montant: z.number().min(0, 'Le montant doit être valide.'),
  etablissementId: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = validateSchema.safeParse(body)

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || 'Données invalides.'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  const rawCode = parsed.data.code.toUpperCase()
  const montantInitial = Math.round(parsed.data.montant)

  const promo = await prisma.promoCode.findUnique({
    where: { code: rawCode }
  })

  if (!promo || !promo.isActive) {
    return {
      valid: false,
      message: 'Code promo invalide ou expiré.',
      reduction: 0,
      montantFinal: montantInitial
    }
  }

  // Vérification de la portée par établissement (si restreint)
  if (promo.etablissementId && parsed.data.etablissementId && promo.etablissementId !== parsed.data.etablissementId) {
    return {
      valid: false,
      message: 'Ce code promo n’est pas applicable à cet établissement.',
      reduction: 0,
      montantFinal: montantInitial
    }
  }

  // Vérification de la date d'expiration
  if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
    return {
      valid: false,
      message: 'Ce code promo a expiré.',
      reduction: 0,
      montantFinal: montantInitial
    }
  }

  // Vérification du nombre maximum d'utilisations
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return {
      valid: false,
      message: 'Ce code promo a atteint sa limite d’utilisations.',
      reduction: 0,
      montantFinal: montantInitial
    }
  }

  // Calcul de la réduction
  let reduction = 0
  if (promo.type === 'PERCENTAGE') {
    reduction = Math.round(montantInitial * (promo.valeur / 100))
  } else if (promo.type === 'FIXED') {
    reduction = Math.round(promo.valeur)
  }

  reduction = Math.min(montantInitial, Math.max(0, reduction))
  const montantFinal = Math.max(0, montantInitial - reduction)

  let message = `Code promo ${promo.code} appliqué avec succès !`
  if (montantFinal === 0) {
    message = `Code promo ${promo.code} appliqué : Candidature 100% gratuite !`
  }

  return {
    valid: true,
    promo: {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      valeur: promo.valeur
    },
    reduction,
    montantInitial,
    montantFinal,
    message
  }
})
