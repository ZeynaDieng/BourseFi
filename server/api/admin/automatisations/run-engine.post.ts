import { requireRole, getSessionUser } from '../../../utils/auth'
import { runAutoRelanceEngine } from '../../../utils/auto-relance-engine'

export default defineEventHandler(async (event) => {
  let user = null
  try {
    user = await requireRole(event, ['ADMIN'])
  } catch {
    // Allows background cron trigger if needed
    user = await getSessionUser(event)
  }

  const body = await readBody(event).catch(() => ({}))
  const query = getQuery(event)

  const force = Boolean(body?.force || query?.force)

  return await runAutoRelanceEngine({
    force,
    actorId: user?.id || null,
    actorRole: user?.role || 'ANONYMOUS',
  })
})
