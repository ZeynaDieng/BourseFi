import { createError, getRouterParam } from 'h3'
import { prisma } from '../../utils/prisma'
import { getMetierPublicBySlug } from '../../utils/cms-public'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') ?? '')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug manquant.' })
  }
  const entry = await getMetierPublicBySlug(prisma, slug)
  if (!entry) {
    throw createError({ statusCode: 404, statusMessage: 'Métier introuvable' })
  }
  return entry
})
