/**
 * Mocks globaux : base en mémoire, emails capturés, audit et notifications neutralisés.
 * Aucun service externe (PostgreSQL, Brevo, SMTP) n'est contacté pendant les tests.
 */
import { vi } from 'vitest'

export type SentEmail = { to: { email: string; name?: string }; subject: string; html: string }

const g = globalThis as any
g.__sentEmails = [] as SentEmail[]
g.__emailShouldFail = false

vi.mock('../../server/utils/prisma', () => ({
  prisma: new Proxy({}, { get: (_t, k) => (globalThis as any).__fakeDb.prisma[k] }),
}))

vi.mock('../../server/utils/email', () => ({
  isEmailConfigured: () => true,
  renderEmail: (opts: { title: string; bodyHtml: string; ctaLabel?: string; ctaUrl?: string }) =>
    `<h1>${opts.title}</h1>${opts.bodyHtml}${opts.ctaUrl ? `<a href="${opts.ctaUrl}">${opts.ctaLabel}</a>` : ''}`,
  sendEmail: async (input: any) => {
    ;(globalThis as any).__sentEmails.push(input)
    return !(globalThis as any).__emailShouldFail
  },
}))

vi.mock('../../server/utils/audit', () => ({ writeAuditLog: async () => {} }))
vi.mock('../../server/utils/notifications', () => ({ notifyStatusChange: async () => {} }))
