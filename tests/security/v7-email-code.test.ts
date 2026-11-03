/**
 * V7 — Vérification de l'email par code à 6 chiffres : session ouverte seulement avec le bon code,
 * essais limités, aucune information sur l'existence du compte.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnv, db, call, createUser, sentEmails } from '../helpers/server'

const STRONG = 'Baobab-Soleil-2026'
const payload = (email: string) => ({ firstName: 'Awa', lastName: 'Ndiaye', email, phone: '771234567', password: STRONG, acceptTerms: true })
const codeFrom = (email: string) => {
  const mail = sentEmails().filter((m) => m.to.email === email).at(-1)
  return mail?.html.match(/letter-spacing:8px[^>]*>(\d{6})</)?.[1] ?? null
}
const verify = (email: string, code: string) => call('POST', '/api/auth/verify-code', { csrf: true, body: { email, code } })

describe('V7 — code de vérification par email', () => {
  beforeEach(() => resetEnv())

  it('V7.1 bon code : email vérifié, session ouverte, code effacé', async () => {
    await call('POST', '/api/auth/register', { body: payload('code.v7@example.test') })
    const code = codeFrom('code.v7@example.test')
    expect(code).toMatch(/^\d{6}$/)
    const u = db().users.find((x) => x.email === 'code.v7@example.test')!
    expect(u.emailVerificationCodeHash).not.toContain(code)
    expect(sentEmails().at(-1)!.subject).not.toContain(code) // les objets d'email sont journalisés

    const r = await verify('code.v7@example.test', code!)
    expect(r.status).toBe(200)
    expect(r.setCookie.some((c) => c.startsWith('bf_session='))).toBe(true)
    expect(u.emailVerified).toBe(true)
    expect(u.emailVerificationCodeHash).toBeNull()
    expect((await verify('code.v7@example.test', code!)).status).toBe(400) // usage unique
  })

  it('V7.2 sans jeton CSRF : refusé', async () => {
    await call('POST', '/api/auth/register', { body: payload('csrf.v7@example.test') })
    const r = await call('POST', '/api/auth/verify-code', { body: { email: 'csrf.v7@example.test', code: codeFrom('csrf.v7@example.test') } })
    expect(r.status).toBe(403)
    expect(db().users.find((x) => x.email === 'csrf.v7@example.test')!.emailVerified).toBe(false)
  })

  it('V7.3 cinq mauvais codes : le code est détruit, même le bon est refusé', async () => {
    await call('POST', '/api/auth/register', { body: payload('brute.v7@example.test') })
    const good = codeFrom('brute.v7@example.test')!
    const wrong = good === '000000' ? '111111' : '000000'
    for (let i = 0; i < 5; i++) expect((await verify('brute.v7@example.test', wrong)).status).toBe(400)
    const r = await verify('brute.v7@example.test', good)
    expect(r.status).toBe(400)
    expect(r.setCookie.some((c) => c.startsWith('bf_session='))).toBe(false)
  })

  it('V7.4 même réponse pour un email inconnu, déjà vérifié ou un mauvais code', async () => {
    await createUser({ email: 'verifie.v7@example.test' })
    await call('POST', '/api/auth/register', { body: payload('attente.v7@example.test') })
    const a = await verify('inconnu.v7@example.test', '123456')
    const b = await verify('verifie.v7@example.test', '123456')
    const c = await verify('attente.v7@example.test', codeFrom('attente.v7@example.test') === '123456' ? '654321' : '123456')
    expect(a.status).toBe(400)
    expect(a.body).toEqual(b.body)
    expect(b.body).toEqual(c.body)
  })

  it('V7.5 inscription avec un email existant : aucun code envoyé', async () => {
    await createUser({ email: 'proprio.v7@example.test' })
    await call('POST', '/api/auth/register', { body: payload('proprio.v7@example.test') })
    expect(codeFrom('proprio.v7@example.test')).toBeNull()
  })

  it('V7.6 renvoi : nouveau code pour un compte en attente, réponse identique sinon', async () => {
    await call('POST', '/api/auth/register', { body: payload('renvoi.v7@example.test') })
    const first = codeFrom('renvoi.v7@example.test')
    const r1 = await call('POST', '/api/auth/resend-code', { body: { email: 'renvoi.v7@example.test' } })
    const r2 = await call('POST', '/api/auth/resend-code', { body: { email: 'personne.v7@example.test' } })
    expect(r1.body).toEqual(r2.body)
    const second = codeFrom('renvoi.v7@example.test')!
    expect(sentEmails().filter((m) => m.to.email === 'renvoi.v7@example.test')).toHaveLength(2)
    if (first !== second) expect((await verify('renvoi.v7@example.test', first!)).status).toBe(400)
    expect((await verify('renvoi.v7@example.test', second)).status).toBe(200)
  })
})
