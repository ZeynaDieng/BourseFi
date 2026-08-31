import { defineNitroPlugin } from 'nitropack/runtime'
import { prisma } from '../utils/prisma'
import { sendEmail, renderEmail } from '../utils/email'

export default defineNitroPlugin(() => {
  console.log('🤖 [BourseFi Auto-Relance Engine] Nitro Server Plugin Initialized.')

  async function runEngineBackground() {
    try {
      const rules = await prisma.autoRelanceRule.findMany({
        where: { isActive: true },
        orderBy: { scenarioStep: 'asc' },
      })

      if (!rules.length) return

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

      const now = new Date()
      let count = 0

      for (const cand of candidates) {
        const ageHours = (now.getTime() - new Date(cand.createdAt).getTime()) / (1000 * 60 * 60)

        for (const rule of rules) {
          if (ageHours >= rule.triggerHours && cand.autoRelanceStep < rule.scenarioStep) {
            // Arrêt strict si candidature traitée ou paiement effectué
            if (cand.status === 'ACCEPTE' || cand.status === 'DOCUMENT_EMIS' || cand.status === 'REFUSE') {
              continue
            }

            const prenom = cand.firstName || cand.fullName.split(' ')[0] || 'Candidat'
            const nom = cand.lastName || ''
            const formation = cand.programme?.titre || 'votre formation'
            const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'https://boursefi.sn'
            const lienPaiement = `${appUrl}/paiement?candidatureId=${cand.id}`
            const codePromo = rule.codePromo || 'RENTREE2026'

            let text = rule.messageTemplate
              .replace(/\{\{prenom\}\}/g, prenom)
              .replace(/\{\{nom\}\}/g, nom)
              .replace(/\{\{formation\}\}/g, formation)
              .replace(/\{\{lien_paiement\}\}/g, lienPaiement)
              .replace(/\{\{code_promo\}\}/g, codePromo)

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
                console.error(`Erreur relance auto pour ${cand.email}:`, err)
              }
            }

            await prisma.autoRelanceLog.create({
              data: {
                candidatureId: cand.id,
                scenarioStep: rule.scenarioStep,
                channel: rule.channel,
                status: 'SENT',
              },
            })

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

            await prisma.candidatureNote.create({
              data: {
                candidatureId: cand.id,
                agentName: '🤖 Moteur d\'Automatisation BourseFi (15h00)',
                exchangeType: rule.channel === 'WHATSAPP' ? 'WHATSAPP' : rule.channel === 'EMAIL' ? 'EMAIL' : 'SUPPORT',
                content: `[AUTOMATION 15H00 ${rule.name}]\n${text}`,
                nextAction: rule.scenarioStep === 4 ? 'WAIT_CANDIDATE' : 'SEND_PAYMENT_LINK',
              },
            })

            count++
            break
          }
        }
      }
      console.log(`🤖 [BourseFi Auto-Relance Engine] Exécution terminée (${count} candidats relancés).`)
    } catch (err) {
      console.error('Error in background Auto-Relance Engine:', err)
    }
  }

  function scheduleDailyAt15h() {
    const now = new Date()
    const nextRun = new Date()
    nextRun.setHours(15, 0, 0, 0)

    if (now.getTime() >= nextRun.getTime()) {
      nextRun.setDate(nextRun.getDate() + 1)
    }

    const msUntilNextRun = nextRun.getTime() - now.getTime()
    const minutes = Math.round(msUntilNextRun / 1000 / 60)
    console.log(`🤖 [BourseFi Auto-Relance Engine] Prochaine relance automatique 15h00 le ${nextRun.toLocaleDateString('fr-FR')} à 15h00 (dans ${minutes} min).`)

    setTimeout(async () => {
      console.log('⏰ [15h00] Lancement du moteur quotidien de relance automatique...')
      await runEngineBackground()
      scheduleDailyAt15h()
    }, msUntilNextRun)
  }

  // Exécution initiale 1 min après le démarrage + planification quotidienne fixe à 15h00
  setTimeout(() => {
    runEngineBackground()
    scheduleDailyAt15h()
  }, 60000)
})
