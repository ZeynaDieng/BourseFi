import nodemailer, { type Transporter } from 'nodemailer'

type SendEmailInput = {
  to: { email: string; name?: string }
  subject: string
  html: string
  text?: string
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

function getEmailConfig() {
  const config = useRuntimeConfig()
  // Même logique que PayTech : process.env runtime > runtimeConfig (NUXT_*) > défaut
  const apiKey = String(process.env.NUXT_BREVO_API_KEY || process.env.BREVO_API_KEY || config.brevoApiKey || '')
  const host = process.env.SMTP_HOST || ''
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''
  const fromEmail = String(process.env.EMAIL_FROM || config.emailFrom || user || 'no-reply@boursefi.sn')
  const fromName = String(process.env.EMAIL_FROM_NAME || config.emailFromName || 'BourseFi')
  const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://boursefi.sn').replace(
    /\/+$/,
    ''
  )
  return { apiKey, host, port, user, pass, fromEmail, fromName, siteUrl }
}

export function isEmailConfigured(): boolean {
  const { apiKey, host, user, pass } = getEmailConfig()
  return Boolean(apiKey || (host && user && pass))
}

let transporter: Transporter | null = null
function getTransporter(): Transporter {
  if (transporter) return transporter
  const { host, port, user, pass } = getEmailConfig()
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL ; 587 = STARTTLS
    auth: { user, pass }
  })
  return transporter
}

/**
 * Enveloppe un contenu HTML dans un layout email simple et responsive,
 * aux couleurs de BourseFi.
 */
export function renderEmail(opts: { title: string; bodyHtml: string; ctaLabel?: string; ctaUrl?: string }): string {
  const { siteUrl } = getEmailConfig()
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<tr><td style="padding:8px 0 4px;">
           <a href="${opts.ctaUrl}" style="display:inline-block;background:#0b1b3a;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px;">${opts.ctaLabel}</a>
         </td></tr>`
      : ''
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#0b1b3a;padding:20px 28px;">
          <a href="${siteUrl}" style="color:#ffffff;font-size:20px;font-weight:800;text-decoration:none;">BourseFi</a>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 14px;font-size:20px;color:#0b1b3a;">${opts.title}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.6;color:#334155;">
            <tr><td>${opts.bodyHtml}</td></tr>
            ${cta}
          </table>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
          BourseFi — Plateforme de bourses au Sénégal.<br>
          Cet email vous est envoyé automatiquement, merci de ne pas y répondre.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

/**
 * Envoie un email transactionnel via Brevo.
 * Utilise l'API HTTP si BREVO_API_KEY est défini, sinon le SMTP (nodemailer).
 * Ne lève jamais : un échec d'email ne doit pas casser le flux métier (inscription, candidature…).
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const { apiKey, fromEmail, fromName } = getEmailConfig()
  if (!isEmailConfigured()) {
    console.warn('[email] non configuré (BREVO_API_KEY ou SMTP_*) -> email ignoré', {
      to: input.to.email,
      subject: input.subject
    })
    return false
  }
  try {
    if (apiKey) {
      await $fetch(BREVO_API_URL, {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: {
          sender: { email: fromEmail, name: fromName },
          to: [{ email: input.to.email, ...(input.to.name ? { name: input.to.name } : {}) }],
          subject: input.subject,
          htmlContent: input.html,
          ...(input.text ? { textContent: input.text } : {})
        }
      })
    } else {
      await getTransporter().sendMail({
        from: { address: fromEmail, name: fromName },
        to: input.to.name ? `"${input.to.name}" <${input.to.email}>` : input.to.email,
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {})
      })
    }
    console.log('[email] envoyé', { to: input.to.email, subject: input.subject })
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[email] échec envoi', { to: input.to.email, subject: input.subject, message })
    return false
  }
}
