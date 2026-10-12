import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'
import { sendEmail, renderEmail } from '../../../utils/email'

const patchSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  programmeId: z.string().min(1).optional(),
  bourseId: z.string().nullable().optional(),
  institution: z.string().trim().optional(),
  field: z.string().trim().optional(),
  level: z.string().trim().optional(),
  lastEducationLevel: z.string().trim().optional(),
  lastDiploma: z.string().trim().optional(),
  graduationDate: z.string().trim().optional(),
  gpa: z.string().trim().optional(),
  sendNotificationEmail: z.boolean().optional(),
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
    throw createError({ statusCode: 400, statusMessage: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ') })
  }

  const candidature = await prisma.candidature.findUnique({
    where: { id },
    include: { programme: true },
  })

  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }

  const candidatureData: Record<string, unknown> = {}

  // 1. Mise à jour de l'identité du candidat
  const fn = parsed.data.firstName !== undefined ? parsed.data.firstName : candidature.firstName
  const ln = parsed.data.lastName !== undefined ? parsed.data.lastName : candidature.lastName

  if (parsed.data.firstName !== undefined) candidatureData.firstName = parsed.data.firstName
  if (parsed.data.lastName !== undefined) candidatureData.lastName = parsed.data.lastName

  if (parsed.data.firstName !== undefined || parsed.data.lastName !== undefined) {
    candidatureData.fullName = `${fn} ${ln}`.trim()
  }

  if (parsed.data.email !== undefined) {
    const cleanEmail = parsed.data.email.trim().toLowerCase()
    candidatureData.email = cleanEmail
    const matchingUser = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } },
    })
    if (matchingUser) {
      candidatureData.userId = matchingUser.id
    }
  }
  if (parsed.data.phone !== undefined) candidatureData.phone = parsed.data.phone
  if (parsed.data.address !== undefined) candidatureData.address = parsed.data.address

  // 2. Mise à jour du programme / formation
  if (parsed.data.programmeId && parsed.data.programmeId !== candidature.programmeId) {
    const programme = await prisma.programme.findUnique({
      where: { id: parsed.data.programmeId },
      include: { etablissement: true },
    })
    if (!programme) {
      throw createError({ statusCode: 404, statusMessage: 'Programme introuvable.' })
    }
    candidatureData.programmeId = programme.id
    candidatureData.partnerId = programme.partnerId
    candidatureData.targetProgram = programme.titre
    candidatureData.institution = programme.etablissement.nom
    if (parsed.data.field === undefined) candidatureData.field = programme.titre
    if (parsed.data.level === undefined && programme.niveau) candidatureData.level = programme.niveau
  }

  // 3. Bourse
  if (parsed.data.bourseId !== undefined) {
    candidatureData.bourseId = parsed.data.bourseId
  }

  // 4. Informations académiques
  if (parsed.data.institution !== undefined && !candidatureData.institution) {
    candidatureData.institution = parsed.data.institution
  }
  if (parsed.data.field !== undefined) candidatureData.field = parsed.data.field
  if (parsed.data.level !== undefined) candidatureData.level = parsed.data.level
  if (parsed.data.lastEducationLevel !== undefined) candidatureData.lastEducationLevel = parsed.data.lastEducationLevel
  if (parsed.data.lastDiploma !== undefined) candidatureData.lastDiploma = parsed.data.lastDiploma
  if (parsed.data.graduationDate !== undefined) candidatureData.graduationDate = parsed.data.graduationDate
  if (parsed.data.gpa !== undefined) candidatureData.gpa = parsed.data.gpa

  if (Object.keys(candidatureData).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Aucune modification fournie.' })
  }

  // Mise à jour de la candidature
  const updatedCandidature = await prisma.candidature.update({
    where: { id },
    data: candidatureData,
    include: {
      programme: {
        include: {
          etablissement: true,
        },
      },
      partner: true,
      bourse: true,
      user: true,
    },
  })

  // Synchronisation avec le compte utilisateur lié
  if (candidature.userId) {
    const userPatch: Record<string, string> = {}
    if (parsed.data.firstName !== undefined) userPatch.firstName = parsed.data.firstName
    if (parsed.data.lastName !== undefined) userPatch.lastName = parsed.data.lastName
    if (candidatureData.fullName) userPatch.name = String(candidatureData.fullName)
    if (parsed.data.email !== undefined) userPatch.email = parsed.data.email.toLowerCase()
    if (parsed.data.phone !== undefined) userPatch.phone = parsed.data.phone
    if (parsed.data.address !== undefined) userPatch.address = parsed.data.address

    if (Object.keys(userPatch).length > 0) {
      try {
        await prisma.user.update({
          where: { id: candidature.userId },
          data: userPatch,
        })
      } catch (err) {
        console.warn('Impossible de synchroniser le profil utilisateur lié:', err)
      }
    }
  }

  // Si l'email a été modifié ou qu'un compte a été lié, réconcilier tous les dossiers portant cet email
  const targetUserId = (candidatureData.userId ? String(candidatureData.userId) : candidature.userId) as string | undefined
  if (parsed.data.email !== undefined && targetUserId) {
    try {
      await prisma.candidature.updateMany({
        where: {
          email: { equals: String(candidatureData.email), mode: 'insensitive' },
          userId: { not: targetUserId },
        },
        data: { userId: targetUserId },
      })
    } catch (reconcileErr) {
      console.warn('Erreur réconciliation candidatures par email:', reconcileErr)
    }
  }

  // Envoi optionnel du courriel de mise à jour au candidat
  if (parsed.data.sendNotificationEmail) {
    const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
    const recipientEmail = updatedCandidature.email
    const recipientName = updatedCandidature.fullName || `${updatedCandidature.firstName} ${updatedCandidature.lastName}`
    const attestationLink = updatedCandidature.documentUrl || `/api/attestations/${updatedCandidature.id}`
    const fullAttestationUrl = attestationLink.startsWith('http') ? attestationLink : `${siteUrl}${attestationLink}`

    try {
      await sendEmail({
        to: { email: recipientEmail, name: recipientName },
        subject: `Mise à jour de votre dossier / attestation — ${updatedCandidature.targetProgram}`,
        html: renderEmail({
          title: 'Vos informations ont été mises à jour',
          bodyHtml: `<p>Bonjour ${updatedCandidature.firstName || recipientName},</p>
            <p>Nous vous informons que les informations de votre candidature pour la formation <strong>${updatedCandidature.targetProgram}</strong> ont été mises à jour par l'administration BourseFi.</p>
            <div style="background:#f1f5f9;padding:14px 18px;border-radius:10px;margin:18px 0;border-left:4px solid #0b1b3a;font-family:Arial,sans-serif;">
              <p style="margin:4px 0;font-size:13px;"><strong>Bénéficiaire :</strong> ${recipientName}</p>
              <p style="margin:4px 0;font-size:13px;"><strong>Établissement :</strong> ${updatedCandidature.institution || updatedCandidature.programme?.etablissement?.nom || 'Établissement partenaire'}</p>
              <p style="margin:4px 0;font-size:13px;"><strong>Formation :</strong> ${updatedCandidature.targetProgram}</p>
            </div>
            <p>Votre attestation officielle a été automatiquement régénérée et mise à jour avec vos nouvelles informations.</p>`,
          ctaLabel: 'Consulter mon attestation à jour',
          ctaUrl: fullAttestationUrl,
        }),
      })
    } catch (mailErr) {
      console.warn('Erreur envoi email notification modification dossier:', mailErr)
    }
  }

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'CANDIDATURE_UPDATED_BY_ADMIN',
    entityType: 'Candidature',
    entityId: id,
    metadata: {
      changes: Object.keys(candidatureData),
      candidatureId: id,
      notifiedCandidate: Boolean(parsed.data.sendNotificationEmail),
    },
  })

  return { ok: true, candidature: updatedCandidature }
})
