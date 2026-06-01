import { getSessionUser } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    return { user: null }
  }

  let partnerName: string | null = null
  if (user.partnerId) {
    const p = await prisma.partner.findUnique({
      where: { id: user.partnerId },
      select: { name: true }
    })
    partnerName = p?.name ?? null
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      partnerId: user.partnerId,
      partnerName
    }
  }
})
