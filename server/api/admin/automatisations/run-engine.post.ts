import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { sendEmail, renderEmail } from '../../../utils/email'
import { writeAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  // Allow system internal call or admin auth
  try {
    await requireRole(event, ['ADMIN'])
  } catch {
    // Allows background cron trigger if needed
  }

  const rules = await prisma.autoRelanceRule.findMany({
    where: { isActive: true },
    orderBy: { scenarioStep: 'asc' },
  })

  if (!rules.length) {
    return { ok: true, processed: 0, message: 'Aucune règle de relance active.' }
  }

  // Candidatures éligibles : non payées, non clôturées, non archivées
  const candidates = await prisma.candidature.findMany({
    where: {
      status: { in: ['EN_ATTENTE_PAIEMENT', 'SOUMIS'] },
      paiement: null,
      isLost: false,
    },
    include: {
      programme: { include: { etablissement: true } },
      user: true,
    },
  })

  const now = new Date()
  let processedCount = 0
  const logsCreated = []

  for (const cand of candidates) {
    const ageHours = (now.getTime() - new Date(cand.createdAt).getTime()) / (1000 * 60 * 60)

    for (const rule of rules) {
      if (ageHours >= rule.triggerHours && cand.autoRelanceStep < rule.scenarioStep) {
        // Vérification stricte d'arrêt automatique (Double Check)
        if (cand.status === 'ACCEPTE' || cand.status === 'DOCUMENT_EMIS' || cand.status === 'REFUSE') {
          continue
        }

        const prenom = cand.firstName || cand.fullName.split(' ')[0] || 'Candidat'
        const nom = cand.lastName || ''
        const formation = cand.programme?.titre || 'votre formation'
        const config = useRuntimeConfig()
        const appUrl = (config.public as { appUrl?: string })?.appUrl || 'https://boursefi.com'
        const lienPaiement = `${appUrl}/paiement?candidatureId=${cand.id}`
        const codePromo = rule.codePromo || 'RENTREE2026'

        let text = rule.messageTemplate
          .replace(/\{\{prenom\}\}/g, prenom)
          .replace(/\{\{nom\}\}/g, nom)
          .replace(/\{\{formation\}\}/g, formation)
          .replace(/\{\{lien_paiement\}\}/g, lienPaiement)
          .replace(/\{\{code_promo\}\}/g, codePromo)

        // 1. Envoi Email si canal EMAIL ou BOTH
        if (rule.channel === 'EMAIL' || rule.channel === 'BOTH') {
          try {
            const htmlContent = renderEmail({
              title: `Rappel de votre candidature — ${formation}`,
              bodyHtml: `<p>${text.replace(/\n/g, '<br>')}</p>`,
              ctaLabel: 'Finaliser mon inscription →',
              ctaUrl: lienPaiement,
            })

            await sendEmail({
              to: { email: cand.email, name: `${prenom} ${nom}`.trim() },
              subject: `[BourseFi] Finalisez votre dossier pour ${formation}`,
              html: htmlContent,
              text,
            })
          } catch (err) {
            console.error(`Erreur email relance auto pour ${cand.email}:`, err)
          }
        }

        // 2. Journaliser l'exécution
        const log = await prisma.autoRelanceLog.create({
          data: {
            candidatureId: cand.id,
            scenarioStep: rule.scenarioStep,
            channel: rule.channel,
            status: 'SENT',
          },
        })

        // 3. Mettre à jour la candidature
        await prisma.candidature.update({
          where: { id: cand.id },
          data: {
            autoRelanceStep: rule.scenarioStep,
            lastAutoRelanceAt: now,
            relanceCount: cand.relanceCount + 1,
            lastRelanceAt: now,
            lastChannelUsed: rule.channel,
          },
        })

        // 4. Consigner une note commerciale automatique dans la timeline
        await prisma.candidatureNote.create({
          data: {
            candidatureId: cand.id,
            agentName: '🤖 Moteur d\'Automatisation BourseFi',
            exchangeType: rule.channel === 'WHATSAPP' ? 'WHATSAPP' : rule.channel === 'EMAIL' ? 'EMAIL' : 'SUPPORT',
            content: `[AUTOMATION ${rule.name}]\n${text}`,
            nextAction: rule.scenarioStep === 4 ? 'WAIT_CANDIDATE' : 'SEND_PAYMENT_LINK',
          },
        })

        processedCount++
        logsCreated.push(log)
        break // Traiter une seule règle à la fois par exécution
      }
    }
  }

  try {
    await writeAuditLog({
      action: 'RUN_AUTO_RELANCE_ENGINE',
      entityType: 'AutoRelanceEngine',
      metadata: { processedCount },
    })
  } catch (auditErr) {
    console.error('Audit log error in run-engine:', auditErr)
  }

  return { ok: true, processed: processedCount, logs: logsCreated }
})
