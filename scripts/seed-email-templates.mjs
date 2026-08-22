import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultTemplates = [
  {
    name: 'Scénario J+1 — Rappel Finalisation Dossier',
    subject: 'Votre dossier BourseFi est presque finalisé',
    scenarioStep: 1,
    bodyHtml: `Bonjour {{prenom}},

Votre demande de bourse pour {{formation}} ({{ecole}}) est toujours en cours de finalisation.

Il ne reste qu'une seule étape pour sécuriser votre place et valider votre dossier.

Cliquez ci-dessous pour accéder directement à votre espace :
👉 {{lien_paiement}}

Des questions ? Répondez directement à cet email.

L'équipe BourseFi.`,
    bodyText: `Bonjour {{prenom}},\n\nVotre demande de bourse pour {{formation}} est toujours en cours.\n\nIl ne reste qu'une étape pour finaliser votre dossier.\n\n👉 {{lien_paiement}}\n\nL'équipe BourseFi`,
    isActive: true,
  },
  {
    name: 'Scénario J+3 — Places Limitées',
    subject: 'Votre place est toujours réservée',
    scenarioStep: 2,
    bodyHtml: `Bonjour {{prenom}},

Votre dossier pour {{formation}} à {{ecole}} est toujours en attente de validation.

Certaines formations disposent d'un nombre très limité de places réservées par nos établissements partenaires.

Finalisez votre inscription dès maintenant pour ne pas perdre votre opportunité :
👉 {{lien_paiement}}

Cordialement,
L'équipe BourseFi.`,
    bodyText: `Bonjour {{prenom}},\n\nVotre dossier est toujours en attente de validation.\n\nCertaines formations disposent d'un nombre limité de places.\n\nFinalisez votre inscription ici :\n👉 {{lien_paiement}}`,
    isActive: true,
  },
  {
    name: 'Scénario J+7 — Offre Spéciale Code Promo',
    subject: 'Offre spéciale pour finaliser votre inscription',
    scenarioStep: 3,
    bodyHtml: `Bonjour {{prenom}},

Pour vous aider à finaliser votre inscription au programme {{formation}}, nous vous proposons aujourd'hui une offre exceptionnelle.

Utilisez votre code promo exclusif lors du règlement :
🎁 CODE PROMO : {{code_promo}} (-5 000 FCFA)

Finalisez votre dossier à tarif réduit ici :
👉 {{lien_paiement}}

L'équipe BourseFi.`,
    bodyText: `Bonjour {{prenom}},\n\nPour vous aider à finaliser votre inscription, nous vous proposons une offre exceptionnelle.\n\nCode promo : {{code_promo}}\n\nFinalisez votre dossier ici :\n👉 {{lien_paiement}}`,
    isActive: true,
  },
  {
    name: 'Scénario J+15 — Dernier Rappel',
    subject: 'Votre bourse est-elle toujours d\'actualité ?',
    scenarioStep: 4,
    bodyHtml: `Bonjour {{prenom}},

Nous souhaitons savoir si vous êtes toujours intéressé(e) par votre inscription en {{formation}} auprès de {{ecole}}.

Sans action de votre part dans les prochains jours, votre dossier sera classé sans suite et votre place sera réattribuée.

Votre dossier reste accessible en 1 clic ici :
👉 {{lien_paiement}}

Si vous n'êtes plus intéressé(e), vous n'avez rien à faire.

L'équipe BourseFi.`,
    bodyText: `Bonjour {{prenom}},\n\nNous souhaitons savoir si vous êtes toujours intéressé(e) par votre inscription.\n\nVotre dossier reste accessible ici :\n👉 {{lien_paiement}}`,
    isActive: true,
  },
]

async function main() {
  console.log('🌱 Seeding Email Templates...')
  for (const tpl of defaultTemplates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { scenarioStep: tpl.scenarioStep },
    })

    if (existing) {
      await prisma.emailTemplate.update({
        where: { id: existing.id },
        data: tpl,
      })
    } else {
      await prisma.emailTemplate.create({
        data: tpl,
      })
    }
  }
  console.log('✅ Email Templates seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
