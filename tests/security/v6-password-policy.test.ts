/**
 * V6 — Politique de mot de passe (4 caractères minimum, aucune liste d’exclusion).
 * Règles attendues, identiques partout : 10–128 caractères, au moins une lettre et
 * un chiffre ou symbole, pas de mot de passe courant/interdit, pas l’email.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { resetEnv, db, call, createUser, sessionCookieFor, sentEmails, tokenFromEmail, flush } from '../helpers/server'

const WEAK = ['1234', 'abc', 'azerty12', 'password123', 'BourseFi2026!', 'motdepasse1', '0123456789', 'aaaaaaaaaaaa']
const STRONG = 'Teranga-Lac-Rose-91'

function reg(email: string, password: string) {
  return { firstName: 'Ami', lastName: 'Gaye', email, phone: '771112233', password, acceptTerms: true }
}

describe('V6 — politique de mot de passe côté serveur', () => {
  beforeEach(() => resetEnv())

  it('V6.1 inscription : mots de passe faibles/interdits refusés (400), aucun compte créé', async () => {
    for (const [i, pw] of WEAK.entries()) {
      const r = await call('POST', '/api/auth/register', { body: reg(`weak${i}.v6@example.test`, pw) })
      expect(r.status, pw).toBe(400)
    }
    expect(db().users).toHaveLength(0)
  })

  it('V6.2 inscription : mot de passe contenant l’email refusé ; trop long refusé', async () => {
    const r1 = await call('POST', '/api/auth/register', { body: reg('mamadou.v6@example.test', 'mamadou.v6-2026') })
    expect(r1.status).toBe(400)
    const r2 = await call('POST', '/api/auth/register', { body: reg('long.v6@example.test', 'Aa1-' + 'x'.repeat(130)) })
    expect(r2.status).toBe(400)
  })

  it('V6.3 inscription : mot de passe conforme accepté', async () => {
    const r = await call('POST', '/api/auth/register', { body: reg('ok.v6@example.test', STRONG) })
    expect(r.status).toBe(200)
    expect(db().users.find((u) => u.email === 'ok.v6@example.test')).toBeTruthy()
  })

  it('V6.4 réinitialisation : faible refusé (jeton conservé), conforme accepté', async () => {
    await createUser({ email: 'reset.v6@example.test', password: 'Ancien-Secret-88' })
    await call('POST', '/api/auth/forgot-password', { body: { email: 'reset.v6@example.test' } })
    await flush()
    const token = tokenFromEmail(sentEmails()[0])!
    for (const pw of WEAK) {
      const r = await call('POST', '/api/auth/reset-password', { body: { token, password: pw } })
      expect(r.status, pw).toBe(400)
    }
    const ok = await call('POST', '/api/auth/reset-password', { body: { token, password: STRONG } })
    expect(ok.status).toBe(200)
  })

  it('V6.5 activation (lien admin) : mêmes règles', async () => {
    const admin = await createUser({ email: 'admin.v6@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    const cand = await db().prisma.candidature.create({ data: { email: 'act.v6@example.test', userId: null } })
    await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    const token = tokenFromEmail(sentEmails().find((m) => m.to.email === 'act.v6@example.test'))!
    expect(token).toBeTruthy()
    const weak = await call('POST', '/api/auth/reset-password', { body: { token, password: '1234' } })
    expect(weak.status).toBe(400)
    const ok = await call('POST', '/api/auth/reset-password', { body: { token, password: STRONG } })
    expect(ok.status).toBe(200)
  })

  it('V6.6 modification par un admin (newPassword) : mêmes règles', async () => {
    const admin = await createUser({ email: 'admin2.v6@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    const target = await createUser({ email: 'cible.v6@example.test', password: 'Cible-Secret-321' })
    const weak = await call('PATCH', `/api/admin/users/${target.id}`, { cookie, body: { newPassword: '1234' } })
    expect(weak.status).toBe(400)
    const u = db().users.find((x) => x.id === target.id)!
    expect(await bcrypt.compare('Cible-Secret-321', u.passwordHash)).toBe(true)
    const ok = await call('PATCH', `/api/admin/users/${target.id}`, { cookie, body: { newPassword: STRONG } })
    expect(ok.status).toBe(200)
    expect(await bcrypt.compare(STRONG, db().users.find((x) => x.id === target.id)!.passwordHash)).toBe(true)
  })

  it('V6.7 types inattendus refusés (nombre, tableau, objet)', async () => {
    for (const pw of [12345678901, ['Teranga-Lac-Rose-91'], { a: 1 }, null]) {
      const r = await call('POST', '/api/auth/register', { body: reg('type.v6@example.test', pw as any) })
      expect(r.status).toBe(400)
    }
  })
})
