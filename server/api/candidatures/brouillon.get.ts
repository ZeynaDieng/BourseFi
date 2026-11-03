import { requireRole } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { parseApplicationDraft } from '../../utils/application-draft'

/** Brouillon de candidature de l'étudiant connecté (null si aucun). */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT'])
  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { applicationDraft: true } })
  return { draft: parseApplicationDraft(row?.applicationDraft) }
})
