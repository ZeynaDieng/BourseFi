<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
  variant?: 'default' | 'primary'
}>()
</script>

<template>
  <article
    class="rounded-xl border border-slate-100 p-6 shadow-premium"
    :class="variant === 'primary' ? 'bg-primary text-white' : 'bg-white'"
  >
    <p
      class="text-xs uppercase tracking-widest"
      :class="variant === 'primary' ? 'text-slate-200' : 'text-slate-400'"
    >
      {{ label }}
    </p>
    <p class="mt-2 text-3xl font-extrabold" :class="variant === 'primary' ? 'text-white' : 'text-primary'">
      {{ value }}
    </p>
    <p v-if="hint" class="mt-1 text-xs" :class="variant === 'primary' ? 'text-slate-300' : 'text-slate-500'">
      {{ hint }}
    </p>
  </article>
</template>
