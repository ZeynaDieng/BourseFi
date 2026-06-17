<script setup lang="ts">
type NavKey = 'home' | 'profil' | 'catalogue' | 'paiement'

const route = useRoute()

const items: { key: NavKey; to: string; icon: string; label: string }[] = [
  { key: 'home', to: '/', icon: 'home', label: 'Accueil' },
  { key: 'profil', to: '/etudiant/profil', icon: 'person', label: 'Profil' },
  {
    key: 'catalogue',
    to: '/programmes#programmes-catalog',
    icon: 'school',
    label: 'Formations',
  },
  { key: 'paiement', to: '/paiement', icon: 'payments', label: 'Paiements' },
]

const activeKey = computed<NavKey>(() => {
  const path = route.path
  if (path.startsWith('/etudiant/profil')) return 'profil'
  if (path.startsWith('/paiement')) return 'paiement'
  if (path.startsWith('/programmes')) return 'catalogue'
  return 'home'
})
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
    aria-label="Navigation étudiant"
  >
    <ul class="mx-auto grid max-w-lg grid-cols-4">
      <li v-for="item in items" :key="item.key">
        <NuxtLink
          :to="item.to"
          class="flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-semibold transition"
          :class="
            activeKey === item.key
              ? 'text-primary'
              : 'text-slate-500 hover:text-primary'
          "
          :aria-current="activeKey === item.key ? 'page' : undefined"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-xl transition"
            :class="
              activeKey === item.key
                ? 'bg-primary/10 text-primary'
                : 'text-slate-500'
            "
          >
            <span class="material-symbols-outlined text-[22px]">{{
              item.icon
            }}</span>
          </span>
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
