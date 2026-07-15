export function useCsrf() {
  const csrfToken = useCookie('bf_csrf_token')

  const getCsrfToken = () => {
    return csrfToken.value || ''
  }

  const addCsrfToHeaders = (headers: Record<string, string> = {}) => {
    const token = getCsrfToken()
    if (token) {
      headers['x-csrf-token'] = token
    }
    return headers
  }

  return {
    csrfToken,
    getCsrfToken,
    addCsrfToHeaders
  }
}