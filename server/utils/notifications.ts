import { prisma } from './prisma'

export type NotificationInput = {
  userId: string
  type: string
  title: string
  body: string
  candidatureId?: string
  bourseId?: string
}

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({ data: input })
}

export async function notifyStatusChange(
  userId: string,
  status: string,
  candidatureId: string,
) {
  const messages: Record<string, { title: string; body: string; type: string }> = {
    EN_ATTENTE_PAIEMENT: {
      type: 'payment_pending',
      title: 'Paiement requis',
      body: 'Réglez les frais de dossier pour finaliser votre candidature.',
    },
    EN_REVUE_PARTENAIRE: {
      type: 'in_review',
      title: 'Dossier en analyse',
      body: 'Votre dossier est en cours d’examen par le partenaire financeur.',
    },
    COMPLEMENT_DEMANDE: {
      type: 'documents_required',
      title: 'Pièce justificative requise',
      body: 'Le bailleur demande un complément de dossier.',
    },
    DOCUMENT_EMIS: {
      type: 'document_ready',
      title: 'Attestation disponible',
      body: 'Votre attestation de bourse est prête au téléchargement.',
    },
    ACCEPTE: {
      type: 'accepted',
      title: 'Candidature acceptée',
      body: 'Félicitations ! Votre candidature a été acceptée.',
    },
    REFUSE: {
      type: 'refused',
      title: 'Candidature refusée',
      body: 'Votre candidature n’a pas été retenue pour cette vague.',
    },
  }

  const msg = messages[status]
  if (!msg) return null

  return createNotification({
    userId,
    type: msg.type,
    title: msg.title,
    body: msg.body,
    candidatureId,
  })
}
