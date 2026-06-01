import type { MetierHubEntry } from '~/types/metier-hub'

export type PublicFaqItem = { id: string; q: string; a: string }

export type PublicTestimonialItem = {
  id: string
  initials: string
  name: string
  role: string
  quote: string
  avatarUrl?: string | null
}

export type PublicSitePayload = {
  content: Record<string, unknown>
  faq: PublicFaqItem[]
  testimonials: PublicTestimonialItem[]
  metiers: MetierHubEntry[]
}

export function usePublicSite() {
  return useAsyncData(
    'site-public',
    () => $fetch<PublicSitePayload>('/api/site/public'),
    {
      default: () => ({
        content: {},
        faq: [],
        testimonials: [],
        metiers: []
      })
    }
  )
}
