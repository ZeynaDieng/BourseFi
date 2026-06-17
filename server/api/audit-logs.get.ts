import { getQuery } from 'h3'
import { requireRole } from '../utils/auth'
import { prisma } from '../utils/prisma'
import { PARTNER_PORTAL_ENABLED } from '../utils/product-config'

export default defineEventHandler(async (event) => {
  await requireRole(event, PARTNER_PORTAL_ENABLED ? ['ADMIN', 'PARTNER'] : ['ADMIN'])
  const query = getQuery(event)
  const limit = Math.min(200, Math.max(1, Number(query.limit || 50)))

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return logs.map((log) => {
    let metadata: Record<string, unknown> | null = null
    if (log.metadata) {
      try {
        metadata = JSON.parse(log.metadata) as Record<string, unknown>
      } catch {
        metadata = null
      }
    }
    return { ...log, metadata }
  })
})
