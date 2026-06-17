<script setup lang="ts">
const props = defineProps<{
  current: number
  steps: string[]
}>()

function stateFor(index: number) {
  if (index < props.current) return 'done'
  if (index === props.current) return 'active'
  return 'todo'
}
</script>

<template>
  <ol class="flex items-center">
    <li
      v-for="(label, index) in steps"
      :key="label"
      class="flex flex-1 items-center last:flex-none"
    >
      <div class="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition"
          :class="{
            'bg-secondary text-on-secondary-container': stateFor(index) === 'done',
            'bg-primary text-white ring-4 ring-primary/15': stateFor(index) === 'active',
            'bg-slate-100 text-slate-400': stateFor(index) === 'todo',
          }"
        >
          <span v-if="stateFor(index) === 'done'" class="material-symbols-outlined text-[18px]">check</span>
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span
          class="text-center text-[11px] font-semibold sm:text-sm"
          :class="stateFor(index) === 'todo' ? 'text-slate-400' : 'text-primary'"
        >
          {{ label }}
        </span>
      </div>
      <span
        v-if="index < steps.length - 1"
        class="mx-2 hidden h-0.5 flex-1 rounded-full transition sm:block"
        :class="index < current ? 'bg-secondary' : 'bg-slate-200'"
        aria-hidden="true"
      />
    </li>
  </ol>
</template>
