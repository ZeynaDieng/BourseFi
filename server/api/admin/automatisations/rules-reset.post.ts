import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'
import { resetAutoRelanceRulesToDefaults } from '../../../utils/auto-relance-seed'

/** Remplace les scénarios de relance par les messages recommandés. */
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  await resetAutoRelanceRulesToDefaults()
  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'RESET_AUTO_RELANCE_RULES',
    entityType: 'AutoRelanceRule',
  })
  return { ok: true }
})
