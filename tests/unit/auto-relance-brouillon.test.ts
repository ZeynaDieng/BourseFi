/**
 * Relances automatiques : candidature commencée (brouillon), compte sans candidature, attestation prête.
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
let promos: any[]
let notes: any[]
let lastCandidatureWhere: any

beforeEach(() => {
  ;(globalThis as any).__sentEmails.length = 0
  users = []
  candidatures = []
  notes = []
  promos = [{ code: 'RENTREE2026', isActive: true, expiresAt: null, maxUses: 100, usedCount: 0 }]
  ;(globalThis as any).__fakeDb = {
    prisma: {
      autoRelanceRule: { findMany: async () => rules },
      promoCode: { findMany: async () => promos },
      candidature: {
        findMany: async (args: any) => {
          lastCandidatureWhere = args.where
          return candidatures
        },
        update: async () => ({}),
      },
      candidatureNote: { create: async (args: any) => notes.push(args.data) },
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
  it('brouillon : propose de terminer la candidature de la formation choisie', async () => {
    users = [student({ email: 'awa@example.test', applicationDraft: draft('bourse-ifaa-licence') })]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toContain('terminez votre candidature pour Licence Comptabilité')
    expect(mail.html).toContain('https://boursefi.test/postuler/bourse-ifaa-licence')
    expect(mail.html).toContain('Terminer ma candidature')
    expect(mail.html).not.toContain('/bourses"')
    expect(mail.html).not.toContain('apercu-attestation')
  })

  it('email non vérifié : même relance (le compte est utilisable sans vérification)', async () => {
    users = [student({ email: 'moussa@example.test', emailVerified: false, applicationDraft: draft('bourse-ifaa-licence') })]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toContain('Licence Comptabilité')
    expect(mail.html).toContain('https://boursefi.test/postuler/bourse-ifaa-licence')
    expect(mail.html).not.toContain('verify-email')
  })

  it('brouillon d’une bourse désactivée : message catalogue habituel', async () => {
    users = [student({ email: 'ibou@example.test', applicationDraft: draft('bourse-fermee') })]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toContain('choisissez votre formation')
    expect(mail.html).toContain('href="https://boursefi.test/bourses"')
  })
})

function dossier(over: Record<string, any> = {}) {
  return {
    id: 'c1',
    status: 'EN_ATTENTE_PAIEMENT',
    email: 'awa@example.test',
    firstName: 'Awa',
    lastName: 'Ndiaye',
    fullName: 'Awa Ndiaye',
    targetProgram: 'Licence Comptabilité',
    montantFinal: 15000,
    blockingReason: null,
    programme: {
      titre: 'Licence Comptabilité',
      devise: 'FCFA',
      etablissement: { nom: 'IFAA' },
      tarifs: [{ status: 'ACTIVE', isDefault: true, montant: 1500000, montantBourse: 780000, anneeAcademique: '2026-2027' }],
    },
    bourse: { coveragePercent: 48, montantMax: null, dateLimite: new Date(Date.now() + 10 * 24 * HOUR) },
    autoRelanceStep: 0,
    lastAutoRelanceAt: null,
    relanceCount: 0,
    createdAt: new Date(Date.now() - 2 * HOUR),
    ...over,
  }
}
const plain = (s: string) => s.replace(/\u202f|\u00a0/g, ' ')

describe('Relances — dossier en attente de paiement', () => {
  it('ne relance que les dossiers en attente de paiement, hors désabonnés', async () => {
    await runAutoRelanceEngine()
    expect(lastCandidatureWhere.status).toBe('EN_ATTENTE_PAIEMENT')
    expect(lastCandidatureWhere.user).toEqual({ relancesOptOutAt: null, deactivatedAt: null })
  })

  it('1h : attestation prête, chiffres réels, aperçu et lien de désabonnement', async () => {
    candidatures = [dossier()]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toBe('[BourseFi] Awa, votre attestation de bourse est prête')
    expect(plain(mail.text)).toContain('48 % de prise en charge à IFAA')
    expect(plain(mail.text)).toContain('frais de dossier (15 000 FCFA)')
    expect(mail.html).toContain('href="https://boursefi.test/paiement?candidatureId=c1"')
    expect(mail.html).toContain('src="https://boursefi.test/emails/apercu-attestation.jpg"')
    expect(mail.html).toContain('https://boursefi.test/desabonnement?e=')
  })

  it('24h : économie calculée comme sur la page de la bourse', async () => {
    candidatures = [dossier({ autoRelanceStep: 1, createdAt: new Date(Date.now() - 30 * HOUR) })]
    await runAutoRelanceEngine()
    expect(plain(sent()[0].text)).toContain('une économie de 720 000 FCFA')
    expect(plain(sent()[0].subject)).toContain('48 % de votre scolarité')
  })

  it('une ligne dont la donnée manque est retirée (pas de trou ni de chiffre inventé)', async () => {
    candidatures = [dossier({ autoRelanceStep: 2, createdAt: new Date(Date.now() - 80 * HOUR), bourse: { coveragePercent: 48, montantMax: null, dateLimite: new Date(Date.now() - HOUR) } })]
    await runAutoRelanceEngine()
    const text = sent()[0].text
    expect(text).toContain('vous attend toujours')
    expect(text).not.toContain('ferment le')
    expect(text).not.toMatch(/\{\{|\n{3,}/)
  })

  it('le code promo n’est proposé que s’il est encore valable', async () => {
    const lastStep = { autoRelanceStep: 4, createdAt: new Date(Date.now() - 400 * HOUR) }
    candidatures = [dossier(lastStep)]
    await runAutoRelanceEngine()
    expect(sent()[0].text).toContain('RENTREE2026')

    ;(globalThis as any).__sentEmails.length = 0
    promos = [{ code: 'RENTREE2026', isActive: true, expiresAt: new Date(Date.now() - HOUR), maxUses: 100, usedCount: 0 }]
    candidatures = [dossier(lastStep)]
    await runAutoRelanceEngine()
    expect(sent()[0].text).not.toContain('RENTREE2026')
    expect(sent()[0].text).not.toContain('code promo')
  })

  it('motif « parents » : message à transférer, sans code promo', async () => {
    candidatures = [dossier({ blockingReason: 'PARENT_APPROVAL', autoRelanceStep: 4, createdAt: new Date(Date.now() - 400 * HOUR) })]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toContain('un message tout prêt pour vos parents')
    expect(plain(mail.text)).toContain('Elle couvre 48 % de ma scolarité à IFAA')
    expect(mail.text).not.toContain('RENTREE2026')
    expect(notes[0].content).toContain('message adapté : PARENT_APPROVAL')
  })

  it('motif « pas l’argent » : aucune relance avant J+7', async () => {
    candidatures = [dossier({ blockingReason: 'FINANCIAL_DIFFICULTY', autoRelanceStep: 1, createdAt: new Date(Date.now() - 80 * HOUR) })]
    await runAutoRelanceEngine()
    expect(sent()).toHaveLength(0)

    candidatures = [dossier({ blockingReason: 'FINANCIAL_DIFFICULTY', autoRelanceStep: 1, createdAt: new Date(Date.now() - 170 * HOUR) })]
    await runAutoRelanceEngine()
    expect(sent()[0].subject).toContain('votre attestation reste réservée')
  })
})

describe('Relances — dossier ancien sans bourse liée', () => {
  it('message cohérent : les lignes chiffrées sont retirées', async () => {
    candidatures = [dossier({ bourse: null, montantFinal: null, programme: { titre: 'Licence Comptabilité', etablissement: { nom: 'IFAA' } } })]
    await runAutoRelanceEngine()
    const [mail] = sent()
    expect(mail.subject).toBe('[BourseFi] Awa, votre attestation de bourse est prête')
    expect(mail.text).toContain('Votre attestation de bourse pour Licence Comptabilité est prête.')
    expect(mail.text).not.toContain('%')
    expect(mail.text).not.toContain('frais de dossier (')
  })
})
