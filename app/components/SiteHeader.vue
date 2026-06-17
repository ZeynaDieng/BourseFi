<script setup lang="ts">
import { STUDENT_HOME } from '~/utils/routes'

const route = useRoute()
const { data } = await useFetch('/api/auth/me')
const { profileHref, profileLabel } = useProfileDestination()

const links = [
  { to: '/', label: 'Accueil', mobileLabel: 'Accueil', exact: true },
  { to: '/bourses', label: 'Bourses disponibles', mobileLabel: 'Bourses' },
  { to: '/ecoles', label: 'Écoles partenaires', mobileLabel: 'Écoles' },
  { to: '/candidature', label: 'Comment ça marche', mobileLabel: 'Aide' },
]

const isActive = (to: string | { path?: string }, exact = false) => {
  const path =
    typeof to === 'string'
      ? to
      : typeof to.path === 'string'
        ? to.path
        : '/'
  if (exact || path === '/') return route.path === path
  return route.path.startsWith(path)
}

const currentUser = computed(() => data.value?.user || null)
const isStudent = computed(() => currentUser.value?.role === 'STUDENT')

const { data: notifData, refresh: refreshNotifs } = useFetch('/api/notifications', {
  immediate: false,
  server: false,
})

watch(
  isStudent,
  (v) => {
    if (v) void refreshNotifs()
  },
  { immediate: true },
)

const unreadNotifs = computed(() => notifData.value?.unreadCount ?? 0)
const isProfileActive = computed(() => route.path === profileHref.value)

const isHome = computed(() => route.path === '/')

const loginHref = computed(() => ({
  path: '/auth/login',
  query: { redirect: STUDENT_HOME },
}))

const logoImgClass = computed(() =>
  isHome.value
    ? 'h-12 w-auto max-h-12 md:h-14 md:max-h-14 lg:h-16 lg:max-h-16 object-contain object-left'
    : 'h-10 w-auto max-h-10 md:h-12 md:max-h-12 lg:h-14 lg:max-h-14 object-contain object-left',
)

const headerBarClass = computed(() =>
  isHome.value
    ? 'min-h-[5rem] py-2.5 md:min-h-[5.25rem]'
    : 'min-h-[4rem] py-2 md:min-h-[4.5rem]',
)
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-premium backdrop-blur-md"
  >
    <div
      class="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 lg:px-8"
      :class="headerBarClass"
    >
      <AppBrandLogo to="/" :img-class="logoImgClass" />
      <nav class="hidden items-center gap-8 md:flex">
        <NuxtLink
          v-for="link in links"
          :key="
            typeof link.to === 'string'
              ? link.to
              : link.to.path + (link.to.hash || '')
          "
          :to="link.to"
          class="border-b-2 pb-1 text-sm font-semibold transition"
          :class="
            isActive(link.to, 'exact' in link && link.exact)
              ? 'border-secondary text-primary'
              : 'border-transparent text-slate-600 hover:text-primary'
          "
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="flex items-center gap-2 sm:gap-3">
        <NuxtLink
          v-if="isStudent"
          to="/etudiant/notifications"
          class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-primary"
          aria-label="Notifications"
        >
          <span class="material-symbols-outlined text-[24px]">notifications</span>
          <span
            v-if="unreadNotifs > 0"
            class="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-container px-1 text-[10px] font-bold text-on-secondary-container"
          >
            {{ unreadNotifs > 9 ? '9+' : unreadNotifs }}
          </span>
        </NuxtLink>
        <NuxtLink
          v-if="!currentUser"
          :to="loginHref"
          class="hidden rounded-lg px-4 py-2 font-medium text-slate-600 transition hover:text-primary md:inline-flex"
        >
          Connexion
        </NuxtLink>
        <NuxtLink
          v-else
          :to="profileHref"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full transition"
          :class="
            isProfileActive
              ? 'bg-primary/10 text-primary ring-2 ring-primary/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
          "
          :aria-label="profileLabel"
          :title="profileLabel"
        >
          <span class="material-symbols-outlined text-[26px]">account_circle</span>
        </NuxtLink>
        <NuxtLink
          to="/bourses"
          class="rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container shadow-sm transition hover:opacity-90 active:scale-95 sm:px-5"
        >
          <span class="hidden sm:inline">Obtenir une bourse</span>
          <span class="sm:hidden">Bourse</span>
        </NuxtLink>
        <details class="relative md:hidden">
          <summary
            class="list-none rounded-lg border border-slate-200 p-2 text-slate-600"
          >
            <span class="material-symbols-outlined">menu</span>
          </summary>
          <div
            class="absolute right-0 top-12 w-52 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            <NuxtLink
              v-for="link in links"
              :key="`m-${typeof link.to === 'string' ? link.to : link.to.path}`"
              :to="link.to"
              class="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {{ link.mobileLabel }}
            </NuxtLink>
            <NuxtLink
              v-if="!currentUser"
              :to="loginHref"
              class="mt-2 block rounded-md border border-slate-100 px-3 py-2 text-sm font-semibold text-primary"
            >
              Connexion
            </NuxtLink>
            <NuxtLink
              v-else
              :to="profileHref"
              class="mt-2 flex items-center gap-2 rounded-md border border-slate-100 px-3 py-2 text-sm font-semibold text-primary"
            >
              <span class="material-symbols-outlined text-[20px]"
                >account_circle</span
              >
              {{ profileLabel }}
            </NuxtLink>
          </div>
        </details>
      </div>
    </div>
  </header>
</template>
