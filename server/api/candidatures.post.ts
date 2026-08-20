import { requireRole } from '../utils/auth'
import { prisma } from '../utils/prisma'
import { z } from 'zod'
import { writeAuditLog } from '../utils/audit'
import type { CandidatureStatus } from '../utils/candidature-types'
import { saveUserIdentityImage, saveUserEducationDocument } from '../utils/candidature-files'
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
  lastEducationLevel: z.string().min(1, "Veuillez préciser votre dernier niveau d'études").max(120).trim(),
  lastDiploma: z.string().min(1, "Veuillez préciser votre dernier diplôme").max(200).trim(),
  graduationDate: z.string().max(40).optional().default(''),
  gpa: z.string().max(30).optional().default(''),
  // Profil (utilisé en repli si le compte n'est pas encore complété)
  phone: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  promoCode: z.string().trim().optional().or(z.literal('')),
  identityCardRecto: documentDataUrl.optional().or(z.literal('')),
  identityCardVerso: documentDataUrl.optional().or(z.literal('')),
  bfemAttestation: documentDataUrl.optional().or(z.literal('')),
  bacTranscript: documentDataUrl.optional().or(z.literal('')),
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN'])
  const body = await readBody(event)
  const parsed = candidatureSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    const issuePath = firstIssue?.path?.join('.') || ''
    const msg = firstIssue?.message || 'Informations candidature invalides ou incomplètes.'
    throw createError({
      statusCode: 400,
      statusMessage: issuePath ? `Champ ${issuePath} invalide : ${msg}` : msg,
    })
  }

  const programme = await prisma.programme.findUnique({
    where: { id: parsed.data.programmeId },
    include: { etablissement: true, tarifs: true },
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
    bourseId = bourse.id
  }

  const effectiveFraisDossier =
    programme.etablissement?.isDirectPartner && programme.etablissement?.fraisDossier !== undefined
      ? programme.etablissement.fraisDossier
      : programme.fraisDossier

  // Traitement du code promo si fourni
  let promoCodeId: string | null = null
  let montantInitial: number | null = effectiveFraisDossier
  let montantReduction: number | null = 0
  let montantFinal: number = effectiveFraisDossier

  if (parsed.data.promoCode && parsed.data.promoCode.trim().length > 0) {
    const codeFormatted = parsed.data.promoCode.trim().toUpperCase()
    const promo = await prisma.promoCode.findUnique({
      where: { code: codeFormatted }
    })

    if (promo && promo.isActive) {
      const isExpired = promo.expiresAt && new Date() > new Date(promo.expiresAt)
      const isLimitReached = promo.maxUses !== null && promo.usedCount >= promo.maxUses
      const isScopeMismatch = promo.etablissementId && programme.etablissementId !== promo.etablissementId

      if (!isExpired && !isLimitReached && !isScopeMismatch) {
        promoCodeId = promo.id
        if (promo.type === 'PERCENTAGE') {
          montantReduction = Math.round(effectiveFraisDossier * (promo.valeur / 100))
        } else if (promo.type === 'FIXED') {
          montantReduction = Math.round(promo.valeur)
        }
        montantReduction = Math.min(effectiveFraisDossier, Math.max(0, montantReduction))
        montantFinal = Math.max(0, effectiveFraisDossier - montantReduction)

        // Incrémenter le nombre d'utilisations du code promo
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } }
        })
      }
    }
  }

  let commissionAmount = 0
  if (programme.etablissement?.commissionValue) {
    if (programme.etablissement.commissionType === 'PERCENTAGE') {
      const tuition = programme.tarifs?.[0]?.montant || 0
      commissionAmount = Math.round(tuition * (programme.etablissement.commissionValue / 100))
    } else {
      commissionAmount = programme.etablissement.commissionValue
    }
  }

  let initialStatus: CandidatureStatus = 'SOUMIS'
  if (montantFinal > 0) {
    initialStatus = 'EN_ATTENTE_PAIEMENT'
  } else {
    initialStatus = 'EN_REVUE_PARTENAIRE'
  }

  const nameParts = (user.name || '').trim().split(/\s+/).filter(Boolean)
  const firstName = (user.firstName || nameParts[0] || '').trim()
  const lastName = (user.lastName || nameParts.slice(1).join(' ') || nameParts[0] || '').trim()
  const email = user.email
  const phone = (user.phone || parsed.data.phone || '').trim()
  const address = (user.address || parsed.data.address || '').trim()
  let rectoUrl = user.identityCardRectoUrl
  let versoUrl = user.identityCardVersoUrl
  let bfemUrl = user.bfemAttestationUrl
  let bacUrl = user.bacTranscriptUrl

  const profilePatch: {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    identityCardRectoUrl?: string
    identityCardVersoUrl?: string
    bfemAttestationUrl?: string
    bacTranscriptUrl?: string
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
    if (!bfemUrl && parsed.data.bfemAttestation) {
      bfemUrl = await saveUserEducationDocument(user.id, 'bfem', parsed.data.bfemAttestation)
      profilePatch.bfemAttestationUrl = bfemUrl
    }
    if (!bacUrl && parsed.data.bacTranscript) {
      bacUrl = await saveUserEducationDocument(user.id, 'bac', parsed.data.bacTranscript)
      profilePatch.bacTranscriptUrl = bacUrl
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur enregistrement des documents.'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  // Document scolaire requis : si le dernier diplôme est BFEM, il faut l'attestation BFEM (ou bac). Sinon le relevé Bac (ou BFEM).
  const hasSchoolDoc = Boolean(bfemUrl || bacUrl)

  if (!firstName || !lastName || !phone || !address || !rectoUrl || !versoUrl || !hasSchoolDoc) {
    const missing: string[] = []
    if (!firstName || !lastName) missing.push('Prénom / Nom')
    if (!phone) missing.push('Téléphone')
    if (!address) missing.push('Adresse (ville, quartier)')
    if (!rectoUrl || !versoUrl) missing.push("Carte d'identité (Recto / Verso)")
    if (!hasSchoolDoc) missing.push('Document scolaire (BAC ou BFEM)')

    throw createError({
      statusCode: 400,
      statusMessage: `Informations manquantes : ${missing.join(', ')}. Veuillez compléter votre dossier.`,
    })
  }

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
      gpa: parsed.data.gpa || 'N/A',
      targetProgram: programme.titre,
      status: initialStatus,
      commissionAmount,
      montantInitial,
      montantReduction,
      montantFinal,
      promoCodeId,
      identityCardRectoUrl: rectoUrl,
      identityCardVersoUrl: versoUrl,
      bfemAttestationUrl: bfemUrl || null,
      bacTranscriptUrl: bacUrl || null,
    },
  })

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
  const formattedFrais = (effectiveFraisDossier || 0).toLocaleString('fr-FR')
  await sendEmail({
    to: { email, name: fullName },
    subject: 'Votre candidature a bien été reçue — BourseFi',
    html: renderEmail({
      title: 'Candidature enregistrée',
      bodyHtml: `<p>Bonjour ${firstName},</p>
        <p>Votre demande de bourse pour <strong>${programme.titre}</strong> a bien été enregistrée.</p>
        ${
          needsPayment
            ? `<p>Pour finaliser votre dossier, il reste à régler les frais de dossier (${formattedFrais} ${programme.devise}) depuis votre espace.</p>`
            : `<p>Votre dossier est transmis pour analyse. Vous serez notifié dès qu'il y a du nouveau.</p>`
        }`,
      ctaLabel: needsPayment ? 'Régler les frais de dossier' : 'Suivre ma candidature',
      ctaUrl: needsPayment ? `${siteUrl}/paiement?candidatureId=${candidature.id}` : `${siteUrl}/etudiant/candidatures`,
    }),
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
      status: initialStatus,
    },
  })

  return {
    ok: true,
    candidature: {
      id: candidature.id,
      status: initialStatus,
      fraisDossier: effectiveFraisDossier || 0,
      devise: programme.devise,
    },
  }
})
