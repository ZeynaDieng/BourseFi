import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { ensureAutoRelanceRulesSeeded } from '../../../utils/auto-relance-seed'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  await ensureAutoRelanceRulesSeeded()

  const rules = await prisma.autoRelanceRule.findMany({
    orderBy: { scenarioStep: 'asc' },
  })

  return { ok: true, rules }
})
