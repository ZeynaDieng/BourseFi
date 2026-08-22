<script setup lang="ts">
import { resolveStudentAuthRedirect } from '~/utils/routes'

const route = useRoute()
const { data } = await useFetch('/api/auth/me')
const { profileHref, profileLabel } = useProfileDestination()

const links = [
  { to: '/', label: 'Accueil', mobileLabel: 'Accueil', icon: 'home', exact: true },
  { to: '/bourses', label: 'Bourses disponibles', mobileLabel: 'Bourses disponibles', icon: 'school' },
  { to: '/ecoles', label: 'Écoles partenaires', mobileLabel: 'Écoles partenaires', icon: 'domain' },
  { to: '/candidature', label: 'Comment ça marche', mobileLabel: 'Comment ça marche', icon: 'help_outline' },
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
const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')

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
  query: { redirect: resolveStudentAuthRedirect(route.fullPath) },
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

const isMobileMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)

function openSearch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-global-search'))
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-premium backdrop-blur-md"
  >
    <div
      class="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8"
      :class="headerBarClass"
    >
      <AppBrandLogo to="/" :img-class="logoImgClass" />

      <!-- Navigation Bureau -->
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

      <!-- Actions Header -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- Bouton Recherche Globale (Spotlight Trigger) -->
        <button
          type="button"
          class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-primary md:border md:border-slate-200 md:bg-slate-50/50 md:rounded-lg md:w-auto md:h-auto md:px-3 md:py-1.5"
          aria-label="Rechercher"
          @click="openSearch"
        >
          <span class="material-symbols-outlined text-[22px] md:text-[18px]">search</span>
          <span class="hidden sm:inline md:text-xs md:font-semibold">Rechercher</span>
          <span class="hidden md:inline rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-400">⌘K</span>
        </button>
        
        <NuxtLink
          v-if="isStudent"
          to="/etudiant/notifications"
          class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-primary"
          aria-label="Notifications"
        >
          <span class="material-symbols-outlined text-[22px]">notifications</span>
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
          class="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full transition"
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
          class="hidden sm:inline-flex rounded-lg bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container shadow-sm transition hover:opacity-90 active:scale-95"
        >
          Obtenir une bourse
        </NuxtLink>

        <!-- Déclencheur Burger Mobile Haut de Gamme -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-primary active:scale-95 md:hidden"
          aria-label="Ouvrir le menu mobile"
          @click="isMobileMenuOpen = true"
        >
          <span class="material-symbols-outlined text-[26px]">menu</span>
        </button>
      </div>
    </div>

    <!-- MENU MOBILE LATÉRAL (DRAWER SHEET ultra-doux avec Backdrop Blur) -->
    <Teleport to="body">
      <!-- Backdrop Overlay -->
      <Transition
        enter-active-class="transition-opacity ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md md:hidden"
          @click="isMobileMenuOpen = false"
        />
      </Transition>

      <!-- Panel Tiroir Mobile Slide-Over -->
      <Transition
        enter-active-class="transition transform ease-out duration-300"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition transform ease-in duration-200"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-y-0 right-0 z-50 flex w-full max-w-[340px] flex-col justify-between bg-white p-6 shadow-2xl md:hidden"
        >
          <!-- En-tête du Tiroir -->
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <AppBrandLogo to="/" img-class="h-9 w-auto object-contain" />
              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 active:scale-95"
                aria-label="Fermer le menu"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <!-- Carte Utilisateur / Connexion en haut -->
            <div v-if="currentUser" class="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  <span class="material-symbols-outlined text-[24px]">person</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold text-slate-900">{{ currentUser.fullName || currentUser.email }}</p>
                  <span class="inline-block rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {{ currentUser.role }}
                  </span>
                </div>
              </div>

              <NuxtLink
                :to="profileHref"
                class="flex w-full items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-slate-100 active:scale-95"
                @click="isMobileMenuOpen = false"
              >
                <span>{{ profileLabel }}</span>
                <span class="material-symbols-outlined text-[16px] text-primary">chevron_right</span>
              </NuxtLink>
            </div>

            <div v-else class="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/80 p-4 space-y-3">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Bienvenue sur BourseFi</p>
                <p class="text-sm font-bold text-slate-900 mt-0.5">Accédez à votre espace candidat</p>
              </div>

              <NuxtLink
                :to="loginHref"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white shadow-md transition hover:bg-primary-dark active:scale-95"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-symbols-outlined text-[18px]">login</span>
                Se Connecter / S'inscrire
              </NuxtLink>
            </div>

            <!-- Liste des rubriques principales avec grandes cibles tactiles -->
            <nav class="space-y-1.5 pt-2">
              <NuxtLink
                v-for="link in links"
                :key="`mobile-${typeof link.to === 'string' ? link.to : link.to.path}`"
                :to="link.to"
                class="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold transition active:scale-[0.98]"
                :class="
                  isActive(link.to, 'exact' in link && link.exact)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 hover:bg-slate-50'
                "
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[22px]" :class="isActive(link.to, 'exact' in link && link.exact) ? 'text-primary' : 'text-slate-400'">
                    {{ link.icon }}
                  </span>
                  <span>{{ link.mobileLabel }}</span>
                </div>
              </NuxtLink>

              <!-- Option Administration si Admin -->
              <NuxtLink
                v-if="isAdmin"
                to="/admin/dashboard"
                class="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3.5 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[22px] text-amber-600">admin_panel_settings</span>
                  <span>Administration</span>
                </div>
                <span class="material-symbols-outlined text-[16px] text-amber-600">chevron_right</span>
              </NuxtLink>
            </nav>
          </div>

          <!-- Pied du Menu Mobile (Actions rapides CTA) -->
          <div class="space-y-3 border-t border-slate-100 pt-4">
            <NuxtLink
              to="/bourses"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 py-3.5 text-xs font-bold text-on-secondary-container shadow-md transition hover:opacity-90 active:scale-95"
              @click="isMobileMenuOpen = false"
            >
              <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
              Obtenir une bourse maintenant
            </NuxtLink>

            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              @click="openSearch(); isMobileMenuOpen = false"
            >
              <span class="material-symbols-outlined text-[16px]">search</span>
              Recherche globale (⌘K)
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>
