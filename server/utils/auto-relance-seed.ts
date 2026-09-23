import { prisma } from './prisma'

export const DEFAULT_AUTO_RELANCE_RULES = [
  {
    scenarioStep: 1,
    name: 'SCÉNARIO 1 — RELANCE RAPIDE (1H)',
    triggerHours: 1,
    channel: 'BOTH',
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
    channel: 'BOTH',
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
    channel: 'BOTH',
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
    channel: 'BOTH',
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
    channel: 'BOTH',
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
    channel: 'BOTH',
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

export async function ensureAutoRelanceRulesSeeded() {
  try {
    const existingCount = await prisma.autoRelanceRule.count()
    if (existingCount === 0) {
      for (const rule of DEFAULT_AUTO_RELANCE_RULES) {
        await prisma.autoRelanceRule.create({
          data: rule,
        })
      }
      console.log('✅ [BourseFi AutoRelance] Rules seeded successfully.')
    }
  } catch (err) {
    console.error('⚠️ [BourseFi AutoRelance] Seeding error:', err)
  }
}
