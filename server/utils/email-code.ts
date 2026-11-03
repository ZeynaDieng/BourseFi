import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { renderEmail, sendEmail } from './email'
import { siteUrl } from './one-time-token'

/** Code de vérification d'email à 6 chiffres, saisi sans quitter le formulaire de candidature. */
export const EMAIL_CODE_TTL_MS = 30 * 60 * 1000
/** Au-delà, le code est invalidé : il faut en demander un nouveau (10⁶ combinaisons, 5 essais par code). */
export const EMAIL_CODE_MAX_ATTEMPTS = 5

export function hashEmailCode(userId: string, code: string) {
  return createHash('sha256').update(`${userId}:${code}`).digest('hex')
}

export function generateEmailCode(userId: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  return {
    code,
    data: {
      emailVerificationCodeHash: hashEmailCode(userId, code),
      emailVerificationCodeExpires: new Date(Date.now() + EMAIL_CODE_TTL_MS),
      emailVerificationCodeAttempts: 0,
    },
  }
}

export function emailCodeMatches(userId: string, code: string, storedHash: string) {
  const a = Buffer.from(hashEmailCode(userId, code))
  const b = Buffer.from(storedHash)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Bloc HTML du code dans l'email de vérification. */
export function emailCodeHtml(code: string) {
  return `<p style="margin:16px 0 4px;">Votre code de vérification :</p>
<p style="margin:0 0 8px;font-size:32px;font-weight:800;letter-spacing:8px;color:#0b1b3a;">${code}</p>
<p style="margin:0 0 16px;color:#64748b;font-size:12px;">Saisissez-le sur la page de candidature. Il est valable 30 minutes.</p>`
}

/** Email de vérification : code à saisir sur la page + lien (les deux activent le compte). */
export async function sendVerificationEmail(user: { id: string; email: string; name: string }, token: string, code: string) {
  return sendEmail({
    to: { email: user.email, name: user.name },
    // Pas de code dans l'objet : les objets d'email sont journalisés
    subject: 'Votre code de vérification BourseFi',
    html: renderEmail({
      title: `Bienvenue ${user.name} !`,
      bodyHtml: `
        <p>Votre compte BourseFi a bien été créé.</p>
        ${emailCodeHtml(code)}
        <p>Vous pouvez aussi confirmer votre adresse en cliquant sur le bouton ci-dessous.</p>
      `,
      ctaLabel: 'Vérifier mon email',
      ctaUrl: `${siteUrl()}/auth/verify-email?token=${token}`,
    }),
  }).catch(() => false)
}

// ── Connexion par code (sans mot de passe) ───────────────────────────────────

/** Hash distinct du code de vérification : un code de connexion ne peut pas servir à l'autre usage. */
function hashLoginCode(userId: string, code: string) {
  return createHash('sha256').update(`connexion:${userId}:${code}`).digest('hex')
}

export function generateLoginCode(userId: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  return {
    code,
    data: {
      loginCodeHash: hashLoginCode(userId, code),
      loginCodeExpires: new Date(Date.now() + EMAIL_CODE_TTL_MS),
      loginCodeAttempts: 0,
    },
  }
}

export function loginCodeMatches(userId: string, code: string, storedHash: string) {
  const a = Buffer.from(hashLoginCode(userId, code))
  const b = Buffer.from(storedHash)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function sendLoginCodeEmail(user: { email: string; name: string }, code: string) {
  return sendEmail({
    to: { email: user.email, name: user.name },
    // Pas de code dans l'objet : les objets d'email sont journalisés
    subject: 'Votre code de connexion BourseFi',
    html: renderEmail({
      title: `Bonjour ${user.name} !`,
      bodyHtml: `
        <p>Voici votre code pour vous connecter à BourseFi, sans mot de passe :</p>
        <p style="margin:0 0 8px;font-size:32px;font-weight:800;letter-spacing:8px;color:#0b1b3a;">${code}</p>
        <p style="margin:0 0 16px;color:#64748b;font-size:12px;">Saisissez-le sur la page de connexion. Il est valable 30 minutes.</p>
        <p style="color:#64748b;font-size:12px;">Vous n'avez rien demandé ? Ignorez cet email : personne ne peut se connecter sans ce code.</p>
      `,
    }),
  }).catch(() => false)
}
