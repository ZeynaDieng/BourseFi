export const SEO_DEFAULT_OG_IMAGE = '/boursefi-banner.png'

export const SEO_DEFAULT_DESCRIPTION =
  "Trouvez les bourses d'études pour les étudiants sénégalais et postulez en ligne sur BourseFi."

export function siteAbsoluteUrl(path: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function buildOrganizationJsonLd(siteUrl: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BourseFi',
    alternateName: 'BourseFi Sénégal',
    url: siteUrl,
    logo: siteAbsoluteUrl('/boursefi-logo.png', siteUrl),
    image: siteAbsoluteUrl(SEO_DEFAULT_OG_IMAGE, siteUrl),
    description,
    areaServed: { '@type': 'Country', name: 'Sénégal' },
  }
}

export function buildWebSiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BourseFi',
    url: siteUrl,
    inLanguage: 'fr-SN',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/recherche?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildFaqJsonLd(items: { q: string; a: string }[]) {
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}
