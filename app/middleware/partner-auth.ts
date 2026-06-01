export default defineNuxtRouteMiddleware(async () => {
  const { user } = await $fetch<{ user: { role: string } | null }>('/api/auth/me')

  if (!user) {
    return navigateTo('/auth/login')
  }
  if (user.role !== 'PARTNER') {
    return navigateTo('/')
  }
})
