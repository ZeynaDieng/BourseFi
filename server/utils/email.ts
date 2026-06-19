const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

type SendEmailInput = {
  to: { email: string; name?: string }
  subject: string
  html: string
  text?: string
}

function getEmailConfig() {
  const apiKey = process.env.BREVO_API_KEY || process.env.NUXT_BREVO_API_KEY || ''
  const fromEmail = process.env.EMAIL_FROM || 'no-reply@boursefi.sn'
  const fromName = process.env.EMAIL_FROM_NAME || 'BourseFi'
  const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://boursefi.sn').replace(
    /\/+$/,
    ''
  )
  return { apiKey, fromEmail, fromName, siteUrl }
}

export function isEmailConfigured(): boolean {
  return Boolean(getEmailConfig().apiKey)
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
 * Envoie un email transactionnel via l'API Brevo.
 * Ne lève jamais : un échec d'email ne doit pas casser le flux métier (inscription, candidature…).
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const { apiKey, fromEmail, fromName } = getEmailConfig()
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY absent -> email ignoré', { to: input.to.email, subject: input.subject })
    return false
  }
  try {
    await $fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: {
        sender: { email: fromEmail, name: fromName },
        to: [{ email: input.to.email, ...(input.to.name ? { name: input.to.name } : {}) }],
        subject: input.subject,
        htmlContent: input.html,
        ...(input.text ? { textContent: input.text } : {})
      }
    })
    console.log('[email] envoyé', { to: input.to.email, subject: input.subject })
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[email] échec envoi', { to: input.to.email, subject: input.subject, message })
    return false
  }
}
