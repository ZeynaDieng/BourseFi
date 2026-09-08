export type StudentDocument = {
  id: string
  label: string
  url?: string
  group: 'attestation' | 'identity' | 'education' | 'receipt'
}

type AccountIdentity = {
  identityCardRectoUrl?: string | null
  identityCardVersoUrl?: string | null
  bfemAttestationUrl?: string | null
  bacTranscriptUrl?: string | null
}

export function buildStudentDocuments(
  candidatures: Array<{
    id: string
    programmeTitre: string
    status?: string | null
    fraisDossier?: number | null
    hasPaid?: boolean
    documentUrl?: string | null
    attestationUrl?: string | null
    identityCardRectoUrl?: string | null
    identityCardVersoUrl?: string | null
    bfemAttestationUrl?: string | null
    bacTranscriptUrl?: string | null
    lastDiploma?: string | null
  }> | null | undefined,
  paiements: Array<{ id: string; amount: number; currency: string; receiptUrl?: string | null }> | null | undefined,
  account?: AccountIdentity | null,
): StudentDocument[] {
  const list: StudentDocument[] = []
  const seenRecto = new Set<string>()
  const seenVerso = new Set<string>()
  const seenEdu = new Set<string>()

  function pushIdentity(
    recto: string | null | undefined,
    verso: string | null | undefined,
    idPrefix: string,
  ) {
    if (recto && !seenRecto.has(recto)) {
      seenRecto.add(recto)
      list.push({
        id: `recto-${idPrefix}`,
        label: 'CNI recto',
        url: recto,
        group: 'identity',
      })
    }
    if (verso && !seenVerso.has(verso)) {
      seenVerso.add(verso)
      list.push({
        id: `verso-${idPrefix}`,
        label: 'CNI verso',
        url: verso,
        group: 'identity',
      })
    }
  }

  function pushEducation(
    url: string | null | undefined,
    label: string,
    idPrefix: string,
  ) {
    if (url && !seenEdu.has(url)) {
      seenEdu.add(url)
      list.push({
        id: `edu-${idPrefix}`,
        label,
        url,
        group: 'education',
      })
    }
  }

  // Pièce d'identité & diplôme enregistrés sur le compte
  if (account) {
    pushIdentity(account.identityCardRectoUrl, account.identityCardVersoUrl, 'compte')
    pushEducation(account.bfemAttestationUrl, 'Attestation BFEM', 'compte-bfem')
    pushEducation(account.bacTranscriptUrl, 'Relevé de notes BAC / Dernier diplôme', 'compte-bac')
  }

  for (const c of candidatures || []) {
    const requiresPayment = Boolean(c.fraisDossier && c.fraisDossier > 0)
    const isPaid = c.hasPaid || !requiresPayment
    const canAccessAttestation = Boolean(
      c.documentUrl ||
      c.attestationUrl ||
      (isPaid && c.status !== 'EN_ATTENTE_PAIEMENT' && ['VALIDE', 'EN_REVUE_PARTENAIRE', 'ACCEPTE', 'DOCUMENT_EMIS'].includes(c.status || ''))
    )

    if (canAccessAttestation) {
      const attUrl = c.documentUrl || c.attestationUrl || `/api/attestations/${c.id}`
      list.push({
        id: `doc-${c.id}`,
        label: `Attestation officielle — ${c.programmeTitre}`,
        url: attUrl,
        group: 'attestation',
      })
    }
    pushIdentity(c.identityCardRectoUrl, c.identityCardVersoUrl, c.id)
    pushEducation(c.bfemAttestationUrl, `Attestation BFEM (${c.programmeTitre})`, `bfem-${c.id}`)
    pushEducation(
      c.bacTranscriptUrl,
      `Relevé / Attestation — ${c.lastDiploma || 'Dernier diplôme'} (${c.programmeTitre})`,
      `bac-${c.id}`,
    )
  }

  for (const p of paiements || []) {
    list.push({
      id: `pay-${p.id}`,
      label: `Reçu — ${p.amount.toLocaleString('fr-FR')} ${p.currency}`,
      url: p.receiptUrl ?? undefined,
      group: 'receipt',
    })
  }
  return list
}

export function groupStudentDocuments(docs: StudentDocument[]) {
  return {
    attestation: docs.filter((d) => d.group === 'attestation'),
    identity: docs.filter((d) => d.group === 'identity'),
    education: docs.filter((d) => d.group === 'education'),
    receipt: docs.filter((d) => d.group === 'receipt'),
  }
}
