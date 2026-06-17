import { createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis.' })

  const row = await prisma.notification.findFirst({
    where: { id, userId: user.id },
  })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Notification introuvable.' })

  return prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  })
})
