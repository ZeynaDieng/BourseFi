<script setup lang="ts">
import { userInitials } from '~/utils/student-dossier'

const route = useRoute()
const { data: me, refresh: refreshMe } = await useFetch('/api/auth/me')
const { data: notifData } = await useFetch('/api/notifications', { lazy: true, server: false })

const open = ref(false)

const firstName = computed(() => me.value?.user?.name?.split(/\s+/)[0] || 'Étudiant')
const initials = computed(() => userInitials(me.value?.user?.name))

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
</script>

<template>
  <div class="md:hidden">
    <!-- Barre mobile -->
    <div class="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
          {{ initials }}
        </span>
        <div class="leading-tight">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Espace étudiant</p>
          <p class="text-sm font-bold text-primary">Bonjour, {{ firstName }}</p>
        </div>
      </div>
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 ring-1 ring-slate-100 transition active:scale-95"
        aria-label="Ouvrir le menu"
        @click="open = true"
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>

    <!-- Drawer -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="open" class="fixed inset-0 z-[110] md:hidden" role="dialog" aria-modal="true">
          <div class="absolute inset-0 bg-primary/40" @click="open = false" />
          <Transition name="drawer-slide">
            <aside
              v-if="open"
              class="absolute inset-y-0 right-0 flex w-[82%] max-w-xs flex-col bg-white shadow-2xl"
            >
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

              <nav class="flex-1 space-y-1 overflow-y-auto p-3">
                <NuxtLink
                  v-for="link in links"
                  :key="link.to"
                  :to="link.to"
                  class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition"
                  :class="route.path.startsWith(link.to) ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'"
                >
                  <span class="material-symbols-outlined text-[22px]">{{ link.icon }}</span>
                  <span class="flex-1">{{ link.label }}</span>
                  <span
                    v-if="link.to === '/etudiant/notifications' && notifData?.unreadCount"
                    class="rounded-full bg-secondary-container px-1.5 py-0.5 text-[10px] font-bold text-on-secondary-container"
                  >
                    {{ notifData.unreadCount }}
                  </span>
                </NuxtLink>

                <NuxtLink
                  to="/bourses"
                  class="mt-3 flex items-center gap-3 rounded-xl bg-primary px-3 py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
                >
                  <span class="material-symbols-outlined text-[22px]">add_circle</span>
                  Trouver une bourse
                </NuxtLink>
              </nav>

              <div class="border-t border-slate-100 p-3">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
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
  </div>
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
