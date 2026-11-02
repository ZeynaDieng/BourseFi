<script setup lang="ts">
const props = defineProps<{
  current: number
  steps: string[]
  /** Intitulés sous les pastilles à toutes les tailles (conteneurs étroits) */
  stacked?: boolean
}>()

function stateFor(index: number) {
  if (index < props.current) return 'done'
  if (index === props.current) return 'active'
  return 'todo'
}
</script>

<template>
  <ol class="flex items-start" :class="stacked ? '' : 'sm:items-center'">
    <li
      v-for="(label, index) in steps"
      :key="label"
      class="relative flex min-w-0 flex-1 items-center"
      :class="stacked ? '' : 'sm:min-w-fit sm:last:flex-none'"
    >
      <!-- Colonnes égales sur mobile : chaque intitulé a la même largeur, reliées par un trait derrière les pastilles -->
      <span
        v-if="index < steps.length - 1"
        class="absolute left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] top-4 h-0.5 -translate-y-1/2 rounded-full transition"
        :class="[index < current ? 'bg-primary' : 'bg-slate-200', stacked ? '' : 'sm:hidden']"
        aria-hidden="true"
      />
      <div
        class="flex w-full min-w-0 flex-col items-center gap-1.5"
        :class="stacked ? '' : 'sm:w-auto sm:flex-row sm:gap-2'"
      >
        <span
          class="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition"
          :class="{
            'bg-primary text-white': stateFor(index) === 'done',
            'bg-primary text-white ring-4 ring-primary/20': stateFor(index) === 'active',
            'bg-slate-100 text-slate-400': stateFor(index) === 'todo',
          }"
        >
          <span v-if="stateFor(index) === 'done'" class="material-symbols-outlined text-[20px] leading-none">check</span>
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span
          class="w-full truncate text-center text-[10px] font-semibold tracking-tight"
          :class="[
            stateFor(index) === 'todo' ? 'text-slate-400' : 'text-primary',
            stacked ? 'sm:text-xs sm:tracking-normal' : 'sm:w-auto sm:overflow-visible sm:text-sm sm:tracking-normal',
          ]"
        >
          {{ label }}
        </span>
      </div>
      <span
        v-if="index < steps.length - 1 && !stacked"
        class="mx-2 hidden h-0.5 flex-1 rounded-full transition sm:block"
        :class="index < current ? 'bg-primary' : 'bg-slate-200'"
        aria-hidden="true"
      />
    </li>
  </ol>
</template>
