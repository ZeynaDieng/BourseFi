/** Message affichable depuis une erreur $fetch / FetchError Nuxt */
export function getAdminErrorMessage(e: unknown, fallback = 'Une erreur est survenue.') {
  if (e && typeof e === 'object') {
    const errObj = e as { statusCode?: number; status?: number; data?: { statusMessage?: string; message?: string } }
    if (errObj.statusCode === 401 || errObj.status === 401) {
      if (process.client) {
        navigateTo('/auth/login')
      }
      return 'Session d\'administration expirée. Veuillez vous re-connecter à votre compte Admin.'
    }
    if (errObj.data?.statusMessage) return errObj.data.statusMessage
    if (errObj.data?.message) return errObj.data.message
  }
  if (e instanceof Error) return e.message
  return fallback
}
