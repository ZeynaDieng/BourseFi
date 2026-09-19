import type { User } from '@prisma/client'
import { createError } from 'h3'
import { prisma } from './prisma'

function forbidden() {
  throw createError({ statusCode: 403, statusMessage: 'Accès refusé.' })
}

/**
 * Vérifie qu'un utilisateur authentifié peut lire un fichier sous /uploads/{segments}.
 */
export async function assertUploadAccess(user: User | null, segments: string[]) {
  const [kind, resourceId] = segments

  // Les images publiques d'écoles, fiches métiers et témoignages sont librement accessibles
  if (kind === 'ecoles' || kind === 'public' || kind === 'testimonials' || kind === 'metiers') {
    return
  }

  // Pour les documents privés (users, candidatures), l'authentification est obligatoire
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentification requise.' })
  }

  if (user.role === 'ADMIN') return

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
