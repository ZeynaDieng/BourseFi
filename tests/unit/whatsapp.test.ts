import { describe, it, expect } from 'vitest'
import { stripEmojis, toWhatsappNumber, whatsappLink } from '../../server/utils/whatsapp'

describe('Liens WhatsApp', () => {
  it('retire les emojis (affichés « � » après la redirection wa.me) sans toucher accents ni gras', () => {
    expect(stripEmojis('Bonjour Awa 👋\n\n🎁 Code *RENTREE2026* !\n👉 https://boursefi.sn')).toBe(
      'Bonjour Awa\n\nCode *RENTREE2026* !\nhttps://boursefi.sn',
    )
    expect(stripEmojis('Félicitations ❤️ 👍🏾 🇸🇳 — à très bientôt')).toBe('Félicitations — à très bientôt')
  })

  it('numéro sénégalais à 9 chiffres → préfixe 221', () => {
    expect(toWhatsappNumber('77 123 45 67')).toBe('221771234567')
    expect(toWhatsappNumber('+221 77 123 45 67')).toBe('221771234567')
  })

  it('pas de lien sans numéro exploitable', () => {
    expect(whatsappLink('', 'x')).toBeNull()
    expect(whatsappLink('12', 'x')).toBeNull()
  })

  it('le message du lien ne contient plus d’emoji', () => {
    const url = whatsappLink('771234567', 'Bonjour 👋 Awa')!
    expect(url.startsWith('https://wa.me/221771234567?text=')).toBe(true)
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Bonjour Awa')
  })
})
