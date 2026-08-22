import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { rateLimit } from '../../utils/rate-limit'
import { sendEmail, renderEmail } from '../../utils/email'

const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
})

export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-forgot-password', 5, 60 * 60 * 1000)
  const body = await readBody(event)
  const parsed = forgotPasswordSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map(i => i.message).join(', '),
    })
  }

  const { email } = parsed.data
  const cleanEmail = email.trim()
  
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: cleanEmail,
        mode: 'insensitive',
      },
    },
  })

  let emailSent = false

  if (user) {
    const resetToken = randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1h expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    })

    const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
    const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken}`

    emailSent = await sendEmail({
      to: { email: user.email, name: user.name },
      subject: '🔒 Réinitialisation de votre mot de passe - BourseFi',
      html: renderEmail({
        title: 'Réinitialisation de mot de passe',
        bodyHtml: `
          <p>Bonjour <strong>${user.name || user.email}</strong>,</p>
          <p>Vous avez demandé la réinitialisation du mot de passe de votre compte BourseFi.</p>
          <p>Pour choisir un nouveau mot de passe, veuillez cliquer sur le bouton sécurisé ci-dessous. Ce lien est valide pendant <strong>1 heure</strong>.</p>
          <p class="text-xs text-slate-500 mt-4">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel reste inchangé.</p>
        `,
        ctaLabel: 'Réinitialiser mon mot de passe',
        ctaUrl: resetUrl,
      }),
    })
  }

  return {
    ok: true,
    emailSent,
    message: 'Si cette adresse e-mail existe dans notre système, un lien de réinitialisation vous a été envoyé par e-mail.',
  }
})
