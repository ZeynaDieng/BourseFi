import { prisma } from '../../../../utils/prisma'
import { requireRole } from '../../../../utils/auth'
import { writeAuditLog } from '../../../../utils/audit'
import { whatsappLink } from '../../../../utils/whatsapp'
import { createLoginLink, LOGIN_LINK_TTL_MS, paymentReturnPath } from '../../../../utils/login-link'
import { siteUrl } from '../../../../utils/one-time-token'

/**
 * « Envoyer l'attestation par WhatsApp » : pour un dossier payé, prépare un message WhatsApp
 * avec un lien personnel qui reconnecte l'étudiant et ouvre son attestation (usage unique, 72 h).
 * Utile quand l'étudiant ne lit pas ses emails ou dit « j'ai payé mais je ne vois pas mon attestation ».
 */
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Candidature invalide.' })

  const candidature = await prisma.candidature.findUnique({
    where: { id },
    include: { user: true, paiement: true },
  })
  if (!candidature) throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  if (candidature.paiement?.status !== 'Valide') {
    throw createError({ statusCode: 409, statusMessage: 'Le paiement de ce dossier n’est pas validé : aucune attestation à envoyer.' })
  }
  if (!candidature.user || candidature.user.role !== 'STUDENT') {
    throw createError({ statusCode: 409, statusMessage: 'Ce dossier n’est rattaché à aucun compte étudiant.' })
  }
  if (candidature.user.deactivatedAt) {
    throw createError({ statusCode: 409, statusMessage: 'Le compte de cet étudiant est désactivé.' })
  }

  const phone = candidature.phone || candidature.user.phone
  // Vérifié avant de créer le lien : pas de lien orphelin si le numéro est inutilisable
  if (!whatsappLink(phone, '.')) {
    throw createError({ statusCode: 422, statusMessage: 'Numéro de téléphone manquant ou invalide pour ce candidat.' })
  }

  const token = await createLoginLink({ userId: candidature.user.id, candidatureId: candidature.id, purpose: 'ATTESTATION_WHATSAPP' })
  const url = `${siteUrl()}${paymentReturnPath(candidature.id, token)}`
  const prenom = candidature.firstName || candidature.fullName.split(' ')[0] || 'Bonjour'
  const heures = LOGIN_LINK_TTL_MS.ATTESTATION_WHATSAPP / 3_600_000
  const message = `Bonjour ${prenom},\n\nVotre paiement pour *${candidature.targetProgram}* est bien validé.\n\nVotre attestation de bourse est disponible ici (lien personnel, valable ${heures} h, sans mot de passe) :\n${url}\n\nNe transférez pas ce lien : il ouvre votre espace BourseFi.\nL'équipe BourseFi.`
  const whatsappUrl = whatsappLink(phone, message)!

  await prisma.candidatureNote.create({
    data: {
      candidatureId: candidature.id,
      agentName: admin.name || admin.email || 'Admin BourseFi',
      exchangeType: 'WHATSAPP',
      content: `Lien d’accès à l’attestation envoyé par WhatsApp (valable ${heures} h).`,
    },
  })
  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'ATTESTATION_LINK_WHATSAPP',
    entityType: 'Candidature',
    entityId: candidature.id,
  })

  return { ok: true, whatsappUrl }
})
