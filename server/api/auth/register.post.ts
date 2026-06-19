import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { createSession } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { sendEmail, renderEmail } from '../../utils/email'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Informations d inscription invalides.' })
  }

  const { name, email, password } = parsed.data
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'Cet email est deja utilise.' })
  }

  const passwordHash = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'STUDENT'
    }
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
      email: user.email,
      role: user.role
    }
  }
})
