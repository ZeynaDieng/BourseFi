import { createError, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const body = await readBody<{
    name?: string
    role?: string
    quote?: string
    initials?: string | null
    avatarUrl?: string | null
    ecoleNom?: string | null
    partenaireNom?: string | null
    published?: boolean
    sortOrder?: number
  }>(event)
  if (!body.name?.trim() || !body.role?.trim() || !body.quote?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nom, rôle et citation requis.' })
  }
  const agg = await prisma.testimonialItem.aggregate({ _max: { sortOrder: true } })
  const sortOrder = body.sortOrder ?? ((agg._max.sortOrder ?? -1) + 1)
  return prisma.testimonialItem.create({
    data: {
      name: body.name.trim(),
      role: body.role.trim(),
      quote: body.quote.trim(),
      initials: body.initials?.trim() || null,
      avatarUrl: body.avatarUrl?.trim() || null,
      ecoleNom: body.ecoleNom?.trim() || null,
      partenaireNom: body.partenaireNom?.trim() || null,
      published: body.published ?? true,
      sortOrder
    }
  })
})
