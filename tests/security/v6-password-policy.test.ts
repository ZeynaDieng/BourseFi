/**
 * V6 — Politique de mot de passe.
 * Étudiants : 4 à 128 caractères, rien d'autre (inscription simple ; la connexion est limitée en tentatives).
 * Équipe (admin, partenaire) : 10–128 caractères, au moins une lettre et un chiffre ou symbole,
 * pas de mot de passe courant/interdit, pas l’email.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { resetEnv, db, call, createUser, sessionCookieFor, sentEmails, tokenFromEmail, flush } from '../helpers/server'

const TOO_SHORT = ['', 'a', 'abc']
const STAFF_WEAK = ['1234', 'azerty12', 'password123', 'BourseFi2026!', 'motdepasse1', '0123456789', 'aaaaaaaaaaaa']
const STRONG = 'Teranga-Lac-Rose-91'

function reg(email: string, password: string) {
  return { firstName: 'Ami', lastName: 'Gaye', email, phone: '771112233', password, acceptTerms: true }
}

describe('V6 — politique de mot de passe côté serveur', () => {
  beforeEach(() => resetEnv())

  it('V6.1 inscription : moins de 4 caractères refusé (400), aucun compte créé', async () => {
    for (const [i, pw] of TOO_SHORT.entries()) {
      const r = await call('POST', '/api/auth/register', { csrf: true, body: reg(`court${i}.v6@example.test`, pw) })
      expect(r.status, pw).toBe(400)
    }
    expect(db().users).toHaveLength(0)
  })

  it('V6.2 inscription : trop long refusé', async () => {
    const r = await call('POST', '/api/auth/register', { csrf: true, body: reg('long.v6@example.test', 'Aa1-' + 'x'.repeat(130)) })
    expect(r.status).toBe(400)
  })

  it('V6.3 inscription : 4 caractères suffisent', async () => {
    const r = await call('POST', '/api/auth/register', { csrf: true, body: reg('ok.v6@example.test', '1234') })
    expect(r.status).toBe(200)
    expect(db().users.find((u) => u.email === 'ok.v6@example.test')).toBeTruthy()
  })

  it('V6.4 réinitialisation étudiant : trop court refusé (jeton conservé), 4 caractères acceptés', async () => {
    await createUser({ email: 'reset.v6@example.test', password: 'Ancien-Secret-88' })
    await call('POST', '/api/auth/forgot-password', { body: { email: 'reset.v6@example.test' } })
    await flush()
    const token = tokenFromEmail(sentEmails()[0])!
    for (const pw of TOO_SHORT) {
      const r = await call('POST', '/api/auth/reset-password', { body: { token, password: pw } })
      expect(r.status, pw).toBe(400)
    }
    const ok = await call('POST', '/api/auth/reset-password', { body: { token, password: 'awa1' } })
    expect(ok.status).toBe(200)
  })

  it('V6.5 réinitialisation d’un compte de l’équipe : règle renforcée', async () => {
    await createUser({ email: 'partner.v6@example.test', role: 'PARTNER', password: 'Ancien-Secret-88' })
    await call('POST', '/api/auth/forgot-password', { body: { email: 'partner.v6@example.test' } })
    await flush()
    const token = tokenFromEmail(sentEmails()[0])!
    for (const pw of STAFF_WEAK) {
      const r = await call('POST', '/api/auth/reset-password', { body: { token, password: pw } })
      expect(r.status, pw).toBe(400)
    }
    const ok = await call('POST', '/api/auth/reset-password', { body: { token, password: STRONG } })
    expect(ok.status).toBe(200)
  })

  it('V6.6 modification par un admin (newPassword) : étudiant 4 caractères, admin règle renforcée', async () => {
    const admin = await createUser({ email: 'admin2.v6@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    const target = await createUser({ email: 'cible.v6@example.test', password: 'Cible-Secret-321' })
    const short = await call('PATCH', `/api/admin/users/${target.id}`, { cookie, body: { newPassword: 'abc' } })
    expect(short.status).toBe(400)
    expect(await bcrypt.compare('Cible-Secret-321', db().users.find((x) => x.id === target.id)!.passwordHash)).toBe(true)
    const ok = await call('PATCH', `/api/admin/users/${target.id}`, { cookie, body: { newPassword: '1234' } })
    expect(ok.status).toBe(200)
    expect(await bcrypt.compare('1234', db().users.find((x) => x.id === target.id)!.passwordHash)).toBe(true)

    // Promotion en admin avec un mot de passe faible : refusée
    const promote = await call('PATCH', `/api/admin/users/${target.id}`, { cookie, body: { role: 'ADMIN', newPassword: '5678' } })
    expect(promote.status).toBe(400)
  })

  it('V6.7 types inattendus refusés (nombre, tableau, objet)', async () => {
    for (const pw of [12345678901, ['Teranga-Lac-Rose-91'], { a: 1 }, null]) {
      const r = await call('POST', '/api/auth/register', { csrf: true, body: reg('type.v6@example.test', pw as any) })
      expect(r.status).toBe(400)
    }
  })
})
