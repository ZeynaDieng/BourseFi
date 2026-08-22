import type { Role } from '@prisma/client'
import type { H3Event } from 'h3'
import { prisma } from './prisma'
import { getSessionUser } from './auth'

type AuditPayload = {
  actorId?: string | null
  actorRole?: Role | 'ANONYMOUS' | string
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown> | null
  target?: string
  meta?: Record<string, unknown>
}

export async function writeAuditLog(
  eventOrPayload: H3Event | AuditPayload,
  optionalPayload?: AuditPayload
) {
  let actorId: string | null = null
  let actorRole: Role | 'ANONYMOUS' | string = 'ANONYMOUS'
  let payload: AuditPayload

  if (optionalPayload) {
    // Premier argument est un H3Event
    const event = eventOrPayload as H3Event
    payload = optionalPayload
    try {
      const user = await getSessionUser(event)
      if (user) {
        actorId = user.id
        actorRole = user.role
      }
    } catch {}
  } else {
    // Un seul argument passé : AuditPayload
    payload = eventOrPayload as AuditPayload
    actorId = payload.actorId ?? null
    actorRole = payload.actorRole ?? 'ANONYMOUS'
  }

  const action = payload.action
  const entityType = payload.entityType || payload.target || 'System'
  const entityId = payload.entityId ?? null
  const metadataObj = payload.metadata || payload.meta || null

  try {
    await prisma.auditLog.create({
      data: {
        actorId: payload.actorId ?? actorId,
        actorRole: payload.actorRole ?? actorRole,
        action,
        entityType,
        entityId,
        metadata: metadataObj ? JSON.stringify(metadataObj) : null,
      },
    })
  } catch (err) {
    console.error('Audit log error:', err)
  }
}
