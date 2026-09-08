import { requireRole } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'
import { writeAuditLog } from '../../../utils/audit'
import { notifyStatusChange } from '../../../utils/notifications'
import { sendEmail, renderEmail } from '../../../utils/email'

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const body = await readBody(event)
  const { candidatureId, paymentMethod } = body

  if (!candidatureId) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant candidature manquant.' })
  }

  const candidature = await prisma.candidature.findUnique({
    where: { id: candidatureId },
    include: { programme: true, user: true, paiement: true }
  })

  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }

  const amount = candidature.montantFinal ?? candidature.programme.fraisDossier ?? 20000
  const method = paymentMethod || 'EXTERNE_ESPECES'
  const refCommand = `EXT-${Date.now()}`
  const attestationNumber = candidature.attestationNumber || `BF-ATT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
  const defaultAttestationUrl = `/api/attestations/${candidature.id}`
  const documentUrl = candidature.documentUrl || defaultAttestationUrl

  // 1. Enregistrer / Mettre à jour le paiement
  let paiement
  if (candidature.paiement) {
    paiement = await prisma.paiement.update({
      where: { id: candidature.paiement.id },
      data: {
        status: 'VALIDE',
        method,
        amount,
        provider: 'manual_admin',
      }
    })
  } else {
    paiement = await prisma.paiement.create({
      data: {
        userId: candidature.userId,
        candidatureId: candidature.id,
        fullName: candidature.fullName,
        email: candidature.email,
        phone: candidature.phone,
        method,
        amount,
        currency: candidature.programme.devise || 'FCFA',
        status: 'VALIDE',
        provider: 'manual_admin',
        refCommand,
      }
    })
  }

  // 2. Mettre à jour la candidature
  const updatedCandidature = await prisma.candidature.update({
    where: { id: candidatureId },
    data: {
      status: 'DOCUMENT_EMIS',
      attestationNumber,
      attestationIssuedAt: candidature.attestationIssuedAt || new Date(),
      documentUrl,
    }
  })

  // 3. Notification & Email au candidat
  await notifyStatusChange(candidature.userId, 'DOCUMENT_EMIS', candidature.id)

  const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
  await sendEmail({
    to: { email: candidature.email, name: candidature.fullName },
    subject: 'Paiement confirmé & Attestation disponible — BourseFi',
    html: renderEmail({
      title: 'Paiement validé & Attestation émise',
      bodyHtml: `<p>Bonjour ${candidature.firstName || candidature.fullName},</p>
        <p>Votre règlement externe de <strong>${amount.toLocaleString('fr-FR')} ${candidature.programme.devise}</strong> pour <strong>${candidature.targetProgram}</strong> a été validé par l'administration.</p>
        <p>Votre attestation officielle de bourse (N° <strong>${attestationNumber}</strong>) est disponible et téléchargeable dans votre espace.</p>`,
      ctaLabel: 'Télécharger mon attestation',
      ctaUrl: `${siteUrl}/etudiant/documents`
    })
  })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'CANDIDATURE_EXTERNAL_PAYMENT_VALIDATED',
    entityType: 'Candidature',
    entityId: candidature.id,
    metadata: { amount, method, refCommand, attestationNumber }
  })

  return {
    ok: true,
    candidature: updatedCandidature,
    paiement
  }
})
