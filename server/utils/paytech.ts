import { createHash, createHmac } from 'node:crypto'

const PAYTECH_BASE_URL = 'https://paytech.sn/api'

export type PaytechConfig = {
  apiKey: string
  apiSecret: string
  env: 'test' | 'prod'
  siteUrl: string
}

export function getPaytechConfig(): PaytechConfig {
  const config = useRuntimeConfig()
  const env = config.paytechEnv === 'prod' ? 'prod' : 'test'
  return {
    apiKey: String(config.paytechApiKey || ''),
    apiSecret: String(config.paytechApiSecret || ''),
    env,
    siteUrl: String(config.public?.siteUrl || '').replace(/\/+$/, '')
  }
}

export function isPaytechConfigured(): boolean {
  const { apiKey, apiSecret } = getPaytechConfig()
  return apiKey.length > 0 && apiSecret.length > 0
}

/**
 * Mappe le moyen de paiement de l'app vers la valeur target_payment de PayTech.
 * Voir la liste des méthodes dans la doc PayTech.
 */
export function mapMethodToTarget(method: string): string {
  const normalized = method.trim().toLowerCase()
  switch (normalized) {
    case 'wave':
      return 'Wave'
    case 'orange money':
    case 'orange':
      return 'Orange Money'
    case 'free money':
    case 'free':
      return 'Free Money'
    case 'carte bancaire':
    case 'carte':
      return 'Carte Bancaire'
    default:
      return method
  }
}

type RequestPaymentInput = {
  itemName: string
  itemPrice: number
  refCommand: string
  commandName: string
  targetPayment?: string
  ipnUrl: string
  successUrl: string
  cancelUrl: string
  customField: Record<string, unknown>
  customer?: {
    phone?: string
    firstName?: string
    lastName?: string
  }
}

type RequestPaymentResult = {
  success: boolean
  token?: string
  redirectUrl?: string
  message?: string
}

/**
 * Crée une demande de paiement PayTech (POST /payment/request-payment).
 * Ajoute les paramètres d'autofill quand une seule méthode est ciblée.
 */
export async function requestPayment(input: RequestPaymentInput): Promise<RequestPaymentResult> {
  const { apiKey, apiSecret, env } = getPaytechConfig()

  const body: Record<string, unknown> = {
    item_name: input.itemName,
    item_price: input.itemPrice,
    currency: 'XOF',
    ref_command: input.refCommand,
    command_name: input.commandName,
    env,
    ipn_url: input.ipnUrl,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    custom_field: JSON.stringify(input.customField)
  }

  if (input.targetPayment) {
    body.target_payment = input.targetPayment
  }

  console.log('[paytech] POST request-payment', {
    ref_command: input.refCommand,
    item_price: input.itemPrice,
    env,
    target_payment: input.targetPayment || 'all'
  })

  let json: Record<string, unknown>
  try {
    json = await $fetch<Record<string, unknown>>(`${PAYTECH_BASE_URL}/payment/request-payment`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        API_KEY: apiKey,
        API_SECRET: apiSecret
      },
      body
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur réseau PayTech'
    console.error('[paytech] request-payment erreur réseau', { ref_command: input.refCommand, message })
    return { success: false, message }
  }

  if (json?.success !== 1) {
    const message = typeof json?.message === 'string' ? json.message : 'PayTech a refusé la demande de paiement.'
    console.warn('[paytech] request-payment refusé', { ref_command: input.refCommand, message })
    return { success: false, message }
  }

  let redirectUrl = String(json.redirect_url || json.redirectUrl || '')
  const token = String(json.token || '')
  console.log('[paytech] request-payment OK', {
    ref_command: input.refCommand,
    has_token: Boolean(token),
    has_redirect: Boolean(redirectUrl)
  })

  // Autofill uniquement pour une méthode unique (sans virgule)
  const target = input.targetPayment
  if (redirectUrl && target && !target.includes(',') && input.customer?.phone) {
    const phone = input.customer.phone
    const nationalNumber = phone.startsWith('+') ? phone.slice(4) : phone
    const fullName = [input.customer.firstName, input.customer.lastName].filter(Boolean).join(' ').trim()
    const params = new URLSearchParams({
      pn: phone,
      nn: nationalNumber,
      fn: fullName,
      tp: target,
      nac: target === 'Carte Bancaire' ? '0' : '1'
    })
    redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + params.toString()
  }

  return { success: true, token, redirectUrl }
}

type IpnBody = Record<string, unknown>

/**
 * Vérifie l'authenticité d'une notification IPN PayTech.
 * Méthode 1 (recommandée) : HMAC-SHA256 sur `${final_item_price|item_price}|${ref_command}|${api_key}`.
 * Méthode 2 (repli) : comparaison des hachages SHA256 des clés API.
 */
export function verifyIpn(body: IpnBody): boolean {
  const { apiKey, apiSecret } = getPaytechConfig()
  if (!apiKey || !apiSecret) return false

  const hmacCompute = typeof body.hmac_compute === 'string' ? body.hmac_compute : ''

  if (hmacCompute) {
    const price = body.final_item_price ?? body.item_price
    const refCommand = body.ref_command ?? ''
    const message = `${price}|${refCommand}|${apiKey}`
    const expected = createHmac('sha256', apiSecret).update(message).digest('hex')
    return timingSafeEqualHex(expected, hmacCompute)
  }

  const apiKeySha = typeof body.api_key_sha256 === 'string' ? body.api_key_sha256 : ''
  const apiSecretSha = typeof body.api_secret_sha256 === 'string' ? body.api_secret_sha256 : ''
  if (!apiKeySha || !apiSecretSha) return false

  const expectedKey = createHash('sha256').update(apiKey).digest('hex')
  const expectedSecret = createHash('sha256').update(apiSecret).digest('hex')
  return timingSafeEqualHex(expectedKey, apiKeySha) && timingSafeEqualHex(expectedSecret, apiSecretSha)
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

/**
 * Décode le champ custom_field d'un IPN (encodé en Base64 puis JSON).
 * Tolère aussi un JSON brut non encodé.
 */
export function decodeCustomField(raw: unknown): Record<string, unknown> {
  if (typeof raw !== 'string' || raw.length === 0) return {}
  const candidates = [() => Buffer.from(raw, 'base64').toString('utf-8'), () => raw]
  for (const decode of candidates) {
    try {
      const parsed = JSON.parse(decode())
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
    } catch {
      // essaie le candidat suivant
    }
  }
  return {}
}
