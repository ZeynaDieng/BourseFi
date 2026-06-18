import { prisma } from './prisma'
import { writeAuditLog } from './audit'
import { createNotification } from './notifications'

type FinalizeOptions = {
  method?: string
  token?: string
  actorId?: string | null
  actorRole?: string
}

type FinalizeResult = {
  alreadyValid: boolean
  paiement: {
    id: string
    amount: number
    amountPartner: number
    amountPlatform: number
    currency: string
  }
}

/**
 * Valide un paiement et fait avancer la candidature liée.
 * Idempotent : si le paiement est déjà "Valide", aucune mutation n'est faite.
 * Utilisé par l'IPN PayTech et la validation manuelle admin.
 */
export async function finalizePaiement(
  paiementId: string,
  options: FinalizeOptions = {}
): Promise<FinalizeResult> {
  const existing = await prisma.paiement.findUnique({
    where: { id: paiementId },
    include: {
      candidature: { include: { programme: { include: { partner: true } } } }
    }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable.' })
  }

  const baseResult = {
    id: existing.id,
    amount: existing.amount,
    amountPartner: existing.amountPartner,
    amountPlatform: existing.amountPlatform,
    currency: existing.currency
  }

  if (existing.status === 'Valide') {
    return { alreadyValid: true, paiement: baseResult }
  }

  const candidature = existing.candidature

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.paiement.update({
      where: { id: existing.id },
      data: {
        status: 'Valide',
        ...(options.method ? { method: options.method } : {}),
        ...(options.token ? { token: options.token } : {})
      }
    })

    if (candidature && candidature.status === 'EN_ATTENTE_PAIEMENT') {
      await tx.candidature.update({
        where: { id: candidature.id },
        data: { status: 'EN_REVUE_PARTENAIRE' }
      })
    }

    return p
  })

  await writeAuditLog({
    actorId: options.actorId ?? existing.userId,
    actorRole: options.actorRole ?? 'SYSTEM',
    action: 'PAIEMENT_VALIDATED',
    entityType: 'Paiement',
    entityId: updated.id,
    metadata: {
      method: updated.method,
      amount: updated.amount,
      amountPartner: updated.amountPartner,
      amountPlatform: updated.amountPlatform,
      candidatureId: candidature?.id ?? null,
      provider: updated.provider ?? null,
      refCommand: updated.refCommand ?? null
    }
  })

  if (candidature) {
    await createNotification({
      userId: candidature.userId,
      type: 'payment_validated',
      title: 'Paiement validé',
      body: 'Votre paiement a été validé. Votre dossier est transmis au bailleur.',
      candidatureId: candidature.id
    })
  }

  return {
    alreadyValid: false,
    paiement: {
      id: updated.id,
      amount: updated.amount,
      amountPartner: updated.amountPartner,
      amountPlatform: updated.amountPlatform,
      currency: updated.currency
    }
  }
}
