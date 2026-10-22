/**
 * V4 — Énumération de comptes à l’inscription (409 « Cet email est déjà utilisé »),
 * session ouverte uniquement pour les nouveaux comptes, auto-vérification si l’email échoue.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { resetEnv, db, call, createUser, sentEmails, setEmailFailure, tokenFromEmail } from '../helpers/server'

const STRONG = 'Baobab-Soleil-2026'

function payload(email: string, password = STRONG) {
  return { firstName: 'Khady', lastName: 'Fall', email, phone: '771234567', password, acceptTerms: true }
}

function publicShape(r: { status: number; body: any; setCookie: string[] }) {
  return { status: r.status, body: r.body, cookies: r.setCookie.map((c) => c.split('=')[0]).sort() }
}

describe('V4 — inscription sans énumération', () => {
  beforeEach(() => resetEnv())
  afterEach(() => vi.restoreAllMocks())

  it('V4.1 email existant vs nouveau : statut, corps et cookies identiques', async () => {
    await createUser({ email: 'deja.v4@example.test' })
    const a = await call('POST', '/api/auth/register', { body: payload('deja.v4@example.test') })
    const b = await call('POST', '/api/auth/register', { body: payload('neuf.v4@example.test') })
    expect(publicShape(a)).toEqual(publicShape(b))
    expect(a.status).toBe(200)
    expect(a.setCookie.some((c) => c.startsWith('bf_session='))).toBe(false)
  })

  it('V4.2 variante de casse d’un email existant : pas de doublon, réponse identique', async () => {
    await createUser({ email: 'casse.v4@example.test', password: 'Original-Secret-55' })
    const a = await call('POST', '/api/auth/register', { body: payload('CASSE.V4@example.test') })
    const b = await call('POST', '/api/auth/register', { body: payload('autre.v4@example.test') })
    expect(publicShape(a)).toEqual(publicShape(b))
    expect(db().users.filter((u) => u.email.toLowerCase() === 'casse.v4@example.test')).toHaveLength(1)
    const u = db().users.find((x) => x.email === 'casse.v4@example.test')!
    expect(await bcrypt.compare('Original-Secret-55', u.passwordHash)).toBe(true)
  })

  it('V4.3 doublon : le propriétaire est prévenu par email, aucun compte modifié', async () => {
    await createUser({ email: 'proprio.v4@example.test' })
    const before = db().users.length
    await call('POST', '/api/auth/register', { body: payload('proprio.v4@example.test') })
    expect(db().users.length).toBe(before)
    const mails = sentEmails().filter((m) => m.to.email === 'proprio.v4@example.test')
    expect(mails).toHaveLength(1)
    expect(tokenFromEmail(mails[0])).toBeNull() // aucun jeton de vérification émis pour l'attaquant
  })

  it('V4.4 inscription légitime : compte non vérifié + email de vérification ; verify → session', async () => {
    const r = await call('POST', '/api/auth/register', { body: payload('legit.v4@example.test') })
    expect(r.status).toBe(200)
    const u = db().users.find((x) => x.email === 'legit.v4@example.test')!
    expect(u.emailVerified).toBe(false)
    const token = tokenFromEmail(sentEmails().find((m) => m.to.email === 'legit.v4@example.test'))
    expect(token).toBeTruthy()

    const blocked = await call('POST', '/api/auth/login', { csrf: true, body: { email: 'legit.v4@example.test', password: STRONG } })
    expect(blocked.status).toBe(403)

    const v = await call('GET', `/api/auth/verify-email?token=${token}`)
    expect(v.status).toBe(200)
    expect(v.setCookie.some((c) => c.startsWith('bf_session='))).toBe(true)

    const ok = await call('POST', '/api/auth/login', { csrf: true, body: { email: 'legit.v4@example.test', password: STRONG } })
    expect(ok.status).toBe(200)
  })

  it('V4.5 email normalisé en minuscules à la création', async () => {
    await call('POST', '/api/auth/register', { body: payload('Mixte.V4@Example.TEST') })
    expect(db().users.find((x) => x.email === 'mixte.v4@example.test')).toBeTruthy()
  })

  it('V4.6 si l’envoi d’email échoue, le compte n’est PAS auto-vérifié ni connecté', async () => {
    setEmailFailure(true)
    const r = await call('POST', '/api/auth/register', { body: payload('echec.v4@example.test') })
    expect(r.status).toBe(200)
    const u = db().users.find((x) => x.email === 'echec.v4@example.test')!
    expect(u.emailVerified).toBe(false)
    expect(r.setCookie.some((c) => c.startsWith('bf_session='))).toBe(false)
    expect(r.body).not.toHaveProperty('emailSent')
  })

  it('V4.7 le corps de requête (mot de passe) n’est jamais journalisé', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const spyW = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await call('POST', '/api/auth/register', { body: payload('log.v4@example.test', 'Secret-Ne-Pas-Logger-1') })
    await call('POST', '/api/auth/register', { body: payload('log2.v4@example.test', 'x') })
    const logged = [...spy.mock.calls, ...spyW.mock.calls].map((c) => JSON.stringify(c)).join('\n')
    expect(logged).not.toContain('Secret-Ne-Pas-Logger-1')
  })

  it('V4.8 champs invalides : 400 sans révéler d’information sur l’existence', async () => {
    await createUser({ email: 'inval.v4@example.test' })
    const r1 = await call('POST', '/api/auth/register', { body: { ...payload('inval.v4@example.test'), acceptTerms: false } })
    const r2 = await call('POST', '/api/auth/register', { body: { ...payload('inconnu.v4@example.test'), acceptTerms: false } })
    expect(r1.status).toBe(400)
    expect(r2.status).toBe(400)
    expect(r1.body.statusMessage ?? r1.body.message).toEqual(r2.body.statusMessage ?? r2.body.message)
  })
})
