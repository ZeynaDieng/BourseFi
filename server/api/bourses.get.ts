import { prisma } from '../utils/prisma'
import { getSessionUser } from '../utils/auth'
import { bourseCardQuery, bourseInclude, serializeBourse, serializeBourseCard, type BourseRow } from '../utils/bourse-serialize'
import { getPublicBourses } from '../utils/public-bourses-cache'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const programmeSlug =
    typeof query.programme === 'string' ? query.programme : undefined
  const partnerSlug =
    typeof query.partner === 'string' ? query.partner : undefined

  // `?active=false` (éléments inactifs) est réservé aux administrateurs.
  const wantsInactive = query.active === 'false'
  const viewer = wantsInactive ? await getSessionUser(event) : null
  const isAdmin = viewer?.role === 'ADMIN'
  const activeOnly = !(wantsInactive && isAdmin)

  const where = {
    ...(activeOnly ? { isActive: true } : {}),
    ...(programmeSlug ? { programme: { slug: programmeSlug } } : {}),
    ...(partnerSlug ? { partner: { slug: partnerSlug } } : {}),
  }
  const orderBy = [
    { programme: { etablissement: { isDirectPartner: 'desc' as const } } },
    { dateLimite: 'asc' as const },
    { titre: 'asc' as const },
  ]

  // Admin : données complètes, toujours à jour
  if (isAdmin) {
    const rows = await prisma.bourse.findMany({ where, include: bourseInclude, orderBy })
    return rows.map(serializeBourse)
  }

  // Public : version « carte » légère, gardée en mémoire
  return getPublicBourses(`${programmeSlug ?? ''}|${partnerSlug ?? ''}`, async () => {
    const rows = await prisma.bourse.findMany({ where, ...bourseCardQuery, orderBy })
    // Colonnes longues omises par bourseCardQuery : la carte ne les lit pas
    return rows.map((r) => serializeBourseCard(r as unknown as BourseRow))
  })
})
