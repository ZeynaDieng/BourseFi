/**
 * Fausse base Prisma en mémoire : couvre uniquement les appels effectués par
 * les handlers testés. Aucune donnée réelle, aucune connexion PostgreSQL.
 */
import { randomBytes } from 'node:crypto'

type Row = Record<string, any>

function id() {
  return 'id_' + randomBytes(6).toString('hex')
}

function matchValue(actual: any, cond: any): boolean {
  if (cond && typeof cond === 'object' && !(cond instanceof Date)) {
    if ('equals' in cond) {
      if (cond.mode === 'insensitive') {
        return String(actual ?? '').toLowerCase() === String(cond.equals ?? '').toLowerCase()
      }
      return actual === cond.equals
    }
    if ('gt' in cond) return actual instanceof Date && actual > cond.gt
    if ('not' in cond) return actual !== cond.not
    if ('in' in cond) return cond.in.includes(actual)
  }
  return actual === cond
}

function matches(row: Row, where: Row = {}): boolean {
  return Object.entries(where).every(([k, v]) => {
    if (v === undefined) return true
    return matchValue(row[k], v)
  })
}

export function createFakeDb() {
  const users: Row[] = []
  const sessions: Row[] = []
  const candidatures: Row[] = []
  const bourses: Row[] = []
  const etablissements: Row[] = []
  const programmes: Row[] = []
  const paiements: Row[] = []
  const calls: { model: string; method: string; args: any }[] = []

  const log = (model: string, method: string, args: any) => calls.push({ model, method, args })

  const prisma = {
    user: {
      findUnique: async (args: any) => {
        log('user', 'findUnique', args)
        return users.find((u) => matches(u, args.where)) ?? null
      },
      findFirst: async (args: any) => {
        log('user', 'findFirst', args)
        return users.find((u) => matches(u, args.where)) ?? null
      },
      count: async (args: any = {}) => users.filter((u) => matches(u, args.where)).length,
      create: async (args: any) => {
        log('user', 'create', args)
        if (users.some((u) => u.email === args.data.email)) {
          const err: any = new Error('Unique constraint failed on the fields: (`email`)')
          err.code = 'P2002'
          throw err
        }
        const row = {
          id: id(),
          role: 'STUDENT',
          emailVerified: false,
          emailVerificationToken: null,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args.data,
        }
        users.push(row)
        return { ...row }
      },
      update: async (args: any) => {
        log('user', 'update', args)
        const row = users.find((u) => matches(u, args.where))
        if (!row) throw Object.assign(new Error('Record not found'), { code: 'P2025' })
        Object.assign(row, args.data, { updatedAt: new Date() })
        return { ...row }
      },
      updateMany: async (args: any) => {
        log('user', 'updateMany', args)
        const rows = users.filter((u) => matches(u, args.where))
        rows.forEach((r) => Object.assign(r, args.data, { updatedAt: new Date() }))
        return { count: rows.length }
      },
    },
    session: {
      create: async (args: any) => {
        const row = { id: id(), createdAt: new Date(), ...args.data }
        sessions.push(row)
        return row
      },
      findUnique: async (args: any) => {
        const s = sessions.find((x) => matches(x, args.where))
        if (!s) return null
        return { ...s, user: users.find((u) => u.id === s.userId) ?? null }
      },
      delete: async (args: any) => {
        const i = sessions.findIndex((x) => matches(x, args.where))
        if (i >= 0) sessions.splice(i, 1)
      },
      deleteMany: async (args: any) => {
        const before = sessions.length
        for (let i = sessions.length - 1; i >= 0; i--) {
          if (matches(sessions[i], args.where)) sessions.splice(i, 1)
        }
        return { count: before - sessions.length }
      },
    },
    candidature: {
      findUnique: async (args: any) => {
        const c = candidatures.find((x) => matches(x, args.where))
        if (!c) return null
        return { ...c, user: users.find((u) => u.id === c.userId) ?? null }
      },
      updateMany: async (args: any) => {
        const rows = candidatures.filter((c) => matches(c, args.where))
        rows.forEach((r) => Object.assign(r, args.data))
        return { count: rows.length }
      },
      create: async (args: any) => {
        const row = { id: id(), ...args.data }
        candidatures.push(row)
        return row
      },
      update: async (args: any) => {
        const row = candidatures.find((x) => matches(x, args.where))
        Object.assign(row!, args.data)
        return row
      },
    },
    programme: {
      findUnique: async (args: any) => programmes.find((p) => matches(p, args.where)) ?? null,
    },
    bourse: {
      findFirst: async () => null,
      findMany: async (args: any) => {
        log('bourse', 'findMany', args)
        const w = args.where ?? {}
        return bourses.filter((b) => (w.isActive === true ? b.isActive === true : true)
          && (w.status ? b.status === w.status : true))
      },
      findUnique: async (args: any) => bourses.find((b) => matches(b, args.where)) ?? null,
    },
    etablissement: {
      findMany: async (args: any) => {
        log('etablissement', 'findMany', args)
        const w = args.where ?? {}
        return etablissements.filter((e) => (w.status ? e.status === w.status : true))
      },
    },
    paiement: {
      create: async (args: any) => {
        const row = { id: id(), ...args.data }
        paiements.push(row)
        return row
      },
    },
    auditLog: { create: async () => ({}) },
  }

  return { prisma, users, sessions, candidatures, bourses, etablissements, programmes, paiements, calls }
}

export type FakeDb = ReturnType<typeof createFakeDb>
