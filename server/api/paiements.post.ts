import { requireRole } from '../utils/auth'
import { prisma } from '../utils/prisma'
import { z } from 'zod'
import { writeAuditLog } from '../utils/audit'
import { createNotification } from '../utils/notifications'

const paiementSchema = z.object({
  candidatureId: z.string().min(1),
  fullName: z.string().min(2),
  email: z.email(),
  phone: z.string().optional().default(''),
  method: z.string().min(2)
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN'])
  const body = await readBody(event)
  const parsed = paiementSchema.safeParse(body)
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

  if (candidature.userId !== user.id && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Ce dossier ne vous appartient pas.' })
  }

  if (candidature.status !== 'EN_ATTENTE_PAIEMENT') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cette candidature ne necessite pas de paiement a ce stade.'
    })
  }

  if (candidature.paiement) {
    throw createError({ statusCode: 400, statusMessage: 'Un paiement existe deja pour ce dossier.' })
  }

  const total = candidature.programme.fraisDossier
  if (total <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun frais de dossier a regler.' })
  }

  const pct = Math.min(100, Math.max(0, candidature.programme.partner.partnerSharePercent))
  const amountPartner = Math.round((total * pct) / 100)
  const amountPlatform = total - amountPartner

  const paiement = await prisma.$transaction(async (tx) => {
    const p = await tx.paiement.create({
      data: {
        candidatureId: candidature.id,
        userId: user.id,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        method: parsed.data.method,
        amount: total,
        amountPartner,
        amountPlatform,
        currency: candidature.programme.devise,
        status: 'Valide'
      }
    })

    await tx.candidature.update({
      where: { id: candidature.id },
      data: { status: 'EN_REVUE_PARTENAIRE' }
    })

    return p
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'PAIEMENT_CREATED',
    entityType: 'Paiement',
    entityId: paiement.id,
    metadata: {
      method: paiement.method,
      amount: paiement.amount,
      amountPartner: paiement.amountPartner,
      amountPlatform: paiement.amountPlatform,
      candidatureId: candidature.id
    }
  })

  await createNotification({
    userId: candidature.userId,
    type: 'payment_validated',
    title: 'Paiement validé',
    body: 'Votre paiement a été validé. Votre dossier est transmis au bailleur.',
    candidatureId: candidature.id,
  })

  return {
    ok: true,
    paiement: {
      id: paiement.id,
      amount: paiement.amount,
      amountPartner: paiement.amountPartner,
      amountPlatform: paiement.amountPlatform,
      currency: paiement.currency
    }
  }
})
