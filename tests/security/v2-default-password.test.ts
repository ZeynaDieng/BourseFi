/**
 * V2 — Mot de passe par défaut `BourseFi2026!` prérempli dans le back-office et
 * accepté tel quel par le backend lors de la création directe de dossiers.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { resetEnv, db, call, createUser, sessionCookieFor, sentEmails, tokenFromEmail } from '../helpers/server'

const root = fileURLToPath(new URL('../../', import.meta.url))
const read = (p: string) => readFileSync(root + p, 'utf8')

function addProgramme() {
  db().programmes.push({
    id: 'prog-v2', titre: 'BTS Commerce', niveau: 'BTS', devise: 'FCFA', fraisDossier: 15000,
    partnerId: 'p1', etablissement: { nom: 'École V2', isDirectPartner: false }, partner: {},
  })
}

describe('V2 — mot de passe par défaut', () => {
  beforeEach(() => resetEnv())

  it('V2.1 aucun mot de passe fixe ni généré n’est présent dans le code frontend admin', () => {
    for (const file of ['app/pages/admin/candidatures.vue', 'app/pages/admin/users.vue']) {
      const src = read(file)
      expect(src, file).not.toMatch(/BourseFi20\d\d!/)
      expect(src, file).not.toMatch(/BourseFi\$\{Math\.floor/)
      expect(src, file).not.toMatch(/password:\s*'[^']+'/) // aucune valeur initiale non vide
    }
  })

  it('V2.2 aucun code serveur ne contient de mot de passe littéral par défaut', () => {
    const files = [
      'server/api/admin/candidatures/creer-direct.post.ts',
      'server/api/admin/candidatures/[id]/activer-compte.post.ts',
      'server/api/admin/users/index.post.ts',
    ]
    for (const f of files) {
      const src = read(f)
      expect(src, f).not.toMatch(/BourseFi(20\d\d|\$\{)/)
      expect(src, f).not.toMatch(/Math\.random\(\)[^\n]*(password|Password)/)
    }
  })

  it('V2.3 creer-direct ignore un mot de passe partagé imposé par le frontend', async () => {
    const admin = await createUser({ email: 'admin.v2@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    addProgramme()
    const res = await call('POST', '/api/admin/candidatures/creer-direct', {
      cookie,
      body: { firstName: 'Ibou', lastName: 'Ndiaye', email: 'ibou.v2@example.test', programmeId: 'prog-v2', password: 'BourseFi2026!' },
    })
    expect(res.status).toBe(200)
    const u = db().users.find((x) => x.email === 'ibou.v2@example.test')!
    expect(await bcrypt.compare('BourseFi2026!', u.passwordHash)).toBe(false)
    expect(res.rawBody).not.toContain('BourseFi2026!')
    expect(sentEmails().map((m) => m.html).join('\n')).not.toContain('BourseFi2026!')
  })

  it('V2.4 deux comptes créés le même jour n’ont pas de secret commun', async () => {
    const admin = await createUser({ email: 'admin2.v2@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    addProgramme()
    for (const e of ['a.v2@example.test', 'b.v2@example.test']) {
      const r = await call('POST', '/api/admin/candidatures/creer-direct', {
        cookie, body: { firstName: 'X', lastName: 'Y', email: e, programmeId: 'prog-v2', password: 'BourseFi2026!' },
      })
      expect(r.status).toBe(200)
    }
    const [t1, t2] = sentEmails().map(tokenFromEmail)
    expect(t1 && t2 && t1 !== t2).toBe(true)
    for (const e of ['a.v2@example.test', 'b.v2@example.test']) {
      const u = db().users.find((x) => x.email === e)!
      expect(await bcrypt.compare('BourseFi2026!', u.passwordHash)).toBe(false)
    }
  })

  it('V2.5 création admin d’utilisateur : mot de passe fourni par le frontend ignoré', async () => {
    const admin = await createUser({ email: 'admin3.v2@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    const r = await call('POST', '/api/admin/users', {
      cookie, body: { email: 'cree.v2@example.test', name: 'Créé V2', password: 'BourseFi2026!' },
    })
    expect(r.status).toBe(200)
    const u = db().users.find((x) => x.email === 'cree.v2@example.test')!
    expect(await bcrypt.compare('BourseFi2026!', u.passwordHash)).toBe(false)
  })

  it('V2.6 activer-compte ignore un mot de passe imposé et ne l’applique pas', async () => {
    const admin = await createUser({ email: 'admin4.v2@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    const cand = await db().prisma.candidature.create({ data: { email: 'act.v2@example.test', userId: null } })
    const r = await call('POST', `/api/admin/candidatures/${cand.id}/activer-compte`, {
      cookie, body: { password: 'BourseFi2026!' },
    })
    expect(r.status).toBe(200)
    const u = db().users.find((x) => x.email === 'act.v2@example.test')!
    expect(await bcrypt.compare('BourseFi2026!', u.passwordHash)).toBe(false)
  })
})
