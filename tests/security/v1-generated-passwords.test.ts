/**
 * V1 — Mots de passe générés prévisibles (`BourseFi${1000..9999}!`).
 * Attendu : plus aucun mot de passe généré/communiqué ; activation par jeton
 * aléatoire, haché en base, expirant, à usage unique et lié à un seul compte.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { createHash } from 'node:crypto'
import {
  resetEnv, db, call, createUser, sessionCookieFor, sentEmails, tokenFromEmail,
} from '../helpers/server'

const STRONG = 'Cheval-Lune-2026'

async function setupAdminAndCandidature(email = 'candidat.v1@example.test') {
  const admin = await createUser({ email: 'admin.v1@example.test', role: 'ADMIN' })
  const cookie = await sessionCookieFor(admin.id)
  const cand = await db().prisma.candidature.create({
    data: { email, firstName: 'Awa', lastName: 'Diop', fullName: 'Awa Diop', userId: null },
  })
  return { admin, cookie, cand }
}

describe('V1 — mots de passe générés / jetons d’activation', () => {
  beforeEach(() => resetEnv())
  afterEach(() => vi.restoreAllMocks())

  it('V1.1 activer-compte ne crée plus de mot de passe dérivé de Math.random (espace 9000 valeurs)', async () => {
    // Si le code utilise encore Math.random, le mot de passe devient déterministe : BourseFi1000!
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { cookie, cand } = await setupAdminAndCandidature()
    const res = await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    expect(res.status).toBe(200)
    const user = db().users.find((u) => u.email === 'candidat.v1@example.test')!
    expect(user).toBeTruthy()
    expect(await bcrypt.compare('BourseFi1000!', user.passwordHash)).toBe(false)
  })

  it('V1.2 aucune réponse admin ne renvoie de mot de passe en clair', async () => {
    const { cookie, cand } = await setupAdminAndCandidature()
    const r1 = await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    expect(r1.status).toBe(200)
    expect(r1.body).not.toHaveProperty('tempPassword')
    expect(r1.rawBody).not.toMatch(/BourseFi\d{4}!/)

    const r2 = await call('POST', '/api/admin/users', {
      cookie, body: { email: 'nouveau.v1@example.test', firstName: 'Moussa', lastName: 'Ba' },
    })
    expect(r2.status).toBe(200)
    expect(r2.body).not.toHaveProperty('generatedPassword')
    expect(r2.rawBody).not.toMatch(/BourseFi\d{4}!/)
  })

  it('V1.3 aucun email d’activation ne contient de mot de passe ; il contient un lien à jeton', async () => {
    const { cookie, cand } = await setupAdminAndCandidature()
    await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    const mail = sentEmails().find((m) => m.to.email === 'candidat.v1@example.test')
    expect(mail).toBeTruthy()
    expect(mail!.html).not.toMatch(/Mot de passe\s*:/i)
    expect(mail!.html).not.toMatch(/BourseFi\d{4}!/)
    const token = tokenFromEmail(mail)
    expect(token).toBeTruthy()
    expect(token!.length).toBeGreaterThanOrEqual(43) // >= 256 bits encodés
  })

  it('V1.4 le jeton est stocké haché (jamais en clair) et expire (≤ 72 h)', async () => {
    const { cookie, cand } = await setupAdminAndCandidature()
    await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    const token = tokenFromEmail(sentEmails()[0])!
    const user = db().users.find((u) => u.email === 'candidat.v1@example.test')!
    expect(user.resetPasswordToken).not.toBe(token)
    expect(user.resetPasswordToken).toBe(createHash('sha256').update(token).digest('hex'))
    const ttl = (user.resetPasswordExpires as Date).getTime() - Date.now()
    expect(ttl).toBeGreaterThan(0)
    expect(ttl).toBeLessThanOrEqual(72 * 3600_000 + 5000)
  })

  it('V1.5 deux activations produisent deux jetons différents (pas d’espace prévisible)', async () => {
    const { cookie } = await setupAdminAndCandidature()
    const c2 = await db().prisma.candidature.create({ data: { email: 'autre.v1@example.test', userId: null } })
    const c1 = db().candidatures[0]
    await call('POST', `/api/admin/candidatures/${c1.id}/activer-compte`, { cookie, body: {} })
    await call('POST', `/api/admin/candidatures/${c2.id}/activer-compte`, { cookie, body: {} })
    const [t1, t2] = sentEmails().map(tokenFromEmail)
    expect(t1).toBeTruthy()
    expect(t2).toBeTruthy()
    expect(t1).not.toBe(t2)
  })

  it('V1.6 le jeton permet de définir le mot de passe une seule fois', async () => {
    const { cookie, cand } = await setupAdminAndCandidature()
    await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    const token = tokenFromEmail(sentEmails()[0])!
    const ok = await call('POST', '/api/auth/reset-password', { body: { token, password: STRONG } })
    expect(ok.status).toBe(200)
    const user = db().users.find((u) => u.email === 'candidat.v1@example.test')!
    expect(await bcrypt.compare(STRONG, user.passwordHash)).toBe(true)

    const replay = await call('POST', '/api/auth/reset-password', { body: { token, password: 'Autre-Secret-9911' } })
    expect(replay.status).toBe(400)
    expect(await bcrypt.compare(STRONG, user.passwordHash)).toBe(true)
  })

  it('V1.7 un jeton expiré est refusé', async () => {
    const { cookie, cand } = await setupAdminAndCandidature()
    await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    const token = tokenFromEmail(sentEmails()[0])!
    const user = db().users.find((u) => u.email === 'candidat.v1@example.test')!
    user.resetPasswordExpires = new Date(Date.now() - 1000)
    const res = await call('POST', '/api/auth/reset-password', { body: { token, password: STRONG } })
    expect(res.status).toBe(400)
  })

  it('V1.8 le jeton d’un utilisateur A ne modifie jamais le compte B', async () => {
    const victim = await createUser({ email: 'victime.v1@example.test', password: 'Victime-Secret-77' })
    const victimHashBefore = victim.passwordHash
    const { cookie, cand } = await setupAdminAndCandidature()
    await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    const token = tokenFromEmail(sentEmails()[0])!
    // Tentatives de contournement : champs supplémentaires pour cibler un autre compte.
    const res = await call('POST', '/api/auth/reset-password', {
      body: { token, password: STRONG, email: 'victime.v1@example.test', userId: victim.id },
    })
    expect(res.status).toBe(200)
    const v = db().users.find((u) => u.id === victim.id)!
    expect(v.passwordHash).toBe(victimHashBefore)
    const a = db().users.find((u) => u.email === 'candidat.v1@example.test')!
    expect(await bcrypt.compare(STRONG, a.passwordHash)).toBe(true)
  })

  it('V1.9 un jeton forgé / tronqué / vide est refusé', async () => {
    const { cookie, cand } = await setupAdminAndCandidature()
    await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    const token = tokenFromEmail(sentEmails()[0])!
    const user = db().users.find((u) => u.email === 'candidat.v1@example.test')!
    for (const bad of [token.slice(0, -1), 'a'.repeat(64), user.resetPasswordToken, '', ' ']) {
      const r = await call('POST', '/api/auth/reset-password', { body: { token: bad, password: STRONG } })
      expect(r.status, `jeton ${String(bad).slice(0, 8)}…`).toBe(400)
    }
  })

  it('V1.10 activer un compte existant ne réinitialise pas son mot de passe actuel', async () => {
    const existing = await createUser({ email: 'existant.v1@example.test', password: 'Mon-Secret-Perso-42' })
    const { cookie } = await setupAdminAndCandidature()
    const cand = await db().prisma.candidature.create({ data: { email: 'existant.v1@example.test', userId: existing.id } })
    const res = await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, { cookie, body: {} })
    expect(res.status).toBe(200)
    const u = db().users.find((x) => x.id === existing.id)!
    expect(await bcrypt.compare('Mon-Secret-Perso-42', u.passwordHash)).toBe(true)
  })

  it('V1.11 creer-direct ne communique pas de mot de passe et envoie un lien d’activation', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const admin = await createUser({ email: 'admin2.v1@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    db().programmes.push({
      id: 'prog1', titre: 'Licence Info', niveau: 'Licence', devise: 'FCFA', fraisDossier: 20000,
      partnerId: 'p1', etablissement: { nom: 'École Test', isDirectPartner: false }, partner: {},
    })
    const res = await call('POST', '/api/admin/candidatures/creer-direct', {
      cookie, body: { firstName: 'Fatou', lastName: 'Sow', email: 'direct.v1@example.test', programmeId: 'prog1' },
    })
    expect(res.status).toBe(200)
    expect(res.body.tempPassword ?? null).toBeNull()
    const u = db().users.find((x) => x.email === 'direct.v1@example.test')!
    expect(await bcrypt.compare('BourseFi1000!', u.passwordHash)).toBe(false)
    const mail = sentEmails().find((m) => m.to.email === 'direct.v1@example.test')!
    expect(mail.html).not.toMatch(/Mot de passe\s*:/i)
    expect(tokenFromEmail(mail)).toBeTruthy()
  })
})
