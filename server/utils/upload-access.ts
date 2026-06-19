import type { User } from '@prisma/client'
import { createError } from 'h3'
import { prisma } from './prisma'

function forbidden() {
  throw createError({ statusCode: 403, statusMessage: 'Accès refusé.' })
}

/**
 * Vérifie qu'un utilisateur authentifié peut lire un fichier sous /uploads/{segments}.
 */
export async function assertUploadAccess(user: User, segments: string[]) {
  if (user.role === 'ADMIN') return

  const [kind, resourceId] = segments
  if (!kind || !resourceId) forbidden()

  if (kind === 'users') {
    if (user.id === resourceId) return
    if (user.role === 'PARTNER' && user.partnerId) {
      const linked = await prisma.candidature.count({
        where: { userId: resourceId, partnerId: user.partnerId },
      })
      if (linked > 0) return
    }
    forbidden()
  }

  if (kind === 'candidatures') {
    const candidature = await prisma.candidature.findUnique({
      where: { id: resourceId },
      select: { userId: true, partnerId: true },
    })
    if (!candidature) {
      throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable.' })
    }
    if (user.id === candidature.userId) return
    if (user.role === 'PARTNER' && user.partnerId === candidature.partnerId) return
    forbidden()
  }

  forbidden()
}
