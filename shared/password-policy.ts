/**
 * Politique de mot de passe unique, partagée entre le serveur (source de vérité)
 * et le frontend (aide à la saisie). Utilisée par : inscription, réinitialisation,
 * activation de compte et modification par un administrateur.
 */

export const PASSWORD_MIN_LENGTH = 10
export const PASSWORD_MAX_LENGTH = 128

export const PASSWORD_POLICY_HINT =
  `Au moins ${PASSWORD_MIN_LENGTH} caractères, avec au moins une lettre et un chiffre ou un symbole. Évitez les mots de passe courants.`

/** Mots de passe/radicaux interdits (comparaison après normalisation). */
const FORBIDDEN_FRAGMENTS = [
  'password', 'motdepasse', 'azerty', 'qwerty', 'boursefi', 'senegal', 'dakar',
  'admin', 'welcome', 'bienvenue', 'letmein', 'iloveyou', 'abc123', 'passer',
]

const COMMON_PASSWORDS = new Set([
  '123456789', '1234567890', '0123456789', '12345678910', 'azertyuiop', 'qwertyuiop',
  'password1', 'password12', 'password123', 'motdepasse1', '1q2w3e4r5t', 'aaaaaaaaaa',
])

function normalize(s: string) {
  return s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export type PasswordCheck = { ok: true } | { ok: false; message: string }

export function checkPassword(password: unknown, context: { email?: string | null } = {}): PasswordCheck {
  if (typeof password !== 'string') return { ok: false, message: 'Mot de passe invalide.' }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, message: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` }
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, message: `Le mot de passe ne peut pas dépasser ${PASSWORD_MAX_LENGTH} caractères.` }
  }
  if (!/\p{L}/u.test(password) || !/[^\p{L}]/u.test(password)) {
    return { ok: false, message: 'Le mot de passe doit contenir au moins une lettre et un chiffre ou un symbole.' }
  }
  const n = normalize(password)
  if (COMMON_PASSWORDS.has(n) || /^(.)\1+$/.test(n)) {
    return { ok: false, message: 'Ce mot de passe est trop courant. Choisissez-en un autre.' }
  }
  if (FORBIDDEN_FRAGMENTS.some((f) => n.includes(f))) {
    return { ok: false, message: 'Ce mot de passe contient un mot interdit ou trop prévisible.' }
  }
  const local = context.email ? normalize(String(context.email).split('@')[0] ?? '') : ''
  if (local.length >= 3 && n.includes(local)) {
    return { ok: false, message: 'Le mot de passe ne doit pas contenir votre adresse email.' }
  }
  return { ok: true }
}
