import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'

/** Durées de validité des jetons à usage unique. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 h (mot de passe oublié)
export const ACTIVATION_TOKEN_TTL_MS = 72 * 60 * 60 * 1000 // 72 h (activation par l'équipe)

/** Jeton aléatoire 256 bits (base64url) — seul son hash SHA-256 est stocké. */
export function generateOneTimeToken() {
  const token = randomBytes(32).toString('base64url')
  return { token, tokenHash: hashToken(token) }
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Hash d'un secret aléatoire jamais communiqué : le compte ne peut pas être
 * utilisé tant que son titulaire n'a pas défini lui-même son mot de passe.
 */
export async function unusablePasswordHash() {
  return bcrypt.hash(randomBytes(32).toString('base64url'), 10)
}

export function siteUrl() {
  return String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
}

export function activationUrl(token: string) {
  return `${siteUrl()}/auth/reset-password?token=${token}&activation=1`
}
