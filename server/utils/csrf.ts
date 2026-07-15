import { randomBytes, createHmac } from 'node:crypto'
import { getCookie, setCookie, createError } from 'h3'

const CSRF_COOKIE_NAME = 'bf_csrf_token'
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-secret-change-in-production'

function generateCsrfToken(): string {
  const timestamp = Date.now()
  const random = randomBytes(16).toString('hex')
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(`${timestamp}:${random}`)
    .digest('base64url')
  return `${timestamp}:${random}:${signature}`
}

function validateCsrfToken(token: string): boolean {
  if (!token) return false

  const parts = token.split(':')
  if (parts.length !== 3) return false

  const [timestamp, random, signature] = parts

  // Vérifier que le token n'est pas trop vieux (1 heure)
  const tokenTime = parseInt(timestamp, 10)
  if (isNaN(tokenTime) || Date.now() - tokenTime > 3600000) {
    return false
  }

  // Recalculer la signature
  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(`${timestamp}:${random}`)
    .digest('base64url')
  return signature === expectedSignature
}

export function getCsrfToken(event: any): string {
  let token = getCookie(event, CSRF_COOKIE_NAME)

  if (!token) {
    token = generateCsrfToken()
    setCookie(event, CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Le client doit pouvoir le lire pour l'envoyer
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 3600 // 1 heure
    })
  }

  return token
}

export function validateCsrf(event: any): void {
  const cookieToken = getCookie(event, CSRF_COOKIE_NAME)
  const headerToken = event.node.req.headers['x-csrf-token'] as string
  const bodyToken = event.node.req.body?.csrfToken as string

  const token = headerToken || bodyToken

  if (!token || !cookieToken || token !== cookieToken || !validateCsrfToken(token)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid CSRF token. Please refresh the page and try again.'
    })
  }
}

export function requireCsrf(event: any): void {
  // Ne pas valider CSRF pour les requêtes GET, HEAD, OPTIONS
  const method = event.node.req.method
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return
  }

  validateCsrf(event)
}