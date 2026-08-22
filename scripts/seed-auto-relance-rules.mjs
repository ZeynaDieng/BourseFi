import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultRules = [
  {
    scenarioStep: 1,
    name: 'SCÉNARIO 1 — RELANCE APRÈS 24 HEURES',
    triggerHours: 24,
    channel: 'BOTH',
    codePromo: null,
    messageTemplate: `Bonjour {{prenom}},

Votre demande de bourse pour {{formation}} est toujours en attente de finalisation.

Vous pouvez finaliser votre dossier ici :
{{lien_paiement}}

L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 2,
    name: 'SCÉNARIO 2 — RELANCE APRÈS 72 HEURES',
    triggerHours: 72,
    channel: 'BOTH',
    codePromo: null,
    messageTemplate: `Bonjour {{prenom}},

Nous avons remarqué que votre dossier n'est pas encore finalisé.

Votre bourse reste disponible mais les places sont limitées.

Finalisez votre inscription ici :
{{lien_paiement}}

L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 3,
    name: 'SCÉNARIO 3 — RELANCE AVEC CODE PROMO (J+7)',
    triggerHours: 168,
    channel: 'BOTH',
    codePromo: 'RENTREE2026',
    messageTemplate: `Bonjour {{prenom}},

Pour vous aider à finaliser votre inscription, nous vous offrons exceptionnellement un code promo.

Code : {{code_promo}}

Finalisez votre dossier ici :
{{lien_paiement}}

L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 4,
    name: 'SCÉNARIO 4 — DERNIER RAPPEL (J+15)',
    triggerHours: 360,
    channel: 'BOTH',
    codePromo: null,
    messageTemplate: `Bonjour {{prenom}},

Votre dossier est toujours en attente.

Sans action de votre part, votre place pourrait être réattribuée.

Finalisez votre dossier ici :
{{lien_paiement}}

L'équipe BourseFi.`,
    isActive: true,
  },
]

async function main() {
  console.log('🌱 Seeding Auto-Relance Rules...')
  for (const rule of defaultRules) {
    await prisma.autoRelanceRule.upsert({
      where: { scenarioStep: rule.scenarioStep },
      update: {
        name: rule.name,
        triggerHours: rule.triggerHours,
        channel: rule.channel,
        codePromo: rule.codePromo,
        messageTemplate: rule.messageTemplate,
        isActive: rule.isActive,
      },
      create: rule,
    })
  }
  console.log('✅ Auto-Relance Rules seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
