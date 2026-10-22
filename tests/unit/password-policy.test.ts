/** Tests unitaires : politique de mot de passe partagée et jetons à usage unique. */
import { describe, it, expect } from 'vitest'
import { checkPassword, PASSWORD_MIN_LENGTH } from '../../shared/password-policy'
import { generateOneTimeToken, hashToken, ACTIVATION_TOKEN_TTL_MS, RESET_TOKEN_TTL_MS } from '../../server/utils/one-time-token'

describe('U.1 checkPassword', () => {
  it.each([
    ['', 'vide'], ['1234', 'trop court'], ['Abcdef12', '8 caractères'], ['abcdefghijkl', 'lettres seules'],
    ['12345678901', 'chiffres seuls'], ['Password-2026', 'mot interdit'], ['Azerty-12345', 'mot interdit'],
    ['BourseFi2026!', 'nom du site'], ['BOURSEFI-9999', 'nom du site (casse)'], ['Passer-123456', 'défaut courant'],
    ['aaaaaaaaaaaa', 'répétition'], ['A1-' + 'z'.repeat(130), 'trop long'],
  ])('refuse %s (%s)', (pw) => {
    expect(checkPassword(pw).ok).toBe(false)
  })

  it('refuse un mot de passe contenant la partie locale de l’email', () => {
    expect(checkPassword('Moussa.Diallo-77', { email: 'moussa.diallo@example.test' }).ok).toBe(false)
  })

  it('refuse les types non-chaîne', () => {
    for (const v of [null, undefined, 12345678901, ['x'], { a: 1 }]) expect(checkPassword(v).ok).toBe(false)
  })

  it.each(['Teranga-Lac-Rose-91', 'Cheval-Lune-2026', 'mangue verte 42', 'Ñdéyé*Fàtou#7'])('accepte %s', (pw) => {
    expect(checkPassword(pw, { email: 'awa@example.test' })).toEqual({ ok: true })
  })

  it('seuil exact de longueur', () => {
    expect(checkPassword('a'.repeat(PASSWORD_MIN_LENGTH - 2) + '1').ok).toBe(false)
    expect(checkPassword('Kq' + 'x'.repeat(PASSWORD_MIN_LENGTH - 3) + '1').ok).toBe(true)
  })
})

describe('U.2 jetons à usage unique', () => {
  it('256 bits, uniques, hash SHA-256 déterministe', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      const { token, tokenHash } = generateOneTimeToken()
      expect(Buffer.from(token, 'base64url').length).toBe(32)
      expect(tokenHash).toBe(hashToken(token))
      expect(tokenHash).not.toBe(token)
      seen.add(token)
    }
    expect(seen.size).toBe(1000)
  })

  it('durées de validité bornées', () => {
    expect(RESET_TOKEN_TTL_MS).toBe(3600_000)
    expect(ACTIVATION_TOKEN_TTL_MS).toBe(72 * 3600_000)
  })
})
