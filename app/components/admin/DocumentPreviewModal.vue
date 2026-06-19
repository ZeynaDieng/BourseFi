<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  doc: { url: string; label: string } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isPdf = computed(() => (props.doc ? /\.pdf($|\?)/i.test(props.doc.url) : false))
</script>

<template>
  <div
    v-if="doc"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="relative flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p class="font-semibold text-primary">{{ doc.label }}</p>
        <div class="flex items-center gap-2">
          <a
            :href="doc.url"
            target="_blank"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Ouvrir / Télécharger
          </a>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fermer"
            @click="emit('close')"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
      <div class="flex flex-1 items-center justify-center overflow-auto bg-slate-50 p-3">
        <iframe v-if="isPdf" :src="doc.url" :title="doc.label" class="h-full w-full border-0 bg-white"></iframe>
        <img v-else :src="doc.url" :alt="doc.label" class="max-h-full max-w-full rounded-lg object-contain" />
      </div>
    </div>
  </div>
</template>
