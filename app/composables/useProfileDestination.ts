import { STUDENT_HOME } from '~/utils/routes'

export function useProfileDestination() {
  const { data } = useFetch('/api/auth/me')

  const currentUser = computed(() => data.value?.user ?? null)

  const profileHref = computed(() => {
    const role = currentUser.value?.role
    if (role === 'ADMIN') return '/admin/dashboard'
    if (role === 'PARTNER') return '/partenaire/dashboard'
    if (role === 'STUDENT') return STUDENT_HOME
    return '/auth/login'
  })

  const profileLabel = computed(() => {
    const role = currentUser.value?.role
    if (role === 'STUDENT') return 'Mon profil'
    if (role === 'ADMIN') return 'Administration'
    if (role === 'PARTNER') return 'Espace partenaire'
    return 'Connexion'
  })

  return { currentUser, profileHref, profileLabel }
}
