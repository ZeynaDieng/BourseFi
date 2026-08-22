import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { sendEmail, renderEmail } from '../../../utils/email'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const body = await readBody(event)
  const promoCode = body?.codePromo || 'RENTREE2026'

  // Candidats dormants sans paiement
  const candidates = await prisma.candidature.findMany({
    where: {
      status: { in: ['EN_ATTENTE_PAIEMENT', 'SOUMIS'] },
      paiement: null,
      isLost: false,
    },
    include: {
      programme: { include: { etablissement: true } },
    },
  })

  let count = 0
  const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'https://boursefi.com'

  for (const cand of candidates) {
    const prenom = cand.firstName || cand.fullName.split(' ')[0] || 'Candidat'
    const formation = cand.programme.titre
    const ecole = cand.programme.etablissement.nom
    const lienPaiement = `${appUrl}/paiement?candidatureId=${cand.id}`

    const subject = `[BourseFi] Votre bourse pour ${formation} est toujours disponible !`
    const textMessage = `Bonjour ${prenom},\n\nVotre demande de bourse pour ${formation} (${ecole}) est toujours en attente de validation.\n\nProfitez exceptionnellement du code promo ${promoCode} (-5 000 FCFA) pour finaliser votre dossier :\n👉 ${lienPaiement}\n\nL'équipe BourseFi.`

    try {
      const htmlContent = renderEmail('Candidature', {
        recipientName: prenom,
        title: `Réactivez votre bourse pour ${formation}`,
        message: textMessage,
        ctaLabel: 'Finaliser mon inscription avec réduction →',
        ctaUrl: lienPaiement,
      })

      await sendEmail({
        to: cand.email,
        subject,
        html: htmlContent,
        text: textMessage,
      })

      await prisma.emailRelanceLog.create({
        data: {
          candidatureId: cand.id,
          subject,
          status: 'SENT',
        },
      })

      await prisma.candidature.update({
        where: { id: cand.id },
        data: {
          emailRelanceStep: (cand.emailRelanceStep || 0) + 1,
          lastEmailRelanceAt: new Date(),
          relanceCount: cand.relanceCount + 1,
        },
      })

      count++
    } catch (e) {
      console.error(`Erreur réactivation email pour ${cand.email}:`, e)
    }
  }

  try {
    await writeAuditLog({
      action: 'LAUNCH_REACTIVATION_CAMPAIGN',
      entityType: 'ReactivationCampaign',
      metadata: { recipientsCount: count, codePromo: promoCode },
    })
  } catch {}

  return { ok: true, count }
})
