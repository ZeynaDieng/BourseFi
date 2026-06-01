import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })
  const body = await readBody<{
    question?: string
    answer?: string
    published?: boolean
    sortOrder?: number
  }>(event)
  return prisma.faqItem.update({
    where: { id },
    data: {
      ...(body.question !== undefined ? { question: body.question } : {}),
      ...(body.answer !== undefined ? { answer: body.answer } : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {})
    }
  })
})
