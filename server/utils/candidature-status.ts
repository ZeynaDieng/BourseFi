import type { CandidatureStatus } from './candidature-types'

export const CANDIDATURE_STATUS_LABELS: Record<CandidatureStatus, string> = {
  BROUILLON: 'Brouillon',
  SOUMIS: 'Déposé',
  EN_ATTENTE_PAIEMENT: 'Paiement effectué',
  EN_REVUE_PARTENAIRE: 'En analyse',
  COMPLEMENT_DEMANDE: 'Pièces demandées',
  ACCEPTE: 'Accepté',
  REFUSE: 'Refusé',
  DOCUMENT_EMIS: 'Attestation disponible',
  TERMINE: 'Terminé'
}

export function statusLabel(status: CandidatureStatus): string {
  return CANDIDATURE_STATUS_LABELS[status] ?? status
}
