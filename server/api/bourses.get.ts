import { prisma } from '../utils/prisma'
import { bourseInclude, serializeBourse } from '../utils/bourse-serialize'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const programmeSlug =
    typeof query.programme === 'string' ? query.programme : undefined
  const partnerSlug =
    typeof query.partner === 'string' ? query.partner : undefined
  const activeOnly = query.active !== 'false'

  const rows = await prisma.bourse.findMany({
    where: {
      ...(activeOnly ? { isActive: true } : {}),
      ...(programmeSlug
        ? { programme: { slug: programmeSlug } }
        : {}),
      ...(partnerSlug ? { partner: { slug: partnerSlug } } : {}),
    },
    include: bourseInclude,
    orderBy: [{ dateLimite: 'asc' }, { titre: 'asc' }],
  })

  return rows.map(serializeBourse)
})
