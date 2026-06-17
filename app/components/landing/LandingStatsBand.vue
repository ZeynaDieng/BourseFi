<script setup lang="ts">
defineProps<{
  items: Array<{ value: string; label: string }>
  dossiersValides?: number
}>()
</script>

<template>
  <section
    v-if="items.length"
    class="border-b border-slate-100 bg-white/95 py-5 backdrop-blur-sm md:py-6"
    aria-label="Chiffres clés BourseFi"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <p
        v-if="dossiersValides && dossiersValides > 0"
        class="mb-4 text-center text-xs font-medium text-slate-500 md:text-sm"
      >
        <span class="material-symbols-outlined mr-1 align-middle text-base text-secondary">verified</span>
        {{ dossiersValides.toLocaleString('fr-FR') }} dossiers validés sur la plateforme
      </p>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        <div
          v-for="(item, i) in items"
          :key="item.label"
          class="landing-stat-rise rounded-xl border border-slate-100/80 bg-surface-container-low/50 px-3 py-3 text-center md:py-4"
          :style="{ animationDelay: `${0.05 + i * 0.07}s` }"
        >
          <p class="font-headline text-2xl font-extrabold text-primary md:text-3xl">
            {{ item.value }}
          </p>
          <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:text-xs">
            {{ item.label }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
