import { createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { bourseInclude, serializeBourse } from '../../utils/bourse-serialize'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug requis.' })
  }

  const row = await prisma.bourse.findUnique({
    where: { slug },
    include: bourseInclude,
  })

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Bourse introuvable.' })
  }

  return serializeBourse(row)
})
