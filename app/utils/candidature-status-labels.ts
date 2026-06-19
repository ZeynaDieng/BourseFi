export const CANDIDATURE_STATUS_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon',
  SOUMIS: 'Déposé',
  EN_ATTENTE_PAIEMENT: 'Paiement effectué',
  EN_REVUE_PARTENAIRE: 'En analyse',
  COMPLEMENT_DEMANDE: 'Pièces demandées',
  ACCEPTE: 'Accepté',
  REFUSE: 'Refusé',
  DOCUMENT_EMIS: 'Attestation disponible',
  TERMINE: 'Terminé',
}

export const CANDIDATURE_STATUS_CHOICES = Object.keys(CANDIDATURE_STATUS_LABELS).filter(
  (k) => k !== 'BROUILLON'
)

export function candidatureStatusLabel(status: string) {
  return CANDIDATURE_STATUS_LABELS[status] ?? status
}
