import { requireRole } from '../../../utils/auth'
import { setGlobalFraisDossierConfig } from '../../../utils/frais-dossier'
import { z } from 'zod'

const schema = z.object({
  referenceTarif: z.number().min(0),
  activeTarif: z.number().min(0),
  mode: z.enum(['standard', 'promotion']),
  isActive: z.boolean(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides.' })
  }

  const updated = await setGlobalFraisDossierConfig(parsed.data)
  
  return { ok: true, config: updated }
})
