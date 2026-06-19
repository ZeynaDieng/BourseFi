import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_OG_IMAGE,
  siteAbsoluteUrl,
} from '~/utils/seo'

type SiteSeoInput = {
  title?: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string | undefined>
  ogImage?: MaybeRefOrGetter<string | undefined>
  robots?: MaybeRefOrGetter<'index, follow' | 'noindex, nofollow'>
  canonical?: MaybeRefOrGetter<string | undefined>
}

export function useSiteSeo(input: SiteSeoInput = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteUrl = String(config.public.siteUrl)

  const title = computed(() => toValue(input.title) ?? 'BourseFi Sénégal')
  const description = computed(() => toValue(input.description) ?? SEO_DEFAULT_DESCRIPTION)
  const ogImage = computed(() => {
    const raw = toValue(input.ogImage) ?? SEO_DEFAULT_OG_IMAGE
    return raw.startsWith('http') ? raw : siteAbsoluteUrl(raw, siteUrl)
  })
  const canonical = computed(() => {
    const path = toValue(input.canonical) ?? route.path
    return siteAbsoluteUrl(path, siteUrl)
  })

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogUrl: canonical,
    ogImage,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    robots: computed(() => toValue(input.robots) ?? 'index, follow'),
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  })

  return { siteUrl, title, description, ogImage, canonical }
}

export function useJsonLd(items: MaybeRefOrGetter<(Record<string, unknown> | null)[]>) {
  useHead({
    script: computed(() => {
      const list = toValue(items).filter(Boolean) as Record<string, unknown>[]
      return list.map((item, index) => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(item),
        key: `json-ld-${index}`,
      }))
    }),
  })
}
