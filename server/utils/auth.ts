import type { H3Event } from 'h3'
import { createError, getCookie, setCookie, deleteCookie } from 'h3'
import { randomBytes } from 'node:crypto'
import { prisma } from './prisma'

const COOKIE_NAME = 'bf_session'
const SESSION_TTL_DAYS = 14

function getSessionExpiry() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS)
  return expiresAt
}

export async function createSession(event: H3Event, userId: string) {
  const token = randomBytes(48).toString('hex')
  const expiresAt = getSessionExpiry()

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt
    }
  })

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt
  })
}

export async function clearAuthSession(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export async function getSessionUser(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!session) return null
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    deleteCookie(event, COOKIE_NAME, { path: '/' })
    return null
  }

  return session.user
}

export async function requireAuth(event: H3Event) {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentification requise.' })
  }
  return user
}

export async function requireRole(event: H3Event, roles: Array<'STUDENT' | 'ADMIN' | 'PARTNER'>) {
  const user = await requireAuth(event)
  if (!roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Permission refusee.' })
  }
  return user
}
