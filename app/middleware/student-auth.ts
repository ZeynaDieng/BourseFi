export default defineNuxtRouteMiddleware(async (to) => {
  const { user } = await $fetch<{ user: { role: string } | null }>('/api/auth/me')

  if (!user) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
  if (user.role !== 'STUDENT') {
    return navigateTo('/')
  }
})
