import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })
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
  return prisma.testimonialItem.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.quote !== undefined ? { quote: body.quote } : {}),
      ...(body.initials !== undefined ? { initials: body.initials } : {}),
      ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
      ...(body.ecoleNom !== undefined ? { ecoleNom: body.ecoleNom } : {}),
      ...(body.partenaireNom !== undefined ? { partenaireNom: body.partenaireNom } : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {})
    }
  })
})
