<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  meta?: string
  status?: string
  statusLabel?: string
}>()
</script>

<template>
  <article
    class="portal-dash-card portal-dash-rise flex flex-col gap-3 p-4 transition active:scale-[0.99] md:p-5"
  >
    <div class="min-w-0 space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="font-semibold text-primary">{{ title }}</p>
        <slot name="badge">
          <ApplicationStatusBadge v-if="status" :status="status" />
        </slot>
      </div>
      <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
      <p v-if="meta" class="text-xs text-slate-400">{{ meta }}</p>
      <p v-if="statusLabel && !status" class="text-xs text-slate-500">{{ statusLabel }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2 border-t border-slate-50 pt-3">
      <slot name="actions" />
    </div>
  </article>
</template>
