import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'
import { findActiveBourseForDraft, parseApplicationDraft } from '../../../utils/application-draft'
import { DRAFT_WHATSAPP_ACTION, whatsappLink } from '../../../utils/whatsapp'

const bodySchema = z.object({ userId: z.string().min(1) })

/** Prépare le message WhatsApp invitant l'étudiant à terminer sa candidature, et trace le contact. */
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Étudiant requis.' })

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } })
  const draft = parseApplicationDraft(user?.applicationDraft)
  if (!user || user.role !== 'STUDENT' || !draft) {
    throw createError({ statusCode: 404, statusMessage: 'Aucune candidature en cours pour cet étudiant.' })
  }
  const bourse = await findActiveBourseForDraft(draft.bourseSlug)
  if (!bourse) throw createError({ statusCode: 409, statusMessage: 'Cette bourse n’est plus active.' })

  const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://boursefi.sn').replace(/\/+$/, '')
  const prenom = user.firstName || user.name.split(' ')[0] || ''
  const formation = bourse.programme.titre
  // Pas de lien d'activation ici : le numéro n'est pas vérifié, ce lien ne doit transiter que par email
  const etapeCompte = user.emailVerified
    ? 'Vos informations sont enregistrées, il ne vous reste que 2 minutes.'
    : 'Activez d’abord votre compte avec le lien reçu par email (pensez à vérifier vos spams), puis terminez votre candidature.'
  const message = `Bonjour ${prenom},

Vous avez commencé votre demande de bourse pour *${formation}* sur BourseFi, mais elle n'est pas encore envoyée.

${etapeCompte}
${siteUrl}/postuler/${bourse.slug}

Besoin d'aide ? Répondez directement à ce message.
L'équipe BourseFi.`

  const url = whatsappLink(draft.fields.phone || user.phone, message)
  if (!url) throw createError({ statusCode: 422, statusMessage: 'Numéro de téléphone manquant ou invalide.' })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: DRAFT_WHATSAPP_ACTION,
    entityType: 'User',
    entityId: user.id,
    metadata: { bourseSlug: bourse.slug },
  })

  return { ok: true, whatsappUrl: url }
})
