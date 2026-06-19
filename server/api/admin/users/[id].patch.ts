import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

const patchSchema = z.object({
  role: z.enum(['STUDENT', 'ADMIN', 'PARTNER']).optional(),
  name: z.string().min(2).max(120).optional(),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(300).optional(),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  const body = await readBody(event)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Corps invalide.' })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  if (parsed.data.role && target.id === admin.id && parsed.data.role !== 'ADMIN') {
    throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas retirer votre propre rôle admin.' })
  }

  const data: Record<string, string> = {}
  if (parsed.data.role) data.role = parsed.data.role
  if (parsed.data.firstName !== undefined) data.firstName = parsed.data.firstName
  if (parsed.data.lastName !== undefined) data.lastName = parsed.data.lastName
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone
  if (parsed.data.address !== undefined) data.address = parsed.data.address

  if (parsed.data.name) {
    data.name = parsed.data.name
  } else if (parsed.data.firstName !== undefined || parsed.data.lastName !== undefined) {
    const fn = parsed.data.firstName ?? target.firstName ?? ''
    const ln = parsed.data.lastName ?? target.lastName ?? ''
    const combined = `${fn} ${ln}`.trim()
    if (combined.length >= 2) data.name = combined
  }

  if (!Object.keys(data).length) {
    throw createError({ statusCode: 400, statusMessage: 'Aucune modification fournie.' })
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
    },
  })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: parsed.data.role ? 'USER_ROLE_UPDATED' : 'USER_PROFILE_UPDATED',
    entityType: 'User',
    entityId: id,
    metadata: { email: target.email, changes: Object.keys(data) },
  })

  return { ok: true, user: updated }
})
