<script setup lang="ts">
const { data: programmes } = await useFetch('/api/programmes')
</script>

<template>
  <section class="py-20">
    <div class="mx-auto max-w-7xl px-8">
      <div class="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-secondary">Formations</p>
          <h2 class="font-headline text-4xl font-extrabold text-primary">
            Formations éligibles aux bourses
          </h2>
          <p class="mt-2 text-on-surface-variant">
            Parcourez le catalogue et postulez via une bourse associée.
          </p>
        </div>
        <NuxtLink to="/programmes" class="font-semibold text-primary">
          Voir toutes les formations →
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <FormationCard
          v-for="p in (programmes ?? []).slice(0, 8)"
          :key="p.id"
          :programme="p"
        />
      </div>
    </div>
  </section>
</template>
