import { requireRole } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'
import { writeAuditLog } from '../../../utils/audit'
import { notifyStatusChange } from '../../../utils/notifications'
import { sendEmail, renderEmail } from '../../../utils/email'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const body = await readBody(event)

  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    programmeId,
    bourseId,
    lastEducationLevel,
    lastDiploma,
    paymentMethod,
    montantEncaisse,
    password,
  } = body

  if (!firstName || !lastName || !email || !programmeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Veuillez remplir au moins le Prénom, Nom, Email et le Programme.',
    })
  }

  const cleanEmail = String(email).trim().toLowerCase()
  const cleanFirstName = String(firstName).trim()
  const cleanLastName = String(lastName).trim()
  const fullName = `${cleanFirstName} ${cleanLastName}`.trim()
  const cleanPhone = phone ? String(phone).trim() : ''
  const cleanAddress = address ? String(address).trim() : ''

  const finalPassword = password?.trim() || `BourseFi${Math.floor(1000 + Math.random() * 9000)}!`
  const passwordHash = await bcrypt.hash(finalPassword, 10)

  // 1. Trouver ou créer l'utilisateur étudiant (recherche insensible à la casse)
  let user = await prisma.user.findFirst({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } },
  })
  const isNewAccount = !user
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: fullName,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        phone: cleanPhone,
        address: cleanAddress,
        passwordHash,
        role: 'STUDENT',
        emailVerified: true,
      },
    })
  } else {
    // Mise à jour si profil incomplet et s'assurer que le compte est actif
    const patch: Record<string, unknown> = { emailVerified: true }
    if (!user.firstName) patch.firstName = cleanFirstName
    if (!user.lastName) patch.lastName = cleanLastName
    if (!user.phone && cleanPhone) patch.phone = cleanPhone
    if (!user.address && cleanAddress) patch.address = cleanAddress
    // Compte existant : on ne touche JAMAIS au mot de passe de l'étudiant
    await prisma.user.update({ where: { id: user.id }, data: patch })
  }

  // 2. Charger le programme & l'établissement
  const programme = await prisma.programme.findUnique({
    where: { id: programmeId },
    include: { etablissement: true, partner: true },
  })

  if (!programme) {
    throw createError({ statusCode: 404, statusMessage: 'Programme introuvable.' })
  }

  // Vérifier bourse si fournie
  let validBourseId: string | null = null
  if (bourseId) {
    const b = await prisma.bourse.findFirst({
      where: { id: bourseId, programmeId: programme.id },
    })
    if (b) validBourseId = b.id
  }

  const catalogFrais =
    programme.etablissement?.isDirectPartner && programme.etablissement?.fraisDossier !== undefined
      ? programme.etablissement.fraisDossier
      : (programme.fraisDossier ?? 20000)

  const finalAmount = montantEncaisse !== undefined && montantEncaisse !== null
    ? Number(montantEncaisse)
    : catalogFrais

  const year = new Date().getFullYear()
  const rand = Math.floor(100000 + Math.random() * 900000)
  const attestationNumber = `BF-ATT-${year}-${rand}`

  // 3. Créer la candidature avec statut DOCUMENT_EMIS
  const candidature = await prisma.candidature.create({
    data: {
      userId: user.id,
      programmeId: programme.id,
      bourseId: validBourseId,
      partnerId: programme.partnerId,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      fullName,
      email: cleanEmail,
      phone: cleanPhone,
      address: cleanAddress,
      targetProgram: programme.titre,
      institution: programme.etablissement.nom,
      field: programme.titre,
      level: programme.niveau || 'Licence',
      lastEducationLevel: lastEducationLevel || 'Terminal',
      lastDiploma: lastDiploma || 'BAC',
      status: 'DOCUMENT_EMIS',
      attestationNumber,
      attestationIssuedAt: new Date(),
      montantInitial: catalogFrais,
      montantFinal: finalAmount,
      documentUrl: `/api/attestations/placeholder`, // sera résolu par l'ID
    },
  })

  // Mettre à jour l'URL finale de l'attestation avec l'ID réel
  const attestationUrl = `/api/attestations/${candidature.id}`
  await prisma.candidature.update({
    where: { id: candidature.id },
    data: { documentUrl: attestationUrl },
  })

  // Réconcilier tous les autres dossiers éventuels portant cet email vers le compte utilisateur
  await prisma.candidature.updateMany({
    where: {
      email: { equals: cleanEmail, mode: 'insensitive' },
      userId: { not: user.id },
    },
    data: { userId: user.id },
  })

  // 4. Créer le règlement
  const method = paymentMethod || 'ESPÈCES_AGENCE'
  const refCommand = `EXT-DIRECT-${Date.now()}`
  const paiement = await prisma.paiement.create({
    data: {
      userId: user.id,
      candidatureId: candidature.id,
      fullName,
      email: cleanEmail,
      phone: cleanPhone,
      method,
      amount: finalAmount,
      currency: programme.devise || 'FCFA',
      status: 'VALIDE',
      provider: 'manual_admin_direct',
      refCommand,
    },
  })

  // 5. Notifications & Email
  await notifyStatusChange(user.id, 'DOCUMENT_EMIS', candidature.id)

  const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
  await sendEmail({
    to: { email: cleanEmail, name: fullName },
    subject: isNewAccount
      ? 'Votre attestation officielle de bourse & accès étudiant — BourseFi'
      : 'Votre attestation officielle de bourse — BourseFi',
    html: renderEmail({
      title: 'Attestation de bourse émise',
      bodyHtml: `<p>Bonjour ${cleanFirstName},</p>
        <p>Votre demande de bourse pour <strong>${programme.titre}</strong> à <strong>${programme.etablissement.nom}</strong> a été validée et enregistrée.</p>
        <p>Votre attestation officielle (N° <strong>${attestationNumber}</strong>) est prête et téléchargeable.</p>
        ${isNewAccount
          ? `<div style="background:#f1f5f9;padding:14px 18px;border-radius:10px;margin:18px 0;border-left:4px solid #0b1b3a;font-family:Arial,sans-serif;">
          <p style="margin:4px 0;font-size:13px;"><strong>Vos accès à votre espace étudiant :</strong></p>
          <p style="margin:4px 0;font-size:13px;">Identifiant : <strong>${cleanEmail}</strong></p>
          <p style="margin:4px 0;font-size:13px;">Mot de passe : <code>${finalPassword}</code></p>
        </div>`
          : `<p>Elle a été ajoutée à votre espace étudiant existant. Connectez-vous avec votre adresse <strong>${cleanEmail}</strong> et votre mot de passe habituel.</p>`}`,
      ctaLabel: 'Accéder à mon espace étudiant',
      ctaUrl: `${siteUrl}/etudiant/documents`,
    }),
  }).catch((err) => console.warn('Erreur envoi email attestation directe:', err))

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'DIRECT_ATTESTATION_CREATED_BY_ADMIN',
    entityType: 'Candidature',
    entityId: candidature.id,
    metadata: { amount: finalAmount, method, attestationNumber, programmeId },
  })

  return {
    ok: true,
    candidatureId: candidature.id,
    attestationNumber,
    attestationUrl: `/api/attestations/${candidature.id}`,
    paiementId: paiement.id,
    isNewAccount,
    tempPassword: isNewAccount ? finalPassword : null,
  }
})
