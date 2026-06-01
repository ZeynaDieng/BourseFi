/** Libellés lisibles pour les clés de contenu site */
export const SITE_CONTENT_LABELS: Record<string, string> = {
  visual_assets: 'Bibliothèque d’images (URLs)',
  home_hero: 'Accueil — Hero principal',
  home_stats: 'Accueil — Chiffres clés',
  home_process: 'Accueil — Étapes du parcours',
  home_partner_section: 'Accueil — Bandeau écoles partenaires',
  why_choose: 'Accueil — Pourquoi nous choisir',
  financement: 'Accueil — Bloc financement',
  espace_etudiant: 'Accueil — Espace étudiant',
  partners_strip: 'Accueil — Réseau / bandeau partenaires',
  landing_metiers: 'Accueil — Section métiers',
  faq_section: 'Accueil — Titres section FAQ',
  testimonials_section: 'Accueil — Titres section témoignages',
  orientation_page: 'Page Orientation',
  metiers_hub_page: 'Page Hub métiers'
}

/** Clés connues dans visual_assets (ordre d’affichage formulaire) */
export const VISUAL_ASSET_KEYS = [
  'heroHome',
  'heroOrientation',
  'heroMetiersHub',
  'whyChooseBanner',
  'stepExplore',
  'stepApply',
  'stepDoc',
  'orientationDocs',
  'comparisonSection'
] as const

export const VISUAL_ASSET_HELP: Partial<Record<(typeof VISUAL_ASSET_KEYS)[number], string>> = {
  heroHome: 'Photo grande largeur sous le menu (accueil)',
  heroOrientation: 'En-tête page Orientation',
  heroMetiersHub: 'En-tête liste des métiers',
  whyChooseBanner: 'Bandeau « Pourquoi nous choisir »',
  stepExplore: 'Carte étape 1 du parcours',
  stepApply: 'Carte étape 2 du parcours',
  stepDoc: 'Carte étape 3 du parcours',
  orientationDocs: 'Visuel bloc documents (orientation)',
  comparisonSection: 'Visuel comparaison de programmes'
}

/** Normalise le brouillon pour éviter champs undefined dans les formulaires */
export function ensureSiteContentDraft(key: string, d: Record<string, unknown>) {
  const str = (v: unknown, fb = '') => (typeof v === 'string' ? v : fb)
  const arr = <T>(v: unknown, fb: T[]) => (Array.isArray(v) ? (v as T[]) : fb.slice())

  switch (key) {
    case 'visual_assets': {
      for (const k of VISUAL_ASSET_KEYS) {
        if (typeof d[k] !== 'string') d[k] = ''
      }
      break
    }
    case 'home_hero': {
      d.title = str(d.title)
      d.headlinePrimary = str(d.headlinePrimary)
      d.headlineAccent = str(d.headlineAccent)
      d.subtitle = str(d.subtitle)
      d.bannerImageUrl = str(d.bannerImageUrl)
      d.searchPlaceholder = str(d.searchPlaceholder)
      d.ctaLabel = str(d.ctaLabel)
      d.ctaHref = str(d.ctaHref)
      if (!Array.isArray(d.sectorOptions)) d.sectorOptions = ['']
      break
    }
    case 'home_stats': {
      const items = arr<{ value?: string; label?: string }>(d.items, [])
      d.items = items.map((x) => ({ value: str(x?.value), label: str(x?.label) }))
      if ((d.items as unknown[]).length === 0) {
        d.items = [{ value: '', label: '' }]
      }
      break
    }
    case 'home_process': {
      d.sectionTitle = str(d.sectionTitle)
      d.sectionSubtitle = str(d.sectionSubtitle)
      const cards = arr<Record<string, unknown>>(d.cards, [])
      d.cards = cards.map((c) => ({
        step: str(c.step),
        icon: str(c.icon),
        variant: str(c.variant, 'light'),
        title: str(c.title),
        body: str(c.body),
        imageKey: str(c.imageKey)
      }))
      if ((d.cards as unknown[]).length === 0) {
        d.cards = [{ step: '', icon: '', variant: 'light', title: '', body: '', imageKey: '' }]
      }
      break
    }
    case 'home_partner_section': {
      d.title = str(d.title)
      d.subtitle = str(d.subtitle)
      d.ctaLabel = str(d.ctaLabel)
      d.ctaHref = str(d.ctaHref)
      break
    }
    case 'why_choose': {
      d.kicker = str(d.kicker)
      d.title = str(d.title)
      d.subtitle = str(d.subtitle)
      d.bannerImageKey = str(d.bannerImageKey)
      const reasons = arr<Record<string, unknown>>(d.reasons, [])
      d.reasons = reasons.map((r) => ({
        icon: str(r.icon),
        title: str(r.title),
        description: str(r.description)
      }))
      if ((d.reasons as unknown[]).length === 0) {
        d.reasons = [{ icon: '', title: '', description: '' }]
      }
      break
    }
    case 'financement': {
      d.kicker = str(d.kicker)
      d.title = str(d.title)
      d.subtitle = str(d.subtitle)
      d.closureTitle = str(d.closureTitle)
      d.closureBody = str(d.closureBody)
      const steps = arr<Record<string, unknown>>(d.steps, [])
      d.steps = steps.map((s) => ({
        actor: str(s.actor),
        icon: str(s.icon),
        title: str(s.title),
        body: str(s.body)
      }))
      if ((d.steps as unknown[]).length === 0) {
        d.steps = [{ actor: '', icon: '', title: '', body: '' }]
      }
      break
    }
    case 'espace_etudiant': {
      d.kicker = str(d.kicker)
      d.title = str(d.title)
      d.subtitle = str(d.subtitle)
      d.ctaLabel = str(d.ctaLabel)
      d.ctaHref = str(d.ctaHref)
      const features = arr<Record<string, unknown>>(d.features, [])
      d.features = features.map((f) => ({
        icon: str(f.icon),
        title: str(f.title),
        text: str(f.text)
      }))
      if ((d.features as unknown[]).length === 0) {
        d.features = [{ icon: '', title: '', text: '' }]
      }
      break
    }
    case 'partners_strip': {
      d.kicker = str(d.kicker)
      d.title = str(d.title)
      d.subtitle = str(d.subtitle)
      const items = arr<Record<string, unknown>>(d.items, [])
      d.items = items.map((x) => ({ label: str(x.label) }))
      if ((d.items as unknown[]).length === 0) {
        d.items = [{ label: '' }]
      }
      break
    }
    case 'landing_metiers': {
      d.kicker = str(d.kicker)
      d.title = str(d.title)
      d.subtitle = str(d.subtitle)
      d.footnote = str(d.footnote)
      break
    }
    case 'faq_section': {
      d.kicker = str(d.kicker)
      d.title = str(d.title)
      break
    }
    case 'testimonials_section': {
      d.kicker = str(d.kicker)
      d.title = str(d.title)
      break
    }
    case 'orientation_page': {
      d.heroTitle = str(d.heroTitle)
      d.heroSubtitle = str(d.heroSubtitle)
      d.heroImageKey = str(d.heroImageKey)
      d.guidesTitle = str(d.guidesTitle)
      d.guidesSubtitle = str(d.guidesSubtitle)
      d.comparisonTitle = str(d.comparisonTitle)
      d.comparisonSubtitle = str(d.comparisonSubtitle)
      d.comparisonImageKey = str(d.comparisonImageKey)
      d.comparisonCtaLabel = str(d.comparisonCtaLabel)
      d.comparisonCtaHref = str(d.comparisonCtaHref)
      d.domainsHeading = str(d.domainsHeading)
      break
    }
    case 'metiers_hub_page': {
      d.kicker = str(d.kicker)
      d.title = str(d.title)
      d.subtitle = str(d.subtitle)
      d.footnote = str(d.footnote)
      d.heroImageKey = str(d.heroImageKey)
      break
    }
    default:
      break
  }
}
