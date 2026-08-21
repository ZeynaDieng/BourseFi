import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'
import { sendEmail, renderEmail } from '../../../utils/email'

const relancerSchema = z.object({
  candidatureId: z.string().min(1, 'Candidature ID requis.'),
  channel: z.enum(['WHATSAPP', 'EMAIL', 'SMS']).default('WHATSAPP'),
  codePromo: z.string().optional().nullable(),
  customMessage: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const body = await readBody(event)
  const parsed = relancerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Données invalides : ' + parsed.error.issues.map((i) => i.message).join(', '),
    })
  }

  const candidature = await prisma.candidature.findUnique({
    where: { id: parsed.data.candidatureId },
    include: {
      programme: { include: { etablissement: true } },
      user: true,
    },
  })

  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }

  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn'
  const paymentUrl = `${baseUrl}/paiement?candidatureId=${candidature.id}`
  const prenom = candidature.firstName || candidature.fullName.split(' ')[0] || 'Étudiant'
  const formation = candidature.targetProgram
  const ecole = candidature.programme.etablissement.nom
  const montantAregler = candidature.montantFinal ?? candidature.programme.fraisDossier ?? candidature.programme.etablissement.fraisDossier ?? 20000

  // Formatage du numéro de téléphone international
  let cleanPhone = (candidature.phone || candidature.user.phone || '').replace(/\D/g, '')
  if (cleanPhone.startsWith('7') || cleanPhone.startsWith('77') || cleanPhone.startsWith('78') || cleanPhone.startsWith('76') || cleanPhone.startsWith('70') || cleanPhone.startsWith('75')) {
    if (cleanPhone.length === 9) cleanPhone = '221' + cleanPhone
  }

  let messageText = parsed.data.customMessage

  if (!messageText) {
    if (parsed.data.codePromo) {
      messageText = `Bonjour ${prenom} 👋\n\nVotre demande de bourse pour ${formation} à ${ecole} est presque finalisée.\n\n🎁 Bonne nouvelle : profitez du code promo *${parsed.data.codePromo}* pour réduire vos frais de dossier !\n\nFinalisez votre inscription ici :\n👉 ${paymentUrl}\n\nL'équipe BourseFi.`
    } else {
      messageText = `Bonjour ${prenom} 👋\n\nVotre demande de bourse pour ${formation} est presque enregistrée.\n\nIl ne vous reste qu'une dernière étape (${montantAregler.toLocaleString('fr-FR')} FCFA) pour débloquer votre attestation d'admission officielle.\n\nFinalisez votre dossier ici :\n👉 ${paymentUrl}\n\nBesoin d'aide ? Répondez directement à ce message.\nL'équipe BourseFi.`
    }
  }

  let whatsappUrl: string | null = null

  if (parsed.data.channel === 'WHATSAPP') {
    whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
  } else if (parsed.data.channel === 'EMAIL') {
    const htmlEmail = renderEmail({
      title: `Rappel : Votre candidature pour ${formation}`,
      bodyHtml: `
        <p>Bonjour <strong>${prenom}</strong>,</p>
        <p>Nous avons bien reçu votre demande de bourse d'études pour la formation <strong>${formation}</strong> à l'école <strong>${ecole}</strong>.</p>
        <p>Votre dossier est actuellement en attente de finalisation des frais de dossier (${montantAregler.toLocaleString('fr-FR')} FCFA).</p>
        ${parsed.data.codePromo ? `<div style="background-color:#ecfdf5;border:1px solid #a7f3d0;padding:12px;border-radius:8px;margin:16px 0;"><strong>🎁 Code promo exclusif :</strong> Utilisez le code <strong>${parsed.data.codePromo}</strong> lors du paiement pour bénéficier immédiatement de votre réduction.</div>` : ''}
        <p>Cliquez sur le bouton ci-dessous pour finaliser votre règlement et obtenir instantanément votre attestation officielle BourseFi :</p>
      `,
      ctaLabel: 'Finaliser mon dossier',
      ctaUrl: paymentUrl,
    })

    await sendEmail({
      to: { email: candidature.email, name: candidature.fullName },
      subject: `Relance BourseFi : Finalisez votre dossier pour ${formation}`,
      html: htmlEmail,
    })
  }

  // Mises à jour en base de données
  const updatedCandidature = await prisma.candidature.update({
    where: { id: candidature.id },
    data: {
      relanceCount: { increment: 1 },
      lastRelanceAt: new Date(),
      lastChannelUsed: parsed.data.channel,
    },
  })

  // Enregistrement d'une note automatique dans l'historique CRM
  const autoNote = await prisma.candidatureNote.create({
    data: {
      candidatureId: candidature.id,
      agentName: admin.name || admin.email || 'Admin BourseFi',
      exchangeType: parsed.data.channel === 'WHATSAPP' ? 'WHATSAPP' : parsed.data.channel === 'EMAIL' ? 'EMAIL' : 'SUPPORT',
      content: `Relance ${parsed.data.channel} effectuée par ${admin.name || 'l\'admin'}.${parsed.data.codePromo ? ` Code promo offert: ${parsed.data.codePromo}.` : ''}`,
      interestLevel: candidature.interestLevel || 'HOT_MED',
      blockingReason: candidature.blockingReason || undefined,
      nextAction: 'WAIT_CANDIDATE',
    },
  })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'CRM_RELANCE_SENT',
    entityType: 'Candidature',
    entityId: candidature.id,
    metadata: {
      channel: parsed.data.channel,
      codePromo: parsed.data.codePromo || null,
      relanceCount: updatedCandidature.relanceCount,
      noteId: autoNote.id,
    },
  })

  return {
    ok: true,
    channel: parsed.data.channel,
    relanceCount: updatedCandidature.relanceCount,
    whatsappUrl,
    messageText,
  }
})
