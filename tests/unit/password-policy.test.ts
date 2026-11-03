/** Tests unitaires : politique de mot de passe partagée et jetons à usage unique. */
import { describe, it, expect } from 'vitest'
import { checkPassword, PASSWORD_MIN_LENGTH, STAFF_PASSWORD_MIN_LENGTH } from '../../shared/password-policy'
import { generateOneTimeToken, hashToken, ACTIVATION_TOKEN_TTL_MS, RESET_TOKEN_TTL_MS } from '../../server/utils/one-time-token'

describe('U.1 checkPassword (étudiant)', () => {
  it.each([['', 'vide'], ['abc', 'trop court'], ['x'.repeat(129), 'trop long']])('refuse %s (%s)', (pw) => {
    expect(checkPassword(pw).ok).toBe(false)
  })

  it('refuse les types non-chaîne', () => {
    for (const v of [null, undefined, 12345678901, ['x'], { a: 1 }]) expect(checkPassword(v).ok).toBe(false)
  })

  it.each(['1234', 'awa1', 'mangue', 'Teranga-Lac-Rose-91'])('accepte %s', (pw) => {
    expect(checkPassword(pw, { email: 'awa@example.test', role: 'STUDENT' })).toEqual({ ok: true })
  })

  it('seuil exact de longueur', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(4)
    expect(checkPassword('a'.repeat(PASSWORD_MIN_LENGTH - 1)).ok).toBe(false)
    expect(checkPassword('a'.repeat(PASSWORD_MIN_LENGTH)).ok).toBe(true)
  })
})

describe('U.1 bis checkPassword (équipe : admin, partenaire)', () => {
  it.each([
    ['1234', 'trop court'], ['Abcdef12', '8 caractères'], ['abcdefghijkl', 'lettres seules'],
    ['12345678901', 'chiffres seuls'], ['Password-2026', 'mot interdit'], ['Azerty-12345', 'mot interdit'],
    ['BourseFi2026!', 'nom du site'], ['BOURSEFI-9999', 'nom du site (casse)'], ['Passer-123456', 'défaut courant'],
    ['aaaaaaaaaaaa', 'répétition'], ['A1-' + 'z'.repeat(130), 'trop long'],
  ])('refuse %s (%s)', (pw) => {
    expect(checkPassword(pw, { role: 'ADMIN' }).ok).toBe(false)
    expect(checkPassword(pw, { role: 'PARTNER' }).ok).toBe(false)
  })

  it('refuse un mot de passe contenant la partie locale de l’email', () => {
    expect(checkPassword('Moussa.Diallo-77', { email: 'moussa.diallo@example.test', role: 'ADMIN' }).ok).toBe(false)
  })

  it.each(['Teranga-Lac-Rose-91', 'Cheval-Lune-2026', 'mangue verte 42', 'Ñdéyé*Fàtou#7'])('accepte %s', (pw) => {
    expect(checkPassword(pw, { email: 'awa@example.test', role: 'ADMIN' })).toEqual({ ok: true })
  })

  it('seuil exact de longueur', () => {
    expect(checkPassword('a'.repeat(STAFF_PASSWORD_MIN_LENGTH - 2) + '1', { role: 'ADMIN' }).ok).toBe(false)
    expect(checkPassword('Kq' + 'x'.repeat(STAFF_PASSWORD_MIN_LENGTH - 3) + '1', { role: 'ADMIN' }).ok).toBe(true)
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
