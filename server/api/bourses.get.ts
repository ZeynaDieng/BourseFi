import { prisma } from '../utils/prisma'
import { getSessionUser } from '../utils/auth'
import { bourseInclude, serializeBourse, serializeBourseCard, type BourseCard } from '../utils/bourse-serialize'
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

  const loadRows = () =>
    prisma.bourse.findMany({
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

  // Admin : données complètes, toujours à jour ; public : version « carte » légère, gardée en mémoire
  const serialize = isAdmin ? serializeBourse : serializeBourseCard
  const load = async () => (await loadRows()).map(serialize)
  if (isAdmin) return load()
  return getPublicBourses(`${programmeSlug ?? ''}|${partnerSlug ?? ''}`, load as () => Promise<BourseCard[]>)
})
