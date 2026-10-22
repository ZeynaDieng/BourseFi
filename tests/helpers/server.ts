import { createApp, createRouter, toWebHandler } from 'h3'
import { createHmac, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { createFakeDb, type FakeDb } from './fake-db'
import type { SentEmail } from './setup-mocks'

import register from '../../server/api/auth/register.post'
import login from '../../server/api/auth/login.post'
import forgot from '../../server/api/auth/forgot-password.post'
import reset from '../../server/api/auth/reset-password.post'
import verifyEmail from '../../server/api/auth/verify-email.get'
import me from '../../server/api/auth/me.get'
import activer from '../../server/api/admin/candidatures/[id]/activer-compte.post'
import creerDirect from '../../server/api/admin/candidatures/creer-direct.post'
import adminUserCreate from '../../server/api/admin/users/index.post'
import adminUserPatch from '../../server/api/admin/users/[id].patch'
import bourses from '../../server/api/bourses.get'
import bourseBySlug from '../../server/api/bourses/[slug].get'
import etablissements from '../../server/api/etablissements.get'

const router = createRouter()
router.post('/api/auth/register', register)
router.post('/api/auth/login', login)
router.post('/api/auth/forgot-password', forgot)
router.post('/api/auth/reset-password', reset)
router.get('/api/auth/verify-email', verifyEmail)
router.get('/api/auth/me', me)
router.post('/api/admin/candidatures/:id/activer-compte', activer)
router.post('/api/admin/candidatures/creer-direct', creerDirect)
router.post('/api/admin/users', adminUserCreate)
router.patch('/api/admin/users/:id', adminUserPatch)
router.get('/api/bourses', bourses)
router.get('/api/bourses/:slug', bourseBySlug)
router.get('/api/etablissements', etablissements)

const app = createApp()
app.use(router)
const web = toWebHandler(app)

let ipCounter = 1

export function db(): FakeDb {
  return (globalThis as any).__fakeDb
}

export function sentEmails(): SentEmail[] {
  return (globalThis as any).__sentEmails
}

export function setEmailFailure(fail: boolean) {
  ;(globalThis as any).__emailShouldFail = fail
}

export function resetEnv() {
  ;(globalThis as any).__fakeDb = createFakeDb()
  ;(globalThis as any).__sentEmails = []
  ;(globalThis as any).__emailShouldFail = false
}

export function freshIp() {
  ipCounter++
  return `10.${(ipCounter >> 16) & 255}.${(ipCounter >> 8) & 255}.${ipCounter & 255}`
}

export async function createUser(opts: {
  email: string
  password?: string
  role?: 'STUDENT' | 'ADMIN' | 'PARTNER'
  emailVerified?: boolean
  name?: string
}) {
  const passwordHash = await bcrypt.hash(opts.password ?? 'Initial-Pass-2026', 4)
  return db().prisma.user.create({
    data: {
      name: opts.name ?? 'Test User',
      email: opts.email,
      passwordHash,
      role: opts.role ?? 'STUDENT',
      emailVerified: opts.emailVerified ?? true,
    },
  })
}

export async function sessionCookieFor(userId: string) {
  const token = randomBytes(24).toString('hex')
  await db().prisma.session.create({
    data: { token, userId, expiresAt: new Date(Date.now() + 3600_000) },
  })
  return `bf_session=${token}`
}

export function csrfToken() {
  const ts = Date.now()
  const rnd = randomBytes(16).toString('hex')
  const sig = createHmac('sha256', process.env.CSRF_SECRET || 'default-secret-change-in-production')
    .update(`${ts}:${rnd}`)
    .digest('base64url')
  return `${ts}:${rnd}:${sig}`
}

export type TestResponse = {
  status: number
  body: any
  rawBody: string
  headers: Headers
  setCookie: string[]
}

export async function call(
  method: string,
  path: string,
  opts: { body?: unknown; rawBody?: string; cookie?: string; ip?: string; csrf?: boolean; headers?: Record<string, string> } = {},
): Promise<TestResponse> {
  const headers: Record<string, string> = {
    'x-forwarded-for': opts.ip ?? freshIp(),
    ...(opts.headers ?? {}),
  }
  const cookies: string[] = []
  if (opts.cookie) cookies.push(opts.cookie)
  if (opts.csrf) {
    const t = csrfToken()
    cookies.push(`bf_csrf_token=${t}`)
    headers['x-csrf-token'] = t
  }
  if (cookies.length) headers.cookie = cookies.join('; ')
  let body: string | undefined
  if (opts.rawBody !== undefined) {
    body = opts.rawBody
    headers['content-type'] = 'application/json'
  } else if (opts.body !== undefined) {
    body = JSON.stringify(opts.body)
    headers['content-type'] = 'application/json'
  }
  const res = await web(new Request(`http://localhost${path}`, { method, headers, body }))
  const rawBody = await res.text()
  let parsed: any = rawBody
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    /* corps non JSON */
  }
  return {
    status: res.status,
    body: parsed,
    rawBody,
    headers: res.headers,
    setCookie: res.headers.getSetCookie?.() ?? [],
  }
}

/** Extrait le jeton d'un lien `?token=...` présent dans un email capturé. */
export function tokenFromEmail(mail: SentEmail | undefined): string | null {
  if (!mail) return null
  const m = mail.html.match(/token=([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

/** Vide la file des micro-tâches (emails envoyés en arrière-plan). */
export async function flush() {
  await new Promise((r) => setTimeout(r, 10))
}
