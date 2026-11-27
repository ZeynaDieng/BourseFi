/**
 * V11 — Modification d'un dossier (et donc de l'attestation) par un admin, y compris après paiement.
 * Régression : avec Zod 4, les champs absents du formulaire faisaient refuser tout l'enregistrement.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnv, db, call, createUser, sessionCookieFor } from '../helpers/server'

describe('V11 — modification du dossier par l’admin', () => {
  let adminCookie: string
  let candId: string
  beforeEach(async () => {
    resetEnv()
    const admin = await createUser({ email: 'admin.v11@example.test', role: 'ADMIN' })
    adminCookie = await sessionCookieFor(admin.id)
    const student = await createUser({ email: 'awa.v11@example.test' })
    const cand = await db().prisma.candidature.create({
      data: { userId: student.id, firstName: 'Awa', lastName: 'Faute', fullName: 'Awa Faute', email: 'awa.v11@example.test', status: 'DOCUMENT_EMIS' },
    })
    await db().prisma.paiement.create({ data: { candidatureId: cand.id, status: 'Valide' } })
    candId = cand.id
  })

  it('V11.1 seulement quelques champs envoyés (les autres absents) : enregistré, nom complet recalculé', async () => {
    const r = await call('PATCH', `/api/admin/candidatures/${candId}`, {
      cookie: adminCookie,
      body: { firstName: 'Awa', lastName: 'Corrigée', email: 'awa.v11@example.test', sendNotificationEmail: false },
    })
    expect(r.status).toBe(200)
    const c = db().candidatures.find((x) => x.id === candId)!
    expect(c.fullName).toBe('Awa Corrigée')
    expect(c.status).toBe('DOCUMENT_EMIS') // dossier payé : toujours modifiable, statut inchangé
  })

  it('V11.2 email invalide refusé ; réservé aux admins', async () => {
    const bad = await call('PATCH', `/api/admin/candidatures/${candId}`, { cookie: adminCookie, body: { email: 'pas-un-email' } })
    expect(bad.status).toBe(400)
    const student = db().users.find((u) => u.email === 'awa.v11@example.test')!
    const forbidden = await call('PATCH', `/api/admin/candidatures/${candId}`, { cookie: await sessionCookieFor(student.id), body: { lastName: 'Pirate' } })
    expect(forbidden.status).toBe(403)
    expect(db().candidatures.find((x) => x.id === candId)!.lastName).toBe('Faute')
  })

  it('V11.3 la modalité est enregistrée sur ce dossier seulement, jamais sur la formation', async () => {
    const r = await call('PATCH', `/api/admin/candidatures/${candId}`, {
      cookie: adminCookie,
      body: { modalite: 'Cours du soir', sendNotificationEmail: false },
    })
    expect(r.status).toBe(200)
    expect(db().candidatures.find((x) => x.id === candId)!.modalite).toBe('Cours du soir')
    expect(db().calls.some((c) => c.model === 'programme' && c.method === 'update')).toBe(false)
  })
})
