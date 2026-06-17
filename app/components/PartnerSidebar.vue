<script setup lang="ts">
const links = [
  { to: '/partenaire/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { to: '/partenaire/bourses', label: 'Bourses', icon: 'school' },
  { to: '/partenaire/candidatures', label: 'Candidatures', icon: 'description' },
  { to: '/partenaire/documents', label: 'Documents', icon: 'folder' },
  { to: '/partenaire/paiements', label: 'Paiements', icon: 'payments' },
  { to: '/partenaire/statistiques', label: 'Statistiques', icon: 'bar_chart' },
  { to: '/partenaire/parametres', label: 'Paramètres', icon: 'settings' },
]

const route = useRoute()

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/auth/login')
}
</script>

<template>
  <aside class="w-64 shrink-0 border-r border-slate-200 bg-white p-4">
    <div class="mb-6">
      <AppBrandLogo to="/" img-class="h-12 w-auto max-h-14 object-contain object-left" />
      <p class="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Portail partenaire</p>
    </div>
    <nav class="space-y-1 text-sm">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-2 rounded-lg px-4 py-3 font-semibold transition"
        :class="isActive(link.to) ? 'bg-slate-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'"
      >
        <span class="material-symbols-outlined text-[20px]">{{ link.icon }}</span>
        {{ link.label }}
      </NuxtLink>
      <NuxtLink
        to="/partenaire/audit"
        class="mt-4 flex items-center gap-2 rounded-lg px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
      >
        <span class="material-symbols-outlined text-[20px]">history</span>
        Journal d'audit
      </NuxtLink>
      <button
        type="button"
        class="mt-6 w-full rounded-lg border border-slate-200 px-4 py-3 text-left font-semibold text-slate-600 hover:bg-slate-50"
        @click="logout"
      >
        Déconnexion
      </button>
    </nav>
  </aside>
</template>
