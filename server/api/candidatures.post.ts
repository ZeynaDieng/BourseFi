import { requireRole } from '../utils/auth'
import { prisma } from '../utils/prisma'
import { z } from 'zod'
import { writeAuditLog } from '../utils/audit'
import type { CandidatureStatus } from '../utils/candidature-types'
import { saveUserIdentityImage } from '../utils/candidature-files'
import { createNotification } from '../utils/notifications'
import { sendEmail, renderEmail } from '../utils/email'

const documentDataUrl = z
  .string()
  .min(80)
  .regex(/^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,/i)

const candidatureSchema = z.object({
  programmeId: z.string().min(1),
  bourseId: z.string().min(1).optional(),
  // Champs spécifiques au dossier
  institution: z.string().max(200).optional().default(''),
  field: z.string().max(300).optional().default(''),
  level: z.string().max(80).optional().default('Non precise'),
  lastEducationLevel: z.string().min(2).max(120).trim(),
  lastDiploma: z.string().min(2).max(200).trim(),
  graduationDate: z.string().max(40).optional().default(''),
  gpa: z.string().min(1).max(30).trim(),
  // Profil (utilisé en repli si le compte n'est pas encore complété)
  phone: z.string().min(8).max(32).trim().optional(),
  address: z.string().min(5).max(600).trim().optional(),
  identityCardRecto: documentDataUrl.optional(),
  identityCardVerso: documentDataUrl.optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN'])
  const body = await readBody(event)
  const parsed = candidatureSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Informations candidature invalides ou incomplètes.'
    })
  }

  const programme = await prisma.programme.findUnique({
    where: { id: parsed.data.programmeId }
  })

  if (!programme) {
    throw createError({ statusCode: 404, statusMessage: 'Programme introuvable.' })
  }

  let bourseId: string | null = null
  if (parsed.data.bourseId) {
    const bourse = await prisma.bourse.findFirst({
      where: {
        id: parsed.data.bourseId,
        programmeId: programme.id,
        isActive: true,
      },
    })
    if (!bourse) {
      throw createError({ statusCode: 400, statusMessage: 'Bourse invalide pour ce programme.' })
    }
    if (bourse.placesRestantes <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Plus de places disponibles pour cette bourse.' })
    }
    bourseId = bourse.id
  }

  let initialStatus: CandidatureStatus = 'SOUMIS'
  if (programme.fraisDossier > 0) {
    initialStatus = 'EN_ATTENTE_PAIEMENT'
  } else {
    initialStatus = 'EN_REVUE_PARTENAIRE'
  }

  // Identité issue du COMPTE candidat (empêche de postuler pour autrui : on
  // n'utilise jamais un nom/email saisi librement, mais celui du compte connecté).
  const nameParts = (user.name || '').trim().split(/\s+/).filter(Boolean)
  const firstName = (user.firstName || nameParts[0] || '').trim()
  const lastName = (user.lastName || nameParts.slice(1).join(' ') || nameParts[0] || '').trim()
  const email = user.email
  const phone = (user.phone || parsed.data.phone || '').trim()
  const address = (user.address || parsed.data.address || '').trim()
  let rectoUrl = user.identityCardRectoUrl
  let versoUrl = user.identityCardVersoUrl

  // Si la CNI n'est pas encore enregistrée sur le compte mais fournie ici,
  // on l'enregistre une fois pour toutes au niveau du compte (réutilisable).
  const profilePatch: {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    identityCardRectoUrl?: string
    identityCardVersoUrl?: string
  } = {}
  try {
    if (!rectoUrl && parsed.data.identityCardRecto) {
      rectoUrl = await saveUserIdentityImage(user.id, 'recto', parsed.data.identityCardRecto)
      profilePatch.identityCardRectoUrl = rectoUrl
    }
    if (!versoUrl && parsed.data.identityCardVerso) {
      versoUrl = await saveUserIdentityImage(user.id, 'verso', parsed.data.identityCardVerso)
      profilePatch.identityCardVersoUrl = versoUrl
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur enregistrement des pièces d identité.'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  if (!firstName || !lastName || !phone || !address || !rectoUrl || !versoUrl) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Complétez votre profil (nom, téléphone, adresse et carte d’identité) avant de postuler.'
    })
  }

  // Mémorise sur le compte les infos nouvellement fournies pour les prochaines candidatures.
  if (!user.firstName) profilePatch.firstName = firstName
  if (!user.lastName) profilePatch.lastName = lastName
  if (!user.phone) profilePatch.phone = phone
  if (!user.address) profilePatch.address = address
  if (Object.keys(profilePatch).length > 0) {
    await prisma.user.update({ where: { id: user.id }, data: profilePatch })
  }

  const fullName = `${firstName} ${lastName}`.trim()

  const candidature = await prisma.candidature.create({
    data: {
      userId: user.id,
      programmeId: programme.id,
      bourseId,
      partnerId: programme.partnerId,
      firstName,
      lastName,
      fullName,
      email,
      phone,
      address,
      institution: parsed.data.institution,
      field: parsed.data.field,
      level: parsed.data.level,
      lastEducationLevel: parsed.data.lastEducationLevel,
      lastDiploma: parsed.data.lastDiploma,
      graduationDate: parsed.data.graduationDate,
      gpa: parsed.data.gpa,
      targetProgram: programme.titre,
      status: initialStatus,
      // CNI réutilisée depuis le compte (pas de duplication de fichiers)
      identityCardRectoUrl: rectoUrl,
      identityCardVersoUrl: versoUrl
    }
  })

  if (bourseId) {
    await prisma.bourse.update({
      where: { id: bourseId },
      data: { placesRestantes: { decrement: 1 } }
    })
  }

  await createNotification({
    userId: user.id,
    type: 'candidature_submitted',
    title: 'Candidature déposée',
    body: `Votre demande de bourse pour ${programme.titre} a été enregistrée.`,
    candidatureId: candidature.id,
    bourseId: bourseId ?? undefined,
  })

  const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
  const needsPayment = initialStatus === 'EN_ATTENTE_PAIEMENT'
  await sendEmail({
    to: { email, name: fullName },
    subject: 'Votre candidature a bien été reçue — BourseFi',
    html: renderEmail({
      title: 'Candidature enregistrée',
      bodyHtml: `<p>Bonjour ${firstName},</p>
        <p>Votre demande de bourse pour <strong>${programme.titre}</strong> a bien été enregistrée.</p>
        ${
          needsPayment
            ? `<p>Pour finaliser votre dossier, il reste à régler les frais de dossier (${programme.fraisDossier.toLocaleString('fr-FR')} ${programme.devise}) depuis votre espace.</p>`
            : `<p>Votre dossier est transmis pour analyse. Vous serez notifié dès qu'il y a du nouveau.</p>`
        }`,
      ctaLabel: needsPayment ? 'Régler les frais de dossier' : 'Suivre ma candidature',
      ctaUrl: needsPayment ? `${siteUrl}/paiement?candidatureId=${candidature.id}` : `${siteUrl}/etudiant/candidatures`
    })
  })

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'CANDIDATURE_CREATED',
    entityType: 'Candidature',
    entityId: candidature.id,
    metadata: {
      programmeId: programme.id,
      partnerId: programme.partnerId,
      status: initialStatus
    }
  })

  return {
    ok: true,
    candidature: {
      id: candidature.id,
      status: initialStatus,
      fraisDossier: programme.fraisDossier,
      devise: programme.devise
    }
  }
})
