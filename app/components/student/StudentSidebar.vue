<script setup lang="ts">
const links = [
  { to: '/etudiant/profil', label: 'Accueil', icon: 'home' },
  { to: '/etudiant/candidatures', label: 'Mes candidatures', icon: 'description' },
  { to: '/etudiant/documents', label: 'Mes documents', icon: 'folder' },
  { to: '/etudiant/paiements', label: 'Mes paiements', icon: 'payments' },
  { to: '/etudiant/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/etudiant/support', label: 'Support', icon: 'help' },
]

const route = useRoute()
const { data: notifData } = await useFetch('/api/notifications', { lazy: true, server: false })

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <aside class="hidden w-56 shrink-0 border-r border-slate-100 bg-white p-4 md:block">
    <p class="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Espace étudiant</p>
    <nav class="space-y-1">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98]"
        :class="isActive(link.to) ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'"
      >
        <span class="material-symbols-outlined text-[20px]">{{ link.icon }}</span>
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
        class="mt-4 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 active:scale-[0.98]"
      >
        <span class="material-symbols-outlined text-[20px]">add_circle</span>
        Trouver une bourse
      </NuxtLink>
    </nav>
  </aside>
</template>
