import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { computeScholarshipEconomy } from '../../app/utils/scholarship-math'

/**
 * Variables disponibles dans les messages de relance. Toutes sont issues de données réelles :
 * une variable inconnue reste vide, et la ligne qui la contient est retirée du message.
 */
export const RELANCE_VARIABLES = [
  'prenom', 'nom', 'formation', 'ecole', 'pourcentage', 'economie', 'montant', 'date_limite', 'lien_paiement', 'code_promo',
] as const

export type RelanceVars = Partial<Record<(typeof RELANCE_VARIABLES)[number], string>>

/** Remplace les {{variables}} ; retire chaque ligne où une variable utilisée est vide. */
export function fillRelanceTemplate(template: string, vars: RelanceVars): string {
  const lines = template.split('\n').flatMap((line) => {
    let missing = false
    const filled = line.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_m, key: string) => {
      const value = (vars as Record<string, string | undefined>)[key]
      if (!value) missing = true
      return value ?? ''
    })
    return missing ? [] : [filled]
  })
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

const fcfa = (n: number, devise = 'FCFA') => `${n.toLocaleString('fr-FR')} ${devise}`

type PromoRow = { code: string; isActive: boolean; expiresAt: Date | null; maxUses: number | null; usedCount: number } | null

/** Un code promo n'est proposé que s'il sera réellement accepté au paiement. */
export function isPromoUsable(promo: PromoRow, now = new Date()): boolean {
  if (!promo || !promo.isActive) return false
  if (promo.expiresAt && promo.expiresAt <= now) return false
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return false
  return true
}

type CandidatureForVars = {
  firstName: string
  lastName: string
  fullName: string
  targetProgram: string
  montantFinal: number | null
  programme: {
    titre: string
    devise?: string
    fraisDossier?: number | null
    etablissement: { nom: string }
    tarifs?: Array<{ status: string; isDefault: boolean; montant: number; montantBourse: number | null; anneeAcademique: string }>
  } | null
  bourse: { coveragePercent: number; montantMax: number | null; dateLimite: Date } | null
}

export function candidatureRelanceVars(cand: CandidatureForVars, opts: { lienPaiement: string; codePromo?: string | null; now?: Date }): RelanceVars {
  const now = opts.now ?? new Date()
  const programme = cand.programme
  const devise = programme?.devise || 'FCFA'
  const vars: RelanceVars = {
    prenom: cand.firstName || cand.fullName.split(' ')[0] || 'Candidat',
    nom: cand.lastName || '',
    formation: programme?.titre || cand.targetProgram || 'votre formation',
    ecole: programme?.etablissement.nom || '',
    lien_paiement: opts.lienPaiement,
    code_promo: opts.codePromo || '',
  }
  const montant = cand.montantFinal ?? programme?.fraisDossier ?? null
  if (montant && montant > 0) vars.montant = fcfa(montant, devise)

  if (cand.bourse) {
    if (cand.bourse.coveragePercent > 0) vars.pourcentage = String(cand.bourse.coveragePercent)
    if (cand.bourse.dateLimite > now) {
      vars.date_limite = cand.bourse.dateLimite.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Dakar' })
    }
    // Même calcul que la page publique de la bourse (tarif actif par défaut, sinon plafond de la bourse)
    const active = (programme?.tarifs || []).filter((t) => t.status === 'ACTIVE')
    const tarif = active.find((t) => t.isDefault) || active[0] || null
    const economy = computeScholarshipEconomy(
      montant ?? 0,
      cand.bourse.coveragePercent,
      tarif?.montant ?? null,
      tarif?.anneeAcademique ?? null,
      tarif ? tarif.montantBourse : cand.bourse.montantMax,
      devise,
    )
    if (economy.economie && economy.economie > 0) vars.economie = fcfa(economy.economie, devise)
  }
  return vars
}

/** Message adapté au motif indiqué par l'étudiant sur la page de paiement (« Je ne peux pas payer maintenant »). */
export const BLOCAGE_MESSAGES: Record<'PARENT_APPROVAL' | 'TECHNICAL_ISSUE' | 'FINANCIAL_DIFFICULTY', { subject: string; body: string }> = {
  PARENT_APPROVAL: {
    subject: '{{prenom}}, un message tout prêt pour vos parents',
    body: `Bonjour {{prenom}},

Vous nous avez indiqué vouloir d'abord en parler à vos parents. Voici un message que vous pouvez leur transférer :

« Bonjour, j'ai obtenu une bourse d'études pour la formation {{formation}} grâce à BourseFi.
Elle couvre {{pourcentage}} % de ma scolarité à {{ecole}}.
Cela représente une économie de {{economie}}.
Pour recevoir mon attestation de bourse, il faut régler les frais de dossier de {{montant}} (Wave, Orange Money ou carte bancaire). »

Quand vous êtes prêt(e), votre attestation vous attend ici :
{{lien_paiement}}

L'équipe BourseFi.`,
  },
  TECHNICAL_ISSUE: {
    subject: '{{prenom}}, on vous aide à finaliser votre paiement',
    body: `Bonjour {{prenom}},

Vous avez rencontré un problème pour payer vos frais de dossier.
Montant à régler : {{montant}}

Voici comment faire en 3 étapes :

1. Vérifiez que votre compte Wave ou Orange Money est suffisamment approvisionné.
2.Sur l'écran de paiement sécurisé, choisissez votre moyen de paiement puis validez la demande reçue sur votre téléphone.
3. Si cela bloque encore, répondez à cet email avec une capture d'écran : un conseiller vous aide.

Reprendre le paiement :
{{lien_paiement}}

L'équipe BourseFi.`,
  },
  FINANCIAL_DIFFICULTY: {
    subject: '{{prenom}}, votre attestation reste réservée',
    body: `Bonjour {{prenom}},

Votre dossier pour {{formation}} et votre attestation de bourse restent réservés.

Quand vous serez prêt(e), il vous suffira de régler les frais de dossier ({{montant}}) ici :
{{lien_paiement}}

Les candidatures pour cette bourse ferment le {{date_limite}}.

L'équipe BourseFi.`,
  },
}

// ── Désabonnement ────────────────────────────────────────────────────────────

function unsubscribeKey() {
  // Clé dédiée si définie, sinon dérivée (séparation de domaine) d'un secret serveur existant
  const base = process.env.UNSUBSCRIBE_SECRET || process.env.PAYTECH_API_SECRET || process.env.CSRF_SECRET || ''
  return createHash('sha256').update(`boursefi:desabonnement-relances:${base}`).digest()
}

export function unsubscribeToken(email: string) {
  return createHmac('sha256', unsubscribeKey()).update(email.trim().toLowerCase()).digest('base64url')
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = Buffer.from(unsubscribeToken(email))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export function unsubscribeUrl(siteUrl: string, email: string) {
  const e = Buffer.from(email.trim().toLowerCase()).toString('base64url')
  return `${siteUrl.replace(/\/+$/, '')}/desabonnement?e=${e}&t=${unsubscribeToken(email)}`
}

/** Pied d'email des relances : lien de désabonnement (obligatoire pour un email marketing). */
export function unsubscribeFooterHtml(siteUrl: string, email: string) {
  return `<p style="margin-top:24px;color:#94a3b8;font-size:11px;">Vous ne souhaitez plus recevoir ces rappels ? <a href="${unsubscribeUrl(siteUrl, email)}" style="color:#94a3b8;">Se désabonner</a></p>`
}
