import { prisma } from '../../utils/prisma'
import { buildPublicSiteSnapshot } from '../../utils/cms-public'

export default defineEventHandler(async () => {
  return buildPublicSiteSnapshot(prisma)
})
