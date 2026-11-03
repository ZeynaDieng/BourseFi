import { prisma } from './prisma'

/**
 * Messages recommandés (nov. 2026) : parler de ce que l'étudiant gagne, avec des chiffres réels
 * (une ligne dont la donnée manque est retirée), et un seul code promo, au dernier message.
 * L'envoi automatique se fait par email ; WhatsApp reste une relance manuelle depuis l'admin.
 */
export const DEFAULT_AUTO_RELANCE_RULES = [
  {
    scenarioStep: 1,
    name: 'SCÉNARIO 1 — ATTESTATION PRÊTE (1H)',
    triggerHours: 1,
    channel: 'EMAIL',
    codePromo: null,
    subjectTemplate: '{{prenom}}, votre attestation de bourse est prête',
    messageTemplate: `Bonjour {{prenom}},

Votre attestation de bourse pour {{formation}} est prête.
Elle vous fait bénéficier de {{avantage}} sur votre scolarité à {{ecole}}.

Il ne reste qu'à régler les frais de dossier ({{montant}}) pour la télécharger :
{{lien_paiement}}

L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 2,
    name: 'SCÉNARIO 2 — CE QUE VOUS GAGNEZ (24H)',
    triggerHours: 24,
    channel: 'EMAIL',
    codePromo: null,
    subjectTemplate: '{{prenom}}, {{avantage}} sur votre scolarité',
    messageTemplate: `Bonjour {{prenom}},

Grâce à votre bourse, vous bénéficiez de {{avantage}} sur votre scolarité en {{formation}} à {{ecole}}.
Soit {{economie_appui}} en moins à payer.

Les frais de dossier sont de {{montant}}, payables par Wave, Orange Money ou carte bancaire en 2 minutes :
{{lien_paiement}}

L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 3,
    name: 'SCÉNARIO 3 — DATE LIMITE (72H)',
    triggerHours: 72,
    channel: 'EMAIL',
    codePromo: null,
    subjectTemplate: 'Votre attestation pour {{formation}} vous attend',
    messageTemplate: `Bonjour {{prenom}},

Votre attestation de bourse pour {{formation}} vous attend toujours.

Les candidatures pour cette bourse ferment le {{date_limite}}.

Débloquez votre attestation ici :
{{lien_paiement}}

L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 4,
    name: 'SCÉNARIO 4 — BESOIN D’AIDE ? (J+7)',
    triggerHours: 168,
    channel: 'EMAIL',
    codePromo: null,
    subjectTemplate: '{{prenom}}, un souci pour finaliser ?',
    messageTemplate: `Bonjour {{prenom}},

Votre dossier pour {{formation}} n'est pas encore finalisé. Si quelque chose vous bloque, nous sommes là pour vous aider :

- des parents à convaincre ?
- un paiement Wave ou Orange Money qui ne passe pas ?
- une question sur la formation ?

Répondez simplement à cet email, un conseiller vous répond.

Votre attestation :
{{lien_paiement}}

L'équipe BourseFi.`,
    isActive: true,
  },
  {
    scenarioStep: 5,
    name: 'SCÉNARIO 5 — DERNIER MESSAGE + CODE PROMO (J+15)',
    triggerHours: 360,
    channel: 'EMAIL',
    codePromo: 'RENTREE2026',
    subjectTemplate: 'Dernier message pour votre bourse {{formation}}',
    messageTemplate: `Bonjour {{prenom}},

C'est notre dernier message au sujet de votre bourse pour {{formation}}.

Pour vous aider à finaliser, voici un code promo à saisir au paiement : {{code_promo}}

Votre attestation :
{{lien_paiement}}

Nous vous souhaitons une excellente réussite dans vos études.
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

/** Remplace toutes les règles par les messages recommandés (bouton de l'admin). */
export async function resetAutoRelanceRulesToDefaults() {
  await prisma.$transaction([
    prisma.autoRelanceRule.deleteMany({}),
    ...DEFAULT_AUTO_RELANCE_RULES.map((rule) => prisma.autoRelanceRule.create({ data: rule })),
  ])
}
