export type StudentCandidature = {
  status: string
  identityCardRectoUrl: string | null
  identityCardVersoUrl: string | null
  programmeTitre: string
  etablissementNom: string
  statusLabel: string
  documentUrl: string | null
  fraisDossier: number
}

export type DossierProgress = {
  percent: number
  missingCount: number
  missingHint: string
  notification: string | null
}

const STATUS_PERCENT: Record<string, number> = {
  BROUILLON: 10,
  SOUMIS: 35,
  EN_ATTENTE_PAIEMENT: 48,
  EN_REVUE_PARTENAIRE: 72,
  COMPLEMENT_DEMANDE: 58,
  ACCEPTE: 88,
  DOCUMENT_EMIS: 100,
  REFUSE: 100,
  TERMINE: 100,
}

export function computeDossierProgress(
  candidatures: StudentCandidature[] | null | undefined,
): DossierProgress {
  if (!candidatures?.length) {
    return {
      percent: 0,
      missingCount: 0,
      missingHint: 'Déposez une première candidature pour démarrer votre dossier.',
      notification: null,
    }
  }

  const latest = candidatures[0]
  let missingCount = 0
  if (!latest.identityCardRectoUrl) missingCount += 1
  if (!latest.identityCardVersoUrl) missingCount += 1
  if (latest.status === 'EN_ATTENTE_PAIEMENT' && latest.fraisDossier > 0) {
    missingCount += 1
  }

  const statusPercent = STATUS_PERCENT[latest.status] ?? 40
  const docsPercent =
    (latest.identityCardRectoUrl ? 8 : 0) +
    (latest.identityCardVersoUrl ? 8 : 0) +
    (latest.status !== 'EN_ATTENTE_PAIEMENT' || latest.fraisDossier <= 0
      ? 8
      : 0)
  const percent = Math.min(100, Math.max(statusPercent, 20 + docsPercent))

  const missingHint =
    missingCount > 0
      ? `Dossier à ${percent} % — pièces manquantes : ${missingCount}`
      : `Dossier à ${percent} % — complet pour l’étape en cours`

  const notification = notificationForStatus(latest.status)

  return { percent, missingCount, missingHint, notification }
}

function notificationForStatus(status: string): string | null {
  switch (status) {
    case 'EN_REVUE_PARTENAIRE':
      return 'Votre dossier a été transmis au bailleur — réponse sous 5 jours ouvrés.'
    case 'COMPLEMENT_DEMANDE':
      return 'Le bailleur demande un complément : consultez votre dossier et ajoutez les pièces.'
    case 'EN_ATTENTE_PAIEMENT':
      return 'Réglez les frais de dossier pour que votre candidature soit transmise au bailleur.'
    case 'DOCUMENT_EMIS':
      return 'Votre attestation de bourse est disponible dans Documents.'
    case 'ACCEPTE':
      return 'Candidature acceptée — le document de bourse est en préparation.'
    case 'REFUSE':
      return 'Cette candidature n’a pas été retenue pour la vague en cours.'
    default:
      return null
  }
}

export function candidatureBadge(status: string): {
  label: string
  className: string
} {
  const map: Record<string, { label: string; className: string }> = {
    BROUILLON: { label: 'Brouillon', className: 'bg-slate-100 text-slate-700' },
    SOUMIS: { label: 'Déposé', className: 'bg-sky-50 text-sky-800' },
    EN_ATTENTE_PAIEMENT: { label: 'Paiement en attente', className: 'bg-amber-50 text-amber-900' },
    EN_REVUE_PARTENAIRE: { label: 'En analyse', className: 'bg-violet-50 text-violet-800' },
    COMPLEMENT_DEMANDE: { label: 'Pièces demandées', className: 'bg-orange-50 text-orange-900' },
    ACCEPTE: { label: 'Accepté', className: 'bg-emerald-50 text-emerald-800' },
    REFUSE: { label: 'Refusé', className: 'bg-red-50 text-red-800' },
    DOCUMENT_EMIS: { label: 'Attestation dispo', className: 'bg-emerald-50 text-emerald-800' },
    TERMINE: { label: 'Terminé', className: 'bg-slate-100 text-slate-700' },
  }
  return map[status] ?? { label: 'En cours', className: 'bg-amber-50 text-amber-900' }
}

export function userInitials(name: string | undefined | null): string {
  if (!name?.trim()) return 'BF'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
