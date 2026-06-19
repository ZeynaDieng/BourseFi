import { randomBytes } from 'node:crypto'
import { getRequestURL } from 'h3'
import { z } from 'zod'
import { requireRole } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import {
  getPaytechConfig,
  isPaytechConfigured,
  mapMethodToTarget,
  requestPayment
} from '../../utils/paytech'
import { finalizePaiement } from '../../utils/paiement-finalize'

const schema = z.object({
  candidatureId: z.string().min(1),
  // Optionnel : si fourni, cible une méthode précise sur PayTech (sinon toutes sont proposées).
  method: z.string().optional().default('')
})

function buildRefCommand() {
  return `BF_${Date.now()}_${randomBytes(4).toString('hex')}`
}

/** En local, les URLs de retour doivent pointer vers localhost pour que l'iframe puisse notifier la page parente. */
function resolveReturnOrigin(event: Parameters<typeof getRequestURL>[0], siteUrl: string): string {
  const requestOrigin = getRequestURL(event).origin
  if (requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1')) {
    return requestOrigin
  }
  return siteUrl.replace(/\/+$/, '')
}

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN'])
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Informations de paiement invalides.' })
  }

  const candidature = await prisma.candidature.findUnique({
    where: { id: parsed.data.candidatureId },
    include: {
      programme: { include: { partner: true } },
      paiement: true
    }
  })

  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }
  if (candidature.userId !== user.id && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Ce dossier ne vous appartient pas.' })
  }
  if (candidature.status !== 'EN_ATTENTE_PAIEMENT') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cette candidature ne necessite pas de paiement a ce stade.'
    })
  }
  if (candidature.paiement && candidature.paiement.status === 'Valide') {
    throw createError({ statusCode: 400, statusMessage: 'Un paiement existe deja pour ce dossier.' })
  }

  const total = candidature.programme.fraisDossier
  if (total <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun frais de dossier a regler.' })
  }

  console.log('[paytech] initier', {
    candidatureId: candidature.id,
    userId: user.id,
    amount: total,
    devise: candidature.programme.devise,
    configured: isPaytechConfigured()
  })

  const pct = Math.min(100, Math.max(0, candidature.programme.partner.partnerSharePercent))
  const amountPartner = Math.round((total * pct) / 100)
  const amountPlatform = total - amountPartner
  const refCommand = buildRefCommand()

  // Coordonnées récupérées depuis la candidature (déjà collectées).
  const fullName = candidature.fullName || `${candidature.firstName} ${candidature.lastName}`.trim()
  const email = candidature.email
  const phone = candidature.phone || ''
  const method = parsed.data.method.trim()

  const paiementData = {
    userId: user.id,
    fullName,
    email,
    phone,
    method: method || 'PayTech',
    amount: total,
    amountPartner,
    amountPlatform,
    currency: candidature.programme.devise,
    status: 'EN_ATTENTE',
    provider: 'paytech',
    refCommand,
    token: null as string | null
  }

  // Réutilise un paiement non validé existant (candidatureId est unique).
  const paiement = candidature.paiement
    ? await prisma.paiement.update({ where: { id: candidature.paiement.id }, data: paiementData })
    : await prisma.paiement.create({ data: { ...paiementData, candidatureId: candidature.id } })

  // Repli dev : sans clés PayTech, on valide directement (comportement historique).
  if (!isPaytechConfigured()) {
    console.warn('[paytech] clés non configurées -> repli dev (validation directe)', {
      candidatureId: candidature.id,
      paiementId: paiement.id
    })
    await finalizePaiement(paiement.id, {
      actorId: user.id,
      actorRole: user.role,
      method: method || 'PayTech'
    })
    return {
      ok: true,
      provider: 'dev',
      redirectUrl: `/paiement?candidatureId=${candidature.id}&status=success`
    }
  }

  const { siteUrl } = getPaytechConfig()
  const returnOrigin = resolveReturnOrigin(event, siteUrl)
  const returnBase = `${returnOrigin}/paiement/retour?candidatureId=${candidature.id}`
  const result = await requestPayment({
    itemName: `Frais de dossier - ${candidature.programme.titre}`,
    itemPrice: total,
    refCommand,
    commandName: `BourseFi - ${candidature.programme.titre}`,
    // Méthode vide => PayTech propose tous les moyens de paiement sur son écran.
    targetPayment: method ? mapMethodToTarget(method) : undefined,
    ipnUrl: `${siteUrl.replace(/\/+$/, '')}/api/paiements/ipn`,
    successUrl: `${returnBase}&status=success`,
    cancelUrl: `${returnBase}&status=cancel`,
    customField: { paiementId: paiement.id, candidatureId: candidature.id },
    customer: {
      phone,
      firstName: candidature.firstName,
      lastName: candidature.lastName
    }
  })

  if (!result.success || !result.redirectUrl) {
    console.error('[paytech] échec initiation -> paiement marqué Echec', {
      candidatureId: candidature.id,
      paiementId: paiement.id,
      refCommand,
      message: result.message
    })
    await prisma.paiement.update({ where: { id: paiement.id }, data: { status: 'Echec' } })
    throw createError({
      statusCode: 502,
      statusMessage: result.message || 'Impossible de joindre la passerelle de paiement.'
    })
  }

  if (result.token) {
    await prisma.paiement.update({ where: { id: paiement.id }, data: { token: result.token } })
  }

  console.log('[paytech] initiation OK -> redirection', {
    candidatureId: candidature.id,
    paiementId: paiement.id,
    refCommand
  })
  return { ok: true, provider: 'paytech', redirectUrl: result.redirectUrl }
})
