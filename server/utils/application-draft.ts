import { z } from 'zod'
import { prisma } from './prisma'

/**
 * Candidature commencée mais pas encore envoyée, stockée sur le compte (User.applicationDraft).
 * Volontairement hors de la table Candidature : un brouillon ne doit compter dans aucune statistique.
 */
export const draftFieldsSchema = z.object({
  phone: z.string().trim().max(32).optional().default(''),
  address: z.string().trim().max(200).optional().default(''),
  lastEducationLevel: z.string().trim().max(120).optional().default(''),
  lastDiploma: z.string().trim().max(200).optional().default(''),
  graduationDate: z.string().trim().max(40).optional().default(''),
})

export const bourseSlugSchema = z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/)

export type DraftFields = z.infer<typeof draftFieldsSchema>

export type ApplicationDraft = {
  bourseSlug: string
  fields: DraftFields
  updatedAt: string
}

export function parseApplicationDraft(raw: unknown): ApplicationDraft | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  const slug = bourseSlugSchema.safeParse(value.bourseSlug)
  if (!slug.success) return null
  const fields = draftFieldsSchema.safeParse(value.fields ?? {})
  return {
    bourseSlug: slug.data,
    fields: fields.success ? fields.data : draftFieldsSchema.parse({}),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date(0).toISOString(),
  }
}

export function buildApplicationDraft(bourseSlug: string, fields: Partial<DraftFields> = {}): ApplicationDraft {
  return {
    bourseSlug,
    fields: draftFieldsSchema.parse(fields),
    updatedAt: new Date().toISOString(),
  }
}

/** Bourse active correspondant au slug, avec le titre de la formation (pour les relances). */
export async function findActiveBourseForDraft(bourseSlug: string) {
  return prisma.bourse.findFirst({
    where: { slug: bourseSlug, isActive: true },
    select: { id: true, slug: true, programmeId: true, programme: { select: { titre: true } } },
  })
}
