import { prisma } from './prisma'
import { sendEmail, renderEmail } from './email'
import { ensureAutoRelanceRulesSeeded } from './auto-relance-seed'
import { writeAuditLog } from './audit'
import { findActiveBourseForDraft, parseApplicationDraft } from './application-draft'
import { attestationPreviewEmailHtml } from './attestation-preview-email'

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

  // 2. Récupérer les candidatures éligibles aux relances :
  // non payées (soit pas de paiement, soit paiement.status !== 'Valide'), non rejetées/finalisées, non perdues
  const candidates = await prisma.candidature.findMany({
    where: {
      status: { in: ['SOUMIS', 'EN_ATTENTE_PAIEMENT', 'BROUILLON', 'EN_REVUE_PARTENAIRE', 'COMPLEMENT_DEMANDE'] },
      isLost: false,
      OR: [
        { paiement: null },
        { paiement: { status: { not: 'Valide' } } },
      ],
    },
    include: {
      programme: { include: { etablissement: true } },
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

    // Ignorer les dossiers déjà validés / annulés / archivés
    if (['ACCEPTE', 'DOCUMENT_EMIS', 'REFUSE', 'TERMINE'].includes(cand.status)) {
      continue
    }

    const ageHours = (now.getTime() - new Date(cand.createdAt).getTime()) / (1000 * 60 * 60)

    // Sélection du scénario
    let targetRule: typeof rules[0] | null = null

    if (cand.autoRelanceStep === 0) {
      if (force) {
        // En mode forcé, commencer par l'étape 1
        targetRule = rules.find(r => r.scenarioStep === 1) || rules[0]
      } else {
        const validRules = rules.filter(r => ageHours >= r.triggerHours)
        if (validRules.length > 0) {
          targetRule = validRules[validRules.length - 1]
        }
      }
    } else {
      const nextRule = rules.find(r => r.scenarioStep === cand.autoRelanceStep + 1)
      if (nextRule && (force || ageHours >= nextRule.triggerHours)) {
        targetRule = nextRule
      }
    }

    if (!targetRule) continue

    const rule = targetRule
    const prenom = cand.firstName || cand.fullName.split(' ')[0] || 'Candidat'
    const nom = cand.lastName || ''
    const formation = cand.programme?.titre || cand.targetProgram || 'votre formation'
    const appUrl = (process.env.NUXT_PUBLIC_APP_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
    const lienPaiement = `${appUrl}/paiement?candidatureId=${cand.id}`
    const codePromo = rule.codePromo || 'RENTREE2026'

    let text = rule.messageTemplate
      .replace(/\{\{prenom\}\}/g, prenom)
      .replace(/\{\{nom\}\}/g, nom)
      .replace(/\{\{formation\}\}/g, formation)
      .replace(/\{\{lien_paiement\}\}/g, lienPaiement)
      .replace(/\{\{code_promo\}\}/g, codePromo)

    let emailSentSuccess = false
    // En attente de paiement, l'attestation est prête et visible en aperçu sur la page de paiement
    const attestationPrete = cand.status === 'EN_ATTENTE_PAIEMENT'

    if (rule.channel === 'EMAIL' || rule.channel === 'BOTH') {
      try {
        const htmlContent = renderEmail({
          title: attestationPrete ? `Votre attestation est prête — ${formation}` : `Rappel de votre candidature — ${formation}`,
          bodyHtml: `<p>${text.replace(/\n/g, '<br>')}</p>${attestationPrete ? attestationPreviewEmailHtml(appUrl) : ''}`,
          ctaLabel: attestationPrete ? 'Voir mon attestation →' : 'Finaliser mon inscription →',
          ctaUrl: lienPaiement,
        })

        emailSentSuccess = await sendEmail({
          to: { email: cand.email, name: `${prenom} ${nom}`.trim() },
          subject: rule.name.includes('PROMO')
            ? `[BourseFi] 🎁 Réduction exclusive : ${formation}`
            : attestationPrete
              ? `[BourseFi] ${prenom}, votre attestation pour ${formation} est prête`
              : `[BourseFi] Finalisez votre inscription pour ${formation}`,
          html: htmlContent,
          text,
        })
      } catch (err) {
        console.error(`❌ Erreur email relance auto pour ${cand.email}:`, err)
      }
    } else {
      emailSentSuccess = true
    }

    const log = await prisma.autoRelanceLog.create({
      data: {
        candidatureId: cand.id,
        scenarioStep: rule.scenarioStep,
        channel: rule.channel,
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
        lastChannelUsed: rule.channel,
      },
    })

    await prisma.candidatureNote.create({
      data: {
        candidatureId: cand.id,
        agentName: '🤖 Moteur Marketing BourseFi',
        exchangeType: rule.channel === 'WHATSAPP' ? 'WHATSAPP' : rule.channel === 'EMAIL' ? 'EMAIL' : 'SUPPORT',
        content: `[AUTOMATION MARKETING ${rule.name}]\n${text}`,
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
        targetRule = rules.find(r => r.scenarioStep === 1) || rules[0]
      } else {
        const validRules = rules.filter(r => ageHours >= r.triggerHours)
        if (validRules.length > 0) {
          targetRule = validRules[validRules.length - 1]
        }
      }
    } else {
      const nextRule = rules.find(r => r.scenarioStep === user.autoRelanceStep + 1)
      if (nextRule && (force || ageHours >= nextRule.triggerHours)) {
        targetRule = nextRule
      }
    }

    if (!targetRule) continue

    const rule = targetRule
    const prenom = user.firstName || user.name.split(' ')[0] || 'Étudiant'
    const nom = user.lastName || ''
    const appUrl = (process.env.NUXT_PUBLIC_APP_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
    const lienCatalogue = `${appUrl}/bourses`
    const codePromo = rule.codePromo || 'RENTREE2026'
    const lignePromo = rule.codePromo ? `🎁 Profitez du code promo ${codePromo} lors de votre inscription !` : ''

    // Candidature commencée depuis une bourse : on propose de la terminer plutôt que de renvoyer au catalogue
    const draft = parseApplicationDraft(user.applicationDraft)
    const draftBourse = draft ? await findActiveBourseForDraft(draft.bourseSlug) : null
    const formation = draftBourse?.programme.titre ?? null
    // Compte non activé : la connexion est refusée tant que l'email n'est pas vérifié, on renvoie donc son lien d'activation
    const lienActivation = !user.emailVerified && user.emailVerificationToken
      ? `${appUrl}/auth/verify-email?token=${user.emailVerificationToken}`
      : null

    let text: string
    let title: string
    let ctaLabel: string
    let ctaUrl: string
    let subject: string

    if (formation && draftBourse) {
      ctaUrl = lienActivation ?? `${appUrl}/postuler/${draftBourse.slug}`
      ctaLabel = lienActivation ? 'Activer mon compte et terminer ma candidature →' : 'Terminer ma candidature →'
      title = `Votre candidature pour ${formation} vous attend`
      subject = `[BourseFi] ${prenom}, terminez votre candidature pour ${formation}`
      text = `Bonjour ${prenom},

Vous avez commencé votre candidature pour ${formation} sur BourseFi, mais elle n'est pas encore envoyée.

${lienActivation
  ? `Il vous reste à activer votre compte : le lien ci-dessous l'active et vous ramène directement à votre candidature.`
  : `Vos informations sont enregistrées : il ne vous reste que 2 minutes pour la terminer et obtenir votre attestation de bourse.`}
${ctaUrl}

${lignePromo}

À très bientôt,
L'équipe BourseFi.`
    } else if (lienActivation) {
      ctaUrl = lienActivation
      ctaLabel = 'Activer mon compte →'
      title = 'Activez votre compte BourseFi'
      subject = `[BourseFi] ${prenom}, activez votre compte pour déposer votre candidature`
      text = `Bonjour ${prenom},

Vous avez créé votre compte étudiant BourseFi mais il n'est pas encore activé.

Activez-le en un clic pour choisir votre formation et déposer votre dossier en 2 minutes :
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

    let emailSentSuccess = false

    if (rule.channel === 'EMAIL' || rule.channel === 'BOTH') {
      try {
        const htmlContent = renderEmail({
          title,
          bodyHtml: `<p>${text.replace(/\n/g, '<br>')}</p>`,
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
    } else {
      emailSentSuccess = true
    }

    const log = await prisma.autoRelanceLog.create({
      data: {
        userId: user.id,
        scenarioStep: rule.scenarioStep,
        channel: rule.channel,
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
