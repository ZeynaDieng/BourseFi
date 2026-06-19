import { SEO_DEFAULT_OG_IMAGE, siteAbsoluteUrl } from '~/utils/seo'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl)
  const ogImage = siteAbsoluteUrl(SEO_DEFAULT_OG_IMAGE, siteUrl)

  useSeoMeta({
    ogSiteName: 'BourseFi',
    ogLocale: 'fr_SN',
    ogImage,
    twitterCard: 'summary_large_image',
    twitterImage: ogImage,
  })

  const verification = String(config.public.googleSiteVerification || '').trim()
  if (verification) {
    useHead({
      meta: [{ name: 'google-site-verification', content: verification }],
    })
  }
})
