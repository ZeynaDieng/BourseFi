<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Fuse from 'fuse.js'
import type { BourseDto } from '~/types/bourse'

const { data: bourses } = await useFetch<BourseDto[]>('/api/bourses')

const searchQ = ref('')
const partnerFilter = ref('')
const cityFilter = ref('')
const levelFilter = ref('')
const sortBy = ref('economie_desc')
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

const topSavingsIds = computed(() => {
  const validList = (bourses.value ?? []).filter(
    (b) => b.economie !== undefined && b.economie !== null && b.economie > 0,
  )
  const sorted = [...validList].sort((a, b) => (b.economie || 0) - (a.economie || 0))
  return new Set(sorted.slice(0, 3).map((b) => b.id))
})

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

  // Marquer le badge Top Économie
  const result = list.map((b) => ({
    ...b,
    isBestEconomy: topSavingsIds.value.has(b.id),
  }))

  // Application du Tri
  if (sortBy.value === 'economie_desc') {
    result.sort((a, b) => (b.economie || 0) - (a.economie || 0))
  } else if (sortBy.value === 'price_asc') {
    result.sort((a, b) => (a.montantBourse || a.tuitionFee || 0) - (b.montantBourse || b.tuitionFee || 0))
  } else if (sortBy.value === 'coverage_desc') {
    result.sort((a, b) => b.coveragePercent - a.coveragePercent)
  }

  return result
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

watch([searchQ, partnerFilter, cityFilter, levelFilter, coverageMin, sortBy], () => {
  displayLimit.value = 12
})

const isMobileFilterOpen = ref(false)

const activeFiltersCount = computed(() => {
  let count = 0
  if (partnerFilter.value) count += 1
  if (cityFilter.value) count += 1
  if (levelFilter.value) count += 1
  if (coverageMin.value > 0) count += 1
  return count
})

function resetFilters() {
  partnerFilter.value = ''
  cityFilter.value = ''
  levelFilter.value = ''
  coverageMin.value = 0
  sortBy.value = 'economie_desc'
}

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
  title: 'Catalogue des bourses | BourseFi',
  description:
    "Comparez les tarifs et découvrez combien vous pouvez économiser sur votre formation au Sénégal.",
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-10 md:px-8">
    <!-- En-tête Épuré -->
    <header class="mb-8">
      <p class="text-xs font-bold uppercase tracking-widest text-secondary">Catalogue bourses</p>
      <h1 class="font-headline text-3xl font-extrabold text-primary sm:text-4xl">Bourses disponibles</h1>
      <p class="mt-2 max-w-2xl text-slate-600">
        Comparez les tarifs officiels, découvrez combien vous pouvez économiser et postulez en quelques clics.
      </p>
    </header>

    <!-- Filtres Multicritères (Desktop version) -->
    <div class="mb-8 hidden md:grid gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-6 animate-scale-up">
      <!-- Recherche -->
      <div class="relative md:col-span-1">
        <span class="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-slate-400 select-none">search</span>
        <input
          v-model="searchQ"
          type="search"
          placeholder="Nom, école..."
          class="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5"
        />
      </div>

      <!-- Trier Par -->
      <select v-model="sortBy" class="rounded-lg border border-amber-300 bg-amber-50/50 px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none">
        <option value="economie_desc">Plus forte économie (FCFA)</option>
        <option value="price_asc">Prix final le plus bas</option>
        <option value="coverage_desc">Plus forte prise en charge (%)</option>
      </select>

      <!-- Filtre Partenaire -->
      <select v-model="partnerFilter" class="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none">
        <option value="">Tous les partenaires</option>
        <option v-for="p in partners" :key="p.slug" :value="p.slug">{{ p.name }}</option>
      </select>

      <!-- Filtre Ville -->
      <select v-model="cityFilter" class="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none">
        <option value="">Toutes les villes</option>
        <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
      </select>

      <!-- Filtre Niveau -->
      <select v-model="levelFilter" class="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none">
        <option value="">Tous les niveaux</option>
        <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
      </select>

      <!-- Filtre Couverture -->
      <select v-model.number="coverageMin" class="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none">
        <option :value="0">Toute couverture</option>
        <option :value="25">≥ 25 % de prise en charge</option>
        <option :value="50">≥ 50 % de prise en charge</option>
        <option :value="75">≥ 75 % de prise en charge</option>
      </select>
    </div>

    <!-- Barre de Recherche Compacte (Mobile version) -->
    <div class="mb-6 flex gap-2 md:hidden">
      <div class="relative flex-1">
        <span class="material-symbols-outlined absolute left-3 top-3 text-[18px] text-slate-400 select-none">search</span>
        <input
          v-model="searchQ"
          type="search"
          placeholder="Rechercher une bourse, école..."
          class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/5"
        />
      </div>
      
      <button
        type="button"
        class="flex-none flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 relative active:scale-95"
        @click="isMobileFilterOpen = true"
      >
        <span class="material-symbols-outlined text-[20px] select-none">tune</span>
        <span
          v-if="activeFiltersCount > 0"
          class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white"
        >
          {{ activeFiltersCount }}
        </span>
      </button>
    </div>

    <!-- Tiroir de filtres Mobile -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="isMobileFilterOpen" class="fixed inset-0 z-[120] md:hidden" role="dialog" aria-modal="true">
          <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" @click="isMobileFilterOpen = false" />
          
          <Transition name="sheet-slide">
            <div class="absolute bottom-0 inset-x-0 rounded-t-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col">
              <div class="mx-auto w-12 h-1.5 rounded-full bg-slate-200 mb-5 flex-none" />
              
              <div class="flex items-center justify-between mb-5 flex-none">
                <h3 class="font-headline text-lg font-bold text-primary">Filtrer & Trier les bourses</h3>
                <button
                  type="button"
                  class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  @click="isMobileFilterOpen = false"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>

              <div class="space-y-4 flex-1">
                <!-- Ordre de Tri -->
                <div class="space-y-1">
                  <label class="text-[10px] font-bold uppercase tracking-wider text-amber-700">Ordre de tri</label>
                  <select v-model="sortBy" class="w-full rounded-lg border border-amber-300 bg-amber-50/50 px-3.5 py-3 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none">
                    <option value="economie_desc">Plus forte économie (FCFA)</option>
                    <option value="price_asc">Prix final le plus bas</option>
                    <option value="coverage_desc">Plus forte prise en charge (%)</option>
                  </select>
                </div>

                <!-- Partenaire -->
                <div class="space-y-1">
                  <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Partenaire</label>
                  <select v-model="partnerFilter" class="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm text-slate-700 focus:bg-white focus:outline-none">
                    <option value="">Tous les partenaires</option>
                    <option v-for="p in partners" :key="p.slug" :value="p.slug">{{ p.name }}</option>
                  </select>
                </div>

                <!-- Ville -->
                <div class="space-y-1">
                  <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ville</label>
                  <select v-model="cityFilter" class="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm text-slate-700 focus:bg-white focus:outline-none">
                    <option value="">Toutes les villes</option>
                    <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
                  </select>
                </div>

                <!-- Niveau -->
                <div class="space-y-1">
                  <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Niveau d'études</label>
                  <select v-model="levelFilter" class="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm text-slate-700 focus:bg-white focus:outline-none">
                    <option value="">Tous les niveaux</option>
                    <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
                  </select>
                </div>
              </div>

              <!-- Actions du tiroir -->
              <div class="mt-6 pt-4 border-t border-slate-100 flex gap-3 flex-none">
                <button
                  type="button"
                  class="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                  @click="resetFilters"
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:opacity-95"
                  @click="isMobileFilterOpen = false"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Grille de cartes -->
    <div v-if="displayedBourses.length" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ScholarshipCard v-for="b in displayedBourses" :key="b.id" :bourse="b" />
    </div>
    
    <p v-else class="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-premium">
      Aucune bourse ne correspond à votre recherche.
    </p>

    <!-- Sentinel element pour infinite scroll -->
    <div v-if="hasMore" ref="loadMoreSentinel" class="py-12 flex justify-center">
      <div class="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-primary"></div>
    </div>
  </main>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.22s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}
</style>
