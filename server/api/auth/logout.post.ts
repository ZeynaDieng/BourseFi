import { clearAuthSession } from '../../utils/auth'
import { getSessionUser } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  await clearAuthSession(event)
  if (user) {
    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'AUTH_LOGOUT',
      entityType: 'Session'
    })
  }
  return { ok: true }
})
