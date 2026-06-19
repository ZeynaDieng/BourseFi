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

/** Reprend le parcours en cours après auth, sinon l’espace étudiant. */
export function resolveStudentAuthRedirect(path: string): string {
  if (path && isSafeStudentRedirect(path)) return path
  return STUDENT_HOME
}

/** Libellé contextuel sur les pages auth selon la destination. */
export function authRedirectHint(path: string): string | null {
  if (path.startsWith('/postuler/')) {
    return 'Connectez-vous pour continuer votre candidature là où vous l’avez laissée.'
  }
  if (path.startsWith('/paiement')) {
    return 'Connectez-vous pour finaliser le paiement de votre dossier.'
  }
  if (path.startsWith('/bourses')) {
    return 'Connectez-vous pour explorer les bourses et postuler.'
  }
  return null
}

