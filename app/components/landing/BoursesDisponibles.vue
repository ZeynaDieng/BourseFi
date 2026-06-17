<script setup lang="ts">
import type { BourseDto } from '~/types/bourse'

const { data: bourses } = await useFetch<BourseDto[]>('/api/bourses')
</script>

<template>
  <section class="bg-surface-container-low py-12 md:py-20">
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
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <ScholarshipCard
          v-for="(b, i) in (bourses ?? []).slice(0, 8)"
          :key="b.id"
          :class="i >= 4 ? 'hidden md:block' : ''"
          :bourse="b"
        />
      </div>
    </div>
  </section>
</template>
