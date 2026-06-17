<script setup lang="ts">
export type PipelineItem = {
  key: string
  label: string
  count: number
  to: string
  tone?: string
}

defineProps<{
  items: PipelineItem[]
}>()
</script>

<template>
  <div
    class="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:pb-0 lg:grid-cols-4"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      class="portal-dash-card portal-dash-rise flex min-w-[9.5rem] shrink-0 snap-start flex-col gap-1 p-4 transition active:scale-[0.98] md:min-w-0"
      :class="item.tone"
    >
      <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {{ item.label }}
      </p>
      <p class="font-headline text-2xl font-black text-primary">{{ item.count }}</p>
    </NuxtLink>
  </div>
</template>
