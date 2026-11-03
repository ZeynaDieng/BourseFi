/** Numéro au format international attendu par wa.me (Sénégal : 9 chiffres commençant par 7 → préfixe 221). */
export function toWhatsappNumber(phone: string | null | undefined): string {
  let digits = (phone || '').replace(/\D/g, '')
  if (digits.length === 9 && digits.startsWith('7')) digits = '221' + digits
  return digits
}

/**
 * Retire les emojis : la redirection wa.me → api.whatsapp.com les remplace souvent par « � ».
 * Le gras WhatsApp (*texte*) et les accents sont conservés.
 */
export function stripEmojis(message: string): string {
  return message
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D\u20E3]/gu, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[ \t]+/gm, '')
}

export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  const number = toWhatsappNumber(phone)
  return number.length >= 8 ? `https://wa.me/${number}?text=${encodeURIComponent(stripEmojis(message))}` : null
}

/** Action d'audit tracée quand un admin relance sur WhatsApp une candidature commencée. */
export const DRAFT_WHATSAPP_ACTION = 'DRAFT_WHATSAPP_RELANCE'
