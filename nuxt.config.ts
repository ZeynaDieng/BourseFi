// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/sitemap'],
  runtimeConfig: {
    paytechApiKey: process.env.PAYTECH_API_KEY || '',
    paytechApiSecret: process.env.PAYTECH_API_SECRET || '',
    paytechEnv: process.env.PAYTECH_ENV || 'test',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn'
    }
  },
  site: {
    url: 'https://boursefi.sn',
    name: 'BourseFi Senegal'
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'BourseFi Senegal',
      link: [
        { rel: 'icon', type: 'image/png', href: '/boursefi-logo.png' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
        }
      ]
    }
  }
})
