import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'
import { buildAdminSiteContentList } from '../../utils/cms-public'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const rows = await prisma.siteContent.findMany()
  return { keys: buildAdminSiteContentList(rows) }
})
