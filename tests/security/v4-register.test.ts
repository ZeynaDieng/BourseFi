/**
 * V4 — Inscription étudiante sans vérification de l'email (choix produit : ne pas faire quitter la candidature).
 * Le compte est utilisable tout de suite et la session ouverte. Contrepartie assumée : une adresse déjà
 * inscrite est signalée (409), comme sur la plupart des sites ; la limite de tentatives freine l'énumération.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { resetEnv, db, call, createUser, sentEmails, setEmailFailure, tokenFromEmail } from '../helpers/server'

const STRONG = 'Baobab-Soleil-2026'

function payload(email: string, password = STRONG) {
  return { firstName: 'Khady', lastName: 'Fall', email, phone: '771234567', password, acceptTerms: true }
}

const hasSession = (r: { setCookie: string[] }) => r.setCookie.some((c) => c.startsWith('bf_session='))

describe('V4 — inscription', () => {
  beforeEach(() => resetEnv())
  afterEach(() => vi.restoreAllMocks())

  it('V4.1 nouvelle adresse : compte créé, session ouverte, email de bienvenue sans lien ni code', async () => {
    const r = await call('POST', '/api/auth/register', { csrf: true, body: payload('neuf.v4@example.test') })
    expect(r.status).toBe(200)
    expect(r.body.user.role).toBe('STUDENT')
    expect(hasSession(r)).toBe(true)
    expect(db().users.find((u) => u.email === 'neuf.v4@example.test')).toBeTruthy()
    const mail = sentEmails().find((m) => m.to.email === 'neuf.v4@example.test')!
    expect(mail.subject).toBe('Bienvenue sur BourseFi')
    expect(tokenFromEmail(mail)).toBeNull()
    expect(mail.html).not.toMatch(/letter-spacing:8px/)
  })

  it('V4.2 adresse déjà inscrite (même avec une autre casse) : 409, aucune session, compte existant intact', async () => {
    await createUser({ email: 'deja.v4@example.test', password: 'Original-Secret-55' })
    const r = await call('POST', '/api/auth/register', { csrf: true, body: payload('DEJA.V4@example.test') })
    expect(r.status).toBe(409)
    expect(hasSession(r)).toBe(false)
    expect(db().users.filter((u) => u.email.toLowerCase() === 'deja.v4@example.test')).toHaveLength(1)
    const u = db().users.find((x) => x.email === 'deja.v4@example.test')!
    expect(await bcrypt.compare('Original-Secret-55', u.passwordHash)).toBe(true)
  })

  it('V4.3 sans jeton CSRF : refusé, aucun compte créé', async () => {
    const r = await call('POST', '/api/auth/register', { body: payload('csrf.v4@example.test') })
    expect(r.status).toBe(403)
    expect(db().users).toHaveLength(0)
  })

  it('V4.4 connexion par mot de passe possible tout de suite, sans vérification', async () => {
    await call('POST', '/api/auth/register', { csrf: true, body: payload('legit.v4@example.test') })
    const ok = await call('POST', '/api/auth/login', { csrf: true, body: { email: 'legit.v4@example.test', password: STRONG } })
    expect(ok.status).toBe(200)
    expect(hasSession(ok)).toBe(true)
  })

  it('V4.5 email normalisé en minuscules à la création', async () => {
    await call('POST', '/api/auth/register', { csrf: true, body: payload('Mixte.V4@Example.TEST') })
    expect(db().users.find((x) => x.email === 'mixte.v4@example.test')).toBeTruthy()
  })

  it('V4.6 si l’envoi de l’email de bienvenue échoue, l’inscription réussit quand même', async () => {
    setEmailFailure(true)
    const r = await call('POST', '/api/auth/register', { csrf: true, body: payload('echec.v4@example.test') })
    expect(r.status).toBe(200)
    expect(hasSession(r)).toBe(true)
  })

  it('V4.7 le corps de requête (mot de passe) n’est jamais journalisé', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const spyW = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await call('POST', '/api/auth/register', { csrf: true, body: payload('log.v4@example.test', 'Secret-Ne-Pas-Logger-1') })
    await call('POST', '/api/auth/register', { csrf: true, body: payload('log2.v4@example.test', 'x') })
    const logged = [...spy.mock.calls, ...spyW.mock.calls].map((c) => JSON.stringify(c)).join('\n')
    expect(logged).not.toContain('Secret-Ne-Pas-Logger-1')
  })

  it('V4.8 champs invalides : 400, même message que l’adresse existe ou non', async () => {
    await createUser({ email: 'inval.v4@example.test' })
    const r1 = await call('POST', '/api/auth/register', { csrf: true, body: { ...payload('inval.v4@example.test'), acceptTerms: false } })
    const r2 = await call('POST', '/api/auth/register', { csrf: true, body: { ...payload('inconnu.v4@example.test'), acceptTerms: false } })
    expect(r1.status).toBe(400)
    expect(r2.status).toBe(400)
    expect(r1.body.statusMessage ?? r1.body.message).toEqual(r2.body.statusMessage ?? r2.body.message)
  })
})
