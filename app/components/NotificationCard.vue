<script setup lang="ts">
defineProps<{
  title: string
  body: string
  createdAt: string
  read?: boolean
}>()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <article
    class="rounded-2xl border border-slate-100 bg-white p-4 shadow-premium"
    :class="{ 'border-primary/20 bg-primary/[0.02]': !read }"
  >
    <div class="flex items-start gap-3">
      <span class="material-symbols-outlined mt-0.5 text-primary">campaign</span>
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-primary">{{ title }}</p>
        <p class="mt-1 text-sm text-slate-600">{{ body }}</p>
        <p class="mt-2 text-[11px] text-slate-400">{{ formatDate(createdAt) }}</p>
      </div>
    </div>
  </article>
</template>
