<script setup lang="ts">
import { computed } from 'vue'
import type { BourseDto } from '~/types/bourse'

const { data: bourses } = await useFetch<BourseDto[]>('/api/bourses')

const featured = computed(() => (bourses.value ?? []).slice(0, 8))
</script>

<template>
  <section class="landing-rise bg-surface-container-low py-12 md:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div class="mb-8 flex items-center justify-between gap-3 md:mb-12">
        <div>
          <h2 class="font-headline text-2xl font-extrabold text-primary md:text-4xl">
            Bourses disponibles
          </h2>
          <p class="mt-1 hidden text-sm text-on-surface-variant sm:block">
            Postulez en quelques clics.
          </p>
        </div>
        <NuxtLink to="/bourses" class="shrink-0 text-sm font-semibold text-primary md:text-base">
          <span class="md:hidden">Tout voir</span>
          <span class="hidden md:inline">Voir toutes →</span>
        </NuxtLink>
      </div>

      <!-- Mobile : carousel horizontal -->
      <div
        class="landing-scroll-row -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden"
      >
        <div
          v-for="b in featured.slice(0, 6)"
          :key="b.id"
          class="w-[min(88vw,320px)] shrink-0 snap-center"
        >
          <ScholarshipCard :bourse="b" />
        </div>
      </div>

      <!-- Desktop : grille -->
      <div class="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
        <ScholarshipCard
          v-for="b in featured"
          :key="b.id"
          :bourse="b"
        />
      </div>
    </div>
  </section>
</template>
