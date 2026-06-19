// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/sitemap'],
  sitemap: {
    exclude: [
      '/admin/**',
      '/etudiant/**',
      '/partenaire/**',
      '/paiement',
      '/paiement/**',
      '/auth/**',
      '/postuler/**',
      '/documents/pre-admission',
    ],
  },
  runtimeConfig: {
    paytechApiKey: process.env.PAYTECH_API_KEY || '',
    paytechApiSecret: process.env.PAYTECH_API_SECRET || '',
    paytechEnv: process.env.PAYTECH_ENV || 'test',
    brevoApiKey: process.env.BREVO_API_KEY || '',
    emailFrom: process.env.EMAIL_FROM || 'no-reply@boursefi.sn',
    emailFromName: process.env.EMAIL_FROM_NAME || 'BourseFi',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn',
      googleSiteVerification: process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    }
  },
  site: {
    url: 'https://boursefi.sn',
    name: 'BourseFi Senegal'
  },
  css: ['~/assets/css/main.css'],
  nitro: {
    routeRules: {
      '/admin/**': { robots: false },
      '/etudiant/**': { robots: false },
      '/partenaire/**': { robots: false },
      '/paiement': { robots: false },
      '/paiement/**': { robots: false },
      '/auth/**': { robots: false },
      '/postuler/**': { robots: false },
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        },
      },
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'BourseFi Senegal',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
      ],
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
