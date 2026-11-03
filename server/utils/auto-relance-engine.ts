import { prisma } from './prisma'
import { sendEmail, renderEmail } from './email'
import { ensureAutoRelanceRulesSeeded } from './auto-relance-seed'
import { writeAuditLog } from './audit'
import { findActiveBourseForDraft, parseApplicationDraft } from './application-draft'
import { attestationPreviewEmailHtml } from './attestation-preview-email'
import {
  BLOCAGE_MESSAGES,
  candidatureRelanceVars,
  fillRelanceTemplate,
  isPromoUsable,
  unsubscribeFooterHtml,
} from './relance-message'

export type RunEngineOptions = {
  force?: boolean
  actorId?: string | null
  actorRole?: string
}

export async function runAutoRelanceEngine(options: RunEngineOptions = {}) {
  const force = Boolean(options.force)

  // 1. Gérer le seeding des règles si la base de données est vide
  await ensureAutoRelanceRulesSeeded()

  const rules = await prisma.autoRelanceRule.findMany({
    where: { isActive: true },
    orderBy: { scenarioStep: 'asc' },
  })

  if (!rules.length) {
    return { ok: true, processed: 0, message: 'Aucune règle de relance active.' }
  }

  const appUrl = (process.env.NUXT_PUBLIC_APP_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')

  // Codes promo des règles : proposés seulement s'ils seront réellement acceptés au paiement
  const promoCodes = [...new Set(rules.map((r) => r.codePromo?.trim().toUpperCase()).filter((c): c is string => Boolean(c)))]
  const promos = promoCodes.length
    ? await prisma.promoCode.findMany({ where: { code: { in: promoCodes } } })
    : []
  const usablePromo = (code: string | null) => {
    const promo = code ? promos.find((p) => p.code === code.trim().toUpperCase()) ?? null : null
    return isPromoUsable(promo) ? promo!.code : null
  }

  // 2. Candidatures en attente de paiement (les seules pour lesquelles le lien de paiement a un sens),
  // non perdues, dont l'étudiant ne s'est pas désabonné
  const candidates = await prisma.candidature.findMany({
    where: {
      status: 'EN_ATTENTE_PAIEMENT',
      isLost: false,
      user: { relancesOptOutAt: null, deactivatedAt: null },
      OR: [
        { paiement: null },
        { paiement: { status: { not: 'Valide' } } },
      ],
    },
    include: {
      programme: { include: { etablissement: true, tarifs: true } },
      bourse: true,
      user: true,
      paiement: true,
    },
  })

  const now = new Date()
  let processedCount = 0
  const logsCreated = []
  const processedEmails = new Set<string>()

  for (const cand of candidates) {
    const candidateEmail = cand.email ? cand.email.trim().toLowerCase() : ''
    if (!candidateEmail) continue

    // Dédoublonnage par email dans une même passe
    if (processedEmails.has(candidateEmail)) continue

    // Cooldown 20h sauf si force = true
    if (!force && cand.lastAutoRelanceAt) {
      const hoursSinceLastRelance = (now.getTime() - new Date(cand.lastAutoRelanceAt).getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastRelance < 20) continue
    }

    const ageHours = (now.getTime() - new Date(cand.createdAt).getTime()) / (1000 * 60 * 60)

    // L'étudiant a indiqué ne pas avoir l'argent pour le moment : pas de relances rapprochées, on attend J+7
    const blocage = cand.blockingReason && cand.blockingReason in BLOCAGE_MESSAGES
      ? (cand.blockingReason as keyof typeof BLOCAGE_MESSAGES)
      : null
    const eligibleRules = blocage === 'FINANCIAL_DIFFICULTY' ? rules.filter((r) => r.triggerHours >= 168) : rules

    // Sélection du scénario : le suivant dans l'ordre des étapes (une étape désactivée ou supprimée est sautée)
    let targetRule: typeof rules[0] | null = null

    if (cand.autoRelanceStep === 0) {
      if (force) {
        targetRule = eligibleRules[0] ?? null
      } else {
        const validRules = eligibleRules.filter(r => ageHours >= r.triggerHours)
        if (validRules.length > 0) {
          targetRule = validRules[validRules.length - 1] ?? null
        }
      }
    } else {
      const nextRule = eligibleRules.find(r => r.scenarioStep > cand.autoRelanceStep)
      if (nextRule && (force || ageHours >= nextRule.triggerHours)) {
        targetRule = nextRule
      }
    }

    if (!targetRule) continue

    const rule = targetRule
    const lienPaiement = `${appUrl}/paiement?candidatureId=${cand.id}`
    const vars = candidatureRelanceVars(cand, { lienPaiement, codePromo: usablePromo(rule.codePromo), now })
    const prenom = vars.prenom!
    const formation = vars.formation!

    // Motif indiqué par l'étudiant (« Je ne peux pas payer maintenant ») : message adapté, sans code promo
    const template = blocage ? BLOCAGE_MESSAGES[blocage] : { subject: rule.subjectTemplate || '', body: rule.messageTemplate }
    const text = fillRelanceTemplate(template.body, blocage ? { ...vars, code_promo: '' } : vars)
    const subject = fillRelanceTemplate(template.subject, vars) || `${prenom}, votre attestation pour ${formation} est prête`

    // Seul l'email part automatiquement (WhatsApp : relance manuelle depuis l'admin)
    let emailSentSuccess = false
    try {
      const htmlContent = renderEmail({
        title: `Votre attestation est prête — ${formation}`,
        bodyHtml: `<p>${text.replace(/\n/g, '<br>')}</p>${attestationPreviewEmailHtml(appUrl)}${unsubscribeFooterHtml(appUrl, cand.email)}`,
        ctaLabel: 'Voir mon attestation →',
        ctaUrl: lienPaiement,
      })

      emailSentSuccess = await sendEmail({
        to: { email: cand.email, name: `${prenom} ${vars.nom ?? ''}`.trim() },
        subject: `[BourseFi] ${subject}`,
        html: htmlContent,
        text,
      })
    } catch (err) {
      console.error(`❌ Erreur email relance auto pour ${cand.email}:`, err)
    }

    const log = await prisma.autoRelanceLog.create({
      data: {
        candidatureId: cand.id,
        scenarioStep: rule.scenarioStep,
        channel: 'EMAIL',
        status: emailSentSuccess ? 'SENT' : 'FAILED',
      },
    })

    await prisma.candidature.update({
      where: { id: cand.id },
      data: {
        autoRelanceStep: rule.scenarioStep,
        lastAutoRelanceAt: now,
        relanceCount: cand.relanceCount + 1,
        lastRelanceAt: now,
        lastChannelUsed: 'EMAIL',
      },
    })

    await prisma.candidatureNote.create({
      data: {
        candidatureId: cand.id,
        agentName: '🤖 Moteur Marketing BourseFi',
        exchangeType: 'EMAIL',
        content: `[AUTOMATION MARKETING ${rule.name}${blocage ? ` — message adapté : ${blocage}` : ''}]\n${text}`,
        nextAction: rule.scenarioStep >= 4 ? 'WAIT_CANDIDATE' : 'SEND_PAYMENT_LINK',
      },
    })

    processedEmails.add(candidateEmail)
    processedCount++
    logsCreated.push(log)
  }

  // 3. Relance des comptes étudiants inscrits SANS aucune candidature
  const registeredUsersWithoutCandidature = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      candidatures: { none: {} },
      relancesOptOutAt: null,
      deactivatedAt: null,
    },
  })

  for (const user of registeredUsersWithoutCandidature) {
    const userEmail = user.email ? user.email.trim().toLowerCase() : ''
    if (!userEmail || processedEmails.has(userEmail)) continue

    if (!force && user.lastAutoRelanceAt) {
      const hoursSinceLastRelance = (now.getTime() - new Date(user.lastAutoRelanceAt).getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastRelance < 20) continue
    }

    const ageHours = (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60)

    let targetRule: typeof rules[0] | null = null

    if (user.autoRelanceStep === 0) {
      if (force) {
        targetRule = rules[0] ?? null
      } else {
        const validRules = rules.filter(r => ageHours >= r.triggerHours)
        if (validRules.length > 0) {
          targetRule = validRules[validRules.length - 1] ?? null
        }
      }
    } else {
      const nextRule = rules.find(r => r.scenarioStep > user.autoRelanceStep)
      if (nextRule && (force || ageHours >= nextRule.triggerHours)) {
        targetRule = nextRule
      }
    }

    if (!targetRule) continue

    const rule = targetRule
    const prenom = user.firstName || user.name.split(' ')[0] || 'Étudiant'
    const nom = user.lastName || ''
    const lienCatalogue = `${appUrl}/bourses`
    const codePromo = usablePromo(rule.codePromo)
    const lignePromo = codePromo ? `Profitez du code promo ${codePromo} lors de votre inscription.` : ''

    // Candidature commencée depuis une bourse : on propose de la terminer plutôt que de renvoyer au catalogue
    const draft = parseApplicationDraft(user.applicationDraft)
    const draftBourse = draft ? await findActiveBourseForDraft(draft.bourseSlug) : null
    const formation = draftBourse?.programme.titre ?? null

    let text: string
    let title: string
    let ctaLabel: string
    let ctaUrl: string
    let subject: string

    if (formation && draftBourse) {
      ctaUrl = `${appUrl}/postuler/${draftBourse.slug}`
      ctaLabel = 'Terminer ma candidature →'
      title = `Votre candidature pour ${formation} vous attend`
      subject = `[BourseFi] ${prenom}, terminez votre candidature pour ${formation}`
      text = `Bonjour ${prenom},

Vous avez commencé votre candidature pour ${formation} sur BourseFi, mais elle n'est pas encore envoyée.

Vos informations sont enregistrées : il ne vous reste que 2 minutes pour la terminer et obtenir votre attestation de bourse.
${ctaUrl}

${lignePromo}

À très bientôt,
L'équipe BourseFi.`
    } else {
      ctaUrl = lienCatalogue
      ctaLabel = 'Découvrir les bourses d\'études →'
      title = `Découvrez nos bourses d'études disponibles — BourseFi`
      subject = `[BourseFi] ${prenom}, choisissez votre formation et bénéficiez de votre bourse`
      text = `Bonjour ${prenom},

Bienvenue sur BourseFi ! Vous avez créé votre compte étudiant mais vous n'avez pas encore sélectionné de formation.

Découvrez des dizaines de formations et bourses d'études disponibles et déposez votre dossier en 2 minutes :
${lienCatalogue}

${lignePromo}

À très bientôt,
L'équipe BourseFi.`
    }

    text = text.replace(/\n{3,}/g, '\n\n')

    let emailSentSuccess = false
    try {
      const htmlContent = renderEmail({
        title,
        bodyHtml: `<p>${text.replace(/\n/g, '<br>')}</p>${unsubscribeFooterHtml(appUrl, user.email)}`,
        ctaLabel,
        ctaUrl,
      })

      emailSentSuccess = await sendEmail({
        to: { email: user.email, name: `${prenom} ${nom}`.trim() },
        subject,
        html: htmlContent,
        text,
      })
    } catch (err) {
      console.error(`❌ Erreur relance compte utilisateur pour ${user.email}:`, err)
    }

    const log = await prisma.autoRelanceLog.create({
      data: {
        userId: user.id,
        scenarioStep: rule.scenarioStep,
        channel: 'EMAIL',
        status: emailSentSuccess ? 'SENT' : 'FAILED',
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: {
        autoRelanceStep: rule.scenarioStep,
        lastAutoRelanceAt: now,
      },
    })

    processedEmails.add(userEmail)
    processedCount++
    logsCreated.push(log)
  }

  try {
    await writeAuditLog({
      actorId: options.actorId ?? null,
      actorRole: options.actorRole ?? 'ANONYMOUS',
      action: 'RUN_AUTO_RELANCE_ENGINE',
      entityType: 'AutoRelanceEngine',
      metadata: { processedCount, force },
    })
  } catch (auditErr) {
    console.error('Audit log error in runAutoRelanceEngine:', auditErr)
  }

  return { ok: true, processed: processedCount, logs: logsCreated }
}
