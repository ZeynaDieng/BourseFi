<script setup lang="ts">
import type { PortalDrawerLink, PortalNavItem } from '~/utils/portal-nav'

defineProps<{
  navItems: PortalNavItem[]
  drawerLinks: PortalDrawerLink[]
  drawerTitle?: string
  logoTo?: string
  ariaLabel?: string
}>()

const drawerOpen = ref(false)

async function logout() {
  drawerOpen.value = false
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/auth/login')
}
</script>

<template>
  <div class="flex min-h-screen flex-col md:flex-row">
    <header
      class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden"
    >
      <AppBrandLogo :to="logoTo ?? '/'" img-class="h-9 w-auto object-contain object-left" />
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50"
        aria-label="Ouvrir le menu"
        @click="drawerOpen = true"
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
    </header>

    <div class="hidden shrink-0 md:block">
      <slot name="sidebar" />
    </div>

    <main
      class="relative flex-1 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/90 pb-24 md:pb-8"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -left-24 top-0 hidden h-72 w-72 rounded-full bg-secondary-fixed/15 blur-3xl md:block"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute bottom-0 right-0 hidden h-96 w-96 translate-x-1/4 rounded-full bg-primary/5 blur-3xl md:block"
      />
      <div class="relative z-10">
        <slot />
      </div>
    </main>

    <PortalMobileNav
      :items="navItems"
      :aria-label="ariaLabel"
      @menu="drawerOpen = true"
    />
    <PortalDrawer
      :open="drawerOpen"
      :title="drawerTitle ?? 'Menu'"
      :links="drawerLinks"
      @close="drawerOpen = false"
      @logout="logout"
    />
  </div>
</template>
