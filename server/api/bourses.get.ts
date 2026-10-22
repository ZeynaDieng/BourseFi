import { prisma } from '../utils/prisma'
import { getSessionUser } from '../utils/auth'
import { bourseInclude, serializeBourse, serializePublicBourse } from '../utils/bourse-serialize'

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

  const rows = await prisma.bourse.findMany({
    where: {
      ...(activeOnly ? { isActive: true } : {}),
      ...(programmeSlug
        ? { programme: { slug: programmeSlug } }
        : {}),
      ...(partnerSlug ? { partner: { slug: partnerSlug } } : {}),
    },
    include: bourseInclude,
    orderBy: [{ programme: { etablissement: { isDirectPartner: 'desc' } } }, { dateLimite: 'asc' }, { titre: 'asc' }],
  })

  return rows.map(isAdmin ? serializeBourse : serializePublicBourse)
})
