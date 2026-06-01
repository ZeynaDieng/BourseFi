import type { Role } from '@prisma/client'
import { prisma } from './prisma'

type AuditPayload = {
  actorId?: string | null
  actorRole?: Role | 'ANONYMOUS' | string
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown> | null
}

export async function writeAuditLog(payload: AuditPayload) {
  await prisma.auditLog.create({
    data: {
      actorId: payload.actorId ?? null,
      actorRole: payload.actorRole ?? 'ANONYMOUS',
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId ?? null,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null
    }
  })
}
