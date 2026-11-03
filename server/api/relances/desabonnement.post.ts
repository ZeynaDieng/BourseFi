import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { rateLimit } from '../../utils/rate-limit'
import { writeAuditLog } from '../../utils/audit'
import { verifyUnsubscribeToken } from '../../utils/relance-message'

const bodySchema = z.object({ e: z.string().min(1).max(400), t: z.string().min(1).max(100) })

/** Désabonnement des relances automatiques, depuis le lien signé en bas des emails. */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'relances-desabonnement', 30, 60 * 60 * 1000)
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  const email = parsed.success ? Buffer.from(parsed.data.e, 'base64url').toString('utf8').trim().toLowerCase() : ''
  if (!parsed.success || !email || !verifyUnsubscribeToken(email, parsed.data.t)) {
    throw createError({ statusCode: 400, statusMessage: 'Lien de désabonnement invalide.' })
  }

  const users = await prisma.user.findMany({
    where: { email: { equals: email, mode: 'insensitive' }, relancesOptOutAt: null },
    select: { id: true, role: true },
  })
  if (users.length) {
    await prisma.user.updateMany({ where: { id: { in: users.map((u) => u.id) } }, data: { relancesOptOutAt: new Date() } })
    for (const u of users) {
      await writeAuditLog({ actorId: u.id, actorRole: u.role, action: 'RELANCES_OPT_OUT', entityType: 'User', entityId: u.id })
    }
  }
  return { ok: true }
})
