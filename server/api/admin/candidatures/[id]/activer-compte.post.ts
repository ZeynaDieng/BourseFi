import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../utils/prisma'
import { requireRole } from '../../../../utils/auth'
import { writeAuditLog } from '../../../../utils/audit'
import { sendEmail, renderEmail } from '../../../../utils/email'

const schema = z.object({
  password: z.string().min(4).optional(),
  sendEmail: z.boolean().default(true),
})

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

  const finalPassword = parsed.data.password?.trim() || `BourseFi${Math.floor(1000 + Math.random() * 9000)}!`
  const passwordHash = await bcrypt.hash(finalPassword, 10)

  let user = candidature.user
  const cleanEmail = (candidature.email || user?.email || '').trim().toLowerCase()

  if (!cleanEmail) {
    throw createError({ statusCode: 400, statusMessage: 'Adresse email absente sur le dossier.' })
  }

  if (!user) {
    // Vérifier si un compte existe déjà avec cette adresse email
    user = await prisma.user.findUnique({ where: { email: cleanEmail } })
  }

  if (!user) {
    // Créer l'utilisateur
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
        passwordHash,
        role: 'STUDENT',
        emailVerified: true,
      },
    })
  } else {
    // Mettre à jour l'utilisateur existant
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerified: true,
      },
    })
  }

  // Rapprocher toutes les candidatures de cet étudiant avec cet id utilisateur (insensible à la casse)
  await prisma.candidature.updateMany({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } },
    data: { userId: user.id },
  })

  // Envoi de l'email officiel d'accès si demandé
  if (parsed.data.sendEmail) {
    const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
    const studentName = candidature.firstName || candidature.fullName || user.name || 'Étudiant'
    try {
      await sendEmail({
        to: { email: cleanEmail, name: studentName },
        subject: 'Vos accès de connexion à votre espace BourseFi',
        html: renderEmail({
          title: 'Votre compte étudiant BourseFi est actif',
          bodyHtml: `<p>Bonjour ${studentName},</p>
            <p>Votre compte étudiant sur la plateforme BourseFi a été activé avec succès par notre équipe administrative.</p>
            <p>Vous pouvez dès maintenant vous connecter pour suivre l'état de votre dossier, accéder à vos reçus et télécharger votre attestation officielle de bourse :</p>
            <div style="background:#f1f5f9;padding:14px 18px;border-radius:10px;margin:18px 0;border-left:4px solid #0b1b3a;font-family:Arial,sans-serif;">
              <p style="margin:4px 0;font-size:13px;"><strong>Identifiant (Email) :</strong> ${cleanEmail}</p>
              <p style="margin:4px 0;font-size:13px;"><strong>Mot de passe :</strong> <code>${finalPassword}</code></p>
            </div>
            <p style="color:#64748b;font-size:12px;">Une fois connecté, vous pourrez modifier votre mot de passe depuis votre profil si vous le souhaitez.</p>`,
          ctaLabel: 'Accéder à mon espace étudiant',
          ctaUrl: `${siteUrl}/login`,
        }),
      })
    } catch (mailErr) {
      console.warn('Erreur lors de l\'envoi de l\'email d\'activation:', mailErr)
    }
  }

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'USER_ACTIVATED_BY_ADMIN',
    entityType: 'User',
    entityId: user.id,
    metadata: {
      candidatureId: candidature.id,
      email: cleanEmail,
    },
  })

  return {
    ok: true,
    email: cleanEmail,
    tempPassword: finalPassword,
    emailVerified: true,
  }
})
