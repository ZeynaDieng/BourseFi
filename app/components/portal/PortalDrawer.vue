<script setup lang="ts">
import type { PortalDrawerLink } from '~/utils/portal-nav'

defineProps<{
  open: boolean
  title?: string
  links: PortalDrawerLink[]
}>()

const emit = defineEmits<{ close: []; logout: [] }>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      :aria-label="title ?? 'Menu'"
    >
      <button
        type="button"
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="Fermer"
        @click="emit('close')"
      />
      <div
        class="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <p class="font-headline text-lg font-bold text-primary">{{ title ?? 'Menu' }}</p>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50"
            aria-label="Fermer"
            @click="emit('close')"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav class="space-y-1 p-3">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
            @click="emit('close')"
          >
            <span class="material-symbols-outlined text-[22px] text-primary">{{ link.icon }}</span>
            {{ link.label }}
          </NuxtLink>
          <button
            type="button"
            class="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
            @click="emit('logout')"
          >
            <span class="material-symbols-outlined text-[22px]">logout</span>
            Déconnexion
          </button>
        </nav>
      </div>
    </div>
  </Teleport>
</template>
