/** Numéro au format international attendu par wa.me (Sénégal : 9 chiffres commençant par 7 → préfixe 221). */
export function toWhatsappNumber(phone: string | null | undefined): string {
  let digits = (phone || '').replace(/\D/g, '')
  if (digits.length === 9 && digits.startsWith('7')) digits = '221' + digits
  return digits
}

export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  const number = toWhatsappNumber(phone)
  return number.length >= 8 ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null
}

/** Action d'audit tracée quand un admin relance sur WhatsApp une candidature commencée. */
export const DRAFT_WHATSAPP_ACTION = 'DRAFT_WHATSAPP_RELANCE'
