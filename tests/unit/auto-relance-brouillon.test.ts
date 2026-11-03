/**
 * Relances automatiques : candidature commencée (brouillon), compte non activé, attestation prête.
 * Base en mémoire minimale, emails capturés par setup-mocks.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DEFAULT_AUTO_RELANCE_RULES } from '../../server/utils/auto-relance-seed'
import { runAutoRelanceEngine } from '../../server/utils/auto-relance-engine'

vi.mock('../../server/utils/auto-relance-seed', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../server/utils/auto-relance-seed')>()),
  ensureAutoRelanceRulesSeeded: async () => {},
}))

const HOUR = 60 * 60 * 1000
const rules = DEFAULT_AUTO_RELANCE_RULES.map((r, i) => ({ ...r, id: `rule_${i}` }))

function student(over: Record<string, any>) {
  return {
    id: over.email,
    role: 'STUDENT',
    name: 'Awa Ndiaye',
    firstName: 'Awa',
    lastName: 'Ndiaye',
    emailVerified: true,
    emailVerificationToken: null,
    applicationDraft: null,
    autoRelanceStep: 0,
    lastAutoRelanceAt: null,
    createdAt: new Date(Date.now() - 2 * HOUR),
    ...over,
  }
}

let users: any[]
let candidatures: any[]

beforeEach(() => {
  ;(globalThis as any).__sentEmails.length = 0
  users = []
  candidatures = []
  ;(globalThis as any).__fakeDb = {
    prisma: {
      autoRelanceRule: { findMany: async () => rules },
      candidature: { findMany: async () => candidatures, update: async () => ({}) },
      candidatureNote: { create: async () => ({}) },
      autoRelanceLog: { create: async (args: any) => args.data },
      user: { findMany: async () => users, update: async () => ({}) },
      bourse: {
        findFirst: async ({ where }: any) =>
          where.slug === 'bourse-ifaa-licence' && where.isActive
            ? { id: 'b1', slug: 'bourse-ifaa-licence', programmeId: 'p1', programme: { titre: 'Licence Comptabilité' } }
            : null,
      },
    },
  }
})

const sent = () => (globalThis as any).__sentEmails as { to: { email: string }; subject: string; html: string; text: string }[]
const draft = (bourseSlug: string) => ({ bourseSlug, fields: { phone: '771234567' }, updatedAt: new Date().toISOString() })

describe('Relances — candidature commencée', () => {
  it('compte activé avec brouillon : propose de terminer la candidature de la formation choisie', async () => {
    users = [student({ email: 'awa@example.test', applicationDraft: draft('bourse-ifaa-licence') })]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toContain('terminez votre candidature pour Licence Comptabilité')
    expect(mail.html).toContain('https://boursefi.test/postuler/bourse-ifaa-licence')
    expect(mail.html).toContain('Terminer ma candidature')
    expect(mail.html).not.toContain('/bourses"')
    expect(mail.html).not.toContain('apercu-attestation')
  })

  it('compte non activé avec brouillon : le lien active le compte (la connexion serait refusée sinon)', async () => {
    users = [student({ email: 'moussa@example.test', emailVerified: false, emailVerificationToken: 'tok123', applicationDraft: draft('bourse-ifaa-licence') })]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toContain('Licence Comptabilité')
    expect(mail.html).toContain('href="https://boursefi.test/auth/verify-email?token=tok123"')
    expect(mail.html).toContain('Activer mon compte et terminer ma candidature')
  })

  it('compte non activé sans brouillon : lien d’activation au lieu du catalogue', async () => {
    users = [student({ email: 'fatou@example.test', emailVerified: false, emailVerificationToken: 'tok456' })]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toContain('activez votre compte')
    expect(mail.html).toContain('href="https://boursefi.test/auth/verify-email?token=tok456"')
  })

  it('brouillon d’une bourse désactivée : message catalogue habituel', async () => {
    users = [student({ email: 'ibou@example.test', applicationDraft: draft('bourse-fermee') })]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toContain('choisissez votre formation')
    expect(mail.html).toContain('href="https://boursefi.test/bourses"')
  })
})

describe('Relances — dossier en attente de paiement', () => {
  it('annonce que l’attestation est prête', async () => {
    candidatures = [{
      id: 'c1',
      status: 'EN_ATTENTE_PAIEMENT',
      email: 'awa@example.test',
      firstName: 'Awa',
      lastName: 'Ndiaye',
      fullName: 'Awa Ndiaye',
      targetProgram: 'Licence Comptabilité',
      programme: { titre: 'Licence Comptabilité' },
      autoRelanceStep: 0,
      lastAutoRelanceAt: null,
      relanceCount: 0,
      createdAt: new Date(Date.now() - 2 * HOUR),
    }]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toBe('[BourseFi] Awa, votre attestation pour Licence Comptabilité est prête')
    expect(mail.html).toContain('Votre attestation est prête')
    expect(mail.html).toContain('href="https://boursefi.test/paiement?candidatureId=c1"')
    expect(mail.html).toContain('src="https://boursefi.test/emails/apercu-attestation.jpg"')
  })
})
