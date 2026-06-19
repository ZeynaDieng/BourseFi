export type StudentDocument = {
  id: string
  label: string
  url?: string
  group: 'attestation' | 'identity' | 'receipt'
}

type AccountIdentity = {
  identityCardRectoUrl?: string | null
  identityCardVersoUrl?: string | null
}

export function buildStudentDocuments(
  candidatures: Array<{
    id: string
    programmeTitre: string
    documentUrl?: string | null
    identityCardRectoUrl?: string | null
    identityCardVersoUrl?: string | null
  }> | null | undefined,
  paiements: Array<{ id: string; amount: number; currency: string; receiptUrl?: string | null }> | null | undefined,
  account?: AccountIdentity | null,
): StudentDocument[] {
  const list: StudentDocument[] = []
  const seenRecto = new Set<string>()
  const seenVerso = new Set<string>()

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

  // Pièce d'identité enregistrée une fois sur le compte (réutilisée pour toutes les candidatures)
  if (account) {
    pushIdentity(account.identityCardRectoUrl, account.identityCardVersoUrl, 'compte')
  }

  for (const c of candidatures || []) {
    if (c.documentUrl) {
      list.push({
        id: `doc-${c.id}`,
        label: `Attestation — ${c.programmeTitre}`,
        url: c.documentUrl,
        group: 'attestation',
      })
    }
    // Anciennes candidatures sans compte unifié : dédoublonnage par URL
    pushIdentity(c.identityCardRectoUrl, c.identityCardVersoUrl, c.id)
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
    receipt: docs.filter((d) => d.group === 'receipt'),
  }
}
