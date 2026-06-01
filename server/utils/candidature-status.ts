import type { CandidatureStatus } from './candidature-types'

export const CANDIDATURE_STATUS_LABELS: Record<CandidatureStatus, string> = {
  SOUMIS: 'Soumis',
  EN_ATTENTE_PAIEMENT: 'En attente de paiement des frais de dossier',
  EN_REVUE_PARTENAIRE: 'En revue chez le partenaire bailleur',
  COMPLEMENT_DEMANDE: 'Complement demande par le bailleur',
  ACCEPTE: 'Accepte pour bourse — document en preparation',
  REFUSE: 'Refuse pour cette vague',
  DOCUMENT_EMIS: 'Document de bourse disponible au telechargement'
}

export function statusLabel(status: CandidatureStatus): string {
  return CANDIDATURE_STATUS_LABELS[status] ?? status
}
