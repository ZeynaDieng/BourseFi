<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Fuse from 'fuse.js'
import type { BourseDto } from '~/types/bourse'

const { data: bourses } = await useFetch<BourseDto[]>('/api/bourses')

const searchQ = ref('')
const partnerFilter = ref('')
const cityFilter = ref('')
const levelFilter = ref('')
const coverageMin = ref(0)

const displayLimit = ref(12)

const partners = computed(() => {
  const set = new Map<string, string>()
  for (const b of bourses.value ?? []) {
    set.set(b.partnerSlug, b.partnerName)
  }
  return [...set.entries()].map(([slug, name]) => ({ slug, name }))
})

const cities = computed(() => {
  const set = new Set<string>()
  for (const b of bourses.value ?? []) {
    if (b.ville) set.add(b.ville)
  }
  return [...set].sort()
})

const levels = computed(() => {
  const set = new Set<string>()
  for (const b of bourses.value ?? []) {
    if (b.programmeNiveau) set.add(b.programmeNiveau)
  }
  return [...set].sort()
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
  if (cityFilter.value) {
    list = list.filter((b) => b.ville === cityFilter.value)
  }
  if (levelFilter.value) {
    list = list.filter((b) => b.programmeNiveau === levelFilter.value)
  }
  if (coverageMin.value > 0) {
    list = list.filter((b) => b.coveragePercent >= coverageMin.value)
  }
  return list
})

const displayedBourses = computed(() => {
  return filtered.value.slice(0, displayLimit.value)
})

const hasMore = computed(() => {
  return displayLimit.value < filtered.value.length
})

function loadMore() {
  if (hasMore.value) {
    displayLimit.value += 12
  }
}

watch([searchQ, partnerFilter, cityFilter, levelFilter, coverageMin], () => {
  displayLimit.value = 12
})

const loadMoreSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore()
    }
  }, {
    rootMargin: '200px',
  })

  if (loadMoreSentinel.value) {
    observer.observe(loadMoreSentinel.value)
  }
})

watch(loadMoreSentinel, (newEl) => {
  if (observer) {
    observer.disconnect()
    if (newEl) {
      observer.observe(newEl)
    }
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

useSiteSeo({
  title: 'Bourses disponibles | BourseFi',
  description:
    "Parcourez les bourses d'études disponibles au Sénégal : couverture, écoles partenaires et dates limites.",
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

    <!-- Filtres Multicritères Ultra-Premium -->
    <div class="mb-8 grid gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:grid-cols-2 md:grid-cols-5">
      <!-- Recherche -->
      <div class="relative sm:col-span-2 md:col-span-1">
        <span class="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-slate-400 select-none">search</span>
        <input
          v-model="searchQ"
          type="search"
          placeholder="Nom, école..."
          class="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5"
        />
      </div>

      <!-- Filtre Partenaire -->
      <select v-model="partnerFilter" class="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5">
        <option value="">Tous les partenaires</option>
        <option v-for="p in partners" :key="p.slug" :value="p.slug">{{ p.name }}</option>
      </select>

      <!-- Filtre Ville -->
      <select v-model="cityFilter" class="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5">
        <option value="">Toutes les villes</option>
        <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
      </select>

      <!-- Filtre Niveau -->
      <select v-model="levelFilter" class="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5">
        <option value="">Tous les niveaux</option>
        <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
      </select>

      <!-- Filtre Couverture -->
      <select v-model.number="coverageMin" class="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5">
        <option :value="0">Toute couverture</option>
        <option :value="25">≥ 25 % de prise en charge</option>
        <option :value="50">≥ 50 % de prise en charge</option>
        <option :value="75">≥ 75 % de prise en charge</option>
        <option :value="100">100 % de prise en charge</option>
      </select>
    </div>

    <div v-if="displayedBourses.length" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ScholarshipCard v-for="b in displayedBourses" :key="b.id" :bourse="b" />
    </div>
    
    <p v-else class="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-premium">
      Aucune bourse ne correspond à votre recherche.
    </p>

    <!-- Sentinel element to trigger next batch load -->
    <div v-if="hasMore" ref="loadMoreSentinel" class="py-12 flex justify-center">
      <div class="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-primary"></div>
    </div>
  </main>
</template>
