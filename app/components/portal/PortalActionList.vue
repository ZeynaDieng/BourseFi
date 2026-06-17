<script setup lang="ts">
export type ActionItem = {
  to: string
  label: string
  hint?: string
  icon?: string
}

defineProps<{
  items: ActionItem[]
  title?: string
}>()
</script>

<template>
  <section>
    <h3 v-if="title" class="mb-3 font-headline text-base font-bold text-primary md:text-lg">
      {{ title }}
    </h3>
    <nav class="flex flex-col gap-2">
      <NuxtLink
        v-for="(item, i) in items"
        :key="item.to"
        :to="item.to"
        class="portal-dash-rise group flex min-h-11 items-center justify-between rounded-xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm transition active:scale-[0.98] hover:border-primary/20 hover:shadow-md"
        :style="{ animationDelay: `${i * 35}ms` }"
      >
        <span class="flex min-w-0 items-center gap-3">
          <span
            v-if="item.icon"
            class="material-symbols-outlined shrink-0 text-[20px] text-slate-400 group-hover:text-primary"
          >{{ item.icon }}</span>
          <span>
            <span class="block font-semibold text-primary">{{ item.label }}</span>
            <span v-if="item.hint" class="text-xs text-slate-500">{{ item.hint }}</span>
          </span>
        </span>
        <span
          class="material-symbols-outlined shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary"
        >arrow_forward</span>
      </NuxtLink>
    </nav>
  </section>
</template>
