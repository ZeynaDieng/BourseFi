<script setup lang="ts">
defineProps<{
  kicker?: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header class="portal-dash-rise space-y-1">
    <p
      v-if="kicker"
      class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
    >
      {{ kicker }}
    </p>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h1 class="font-headline text-2xl font-extrabold text-primary md:text-3xl">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 flex-wrap gap-2">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
