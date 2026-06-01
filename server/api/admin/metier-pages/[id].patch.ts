import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })

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

  if (body.slug?.trim()) {
    const clash = await prisma.metierPage.findFirst({
      where: { slug: body.slug.trim(), NOT: { id } }
    })
    if (clash) {
      throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
    }
  }

  return prisma.metierPage.update({
    where: { id },
    data: {
      ...(body.slug !== undefined ? { slug: body.slug.trim() } : {}),
      ...(body.label !== undefined ? { label: body.label } : {}),
      ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription } : {}),
      ...(body.salary !== undefined ? { salary: body.salary } : {}),
      ...(body.employability !== undefined ? { employability: body.employability } : {}),
      ...(body.salaryNote !== undefined ? { salaryNote: body.salaryNote } : {}),
      ...(body.missions !== undefined ? { missions: body.missions } : {}),
      ...(body.skills !== undefined ? { skills: body.skills } : {}),
      ...(body.career !== undefined ? { career: body.career } : {}),
      ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl || null } : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {})
    }
  })
})
