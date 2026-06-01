export type ProgrammeMetierFields = {
  slug: string
  titre: string
  description: string
  perspectives: string | null
}

export type MetierTrackConfig = {
  label: string
  programmeSlugs: string[]
  keywords: string[]
}

/** Slugs utilisés dans les URLs : /programmes?metier=… */
export const METIER_TRACKS: Record<string, MetierTrackConfig> = {
  'dev-web': {
    label: 'Développement Web',
    programmeSlugs: ['ingenieur-developpement-logiciel-esp'],
    keywords: [
      'developpement web',
      'genie logiciel',
      'application web',
      'fullstack',
      'frontend',
      'front-end',
      'backend',
      'plateforme web',
      'ingenieur logiciel'
    ]
  },
  cybersecurite: {
    label: 'Cybersécurité',
    programmeSlugs: ['master-cybersecurite-esp'],
    keywords: [
      'cyber',
      'cybersecurite',
      'securite des systemes',
      'soc',
      'ssi',
      'pentest',
      'incident'
    ]
  },
  'data-science': {
    label: 'Data Science',
    programmeSlugs: ['master-data-science-esp', 'master-finance-numerique-ucad'],
    keywords: [
      'data science',
      'science des donnees',
      'machine learning',
      'scoring',
      'analyse de donnees',
      'visualisation',
      'big data'
    ]
  },
  ia: {
    label: 'Intelligence artificielle',
    programmeSlugs: ['master-ia-appliquee-esp', 'master-data-science-esp'],
    keywords: [
      'intelligence artificielle',
      'deep learning',
      'nlp',
      'reseau de neurones',
      'ia generative',
      'modele predictif',
      'apprentissage automatique'
    ]
  },
  'marketing-digital': {
    label: 'Marketing digital',
    programmeSlugs: ['msc-marketing-digital-ism', 'mba-fintech-ism'],
    keywords: [
      'marketing digital',
      'strategie digitale',
      'acquisition',
      'communication digitale',
      'growth',
      'seo',
      'reseaux sociaux'
    ]
  },
  finance: {
    label: 'Finance & banque',
    programmeSlugs: [
      'master-finance-numerique-ucad',
      'mba-fintech-ism',
      'master-data-science-esp'
    ],
    keywords: [
      'finance',
      'fintech',
      'banque',
      'credit',
      'risque financier',
      'inclusion bancaire',
      'conformite',
      'analyste financier'
    ]
  },
  sante: {
    label: 'Santé & sciences',
    programmeSlugs: ['master-sante-publique-ucad'],
    keywords: [
      'sante publique',
      'sante',
      'epidemiologie',
      'systeme de sante',
      'hopital',
      'biomedecine',
      'sciences de la sante'
    ]
  }
}

function normalizeSearchText(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/'/g, ' ')
}

export function programmeMatchesMetierTrack(
  p: ProgrammeMetierFields,
  metier: string | undefined
): boolean {
  if (!metier || !METIER_TRACKS[metier]) return true

  const track = METIER_TRACKS[metier]
  if (track.programmeSlugs.includes(p.slug)) return true

  const blob = normalizeSearchText(`${p.titre} ${p.description} ${p.perspectives ?? ''}`)

  return track.keywords.some((k) => blob.includes(normalizeSearchText(k)))
}

export function getMetierTrackLabel(metier: string | undefined): string | undefined {
  if (!metier) return undefined
  return METIER_TRACKS[metier]?.label
}

export function isKnownMetierTrack(metier: string | undefined): metier is string {
  return Boolean(metier && METIER_TRACKS[metier])
}
