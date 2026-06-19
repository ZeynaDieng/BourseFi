import { z } from 'zod'
import { requireAuth } from '../utils/auth'
import { prisma } from '../utils/prisma'
import { saveUserIdentityImage } from '../utils/candidature-files'
import { writeAuditLog } from '../utils/audit'

const dataUrl = z.string().regex(/^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,/i)

const profileSchema = z.object({
  firstName: z.string().min(1).max(80).trim(),
  lastName: z.string().min(1).max(80).trim(),
  phone: z.string().min(8).max(32).trim(),
  address: z.string().min(5).max(600).trim(),
  identityCardRecto: dataUrl.optional(),
  identityCardVerso: dataUrl.optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Informations de profil invalides ou incomplètes.' })
  }

  const data: {
    firstName: string
    lastName: string
    name: string
    phone: string
    address: string
    identityCardRectoUrl?: string
    identityCardVersoUrl?: string
  } = {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
    phone: parsed.data.phone,
    address: parsed.data.address
  }

  try {
    if (parsed.data.identityCardRecto) {
      data.identityCardRectoUrl = await saveUserIdentityImage(user.id, 'recto', parsed.data.identityCardRecto)
    }
    if (parsed.data.identityCardVerso) {
      data.identityCardVersoUrl = await saveUserIdentityImage(user.id, 'verso', parsed.data.identityCardVerso)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur lors de l’enregistrement de la pièce d’identité.'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'PROFILE_UPDATED',
    entityType: 'User',
    entityId: user.id,
    metadata: { hasRecto: Boolean(data.identityCardRectoUrl), hasVerso: Boolean(data.identityCardVersoUrl) }
  })

  return {
    ok: true,
    profile: {
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      address: updated.address,
      identityCardRectoUrl: updated.identityCardRectoUrl,
      identityCardVersoUrl: updated.identityCardVersoUrl
    }
  }
})
