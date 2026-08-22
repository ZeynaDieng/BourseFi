import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const logs = await prisma.autoRelanceLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 50,
    include: {
      candidature: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          programme: { select: { titre: true, etablissement: { select: { nom: true } } } },
        },
      },
    },
  })

  return { ok: true, logs }
})
