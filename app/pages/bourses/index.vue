<script setup lang="ts">
import Fuse from 'fuse.js'
import type { BourseDto } from '~/types/bourse'

const { data: bourses } = await useFetch<BourseDto[]>('/api/bourses')

const searchQ = ref('')
const partnerFilter = ref('')
const coverageMin = ref(0)

const partners = computed(() => {
  const set = new Map<string, string>()
  for (const b of bourses.value ?? []) {
    set.set(b.partnerSlug, b.partnerName)
  }
  return [...set.entries()].map(([slug, name]) => ({ slug, name }))
})

const fuse = computed(() =>
  new Fuse(bourses.value ?? [], {
    keys: [
      { name: 'titre', weight: 1 },
      { name: 'etablissement', weight: 0.8 },
      { name: 'partnerName', weight: 0.7 },
      { name: 'ville', weight: 0.5 },
    ],
    threshold: 0.4,
  }),
)

const filtered = computed(() => {
  let list = bourses.value ?? []
  if (searchQ.value.trim().length >= 2) {
    list = fuse.value.search(searchQ.value.trim()).map((r) => r.item)
  }
  if (partnerFilter.value) {
    list = list.filter((b) => b.partnerSlug === partnerFilter.value)
  }
  if (coverageMin.value > 0) {
    list = list.filter((b) => b.coveragePercent >= coverageMin.value)
  }
  return list
})

useSeoMeta({
  title: 'Bourses disponibles — BourseFi',
  description: 'Parcourez les bourses d\'études disponibles au Sénégal : couverture, écoles partenaires et dates limites.',
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-12 md:px-8">
    <header class="mb-10">
      <p class="text-xs font-bold uppercase tracking-widest text-secondary">Catalogue bourses</p>
      <h1 class="font-headline text-4xl font-extrabold text-primary">Bourses disponibles</h1>
      <p class="mt-2 max-w-2xl text-slate-600">
        Trouvez une bourse, consultez la formation associée et postulez en quelques clics.
      </p>
    </header>

    <div class="mb-8 grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-premium md:grid-cols-[1fr_auto_auto]">
      <input
        v-model="searchQ"
        type="search"
        placeholder="Rechercher une bourse, école, partenaire..."
        class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
      />
      <select v-model="partnerFilter" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
        <option value="">Tous les partenaires</option>
        <option v-for="p in partners" :key="p.slug" :value="p.slug">{{ p.name }}</option>
      </select>
      <select v-model.number="coverageMin" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
        <option :value="0">Toute couverture</option>
        <option :value="25">≥ 25 %</option>
        <option :value="50">≥ 50 %</option>
        <option :value="75">≥ 75 %</option>
        <option :value="100">100 %</option>
      </select>
    </div>

    <div v-if="filtered.length" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ScholarshipCard v-for="b in filtered" :key="b.id" :bourse="b" />
    </div>
    <p v-else class="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-premium">
      Aucune bourse ne correspond à votre recherche.
    </p>
  </main>
</template>
