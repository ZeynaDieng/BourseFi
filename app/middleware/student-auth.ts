export default defineNuxtRouteMiddleware(async (to) => {
  // useRequestFetch transmet les cookies de la requête entrante pendant le SSR,
  // sinon /api/auth/me ne voit pas la session et redirige vers login à chaque refresh.
  const requestFetch = useRequestFetch()
  const { user } = await requestFetch<{ user: { role: string } | null }>('/api/auth/me')

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
