import { prisma } from '../../../utils/prisma'
import { z } from 'zod'

const countSchema = z.object({
  niveau: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  hasCandidature: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user || user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Accès non autorisé' })
  }

  const body = await readBody(event)
  const parsed = countSchema.safeParse(body || {})
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Filtres invalides' })
  }

  const filters = parsed.data

  const whereClause: any = { role: 'STUDENT' }

  const candidatureFilters: any = {}
  let useCandidatureFilter = false

  if (filters.niveau && filters.niveau.length > 0) {
    candidatureFilters.level = { in: filters.niveau }
    useCandidatureFilter = true
  }

  if (filters.status && filters.status.length > 0) {
    candidatureFilters.status = { in: filters.status }
    useCandidatureFilter = true
  }

  if (filters.hasCandidature || useCandidatureFilter) {
    whereClause.candidatures = { some: candidatureFilters }
  }

  const count = await prisma.user.count({
    where: whereClause
  })

  return { count }
})
