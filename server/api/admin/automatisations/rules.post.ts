import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

const updateRuleSchema = z.object({
  scenarioStep: z.number().int(),
  name: z.string().min(1),
  triggerHours: z.number().int().min(1),
  channel: z.enum(['WHATSAPP', 'EMAIL', 'BOTH']),
  codePromo: z.string().optional().nullable(),
  messageTemplate: z.string().min(1),
  isActive: z.boolean(),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const body = await readBody(event)
  const parsed = updateRuleSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Données invalides.' })
  }

  const { scenarioStep, name, triggerHours, channel, codePromo, messageTemplate, isActive } = parsed.data

  const updatedRule = await prisma.autoRelanceRule.upsert({
    where: { scenarioStep },
    update: {
      name,
      triggerHours,
      channel,
      codePromo,
      messageTemplate,
      isActive,
    },
    create: {
      scenarioStep,
      name,
      triggerHours,
      channel,
      codePromo,
      messageTemplate,
      isActive,
    },
  })

  await writeAuditLog(event, {
    action: 'UPDATE_AUTO_RELANCE_RULE',
    target: `Scénario ${scenarioStep} (${name})`,
    meta: { scenarioStep, isActive, triggerHours },
  })

  return { ok: true, rule: updatedRule }
})
