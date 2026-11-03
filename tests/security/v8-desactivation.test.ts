/**
 * V8 — Désactivation d'un compte depuis le backoffice : connexion refusée, sessions révoquées,
 * aucun lien de réinitialisation ; réservé aux admins, jamais sur soi-même ni le dernier admin.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnv, db, call, createUser, sessionCookieFor, sentEmails } from '../helpers/server'

const PASS = 'Initial-Pass-2026'
const login = (email: string) => call('POST', '/api/auth/login', { csrf: true, body: { email, password: PASS } })
const statut = (cookie: string, id: string, body: Record<string, unknown>) =>
  call('POST', `/api/admin/users/${id}/statut`, { cookie, body })

describe('V8 — désactivation de compte', () => {
  let adminCookie: string
  let admin: any
  beforeEach(async () => {
    resetEnv()
    admin = await createUser({ email: 'admin.v8@example.test', role: 'ADMIN' })
    adminCookie = await sessionCookieFor(admin.id)
  })

  it('V8.1 désactivé : sessions révoquées immédiatement, connexion refusée', async () => {
    const student = await createUser({ email: 'etu.v8@example.test' })
    const studentCookie = await sessionCookieFor(student.id)
    expect((await call('GET', '/api/auth/me', { cookie: studentCookie })).body.user).not.toBeNull()

    const r = await statut(adminCookie, student.id, { active: false, reason: 'Fraude au code promo' })
    expect(r.status).toBe(200)
    expect(db().users.find((u) => u.id === student.id)!.deactivationReason).toBe('Fraude au code promo')

    expect((await call('GET', '/api/auth/me', { cookie: studentCookie })).body.user).toBeNull()
    const l = await login('etu.v8@example.test')
    expect(l.status).toBe(403)
    expect(l.setCookie.some((c) => c.startsWith('bf_session='))).toBe(false)
  })

  it('V8.2 une session restée en base est ignorée et supprimée', async () => {
    const student = await createUser({ email: 'vieille.v8@example.test' })
    await statut(adminCookie, student.id, { active: false })
    const cookie = await sessionCookieFor(student.id) // ex. session créée juste avant la désactivation
    expect((await call('GET', '/api/auth/me', { cookie })).body.user).toBeNull()
    expect(db().sessions.filter((s) => s.userId === student.id)).toHaveLength(0)
  })

  it('V8.3 mauvais mot de passe : même réponse qu’un compte actif (rien n’est révélé)', async () => {
    const student = await createUser({ email: 'secret.v8@example.test' })
    await statut(adminCookie, student.id, { active: false })
    const r = await call('POST', '/api/auth/login', { csrf: true, body: { email: 'secret.v8@example.test', password: 'Mauvais-Pass-2026' } })
    expect(r.status).toBe(401)
  })

  it('V8.4 mot de passe oublié : aucun lien envoyé à un compte désactivé', async () => {
    const student = await createUser({ email: 'oubli.v8@example.test' })
    await statut(adminCookie, student.id, { active: false })
    const r = await call('POST', '/api/auth/forgot-password', { body: { email: 'oubli.v8@example.test' } })
    expect(r.status).toBe(200)
    await new Promise((res) => setTimeout(res, 20))
    expect(sentEmails().filter((m) => m.to.email === 'oubli.v8@example.test')).toHaveLength(0)
  })

  it('V8.5 réactivation : la connexion refonctionne', async () => {
    const student = await createUser({ email: 'retour.v8@example.test' })
    await statut(adminCookie, student.id, { active: false })
    expect((await statut(adminCookie, student.id, { active: true })).status).toBe(200)
    const u = db().users.find((x) => x.id === student.id)!
    expect(u.deactivatedAt).toBeNull()
    expect((await login('retour.v8@example.test')).status).toBe(200)
  })

  it('V8.6 garde-fous : pas sur soi-même, pas le dernier admin, réservé aux admins', async () => {
    expect((await statut(adminCookie, admin.id, { active: false })).status).toBe(400)

    const student = await createUser({ email: 'pirate.v8@example.test' })
    const studentCookie = await sessionCookieFor(student.id)
    expect((await statut(studentCookie, admin.id, { active: false })).status).toBe(403)

    const admin2 = await createUser({ email: 'admin2.v8@example.test', role: 'ADMIN' })
    const admin2Cookie = await sessionCookieFor(admin2.id)
    expect((await statut(adminCookie, admin2.id, { active: false })).status).toBe(200)
    // admin2 désactivé : il ne reste qu'un admin actif, qui ne peut pas être désactivé
    const admin3 = await createUser({ email: 'admin3.v8@example.test', role: 'ADMIN' })
    const admin3Cookie = await sessionCookieFor(admin3.id)
    expect((await statut(admin3Cookie, admin.id, { active: false })).status).toBe(200)
    expect((await statut(admin2Cookie, admin3.id, { active: false })).status).toBe(401) // admin2 déconnecté
  })
})
