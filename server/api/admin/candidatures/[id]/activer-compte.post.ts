import { z } from 'zod'
import { prisma } from '../../../../utils/prisma'
import { requireRole } from '../../../../utils/auth'
import { writeAuditLog } from '../../../../utils/audit'
import { sendEmail, renderEmail } from '../../../../utils/email'
import {
  ACTIVATION_TOKEN_TTL_MS, activationUrl, generateOneTimeToken, unusablePasswordHash,
} from '../../../../utils/one-time-token'

/**
 * Aucun mot de passe n'est choisi, généré ou communiqué par l'équipe :
 * l'étudiant reçoit un lien d'activation (jeton aléatoire 256 bits, haché en
 * base, valable 72 h, à usage unique) et définit lui-même son mot de passe.
 * Tout champ `password` envoyé par le frontend est ignoré.
 */
const schema = z.object({
  sendEmail: z.boolean().default(true),
}).passthrough()

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de dossier manquant.' })
  }

  const body = await readBody(event).catch(() => ({}))
  const parsed = schema.safeParse(body || {})
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Données invalides.' })
  }

  const candidature = await prisma.candidature.findUnique({
    where: { id },
    include: { user: true },
  })

  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }

  let user = candidature.user
  const cleanEmail = (candidature.email || user?.email || '').trim().toLowerCase()

  if (!cleanEmail) {
    throw createError({ statusCode: 400, statusMessage: 'Adresse email absente sur le dossier.' })
  }

  if (!user) {
    user = await prisma.user.findFirst({ where: { email: { equals: cleanEmail, mode: 'insensitive' } } })
  }

  const { token, tokenHash } = generateOneTimeToken()
  const tokenData = {
    resetPasswordToken: tokenHash,
    resetPasswordExpires: new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS),
  }

  const isNewAccount = !user
  if (!user) {
    const fn = candidature.firstName || ''
    const ln = candidature.lastName || ''
    const fullName = candidature.fullName || `${fn} ${ln}`.trim() || 'Étudiant'
    user = await prisma.user.create({
      data: {
        name: fullName,
        firstName: fn || null,
        lastName: ln || null,
        email: cleanEmail,
        phone: candidature.phone || null,
        address: candidature.address || null,
        passwordHash: await unusablePasswordHash(),
        role: 'STUDENT',
        emailVerified: true,
        ...tokenData,
      },
    })
  } else {
    // Compte existant : le mot de passe actuel n'est JAMAIS modifié.
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, ...tokenData },
    })
  }

  await prisma.candidature.updateMany({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } },
    data: { userId: user.id },
  })

  let activationEmailSent = false
  if (parsed.data.sendEmail) {
    const studentName = candidature.firstName || candidature.fullName || user.name || 'Étudiant'
    activationEmailSent = await sendEmail({
      to: { email: cleanEmail, name: studentName },
      subject: 'Activez votre espace étudiant BourseFi',
      html: renderEmail({
        title: 'Votre compte étudiant BourseFi est prêt',
        bodyHtml: `<p>Bonjour ${studentName},</p>
          <p>Votre compte étudiant sur la plateforme BourseFi a été activé par notre équipe.</p>
          <p>Pour y accéder, choisissez votre mot de passe personnel via le bouton ci-dessous. Ce lien est <strong>personnel</strong>, valable <strong>72 heures</strong> et utilisable <strong>une seule fois</strong>.</p>
          <p style="color:#64748b;font-size:12px;">${isNewAccount ? '' : 'Vous pouvez aussi continuer à utiliser votre mot de passe actuel. '}BourseFi ne vous demandera jamais votre mot de passe.</p>`,
        ctaLabel: 'Choisir mon mot de passe',
        ctaUrl: activationUrl(token),
      }),
    }).catch(() => false)
  }

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'USER_ACTIVATED_BY_ADMIN',
    entityType: 'User',
    entityId: user.id,
    metadata: { candidatureId: candidature.id, email: cleanEmail, activationEmailSent },
  })

  return {
    ok: true,
    email: cleanEmail,
    emailVerified: true,
    isNewAccount,
    activationEmailSent,
  }
})
