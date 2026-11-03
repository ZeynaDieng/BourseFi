/**
 * Brouillon de candidature : la bourse choisie à l'inscription est retenue, l'étudiant y est ramené
 * (réponse de l'inscription, email de bienvenue), et sa saisie est conservée côté serveur.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnv, db, call, createUser, sessionCookieFor, sentEmails } from '../helpers/server'

const SLUG = 'bourse-ifaa-licence'

function addBourse(isActive = true) {
  db().bourses.push({ id: 'b1', slug: SLUG, isActive, programmeId: 'p1', programme: { titre: 'Licence Comptabilité' } })
}

function registerPayload(email: string, extra: Record<string, unknown> = {}) {
  return { firstName: 'Awa', lastName: 'Ndiaye', email, phone: '771234567', password: 'Baobab-Soleil-2026', acceptTerms: true, ...extra }
}

describe('Brouillon de candidature', () => {
  beforeEach(() => resetEnv())

  it('inscription depuis une bourse : brouillon créé, retour au formulaire', async () => {
    addBourse()
    const r = await call('POST', '/api/auth/register', { csrf: true, body: registerPayload('awa.b@example.test', { bourseSlug: SLUG }) })
    expect(r.status).toBe(200)
    expect(r.body.resumeUrl).toBe(`/postuler/${SLUG}`)
    const u = db().users.find((x) => x.email === 'awa.b@example.test')!
    expect(u.applicationDraft).toMatchObject({ bourseSlug: SLUG, fields: { phone: '771234567' } })
    // L'email de bienvenue ramène à la candidature
    expect(sentEmails().at(-1)!.html).toContain(`/postuler/${SLUG}`)
  })

  it('inscription sans bourse (ou bourse inconnue) : pas de brouillon', async () => {
    const r = await call('POST', '/api/auth/register', { csrf: true, body: registerPayload('sans.b@example.test', { bourseSlug: 'inconnue' }) })
    expect(r.body.resumeUrl).toBeNull()
    const u = db().users.find((x) => x.email === 'sans.b@example.test')!
    expect(u.applicationDraft ?? null).toBeNull()
  })

  it('email déjà utilisé : le compte existant n’est pas modifié', async () => {
    addBourse()
    await createUser({ email: 'deja.b@example.test' })
    await call('POST', '/api/auth/register', { csrf: true, body: registerPayload('deja.b@example.test', { bourseSlug: SLUG }) })
    expect(db().users.find((x) => x.email === 'deja.b@example.test')!.applicationDraft ?? null).toBeNull()
  })

  it('la saisie est enregistrée puis relue par l’étudiant', async () => {
    addBourse()
    const user = await createUser({ email: 'saisie.b@example.test' })
    const cookie = await sessionCookieFor(user.id)
    const fields = { phone: '770000000', address: 'Dakar, Médina', lastEducationLevel: 'Terminale', lastDiploma: 'BAC', graduationDate: '2026' }
    const put = await call('PUT', '/api/candidatures/brouillon', { cookie, body: { bourseSlug: SLUG, fields } })
    expect(put.status).toBe(200)
    const get = await call('GET', '/api/candidatures/brouillon', { cookie })
    expect(get.body.draft).toMatchObject({ bourseSlug: SLUG, fields })
  })

  it('refuse un visiteur non connecté et une bourse désactivée', async () => {
    addBourse(false)
    expect((await call('PUT', '/api/candidatures/brouillon', { body: { bourseSlug: SLUG } })).status).toBe(401)
    const user = await createUser({ email: 'ferme.b@example.test' })
    const cookie = await sessionCookieFor(user.id)
    expect((await call('PUT', '/api/candidatures/brouillon', { cookie, body: { bourseSlug: SLUG } })).status).toBe(404)
  })
})
