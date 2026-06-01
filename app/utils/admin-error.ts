/** Message affichable depuis une erreur $fetch / FetchError Nuxt */
export function getAdminErrorMessage(e: unknown, fallback = 'Une erreur est survenue.') {
  if (e && typeof e === 'object' && 'data' in e) {
    const data = (e as { data?: { statusMessage?: string; message?: string } }).data
    if (data?.statusMessage) return data.statusMessage
    if (data?.message) return data.message
  }
  if (e instanceof Error) return e.message
  return fallback
}
