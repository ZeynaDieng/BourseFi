/**
 * Statuts dossier — source unique (évite les imports runtime @prisma/client en ESM/Nitro).
 * Rester aligné avec prisma/schema.prisma enum CandidatureStatus.
 */
export const CANDIDATURE_STATUSES = [
  'BROUILLON',
  'SOUMIS',
  'EN_ATTENTE_PAIEMENT',
  'EN_REVUE_PARTENAIRE',
  'COMPLEMENT_DEMANDE',
  'ACCEPTE',
  'REFUSE',
  'DOCUMENT_EMIS',
  'TERMINE'
] as const

export type CandidatureStatus = (typeof CANDIDATURE_STATUSES)[number]
