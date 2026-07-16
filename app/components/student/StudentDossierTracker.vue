<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  percent: number
  missingCount: number
  missingHint: string
  notification: string | null
  statusLabel?: string
  statusClassName?: string
  responseHint?: string | null
  nextStep?: string
  reference?: string
}>()

const statusPercent = ref(0)

onMounted(() => {
  requestAnimationFrame(() => {
    statusPercent.value = props.percent
  })
})

watch(
  () => props.percent,
  (newVal) => {
    statusPercent.value = newVal
  }
)
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300">
    <!-- En-tête de progression -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <div class="flex flex-wrap items-center gap-2">
        <span 
          v-if="statusLabel" 
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold" 
          :class="statusClassName || 'bg-slate-100 text-slate-700'"
        >
          {{ statusLabel }}
        </span>
        <span class="text-xs text-slate-400 font-medium">Complétude du dossier</span>
      </div>
      <span class="font-headline text-lg font-extrabold text-primary">{{ percent }}%</span>
    </div>

    <!-- Barre de progression de complétude -->
    <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        class="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
        :style="{ width: `${statusPercent}%` }"
      />
    </div>

    <!-- Alertes & Pièces manquantes -->
    <div v-if="missingCount > 0" class="mt-4 flex items-start gap-2.5 rounded-lg bg-rose-50/60 border border-rose-100/80 p-3 text-xs text-rose-800 animate-fade-in-up">
      <span class="material-symbols-outlined text-[16px] text-rose-600 select-none shrink-0 mt-0.5">info</span>
      <div class="leading-relaxed">
        <strong>{{ missingCount }} pièce(s) manquante(s) ou en attente</strong> : 
        <span class="text-rose-700">{{ missingHint }}</span>
      </div>
    </div>
    
    <div v-else-if="notification" class="mt-4 flex items-start gap-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100/80 p-3 text-xs text-emerald-800 animate-fade-in-up">
      <span class="material-symbols-outlined text-[16px] text-emerald-600 select-none shrink-0 mt-0.5">check_circle</span>
      <div class="leading-relaxed font-medium">
        {{ notification }}
      </div>
    </div>

    <!-- Méta-données de candidature -->
    <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-xs text-slate-500">
      <div class="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <span v-if="responseHint" class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[15px] text-slate-400 select-none">schedule</span>
          {{ responseHint }}
        </span>
        <span v-if="nextStep" class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[15px] text-slate-400 select-none">arrow_forward</span>
          {{ nextStep }}
        </span>
      </div>
      <span v-if="reference" class="font-mono text-slate-400 text-[10px] tracking-wider">
        Réf. {{ reference }}
      </span>
    </div>
  </div>
</template>
