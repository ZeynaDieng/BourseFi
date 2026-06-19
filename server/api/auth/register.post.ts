import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { rateLimit } from '../../utils/rate-limit'
import { sendEmail, renderEmail } from '../../utils/email'

const registerSchema = z
  .object({
    name: z.string().min(2).optional(),
    firstName: z.string().min(1).max(80).optional(),
    lastName: z.string().min(1).max(80).optional(),
    email: z.email(),
    password: z.string().min(8),
  })
  .refine((data) => data.name || (data.firstName && data.lastName), {
    message: 'Indiquez votre prénom et nom, ou un nom complet.',
  })

export default defineEventHandler(async (event) => {
  rateLimit(event, 'auth-register', 5, 60 * 60 * 1000)
  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Informations d inscription invalides.' })
  }

  const { email, password } = parsed.data
  const firstName = parsed.data.firstName?.trim() ?? ''
  const lastName = parsed.data.lastName?.trim() ?? ''
  const name =
    parsed.data.name?.trim() ||
    `${firstName} ${lastName}`.trim()
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'Cet email est deja utilise.' })
  }

  const passwordHash = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      firstName: firstName || null,
      lastName: lastName || null,
      email,
      passwordHash,
      role: 'STUDENT',
    },
  })

  await createSession(event, user.id)
  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'AUTH_REGISTER',
    entityType: 'User',
    entityId: user.id,
    metadata: { email: user.email }
  })

  const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
  await sendEmail({
    to: { email: user.email, name: user.name },
    subject: 'Bienvenue sur BourseFi 🎓',
    html: renderEmail({
      title: `Bienvenue ${user.name} !`,
      bodyHtml: `<p>Votre compte BourseFi a bien été créé.</p>
        <p>Vous pouvez dès maintenant explorer les bourses disponibles, déposer votre candidature et suivre l'avancement de vos dossiers depuis votre espace.</p>`,
      ctaLabel: 'Découvrir les bourses',
      ctaUrl: `${siteUrl}/bourses`
    })
  })

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  }
})
