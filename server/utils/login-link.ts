import { prisma } from './prisma'
import { generateOneTimeToken } from './one-time-token'

/**
 * Liens de connexion à usage unique liés à un paiement.
 * Beaucoup d'étudiants arrivent depuis Facebook / Instagram (navigateur intégré) et paient avec Wave :
 * le retour peut s'ouvrir dans Safari ou Chrome, où ils ne sont pas connectés.
 * Le lien les reconnecte, uniquement sur leur compte étudiant et uniquement une fois le paiement validé.
 */
export const LOGIN_LINK_TTL_MS = {
  PAYMENT_RETURN: 2 * 60 * 60 * 1000, // 2 h : couvre le temps de payer sur Wave / Orange Money
  ATTESTATION_EMAIL: 72 * 60 * 60 * 1000, // 72 h : email de confirmation du paiement
  ATTESTATION_WHATSAPP: 72 * 60 * 60 * 1000, // 72 h : envoyé par l'équipe depuis le backoffice
} as const

export type LoginLinkPurpose = keyof typeof LOGIN_LINK_TTL_MS

/** Crée un lien (seul le hash est stocké) ; les liens non utilisés du même usage sont remplacés. */
export async function createLoginLink(input: { userId: string; candidatureId: string; purpose: LoginLinkPurpose }) {
  const { token, tokenHash } = generateOneTimeToken()
  await prisma.loginLink.deleteMany({
    where: { userId: input.userId, candidatureId: input.candidatureId, purpose: input.purpose, usedAt: null },
  })
  await prisma.loginLink.create({
    data: { ...input, tokenHash, expiresAt: new Date(Date.now() + LOGIN_LINK_TTL_MS[input.purpose]) },
  })
  return token
}

/** Page qui consomme le lien (en JavaScript, pour qu'un antivirus d'email qui suit les liens ne le brûle pas). */
export function paymentReturnPath(candidatureId: string, token?: string | null) {
  const q = new URLSearchParams({ candidatureId, status: 'success' })
  if (token) q.set('k', token)
  return `/paiement/retour?${q.toString()}`
}
