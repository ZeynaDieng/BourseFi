export type BourseProcessStep = {
  step: string
  title: string
  body: string
}

export const BOURSE_PROCESS_HEADING = {
  title: 'Comment obtenir une bourse ?',
  subtitle: 'Obtenez votre bourse en 3 étapes simples.',
  flow: 'Formation → Demande → Attestation',
} as const

export const BOURSE_PROCESS_STEPS: BourseProcessStep[] = [
  {
    step: '1',
    title: 'Choisissez une formation',
    body: 'Explorez les formations et écoles éligibles.',
  },
  {
    step: '2',
    title: 'Déposez votre demande',
    body: 'Complétez votre dossier et effectuez le paiement des frais de dossier.',
  },
  {
    step: '3',
    title: 'Recevez votre attestation',
    body: 'Téléchargez votre document depuis votre espace personnel.',
  },
]

const LEGACY_PROCESS_PATTERN =
  /découvrir les écoles|pop-up|bailleur|document bailleur|partenaire financeur|mairie|agence/i

/** Contenu CMS admin, avec repli sur les étapes MVP si ancien wording détecté. */
export function resolveBourseProcessSteps(
  cmsCards?: Array<{ step?: string; title?: string; body?: string }> | null,
): BourseProcessStep[] {
  if (!cmsCards?.length) return BOURSE_PROCESS_STEPS

  const hasLegacy = cmsCards.some(
    (c) => LEGACY_PROCESS_PATTERN.test(`${c.title ?? ''} ${c.body ?? ''}`),
  )
  if (hasLegacy || cmsCards.length !== 3) return BOURSE_PROCESS_STEPS

  return cmsCards.slice(0, 3).map((c, i) => ({
    step: c.step?.trim() || String(i + 1),
    title: c.title?.trim() || BOURSE_PROCESS_STEPS[i]!.title,
    body: c.body?.trim() || BOURSE_PROCESS_STEPS[i]!.body,
  }))
}
