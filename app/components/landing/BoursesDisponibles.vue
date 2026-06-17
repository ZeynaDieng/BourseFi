<script setup lang="ts">
import type { BourseDto } from '~/types/bourse'

const { data: bourses } = await useFetch<BourseDto[]>('/api/bourses')
</script>

<template>
  <section class="bg-surface-container-low py-20">
    <div class="mx-auto max-w-7xl px-8">
      <div class="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-secondary">Bourses</p>
          <h2 class="font-headline text-4xl font-extrabold text-primary">
            Bourses disponibles actuellement
          </h2>
          <p class="mt-2 text-on-surface-variant">
            Postulez directement à une offre de financement partenaire.
          </p>
        </div>
        <NuxtLink to="/bourses" class="font-semibold text-primary">
          Voir toutes les bourses →
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ScholarshipCard
          v-for="b in (bourses ?? []).slice(0, 8)"
          :key="b.id"
          :bourse="b"
        />
      </div>
    </div>
  </section>
</template>
