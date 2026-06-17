export type StudentDocument = {
  id: string
  label: string
  url?: string
  group: 'attestation' | 'identity' | 'receipt'
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
): StudentDocument[] {
  const list: StudentDocument[] = []
  for (const c of candidatures || []) {
    if (c.documentUrl) {
      list.push({
        id: `doc-${c.id}`,
        label: `Attestation — ${c.programmeTitre}`,
        url: c.documentUrl,
        group: 'attestation',
      })
    }
    if (c.identityCardRectoUrl) {
      list.push({
        id: `recto-${c.id}`,
        label: 'CNI recto',
        url: c.identityCardRectoUrl,
        group: 'identity',
      })
    }
    if (c.identityCardVersoUrl) {
      list.push({
        id: `verso-${c.id}`,
        label: 'CNI verso',
        url: c.identityCardVersoUrl,
        group: 'identity',
      })
    }
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
