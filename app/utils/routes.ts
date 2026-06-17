/** Point d’entrée unique de l’espace étudiant connecté. */
export const STUDENT_HOME = '/etudiant/profil' as const

/** Chemins autorisés après connexion étudiant via ?redirect= */
export function isSafeStudentRedirect(path: string): boolean {
  return (
    path.startsWith('/etudiant/') ||
    path.startsWith('/paiement') ||
    path.startsWith('/postuler') ||
    path.startsWith('/bourses')
  )
}
