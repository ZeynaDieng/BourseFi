<script setup lang="ts">
type NavKey = 'home' | 'candidatures' | 'documents' | 'notifications' | 'profil'

const route = useRoute()
const { data: notifData } = await useFetch('/api/notifications', { lazy: true, server: false })

const items = computed(() => [
  { key: 'home' as const, to: '/etudiant/profil', icon: 'home', label: 'Accueil' },
  { key: 'candidatures' as const, to: '/etudiant/candidatures', icon: 'description', label: 'Dossiers' },
  { key: 'documents' as const, to: '/etudiant/documents', icon: 'folder', label: 'Docs' },
  {
    key: 'notifications' as const,
    to: '/etudiant/notifications',
    icon: 'notifications',
    label: 'Alertes',
    badge: notifData.value?.unreadCount,
  },
  { key: 'profil' as const, to: '/etudiant/paiements', icon: 'payments', label: 'Payer' },
])

const activeKey = computed<NavKey>(() => {
  const path = route.path
  if (path.startsWith('/etudiant/candidatures')) return 'candidatures'
  if (path.startsWith('/etudiant/documents')) return 'documents'
  if (path.startsWith('/etudiant/notifications')) return 'notifications'
  if (path.startsWith('/etudiant/paiements')) return 'profil'
  if (path.startsWith('/etudiant/profil') || path.startsWith('/etudiant')) return 'home'
  return 'home'
})
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
    aria-label="Navigation étudiant"
  >
    <ul class="mx-auto grid max-w-lg grid-cols-5">
      <li v-for="item in items" :key="item.key">
        <NuxtLink
          :to="item.to"
          class="relative flex flex-col items-center gap-0.5 px-1 py-1.5 text-[9px] font-semibold transition active:scale-[0.98]"
          :class="activeKey === item.key ? 'text-primary' : 'text-slate-500 hover:text-primary'"
        >
          <span
            class="relative flex h-8 w-8 items-center justify-center rounded-xl transition"
            :class="activeKey === item.key ? 'bg-primary/10 text-primary' : 'text-slate-500'"
          >
            <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
            <span
              v-if="item.badge && item.badge > 0"
              class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold text-on-secondary-container"
            >
              {{ item.badge > 9 ? '9+' : item.badge }}
            </span>
          </span>
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
