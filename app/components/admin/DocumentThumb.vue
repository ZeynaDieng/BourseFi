<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  url: string
  label: string
}>()

const emit = defineEmits<{
  (e: 'open', payload: { url: string; label: string }): void
}>()

const isPdf = computed(() => /\.pdf($|\?)/i.test(props.url))
</script>

<template>
  <div class="group relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
      @click="emit('open', { url, label })"
    >
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200"
      >
        <img v-if="!isPdf" :src="url" :alt="label" class="h-full w-full object-cover" />
        <span v-else class="material-symbols-outlined text-[18px] text-red-500">picture_as_pdf</span>
      </span>
      <span>{{ label }}</span>
      <span class="material-symbols-outlined text-[16px] text-slate-400">zoom_in</span>
    </button>

    <!-- Aperçu agrandi au survol (images uniquement) -->
    <div
      v-if="!isPdf"
      class="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xl group-hover:block"
    >
      <img :src="url" :alt="label" class="h-40 w-full rounded-lg object-contain" />
      <p class="px-1 py-1 text-center text-[11px] font-semibold text-slate-500">{{ label }}</p>
    </div>
  </div>
</template>
