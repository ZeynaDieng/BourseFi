import { prisma } from './prisma'

/** À la connexion d'un étudiant : rattache à son compte les candidatures déposées avec son email. */
export async function linkStudentCandidatures(user: { id: string; role: string; email: string | null }) {
  if (user.role !== 'STUDENT' || !user.email) return
  try {
    await prisma.candidature.updateMany({
      where: {
        email: { equals: user.email.trim(), mode: 'insensitive' },
        userId: { not: user.id },
      },
      data: { userId: user.id },
    })
  } catch (e) {
    console.warn('[AUTH_LOGIN] Auto-sync candidatures:', e)
  }
}
