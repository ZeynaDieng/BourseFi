import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { rateLimit, rateLimitKey } from '../../utils/rate-limit'
import { sendEmail, renderEmail } from '../../utils/email'
import { generateOneTimeToken, RESET_TOKEN_TTL_MS, siteUrl } from '../../utils/one-time-token'

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide').max(254),
})

/** Réponse unique, que le compte existe ou non (aucun champ conditionnel). */
const PUBLIC_RESPONSE = {
  ok: true,
  message: 'Si cette adresse e-mail existe dans notre système, un lien de réinitialisation vous a été envoyé par e-mail.',
}

export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-forgot-password', 5, 60 * 60 * 1000)
  const body = await readBody(event).catch(() => null)
  const parsed = forgotPasswordSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map(i => i.message).join(', '),
    })
  }

  const cleanEmail = parsed.data.email.toLowerCase()
  rateLimitKey('auth-forgot-password', cleanEmail, 3, 60 * 60 * 1000)

  // Jeton généré dans tous les cas pour limiter les écarts de traitement.
  const { token, tokenHash } = generateOneTimeToken()

  const user = await prisma.user.findFirst({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } },
  })

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: tokenHash, // seul le hash est stocké
        resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    })

    const resetUrl = `${siteUrl()}/auth/reset-password?token=${token}`

    // Envoi non attendu : le temps de réponse ne dépend pas du fournisseur email.
    void sendEmail({
      to: { email: user.email, name: user.name },
      subject: '🔒 Réinitialisation de votre mot de passe - BourseFi',
      html: renderEmail({
        title: 'Réinitialisation de mot de passe',
        bodyHtml: `
          <p>Bonjour <strong>${user.name || user.email}</strong>,</p>
          <p>Vous avez demandé la réinitialisation du mot de passe de votre compte BourseFi.</p>
          <p>Pour choisir un nouveau mot de passe, veuillez cliquer sur le bouton sécurisé ci-dessous. Ce lien est valide pendant <strong>1 heure</strong> et ne peut être utilisé qu’une seule fois.</p>
          <p class="text-xs text-slate-500 mt-4">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel reste inchangé.</p>
        `,
        ctaLabel: 'Réinitialiser mon mot de passe',
        ctaUrl: resetUrl,
      }),
    }).catch((err) => console.warn('[AUTH_FORGOT] Échec envoi email', err))
  }

  return PUBLIC_RESPONSE
})
