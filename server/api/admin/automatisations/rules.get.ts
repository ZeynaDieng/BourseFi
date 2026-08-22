import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  let rules = await prisma.autoRelanceRule.findMany({
    orderBy: { scenarioStep: 'asc' },
  })

  // Fallback if DB wasn't seeded yet
  if (rules.length === 0) {
    rules = [
      {
        id: 'step-1',
        scenarioStep: 1,
        name: 'SCÉNARIO 1 — RELANCE APRÈS 24 HEURES',
        triggerHours: 24,
        channel: 'BOTH',
        codePromo: null,
        messageTemplate: `Bonjour {{prenom}},\n\nVotre demande de bourse pour {{formation}} est toujours en attente de finalisation.\n\nVous pouvez finaliser votre dossier ici :\n{{lien_paiement}}\n\nL'équipe BourseFi.`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'step-2',
        scenarioStep: 2,
        name: 'SCÉNARIO 2 — RELANCE APRÈS 72 HEURES',
        triggerHours: 72,
        channel: 'BOTH',
        codePromo: null,
        messageTemplate: `Bonjour {{prenom}},\n\nNous avons remarqué que votre dossier n'est pas encore finalisé.\n\nVotre bourse reste disponible mais les places sont limitées.\n\nFinalisez votre inscription ici :\n{{lien_paiement}}\n\nL'équipe BourseFi.`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'step-3',
        scenarioStep: 3,
        name: 'SCÉNARIO 3 — RELANCE AVEC CODE PROMO (J+7)',
        triggerHours: 168,
        channel: 'BOTH',
        codePromo: 'RENTREE2026',
        messageTemplate: `Bonjour {{prenom}},\n\nPour vous aider à finaliser votre inscription, nous vous offrons exceptionnellement un code promo.\n\nCode : {{code_promo}}\n\nFinalisez votre dossier ici :\n{{lien_paiement}}\n\nL'équipe BourseFi.`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'step-4',
        scenarioStep: 4,
        name: 'SCÉNARIO 4 — DERNIER RAPPEL (J+15)',
        triggerHours: 360,
        channel: 'BOTH',
        codePromo: null,
        messageTemplate: `Bonjour {{prenom}},\n\nVotre dossier est toujours en attente.\n\nSans action de votre part, votre place pourrait être réattribuée.\n\nFinalisez votre dossier ici :\n{{lien_paiement}}\n\nL'équipe BourseFi.`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  }

  return { ok: true, rules }
})
