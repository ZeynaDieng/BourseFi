import { defineNitroPlugin } from 'nitropack/runtime'
import { prisma } from '../utils/prisma'
import { sendEmail, renderEmail } from '../utils/email'

const DEFAULT_RULES = [
  {
    scenarioStep: 1,
    name: 'SCÉNARIO 1 — RELANCE RAPIDE (1H)',
    triggerHours: 1,
    channel: 'EMAIL',
    codePromo: null,
    messageTemplate: `Bonjour {{prenom}},

Vous avez commencé votre inscription pour {{formation}} sur BourseFi mais vous n'avez pas encore finalisé votre paiement.

Vos informations ont bien été conservées. Cliquez ci-dessous pour finaliser votre dossier en 2 minutes :
{{lien_paiement}}

À très vite,
L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 2,
    name: 'SCÉNARIO 2 — RELANCE J+1 (24H)',
    triggerHours: 24,
    channel: 'EMAIL',
    codePromo: null,
    messageTemplate: `Bonjour {{prenom}},

Votre demande de bourse pour {{formation}} est toujours disponible, mais le nombre de places par établissement partenaire est limité.

Vous pouvez réserver définitivement votre place en finalisant ici :
{{lien_paiement}}

Si vous rencontrez des difficultés avec votre règlement (Wave, Orange Money, Carte bancaire), répondez directement à cet email.

Cordialement,
L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 3,
    name: 'SCÉNARIO 3 — RELANCE J+3 AVEC CODE PROMO (72H)',
    triggerHours: 72,
    channel: 'EMAIL',
    codePromo: 'RENTREE2026',
    messageTemplate: `Bonjour {{prenom}},

Pour vous aider à concrétiser votre inscription pour {{formation}}, nous vous offrons exceptionnellement le code promo {{code_promo}} !

Saisissez ce code lors de votre paiement ici :
{{lien_paiement}}

Cette offre est valable pendant 48 heures seulement.

À très bientôt,
L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 4,
    name: 'SCÉNARIO 4 — DERNIER RAPPEL SEMAINE (J+7 / 168H)',
    triggerHours: 168,
    channel: 'EMAIL',
    codePromo: null,
    messageTemplate: `Bonjour {{prenom}},

Ceci est un rappel concernant votre dossier d'inscription pour {{formation}}.

Sans action de votre part, votre place pré-réservée pourra être attribuée à un candidat sur liste d'attente.

Finalisez votre dossier dès maintenant :
{{lien_paiement}}

Excellente journée,
L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 5,
    name: 'SCÉNARIO 5 — RECONQUÊTE 2 SEMAINES (J+14 / 336H)',
    triggerHours: 336,
    channel: 'EMAIL',
    codePromo: 'RENTREE2026',
    messageTemplate: `Bonjour {{prenom}},

Cela fait 2 semaines que vous avez démarré votre candidature pour {{formation}}.

Nous serions ravis de vous compter parmi nos étudiants cette année. Si vous avez des questions sur le programme ou le règlement, répondez directement à cet email.

Vous pouvez toujours finaliser votre inscription avec votre code promo {{code_promo}} ici :
{{lien_paiement}}

À très vite,
L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 6,
    name: 'SCÉNARIO 6 — RELANCE MENSUELLE (J+30 / 720H)',
    triggerHours: 720,
    channel: 'EMAIL',
    codePromo: null,
    messageTemplate: `Bonjour {{prenom}},

Les inscriptions pour la session en cours touchent à leur fin pour {{formation}}.

Si vous souhaitez confirmer votre candidature ou reporter votre rentrée à la session suivante, cliquez sur le lien ci-dessous :
{{lien_paiement}}

Restant à votre disposition,
L'équipe BourseFi.`,
    isActive: true,
  },
]

export default defineNitroPlugin(() => {
  console.log('🤖 [BourseFi Auto-Relance Engine] Nitro Plugin démarré en arrière-plan.')

  async function ensureRulesSeeded() {
    try {
      for (const rule of DEFAULT_RULES) {
        await prisma.autoRelanceRule.upsert({
          where: { scenarioStep: rule.scenarioStep },
          update: {},
          create: rule,
        })
      }
    } catch (err) {
      console.error('⚠️ Erreur lors du seeding des règles auto-relance:', err)
    }
  }

  async function runEngineBackground() {
    try {
      await ensureRulesSeeded()

      const rules = await prisma.autoRelanceRule.findMany({
        where: { isActive: true },
        orderBy: { scenarioStep: 'asc' },
      })

      if (!rules.length) return

      const candidates = await prisma.candidature.findMany({
        where: {
          status: { in: ['EN_ATTENTE_PAIEMENT', 'SOUMIS', 'BROUILLON'] },
          paiement: null,
          isLost: false,
        },
        include: {
          programme: { include: { etablissement: true } },
        },
      })

      const now = new Date()
      let count = 0
      const processedEmails = new Set<string>()

      for (const cand of candidates) {
        const candidateEmail = cand.email.trim().toLowerCase()

        // 1. Éviter d'envoyer plusieurs emails à la même adresse lors du même passage
        if (processedEmails.has(candidateEmail)) {
          continue
        }

        // 2. Sécurité Cooldown : Ne JAMAIS relancer un candidat si une relance automatique a eu lieu il y a moins de 20 heures
        if (cand.lastAutoRelanceAt) {
          const hoursSinceLastRelance = (now.getTime() - new Date(cand.lastAutoRelanceAt).getTime()) / (1000 * 60 * 60)
          if (hoursSinceLastRelance < 20) {
            continue
          }
        }

        // 3. Sécurité Statut : Ne jamais relancer les dossiers finalisés
        if (cand.status === 'ACCEPTE' || cand.status === 'DOCUMENT_EMIS' || cand.status === 'REFUSE' || cand.status === 'TERMINE') {
          continue
        }

        const ageHours = (now.getTime() - new Date(cand.createdAt).getTime()) / (1000 * 60 * 60)

        // 4. Sélection intelligente du scénario approprié
        let targetRule: typeof rules[0] | null = null

        if (cand.autoRelanceStep === 0) {
          // Premier envoi : si le dossier est ancien, sauter directement au scénario correspondant à son âge actuel
          const validRules = rules.filter(r => ageHours >= r.triggerHours)
          if (validRules.length > 0) {
            // Prendre le scénario le plus élevé disponible pour son âge
            targetRule = validRules[validRules.length - 1]
          }
        } else {
          // Relances suivantes : prendre strictement le scénario suivant (cand.autoRelanceStep + 1)
          const nextRule = rules.find(r => r.scenarioStep === cand.autoRelanceStep + 1)
          if (nextRule && ageHours >= nextRule.triggerHours) {
            targetRule = nextRule
          }
        }

        if (!targetRule) continue

        const rule = targetRule
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
              subject: `[BourseFi] ${rule.name.includes('PROMO') ? '🎁 Réduction exclusive :' : 'Finalisez votre inscription pour'} ${formation}`,
              html: htmlContent,
              text,
            })
          } catch (err) {
            console.error(`❌ Erreur relance auto pour ${cand.email}:`, err)
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
            agentName: '🤖 Moteur Marketing BourseFi (Cron 15min)',
            exchangeType: rule.channel === 'WHATSAPP' ? 'WHATSAPP' : rule.channel === 'EMAIL' ? 'EMAIL' : 'SUPPORT',
            content: `[AUTOMATION MARKETING ${rule.name}]\n${text}`,
            nextAction: rule.scenarioStep >= 4 ? 'WAIT_CANDIDATE' : 'SEND_PAYMENT_LINK',
          },
        })

        processedEmails.add(candidateEmail)
        count++
      }

      if (count > 0) {
        console.log(`🤖 [BourseFi Auto-Relance Engine] Relance effectuée pour ${count} candidat(s) abandonné(s).`)
      }
    } catch (err) {
      console.error('❌ Erreur Moteur Auto-Relance en arrière-plan:', err)
    }
  }

  // Démarrage immédiat après 15 secondes
  setTimeout(() => {
    runEngineBackground()
  }, 15000)

  // Exécution automatique toutes les 15 minutes en tâche de fond (100% autonome)
  const INTERVAL_MS = 15 * 60 * 1000
  setInterval(() => {
    runEngineBackground()
  }, INTERVAL_MS)

  console.log('⏱️ [BourseFi Auto-Relance Engine] Cron planifié toutes les 15 minutes (Totalement autonome).')
})

