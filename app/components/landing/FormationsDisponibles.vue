<script setup lang="ts">
const { data: programmes } = await useFetch('/api/programmes')
</script>

<template>
  <section class="hidden py-12 md:block md:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div class="mb-8 flex items-center justify-between gap-3 md:mb-12">
        <div>
          <h2 class="font-headline text-2xl font-extrabold text-primary md:text-4xl">
            Formations éligibles
          </h2>
          <p class="mt-1 hidden text-sm text-on-surface-variant sm:block">
            Parcourez le catalogue et postulez via une bourse associée.
          </p>
        </div>
        <NuxtLink to="/programmes" class="shrink-0 text-sm font-semibold text-primary md:text-base">
          Voir toutes →
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <FormationCard
          v-for="p in (programmes ?? []).slice(0, 8)"
          :key="p.id"
          :programme="p"
        />
      </div>
    </div>
  </section>
</template>
