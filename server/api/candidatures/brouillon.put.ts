import { z } from 'zod'
import { requireRole } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { rateLimitKey } from '../../utils/rate-limit'
import {
  bourseSlugSchema,
  buildApplicationDraft,
  draftFieldsSchema,
  findActiveBourseForDraft,
} from '../../utils/application-draft'

const bodySchema = z.object({
  bourseSlug: bourseSlugSchema,
  fields: draftFieldsSchema.optional(),
})

/** Enregistre la candidature en cours de saisie, pour la reprendre plus tard ou sur un autre appareil. */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT'])
  rateLimitKey('candidature-brouillon', user.id, 120, 60 * 60 * 1000)
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Brouillon invalide.' })
  }

  const bourse = await findActiveBourseForDraft(parsed.data.bourseSlug)
  if (!bourse) {
    throw createError({ statusCode: 404, statusMessage: 'Bourse introuvable.' })
  }

  const draft = buildApplicationDraft(bourse.slug, parsed.data.fields)
  await prisma.user.update({ where: { id: user.id }, data: { applicationDraft: draft } })
  return { ok: true, draft }
})
