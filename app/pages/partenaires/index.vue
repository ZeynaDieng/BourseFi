<script setup lang="ts">
const { data: partners } = await useFetch('/api/partners')

useSeoMeta({
  title: 'Partenaires financeurs — BourseFi',
  description: 'Découvrez les partenaires qui financent les bourses d\'études sur BourseFi.',
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-12 md:px-8">
    <header class="mb-10 text-center">
      <p class="text-xs font-bold uppercase tracking-widest text-secondary">Financeurs</p>
      <h1 class="font-headline text-4xl font-extrabold text-primary">Partenaires financeurs</h1>
      <p class="mx-auto mt-2 max-w-2xl text-slate-600">
        Mairies, agences et bailleurs publics qui rendent les bourses accessibles en ligne.
      </p>
    </header>
    <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      <PartnerCard v-for="p in partners ?? []" :key="p.slug" :partner="p" />
    </div>
  </main>
</template>
