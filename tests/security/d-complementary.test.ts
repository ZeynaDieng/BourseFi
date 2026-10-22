/**
 * D — Autorisations admin, limitation de débit, cas limites, non-régression connexion/bourses.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnv, db, call, createUser, sessionCookieFor } from '../helpers/server'

describe('D.1 — autorisations des routes administratives', () => {
  beforeEach(() => resetEnv())

  const routes = (candId: string, userId: string) => [
    ['POST', `/api/admin/candidatures/${candId}/activer-compte`, {}],
    ['POST', '/api/admin/users', { email: 'x.d@example.test', name: 'X D' }],
    ['PATCH', `/api/admin/users/${userId}`, { name: 'Nouveau Nom' }],
    ['POST', '/api/admin/candidatures/creer-direct', { firstName: 'a', lastName: 'b', email: 'c.d@example.test', programmeId: 'nope' }],
  ] as const

  it('D.1.1 non authentifié → 401 ; étudiant → 403 ; partenaire → 403', async () => {
    const student = await createUser({ email: 'etu.d@example.test' })
    const partner = await createUser({ email: 'part.d@example.test', role: 'PARTNER' })
    const cand = await db().prisma.candidature.create({ data: { email: 'c.d@example.test', userId: null } })
    const sCookie = await sessionCookieFor(student.id)
    const pCookie = await sessionCookieFor(partner.id)
    for (const [m, p, body] of routes(cand.id, student.id)) {
      expect((await call(m, p, { body })).status, `${m} ${p} anonyme`).toBe(401)
      expect((await call(m, p, { body, cookie: sCookie })).status, `${m} ${p} étudiant`).toBe(403)
      expect((await call(m, p, { body, cookie: pCookie })).status, `${m} ${p} partenaire`).toBe(403)
    }
    expect(db().users.find((u) => u.email === 'x.d@example.test')).toBeUndefined()
  })

  it('D.1.2 session expirée ou forgée → 401', async () => {
    const admin = await createUser({ email: 'adm.d@example.test', role: 'ADMIN' })
    await db().prisma.session.create({ data: { token: 'expired', userId: admin.id, expiresAt: new Date(Date.now() - 1000) } })
    for (const cookie of ['bf_session=expired', 'bf_session=forged-token']) {
      const r = await call('POST', '/api/admin/users', { cookie, body: { email: 'y.d@example.test' } })
      expect(r.status).toBe(401)
    }
  })

  it('D.1.3 administrateur autorisé → 200', async () => {
    const admin = await createUser({ email: 'adm2.d@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    const r = await call('POST', '/api/admin/users', { cookie, body: { email: 'z.d@example.test', name: 'Z D' } })
    expect(r.status).toBe(200)
  })

  it('D.1.4 un admin ne peut pas retirer son propre rôle', async () => {
    const admin = await createUser({ email: 'adm3.d@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    const r = await call('PATCH', `/api/admin/users/${admin.id}`, { cookie, body: { role: 'STUDENT' } })
    expect(r.status).toBe(400)
  })
})

describe('D.2 — protections contre les tentatives répétées', () => {
  beforeEach(() => resetEnv())

  it('D.2.1 connexion : blocage 429 après 10 essais depuis une même IP', async () => {
    await createUser({ email: 'brute.d@example.test', password: 'Vrai-Secret-2026' })
    const ip = '192.0.2.10'
    const statuses: number[] = []
    for (let i = 0; i < 11; i++) {
      statuses.push((await call('POST', '/api/auth/login', { ip, csrf: true, body: { email: 'brute.d@example.test', password: `faux-${i}` } })).status)
    }
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true)
    expect(statuses[10]).toBe(429)
  })

  it('D.2.2 connexion : rotation de X-Forwarded-For ne contourne pas la limite par compte', async () => {
    await createUser({ email: 'rotate.d@example.test', password: 'Vrai-Secret-2026' })
    const statuses: number[] = []
    for (let i = 0; i < 12; i++) {
      statuses.push((await call('POST', '/api/auth/login', { csrf: true, body: { email: 'rotate.d@example.test', password: `faux-${i}` } })).status)
    }
    expect(statuses).toContain(429)
  })

  it('D.2.3 mot de passe oublié : limite par IP et par adresse ciblée', async () => {
    const ip = '192.0.2.20'
    const s1: number[] = []
    for (let i = 0; i < 6; i++) s1.push((await call('POST', '/api/auth/forgot-password', { ip, body: { email: `n${i}.d@example.test` } })).status)
    expect(s1[5]).toBe(429)
    const s2: number[] = []
    for (let i = 0; i < 6; i++) s2.push((await call('POST', '/api/auth/forgot-password', { body: { email: 'cible.d@example.test' } })).status)
    expect(s2).toContain(429)
  })

  it('D.2.4 réinitialisation : limite par IP', async () => {
    const ip = '192.0.2.30'
    const s: number[] = []
    for (let i = 0; i < 11; i++) s.push((await call('POST', '/api/auth/reset-password', { ip, body: { token: 'x'.repeat(64), password: 'Teranga-Lac-Rose-91' } })).status)
    expect(s[10]).toBe(429)
  })

  it('D.2.5 inscription : limite par IP', async () => {
    const ip = '192.0.2.40'
    const s: number[] = []
    for (let i = 0; i < 11; i++) {
      s.push((await call('POST', '/api/auth/register', { ip, body: { firstName: 'a', lastName: 'b', email: `r${i}.d@example.test`, phone: '771234567', password: 'Teranga-Lac-Rose-91', acceptTerms: true } })).status)
    }
    expect(s[10]).toBe(429)
  })
})

describe('D.3 — cas limites et non-régression', () => {
  beforeEach(() => resetEnv())

  it('D.3.1 connexion légitime OK, mauvais mot de passe et compte inconnu → même 401', async () => {
    await createUser({ email: 'login.d@example.test', password: 'Vrai-Secret-2026' })
    const ok = await call('POST', '/api/auth/login', { csrf: true, body: { email: 'login.d@example.test', password: 'Vrai-Secret-2026' } })
    expect(ok.status).toBe(200)
    expect(ok.setCookie.some((c) => c.startsWith('bf_session='))).toBe(true)
    const bad = await call('POST', '/api/auth/login', { csrf: true, body: { email: 'login.d@example.test', password: 'faux' } })
    const unk = await call('POST', '/api/auth/login', { csrf: true, body: { email: 'nobody.d@example.test', password: 'faux' } })
    expect(bad.status).toBe(401)
    expect(unk.status).toBe(401)
    expect(bad.body.statusMessage).toBe(unk.body.statusMessage)
  })

  it('D.3.2 connexion insensible à la casse de l’email', async () => {
    await createUser({ email: 'case.d@example.test', password: 'Vrai-Secret-2026' })
    const ok = await call('POST', '/api/auth/login', { csrf: true, body: { email: 'CASE.d@Example.test', password: 'Vrai-Secret-2026' } })
    expect(ok.status).toBe(200)
  })

  it('D.3.3 connexion sans CSRF → 403', async () => {
    await createUser({ email: 'csrf.d@example.test', password: 'Vrai-Secret-2026' })
    const r = await call('POST', '/api/auth/login', { body: { email: 'csrf.d@example.test', password: 'Vrai-Secret-2026' } })
    expect(r.status).toBe(403)
  })

  it('D.3.4 vérification d’email : jeton manquant/invalide/rejoué refusé', async () => {
    expect((await call('GET', '/api/auth/verify-email')).status).toBe(400)
    expect((await call('GET', '/api/auth/verify-email?token=inconnu')).status).toBeGreaterThanOrEqual(400)
  })

  it('D.3.5 reset-password : corps malformé / types invalides → 400', async () => {
    for (const opts of [{ rawBody: '{oops' }, { body: { token: 123, password: 'Teranga-Lac-Rose-91' } }, { body: {} }]) {
      expect((await call('POST', '/api/auth/reset-password', opts as any)).status).toBe(400)
    }
  })

  it('D.3.6 consultation des bourses : bourse inexistante → 404', async () => {
    expect((await call('GET', '/api/bourses/inexistante')).status).toBe(404)
  })
})
