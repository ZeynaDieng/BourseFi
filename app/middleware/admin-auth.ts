export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  const { user } = await requestFetch<{ user: { role: string } | null }>('/api/auth/me')

  if (!user) {
    return navigateTo('/auth/login')
  }
  if (user.role !== 'ADMIN') {
    return navigateTo('/')
  }
})
