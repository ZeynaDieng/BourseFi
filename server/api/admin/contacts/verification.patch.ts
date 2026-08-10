import { createError, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const body = await readBody<{
    etablissementId: string
    contactStatus: 'VERIFIED' | 'TO_VERIFY' | 'UNVERIFIED'
  }>(event)

  if (!body.etablissementId || !body.contactStatus) {
    throw createError({ statusCode: 400, statusMessage: 'etablissementId et contactStatus sont requis.' })
  }

  const contactVerifiedAt = body.contactStatus === 'VERIFIED' ? new Date() : null

  const updated = await prisma.etablissement.update({
    where: { id: body.etablissementId },
    data: {
      contactStatus: body.contactStatus,
      contactVerifiedAt,
      updatedBy: user.email,
    },
  })

  // Mettre à jour également le statut des contacts liés
  await prisma.etablissementContact.updateMany({
    where: { etablissementId: body.etablissementId },
    data: {
      status: body.contactStatus,
    },
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'CONTACT_VERIFICATION_TOGGLE',
    entityType: 'Etablissement',
    entityId: updated.id,
    metadata: { status: body.contactStatus },
  })

  return updated
})
