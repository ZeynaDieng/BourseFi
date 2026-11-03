import { z } from 'zod'
import { requireRole } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'
import { rateLimitKey } from '../../../utils/rate-limit'

const REASONS = {
  FINANCIAL_DIFFICULTY: { label: 'Pas les moyens de payer pour le moment', nextAction: 'WAIT_CANDIDATE' },
  PARENT_APPROVAL: { label: 'Doit d’abord en parler à ses parents', nextAction: 'CALL_TOMORROW' },
  TECHNICAL_ISSUE: { label: 'Problème avec le paiement (Wave, Orange Money…)', nextAction: 'CALL_TOMORROW' },
} as const

const bodySchema = z.object({ reason: z.enum(Object.keys(REASONS) as [keyof typeof REASONS, ...(keyof typeof REASONS)[]]) })

/**
 * « Je ne peux pas payer maintenant » : l'étudiant indique pourquoi, depuis la page de paiement.
 * Le motif alimente le suivi CRM de l'admin (motif de blocage + note), sans changer le statut du dossier.
 */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT'])
  rateLimitKey('candidature-blocage', user.id, 20, 60 * 60 * 1000)
  const id = getRouterParam(event, 'id')
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!id || !parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Motif invalide.' })
  }

  const candidature = await prisma.candidature.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true },
  })
  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }
  if (candidature.status !== 'EN_ATTENTE_PAIEMENT') {
    throw createError({ statusCode: 409, statusMessage: 'Ce dossier n’est pas en attente de paiement.' })
  }

  const reason = parsed.data.reason
  await prisma.candidature.update({ where: { id }, data: { blockingReason: reason } })
  await prisma.candidatureNote.create({
    data: {
      candidatureId: id,
      agentName: 'Étudiant (page de paiement)',
      exchangeType: 'SUPPORT',
      content: `L’étudiant a cliqué sur « Je ne peux pas payer maintenant » : ${REASONS[reason].label}.`,
      blockingReason: reason,
      nextAction: REASONS[reason].nextAction,
    },
  })

  return { ok: true }
})
