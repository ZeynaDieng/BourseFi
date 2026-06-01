/**
 * Visuels marketing — photos Unsplash (https://unsplash.com/license).
 * En production, vous pouvez remplacer par vos propres shoots ou banques partenaires.
 */
function photo(photoPath: string, w: number): string {
  return `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=${w}&q=80`
}

export const MARKETING_IMAGES = {
  heroHome: photo('photo-1523240795612-9a054b0db644', 1920),
  heroOrientation: photo('photo-1571260899304-425eee4c7efc', 1400),
  heroMetiersHub: photo('photo-1523050854058-8df90110c9f1', 1400),
  whyChooseBanner: photo('photo-1529390079861-591de354faf5', 1600),
  stepExplore: photo('photo-1434030216411-0b793f4b4173', 900),
  stepApply: photo('photo-1556761175-b413da4baf72', 900),
  stepDoc: photo('photo-1454165804606-c3d57bc86b40', 900),
  orientationDocs: photo('photo-1450101499163-c8848c66ca85', 900),
  comparisonSection: photo('photo-1552664730-d307ca884978', 1200)
} as const

/** Une photo par fiche métier (hub + landing + détail). */
export const METIER_VISUAL_BY_SLUG: Record<string, string> = {
  'dev-web': photo('photo-1498050108023-c5249f4df085', 900),
  cybersecurite: photo('photo-1563986768609-322da13575f3', 900),
  'data-science': photo('photo-1551288049-bebda4e38c71', 900),
  ia: photo('photo-1620712943543-bcc4688e7485', 900),
  'marketing-digital': photo('photo-1460925895917-afdab827c52f', 900),
  finance: photo('photo-1554224155-6726b3ff858f', 900),
  sante: photo('photo-1576091160399-112ba8d25d1f', 900)
}

export const EDUCATION_CARD_BACKDROPS = [
  photo('photo-1523240795612-9a054b0db644', 800),
  photo('photo-1541339907198-e08756dedf3f', 800),
  photo('photo-1524178232363-1fb2b075b655', 800),
  photo('photo-1509062522246-3755977927d7', 800)
]

export function educationCardImage(index: number): string {
  return EDUCATION_CARD_BACKDROPS[index % EDUCATION_CARD_BACKDROPS.length]!
}

/** Fallback visuel carte école quand `coverImageUrl` est absent (stable par slug). */
export function partnerSchoolCoverFallback(slug: string): string {
  let h = 0
  for (let i = 0; i < slug.length; i++) {
    h = Math.imul(31, h) + slug.charCodeAt(i)
  }
  return educationCardImage(Math.abs(h))
}

export function metierVisual(slug: string): string {
  return METIER_VISUAL_BY_SLUG[slug] ?? MARKETING_IMAGES.heroMetiersHub
}
