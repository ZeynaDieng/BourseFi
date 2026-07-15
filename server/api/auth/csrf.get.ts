import { getCsrfToken } from '../../utils/csrf'

export default defineEventHandler((event) => {
  const token = getCsrfToken(event)
  return { csrfToken: token }
})