/**
 * V10 — Connexion sans mot de passe (code par email) et envoi de l'attestation par WhatsApp :
 * réservés aux étudiants, codes à usage unique et essais limités, aucune information sur l'existence du compte.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnv, db, call, createUser, sentEmails, sessionCookieFor } from '../helpers/server'

const codeFrom = (email: string) => {
  const mail = sentEmails().filter((m) => m.to.email === email).at(-1)
  return mail?.html.match(/letter-spacing:8px[^>]*>(\d{6})</)?.[1] ?? null
}
const ask = (email: string) => call('POST', '/api/auth/connexion-code', { body: { email } })
const verify = (email: string, code: string, csrf = true) =>
  call('POST', '/api/auth/connexion-code-verifier', { csrf, body: { email, code } })

describe('V10 — connexion par code', () => {
  beforeEach(() => resetEnv())

  it('V10.1 bon code : session ouverte, code effacé, usage unique, code absent de l’objet', async () => {
    const u = await createUser({ email: 'awa.v10@example.test', emailVerified: false })
    expect((await ask('awa.v10@example.test')).status).toBe(200)
    const code = codeFrom('awa.v10@example.test')
    expect(code).toMatch(/^\d{6}$/)
    expect(sentEmails().at(-1)!.subject).not.toContain(code)
    const row = db().users.find((x) => x.id === u.id)!
    expect(row.loginCodeHash).not.toContain(code)

    const r = await verify('awa.v10@example.test', code!)
    expect(r.status).toBe(200)
    expect(r.body.user.role).toBe('STUDENT')
    expect(r.setCookie.some((c) => c.startsWith('bf_session='))).toBe(true)
    expect(row.loginCodeHash).toBeNull()
    expect(row.emailVerified).toBe(true)
    expect((await verify('awa.v10@example.test', code!)).status).toBe(400)
  })

  it('V10.2 réponse identique pour un compte inconnu, un admin ou un compte désactivé ; aucun code envoyé', async () => {
    await createUser({ email: 'admin.v10@example.test', role: 'ADMIN' })
    const off = await createUser({ email: 'off.v10@example.test' })
    db().users.find((x) => x.id === off.id)!.deactivatedAt = new Date()
    const bodies = []
    for (const e of ['inconnu.v10@example.test', 'admin.v10@example.test', 'off.v10@example.test']) {
      const r = await ask(e)
      expect(r.status).toBe(200)
      bodies.push(JSON.stringify(r.body))
    }
    expect(new Set(bodies).size).toBe(1)
    expect(sentEmails()).toHaveLength(0)
  })

  it('V10.3 5 mauvais codes : code détruit, même le bon est refusé', async () => {
    await createUser({ email: 'brute.v10@example.test' })
    await ask('brute.v10@example.test')
    const good = codeFrom('brute.v10@example.test')!
    const wrong = good === '000000' ? '111111' : '000000'
    for (let i = 0; i < 5; i++) expect((await verify('brute.v10@example.test', wrong)).status).toBe(400)
    expect((await verify('brute.v10@example.test', good)).status).toBe(400)
    expect(db().sessions).toHaveLength(0)
  })

  it('V10.4 sans CSRF refusé ; code expiré refusé', async () => {
    const u = await createUser({ email: 'exp.v10@example.test' })
    await ask('exp.v10@example.test')
    const code = codeFrom('exp.v10@example.test')!
    expect((await verify('exp.v10@example.test', code, false)).status).toBe(403)
    db().users.find((x) => x.id === u.id)!.loginCodeExpires = new Date(Date.now() - 1000)
    expect((await verify('exp.v10@example.test', code)).status).toBe(400)
  })
})

describe('V10 bis — attestation envoyée par WhatsApp', () => {
  let adminCookie: string
  beforeEach(async () => {
    resetEnv()
    const admin = await createUser({ email: 'admin.v10b@example.test', role: 'ADMIN' })
    adminCookie = await sessionCookieFor(admin.id)
  })

  async function dossier(status: string) {
    const user = await createUser({ email: 'etu.v10b@example.test' })
    const cand = await db().prisma.candidature.create({
      data: { userId: user.id, firstName: 'Awa', fullName: 'Awa Ndiaye', targetProgram: 'Licence Marketing', phone: '771234567' },
    })
    await db().prisma.paiement.create({ data: { candidatureId: cand.id, status } })
    return { user, cand }
  }

  it('V10.6 dossier payé : lien WhatsApp avec un lien de reconnexion qui fonctionne', async () => {
    const { cand, user } = await dossier('Valide')
    const r = await call('POST', `/api/admin/candidatures/${cand.id}/attestation-whatsapp`, { cookie: adminCookie })
    expect(r.status).toBe(200)
    expect(r.body.whatsappUrl).toMatch(/^https:\/\/wa\.me\/221771234567\?text=/)
    const text = decodeURIComponent(r.body.whatsappUrl.split('text=')[1])
    const token = text.match(/[?&]k=([A-Za-z0-9_-]+)/)?.[1]
    expect(token).toBeTruthy()
    expect(db().candidatureNotes).toHaveLength(1)

    const login = await call('POST', '/api/auth/lien-connexion', { csrf: true, body: { token } })
    expect(login.status).toBe(200)
    expect(db().sessions.some((s) => s.userId === user.id)).toBe(true)
  })

  it('V10.7 refusé si non payé, ou si l’appelant n’est pas admin', async () => {
    const { cand, user } = await dossier('EN_ATTENTE')
    expect((await call('POST', `/api/admin/candidatures/${cand.id}/attestation-whatsapp`, { cookie: adminCookie })).status).toBe(409)
    const studentCookie = await sessionCookieFor(user.id)
    expect((await call('POST', `/api/admin/candidatures/${cand.id}/attestation-whatsapp`, { cookie: studentCookie })).status).toBe(403)
    expect(db().loginLinks).toHaveLength(0)
  })
})
