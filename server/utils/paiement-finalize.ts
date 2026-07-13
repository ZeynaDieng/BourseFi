import { prisma } from './prisma'
import { writeAuditLog } from './audit'
import { createNotification } from './notifications'
import { sendEmail, renderEmail } from './email'

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
    console.log('[paytech] finalize: déjà validé (idempotent)', { paiementId: existing.id })
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

    // Envoi d'email automatique à l'admin lors de la validation d'un paiement
    const adminEmail = renderEmail({
      title: 'Nouveau paiement validé',
      bodyHtml: `
        <p>Un nouveau paiement a été validé sur la plateforme BourseFi.</p>
        <p><strong>Détails du paiement :</strong></p>
        <ul>
          <li>Montant : ${updated.amount.toLocaleString('fr-FR')} ${updated.currency}</li>
          <li>Méthode : ${updated.method}</li>
          <li>Candidat : ${existing.fullName}</li>
          <li>Email : ${existing.email}</li>
          <li>Téléphone : ${existing.phone || 'Non renseigné'}</li>
          <li>Programme : ${candidature.programme.titre}</li>
          <li>Partenaire : ${candidature.programme.partner.name}</li>
          <li>ID paiement : ${updated.id}</li>
          <li>Référence : ${updated.refCommand || 'N/A'}</li>
        </ul>
        <p>Le dossier du candidat est maintenant en attente de revue partenaire.</p>
      `,
      ctaLabel: 'Voir le paiement',
      ctaUrl: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn'}/admin/transactions?id=${updated.id}`
    })

    await sendEmail({
      to: { email: 'zeynash1@gmail.com' },
      subject: `Nouveau paiement validé - ${existing.fullName}`,
      html: adminEmail
    })
  }

  console.log('[paytech] finalize: paiement validé', {
    paiementId: updated.id,
    candidatureId: candidature?.id ?? null,
    amount: updated.amount
  })

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
