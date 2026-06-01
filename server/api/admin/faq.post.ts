import { createError, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const body = await readBody<{
    question?: string
    answer?: string
    published?: boolean
    sortOrder?: number
  }>(event)
  if (!body.question?.trim() || !body.answer?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Question et réponse requises.' })
  }
  const agg = await prisma.faqItem.aggregate({ _max: { sortOrder: true } })
  const sortOrder = body.sortOrder ?? ((agg._max.sortOrder ?? -1) + 1)
  return prisma.faqItem.create({
    data: {
      question: body.question.trim(),
      answer: body.answer.trim(),
      published: body.published ?? true,
      sortOrder
    }
  })
})
