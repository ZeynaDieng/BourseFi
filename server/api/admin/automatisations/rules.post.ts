import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

const updateRuleSchema = z.object({
  scenarioStep: z.number().int(),
  name: z.string().min(1),
  triggerHours: z.number().int().min(1),
  // Conservé pour compatibilité : seules les relances email sont automatiques
  channel: z.enum(['WHATSAPP', 'EMAIL', 'BOTH']).optional(),
  codePromo: z.string().optional().nullable(),
  subjectTemplate: z.string().max(200).optional().nullable(),
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

  const { scenarioStep, name, triggerHours, codePromo, messageTemplate, isActive } = parsed.data
  const channel = 'EMAIL'
  const subjectTemplate = parsed.data.subjectTemplate?.trim() || null

  // Les étapes s'enchaînent dans l'ordre : le délai doit rester entre celui de l'étape précédente et de la suivante
  const others = await prisma.autoRelanceRule.findMany({ where: { scenarioStep: { not: scenarioStep } } })
  const before = others.filter((r) => r.scenarioStep < scenarioStep && r.triggerHours >= triggerHours)
  const after = others.filter((r) => r.scenarioStep > scenarioStep && r.triggerHours <= triggerHours)
  if (before.length || after.length) {
    const conflict = before[0] ?? after[0]!
    throw createError({
      statusCode: 400,
      statusMessage: `Délai incohérent : l'étape ${conflict.scenarioStep} est à ${conflict.triggerHours} h. Chaque étape doit partir après la précédente et avant la suivante.`,
    })
  }

  const updatedRule = await prisma.autoRelanceRule.upsert({
    where: { scenarioStep },
    update: {
      name,
      triggerHours,
      channel,
      codePromo,
      subjectTemplate,
      messageTemplate,
      isActive,
    },
    create: {
      scenarioStep,
      name,
      triggerHours,
      channel,
      codePromo,
      subjectTemplate,
      messageTemplate,
      isActive,
    },
  })

  try {
    await writeAuditLog({
      actorId: admin.id,
      actorRole: admin.role,
      action: 'UPDATE_AUTO_RELANCE_RULE',
      entityType: 'AutoRelanceRule',
      entityId: String(scenarioStep),
      metadata: { scenarioStep, isActive, triggerHours },
    })
  } catch {}

  return { ok: true, rule: updatedRule }
})
