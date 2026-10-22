/**
 * V3 — Énumération de comptes via « mot de passe oublié » (champ `emailSent`).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnv, db, call, createUser, sentEmails, flush, setEmailFailure } from '../helpers/server'

function publicShape(r: { status: number; body: any; setCookie: string[] }) {
  return {
    status: r.status,
    body: r.body,
    keys: Object.keys(r.body ?? {}).sort(),
    // Le cookie CSRF n'est pas posé par ce handler : aucune différence ne doit apparaître.
    cookies: r.setCookie.map((c) => c.split('=')[0]).sort(),
  }
}

describe('V3 — mot de passe oublié : réponses indistinguables', () => {
  beforeEach(() => resetEnv())

  it('V3.1 compte existant vs inexistant : statut, corps, champs et cookies identiques', async () => {
    await createUser({ email: 'existe.v3@example.test' })
    const a = await call('POST', '/api/auth/forgot-password', { body: { email: 'existe.v3@example.test' } })
    const b = await call('POST', '/api/auth/forgot-password', { body: { email: 'inconnu.v3@example.test' } })
    expect(publicShape(a)).toEqual(publicShape(b))
    expect(a.status).toBe(200)
    expect(a.body).not.toHaveProperty('emailSent')
  })

  it('V3.2 indistinguable même si l’envoi d’email échoue pour le compte existant', async () => {
    await createUser({ email: 'existe2.v3@example.test' })
    setEmailFailure(true)
    const a = await call('POST', '/api/auth/forgot-password', { body: { email: 'existe2.v3@example.test' } })
    const b = await call('POST', '/api/auth/forgot-password', { body: { email: 'inconnu2.v3@example.test' } })
    expect(publicShape(a)).toEqual(publicShape(b))
  })

  it('V3.3 variantes de casse/espaces : même réponse, et le compte légitime reçoit le lien', async () => {
    await createUser({ email: 'casse.v3@example.test' })
    const a = await call('POST', '/api/auth/forgot-password', { body: { email: '  CASSE.v3@Example.test ' } })
    const b = await call('POST', '/api/auth/forgot-password', { body: { email: 'personne.v3@example.test' } })
    expect(publicShape(a)).toEqual(publicShape(b))
    await flush()
    expect(sentEmails().filter((m) => m.to.email === 'casse.v3@example.test')).toHaveLength(1)
    expect(sentEmails().filter((m) => m.to.email === 'personne.v3@example.test')).toHaveLength(0)
  })

  it('V3.4 entrée invalide : 400 identique, indépendamment de l’existence', async () => {
    const r1 = await call('POST', '/api/auth/forgot-password', { body: { email: 'pas-un-email' } })
    const r2 = await call('POST', '/api/auth/forgot-password', { body: {} })
    const r3 = await call('POST', '/api/auth/forgot-password', { rawBody: '{malformed' })
    for (const r of [r1, r2, r3]) expect(r.status).toBe(400)
  })

  it('V3.5 le lien de réinitialisation fonctionne pour l’utilisateur légitime (non-régression)', async () => {
    await createUser({ email: 'legit.v3@example.test', password: 'Ancien-Secret-12' })
    await call('POST', '/api/auth/forgot-password', { body: { email: 'legit.v3@example.test' } })
    await flush()
    const mail = sentEmails().find((m) => m.to.email === 'legit.v3@example.test')!
    const token = mail.html.match(/token=([a-zA-Z0-9_-]+)/)![1]
    const r = await call('POST', '/api/auth/reset-password', { body: { token, password: 'Nouveau-Secret-34' } })
    expect(r.status).toBe(200)
    const login = await call('POST', '/api/auth/login', { csrf: true, body: { email: 'legit.v3@example.test', password: 'Nouveau-Secret-34' } })
    expect(login.status).toBe(200)
    const u = db().users.find((x) => x.email === 'legit.v3@example.test')!
    expect(u.resetPasswordToken).toBeNull()
  })
})
