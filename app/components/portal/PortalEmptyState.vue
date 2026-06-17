<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  to?: string
  ctaLabel?: string
}>()
</script>

<template>
  <div class="portal-dash-card flex flex-col items-center px-6 py-12 text-center">
    <span
      v-if="icon"
      class="material-symbols-outlined mb-4 text-[40px] text-slate-300"
    >{{ icon }}</span>
    <p class="font-headline text-lg font-bold text-primary">{{ title }}</p>
    <p v-if="description" class="mt-2 max-w-sm text-sm text-slate-500">{{ description }}</p>
    <NuxtLink
      v-if="to && ctaLabel"
      :to="to"
      class="mt-6 flex min-h-11 w-full max-w-xs items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition active:scale-[0.98] sm:w-auto"
    >
      {{ ctaLabel }}
    </NuxtLink>
    <slot />
  </div>
</template>
