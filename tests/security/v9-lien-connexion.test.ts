/**
 * V9 — Lien de reconnexion après paiement (retour PayTech ouvert dans un autre navigateur,
 * email de confirmation) : usage unique, seulement après validation du paiement,
 * seulement pour le compte étudiant propriétaire du dossier.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnv, db, call, createUser } from '../helpers/server'
import { createLoginLink } from '../../server/utils/login-link'

const useLink = (token: string, opts: { csrf?: boolean } = {}) =>
  call('POST', '/api/auth/lien-connexion', { csrf: opts.csrf ?? true, body: { token } })

async function setup(opts: { paid?: boolean; role?: 'STUDENT' | 'ADMIN' } = {}) {
  const user = await createUser({ email: 'etu.v9@example.test', role: opts.role })
  const cand = await db().prisma.candidature.create({ data: { userId: user.id, status: 'EN_ATTENTE_PAIEMENT' } })
  const paiement = await db().prisma.paiement.create({
    data: { candidatureId: cand.id, status: opts.paid === false ? 'EN_ATTENTE' : 'Valide' },
  })
  const token = await createLoginLink({ userId: user.id, candidatureId: cand.id, purpose: 'PAYMENT_RETURN' })
  return { user, cand, paiement, token }
}

describe('V9 — lien de reconnexion après paiement', () => {
  beforeEach(() => resetEnv())

  it('V9.1 paiement validé : session ouverte, redirection vers le paiement, hash seul stocké', async () => {
    const { user, cand, token } = await setup()
    expect(db().loginLinks[0].tokenHash).not.toBe(token)

    const r = await useLink(token)
    expect(r.status).toBe(200)
    expect(r.body.redirect).toBe(`/paiement?candidatureId=${cand.id}&status=success`)
    expect(r.setCookie.some((c) => c.startsWith('bf_session='))).toBe(true)
    expect(db().sessions.filter((s) => s.userId === user.id)).toHaveLength(1)
  })

  it('V9.2 usage unique', async () => {
    const { token } = await setup()
    expect((await useLink(token)).status).toBe(200)
    expect((await useLink(token)).status).toBe(400)
  })

  it('V9.3 paiement pas encore validé : « en attente », lien conservé, aucune session', async () => {
    const { paiement, token } = await setup({ paid: false })
    const r = await useLink(token)
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ pending: true })
    expect(db().sessions).toHaveLength(0)
    expect(db().loginLinks[0].usedAt).toBeNull()

    // L'IPN valide le paiement : le même lien fonctionne
    paiement.status = 'Valide'
    expect((await useLink(token)).status).toBe(200)
  })

  it('V9.4 lien expiré, inconnu ou remplacé : refusé', async () => {
    const { user, cand, token } = await setup()
    db().loginLinks[0].expiresAt = new Date(Date.now() - 1000)
    expect((await useLink(token)).status).toBe(400)
    expect((await useLink('x'.repeat(43))).status).toBe(400)

    // Un nouveau paiement lancé remplace l'ancien lien
    const first = await createLoginLink({ userId: user.id, candidatureId: cand.id, purpose: 'PAYMENT_RETURN' })
    const second = await createLoginLink({ userId: user.id, candidatureId: cand.id, purpose: 'PAYMENT_RETURN' })
    expect((await useLink(first)).status).toBe(400)
    expect((await useLink(second)).status).toBe(200)
    expect(db().sessions).toHaveLength(1)
  })

  it('V9.5 jamais pour un compte de l’équipe', async () => {
    const { token } = await setup({ role: 'ADMIN' })
    expect((await useLink(token)).status).toBe(400)
    expect(db().sessions).toHaveLength(0)
  })

  it('V9.6 compte désactivé : refusé', async () => {
    const { user, token } = await setup()
    db().users.find((u) => u.id === user.id)!.deactivatedAt = new Date()
    expect((await useLink(token)).status).toBe(403)
    expect(db().sessions).toHaveLength(0)
  })

  it('V9.7 sans jeton CSRF : refusé, lien conservé', async () => {
    const { token } = await setup()
    expect((await useLink(token, { csrf: false })).status).toBe(403)
    expect(db().loginLinks[0].usedAt).toBeNull()
  })
})
