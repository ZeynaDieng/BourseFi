import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { scenarioStep: 'asc' },
  })

  return { ok: true, templates }
})
