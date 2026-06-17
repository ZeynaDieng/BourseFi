<script setup lang="ts">
import { computed } from 'vue'

const { data: site } = await usePublicSite()

const items = computed(() => (site.value?.testimonials ?? []).slice(0, 3))
</script>

<template>
  <section
    v-if="items.length"
    class="border-t border-slate-100 bg-white py-10 md:py-14"
    aria-label="Témoignages étudiants"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div class="mb-6 text-center md:mb-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          Ils nous font confiance
        </p>
        <h2 class="mt-2 font-headline text-xl font-extrabold text-primary md:text-2xl">
          Des étudiants accompagnés jusqu'à l'attestation
        </h2>
      </div>

      <div
        class="landing-scroll-row -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
      >
        <blockquote
          v-for="(t, i) in items"
          :key="t.id"
          class="card-interactive landing-rise flex w-[min(88vw,340px)] shrink-0 snap-center flex-col rounded-2xl border border-slate-100 bg-surface-container-low/40 p-5 shadow-premium md:w-auto"
          :style="{ animationDelay: `${0.1 + i * 0.08}s` }"
        >
          <div class="mb-3 flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-headline text-xs font-bold text-primary"
            >
              {{ t.initials }}
            </div>
            <div class="min-w-0">
              <cite class="block truncate not-italic text-sm font-semibold text-primary">{{ t.name }}</cite>
              <p class="truncate text-xs text-slate-500">{{ t.role }}</p>
            </div>
          </div>
          <p class="line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
            « {{ t.quote }} »
          </p>
        </blockquote>
      </div>
    </div>
  </section>
</template>
