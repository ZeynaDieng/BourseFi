<script setup lang="ts">
import { userInitials } from '~/utils/student-dossier'

const route = useRoute()
const { data: me, refresh: refreshMe } = await useFetch('/api/auth/me')
const { data: notifData } = await useFetch('/api/notifications', { lazy: true, server: false })

const open = ref(false)

const firstName = computed(() => me.value?.user?.name?.split(/\s+/)[0] || 'Étudiant')
const initials = computed(() => userInitials(me.value?.user?.name))
const unread = computed(() => notifData.value?.unreadCount ?? 0)

const links = [
  { to: '/etudiant/profil', label: 'Accueil', icon: 'home' },
  { to: '/etudiant/candidatures', label: 'Mes candidatures', icon: 'description' },
  { to: '/etudiant/documents', label: 'Mes documents', icon: 'folder' },
  { to: '/etudiant/paiements', label: 'Mes paiements', icon: 'payments' },
  { to: '/etudiant/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/etudiant/support', label: 'Support', icon: 'help' },
]

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshMe()
  open.value = false
  await navigateTo('/auth/login')
}

function onLogoError(e: Event) {
  ;(e.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <header class="sticky top-0 z-50 h-16 border-b border-slate-100 bg-white/95 backdrop-blur">
    <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
      <NuxtLink to="/etudiant/profil" class="flex items-center gap-2">
        <img src="/boursefi-logo.png" alt="BourseFi" class="h-8 w-8 rounded-lg object-contain" @error="onLogoError" />
        <span class="font-headline text-lg font-extrabold text-primary">BourseFi</span>
        <span class="ml-1 hidden rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary sm:inline">
          Espace étudiant
        </span>
      </NuxtLink>

      <div class="flex items-center gap-1.5">
        <NuxtLink
          to="/"
          class="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-primary md:inline-flex"
        >
          <span class="material-symbols-outlined text-[18px]">public</span>
          Voir le site
        </NuxtLink>

        <NuxtLink
          to="/etudiant/notifications"
          class="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-primary"
          aria-label="Notifications"
        >
          <span class="material-symbols-outlined text-[22px]">notifications</span>
          <span
            v-if="unread"
            class="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold text-on-secondary-container"
          >
            {{ unread > 9 ? '9+' : unread }}
          </span>
        </NuxtLink>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-primary md:hidden"
          aria-label="Ouvrir le menu"
          @click="open = true"
        >
          <span class="material-symbols-outlined text-[24px]">menu</span>
        </button>
      </div>
    </div>

    <!-- Drawer mobile -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="open" class="fixed inset-0 z-[110] md:hidden" role="dialog" aria-modal="true">
          <div class="absolute inset-0 bg-primary/40" @click="open = false" />
          <Transition name="drawer-slide">
            <aside v-if="open" class="absolute inset-y-0 right-0 flex w-[82%] max-w-xs flex-col bg-white shadow-2xl">
              <div class="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <div class="flex items-center gap-2">
                  <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                    {{ initials }}
                  </span>
                  <div class="leading-tight">
                    <p class="text-sm font-bold text-primary">Bonjour, {{ firstName }}</p>
                    <p class="truncate text-xs text-slate-500">{{ me?.user?.email }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Fermer le menu"
                  @click="open = false"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>

              <nav class="flex-1 space-y-0.5 overflow-y-auto p-3">
                <NuxtLink
                  v-for="link in links"
                  :key="link.to"
                  :to="link.to"
                  class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
                  :class="route.path.startsWith(link.to) ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'"
                >
                  <span class="material-symbols-outlined text-[22px]">{{ link.icon }}</span>
                  <span class="flex-1">{{ link.label }}</span>
                  <span
                    v-if="link.to === '/etudiant/notifications' && unread"
                    class="rounded-full bg-secondary-container px-1.5 py-0.5 text-[10px] font-bold text-on-secondary-container"
                  >
                    {{ unread }}
                  </span>
                </NuxtLink>

                <NuxtLink
                  to="/"
                  class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <span class="material-symbols-outlined text-[22px]">public</span>
                  Voir le site
                </NuxtLink>
              </nav>

              <div class="mt-auto border-t border-slate-100 p-3">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  @click="logout"
                >
                  <span class="material-symbols-outlined text-[22px]">logout</span>
                  Déconnexion
                </button>
              </div>
            </aside>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
@media (prefers-reduced-motion: reduce) {
  .drawer-fade-enter-active,
  .drawer-fade-leave-active,
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition: none;
  }
}
</style>
