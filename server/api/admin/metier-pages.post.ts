import { createError, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const body = await readBody<{
    slug?: string
    label?: string
    shortDescription?: string
    salary?: string
    employability?: string
    salaryNote?: string
    missions?: string[]
    skills?: string[]
    career?: { level: string; text: string }[]
    coverImageUrl?: string | null
    published?: boolean
    sortOrder?: number
  }>(event)

  if (!body.slug?.trim() || !body.label?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Slug et libellé requis.' })
  }

  const exists = await prisma.metierPage.findUnique({ where: { slug: body.slug.trim() } })
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'Ce slug existe déjà.' })
  }

  const agg = await prisma.metierPage.aggregate({ _max: { sortOrder: true } })
  const sortOrder = body.sortOrder ?? ((agg._max.sortOrder ?? -1) + 1)

  return prisma.metierPage.create({
    data: {
      slug: body.slug.trim(),
      label: body.label.trim(),
      shortDescription: body.shortDescription ?? '',
      salary: body.salary ?? '',
      employability: body.employability ?? '',
      salaryNote: body.salaryNote ?? '',
      missions: body.missions ?? [],
      skills: body.skills ?? [],
      career: body.career ?? [],
      coverImageUrl: body.coverImageUrl?.trim() || null,
      published: body.published ?? true,
      sortOrder
    }
  })
})
