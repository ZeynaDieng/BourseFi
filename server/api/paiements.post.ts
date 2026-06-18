import { requireRole } from '../utils/auth'
import { prisma } from '../utils/prisma'
import { z } from 'zod'
import { finalizePaiement } from '../utils/paiement-finalize'

const paiementSchema = z.object({
  candidatureId: z.string().min(1),
  fullName: z.string().min(2),
  email: z.email(),
  phone: z.string().optional().default(''),
  method: z.string().min(2)
})

/**
 * Validation manuelle d'un paiement par un administrateur (ex. encaissement hors ligne).
 * Le parcours étudiant passe désormais par /api/paiements/initier + IPN PayTech.
 */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const parsed = paiementSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Informations de paiement invalides.' })
  }

  const candidature = await prisma.candidature.findUnique({
    where: { id: parsed.data.candidatureId },
    include: {
      programme: { include: { partner: true } },
      paiement: true
    }
  })

  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }
  if (candidature.status !== 'EN_ATTENTE_PAIEMENT') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cette candidature ne necessite pas de paiement a ce stade.'
    })
  }
  if (candidature.paiement && candidature.paiement.status === 'Valide') {
    throw createError({ statusCode: 400, statusMessage: 'Un paiement existe deja pour ce dossier.' })
  }

  const total = candidature.programme.fraisDossier
  if (total <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun frais de dossier a regler.' })
  }

  const pct = Math.min(100, Math.max(0, candidature.programme.partner.partnerSharePercent))
  const amountPartner = Math.round((total * pct) / 100)
  const amountPlatform = total - amountPartner

  const paiementData = {
    userId: candidature.userId,
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    method: parsed.data.method,
    amount: total,
    amountPartner,
    amountPlatform,
    currency: candidature.programme.devise,
    status: 'EN_ATTENTE',
    provider: 'manuel'
  }

  const paiement = candidature.paiement
    ? await prisma.paiement.update({ where: { id: candidature.paiement.id }, data: paiementData })
    : await prisma.paiement.create({ data: { ...paiementData, candidatureId: candidature.id } })

  const result = await finalizePaiement(paiement.id, {
    actorId: user.id,
    actorRole: user.role,
    method: parsed.data.method
  })

  return { ok: true, paiement: result.paiement }
})
