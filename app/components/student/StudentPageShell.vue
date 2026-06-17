<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  showNotifications?: boolean
}>()

const { data: notifData } = await useFetch('/api/notifications', {
  lazy: true,
  server: false,
})
</script>

<template>
  <div class="mx-auto w-full max-w-lg px-4 pt-5 md:max-w-3xl md:px-6 md:pt-6">
    <header class="mb-5 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="font-headline text-2xl font-extrabold text-primary md:text-3xl">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>
      <NuxtLink
        v-if="showNotifications !== false"
        to="/etudiant/notifications"
        class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100 transition active:scale-[0.98] hover:text-primary"
        aria-label="Notifications"
      >
        <span class="material-symbols-outlined text-[22px]">notifications</span>
        <span
          v-if="notifData?.unreadCount"
          class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold text-on-secondary-container"
        >
          {{ notifData.unreadCount > 9 ? '9+' : notifData.unreadCount }}
        </span>
      </NuxtLink>
    </header>
    <slot />
  </div>
</template>
