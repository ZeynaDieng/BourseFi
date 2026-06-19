import { z } from 'zod'
import { assertPartnerPortalEnabled } from '../../utils/product-config'
import { CANDIDATURE_STATUSES, type CandidatureStatus } from '../../utils/candidature-types'
import { requireRole } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { writeAuditLog } from '../../utils/audit'
import { notifyStatusChange } from '../../utils/notifications'
import { saveCandidatureAttestation } from '../../utils/candidature-files'
import { sendEmail, renderEmail } from '../../utils/email'

const candidatureStatusZod = z.enum(CANDIDATURE_STATUSES)

const patchSchema = z.object({
  status: candidatureStatusZod.optional(),
  documentUrl: z.union([z.string().url(), z.literal('')]).optional(),
  // Fichier d'attestation importé par l'admin (image ou PDF en base64).
  documentDataUrl: z
    .string()
    .regex(/^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,/i)
    .optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN', 'PARTNER'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  }

  const body = await readBody(event)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Corps invalide.' })
  }

  const dossier = await prisma.candidature.findUnique({ where: { id } })
  if (!dossier) {
    throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })
  }

  if (user.role === 'PARTNER') {
    assertPartnerPortalEnabled()
    if (!user.partnerId || dossier.partnerId !== user.partnerId) {
      throw createError({ statusCode: 403, statusMessage: 'Acces refuse a ce dossier.' })
    }
  }

  const nextStatus = parsed.data.status
  const docInput = parsed.data.documentUrl

  const data: {
    status?: CandidatureStatus
    documentUrl?: string | null
    documentIssuedAt?: Date | null
  } = {}

  // 1) Fichier importé (prioritaire) : on l'enregistre et on pointe documentUrl dessus.
  let attestationJustEmitted = false
  if (parsed.data.documentDataUrl) {
    const saved = await saveCandidatureAttestation(id, parsed.data.documentDataUrl)
    data.documentUrl = saved.documentUrl
    data.documentIssuedAt = new Date()
    attestationJustEmitted = true
  } else if (docInput !== undefined) {
    // 2) Compat : URL externe (ancien comportement)
    data.documentUrl = docInput === '' ? null : docInput
    if (typeof data.documentUrl === 'string' && data.documentUrl.length > 0) {
      data.documentIssuedAt = new Date()
      attestationJustEmitted = true
    }
    if (data.documentUrl === null) {
      data.documentIssuedAt = null
    }
  }

  if (nextStatus !== undefined) {
    data.status = nextStatus
  }

  // Attestation déposée → le dossier passe automatiquement à « document émis »
  if (attestationJustEmitted && data.status !== 'REFUSE' && data.status !== 'TERMINE') {
    data.status = 'DOCUMENT_EMIS'
  }

  if (data.status === 'DOCUMENT_EMIS') {
    const hasDoc = data.documentUrl !== undefined ? Boolean(data.documentUrl) : Boolean(dossier.documentUrl)
    if (!hasDoc) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Une attestation est obligatoire pour le statut DOCUMENT_EMIS.'
      })
    }
  }

  const updated =
    Object.keys(data).length > 0
      ? await prisma.candidature.update({
          where: { id },
          data
        })
      : dossier

  if (nextStatus && nextStatus !== dossier.status) {
    await notifyStatusChange(dossier.userId, nextStatus, id)
  } else if (data.status === 'DOCUMENT_EMIS' && dossier.status !== 'DOCUMENT_EMIS') {
    await notifyStatusChange(dossier.userId, 'DOCUMENT_EMIS', id)
  }

  // Email au candidat dès qu'une attestation est mise à disposition (sans attendre le bailleur).
  if (attestationJustEmitted && updated.documentUrl) {
    const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
    await sendEmail({
      to: { email: dossier.email, name: dossier.fullName },
      subject: 'Votre attestation est disponible — BourseFi',
      html: renderEmail({
        title: 'Votre attestation est prête 🎉',
        bodyHtml: `<p>Bonjour ${dossier.firstName || dossier.fullName},</p>
          <p>Votre attestation pour <strong>${dossier.targetProgram}</strong> a été validée et déposée par notre équipe.</p>
          <p>Vous pouvez la consulter et la télécharger dès maintenant depuis votre espace BourseFi.</p>`,
        ctaLabel: 'Voir mon attestation',
        ctaUrl: `${siteUrl}/etudiant/documents`
      })
    })
  }

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'CANDIDATURE_UPDATED',
    entityType: 'Candidature',
    entityId: id,
    metadata: { ...parsed.data }
  })

  return { ok: true, candidature: updated }
})
