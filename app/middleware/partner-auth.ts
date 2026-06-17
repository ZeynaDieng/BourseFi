import { PARTNER_PORTAL_ENABLED } from '~/utils/product-config'

export default defineNuxtRouteMiddleware(async () => {
  if (!PARTNER_PORTAL_ENABLED) {
    return navigateTo('/')
  }

  const { user } = await $fetch<{ user: { role: string } | null }>('/api/auth/me')

  if (!user) {
    return navigateTo('/auth/login')
  }
  if (user.role !== 'PARTNER') {
    return navigateTo('/')
  }
})
