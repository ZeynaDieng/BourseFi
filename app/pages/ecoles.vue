<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PartnerSchoolCardEcole } from '~/types/partner-school-card'

const { data: ecoles } = await useFetch('/api/etablissements')

const searchQ = ref('')
const cityFilter = ref('')

const cities = computed(() => {
  const all = (ecoles.value ?? []).map((e: any) => e.ville).filter(Boolean)
  return [...new Set(all)].sort()
})

const filteredEcoles = computed(() => {
  let list = (ecoles.value ?? []) as PartnerSchoolCardEcole[]
  const query = searchQ.value.trim().toLowerCase()
  if (query) {
    list = list.filter(
      (e) =>
        e.nom.toLowerCase().includes(query) ||
        (e.resume && e.resume.toLowerCase().includes(query)) ||
        e.ville.toLowerCase().includes(query)
    )
  }
  if (cityFilter.value) {
    list = list.filter((e) => e.ville === cityFilter.value)
  }
  return [...list].sort((a, b) => {
    const aDirect = a.isDirectPartner ? 1 : 0
    const bDirect = b.isDirectPartner ? 1 : 0
    if (bDirect !== aDirect) return bDirect - aDirect
    return a.nom.localeCompare(b.nom)
  })
})

useSiteSeo({
  title: 'Écoles partenaires | BourseFi',
  description: 'Découvrez les établissements d’enseignement supérieur partenaires de BourseFi au Sénégal.',
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-12 md:px-8">
    <header class="mb-10">
      <p class="text-xs font-bold uppercase tracking-widest text-secondary">BourseFi au Sénégal</p>
      <h1 class="font-headline text-4xl font-extrabold text-primary">Écoles partenaires</h1>
      <p class="mt-2 max-w-2xl text-slate-600">
        Découvrez les établissements partenaires et accédez directement aux bourses disponibles pour chaque école.
      </p>
    </header>

    <!-- Barre de Recherche et Filtres Écoles -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm animate-scale-up">
      <!-- Recherche -->
      <div class="relative flex-1 max-w-md">
        <span class="material-symbols-outlined absolute left-3.5 top-3.5 text-[18px] text-slate-400 select-none">search</span>
        <input
          v-model="searchQ"
          type="search"
          placeholder="Rechercher une école, un mot-clé..."
          class="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5"
        />
      </div>

      <!-- Filtre Ville -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Ville :</span>
        <select
          v-model="cityFilter"
          class="w-full sm:w-48 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/5"
        >
          <option value="">Toutes les villes</option>
          <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
    </div>

    <!-- Liste des écoles -->
    <div v-if="filteredEcoles.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <PartnerSchoolCard v-for="e in filteredEcoles" :key="e.slug" :ecole="e" class="animate-fade-in-up" />
    </div>

    <!-- État vide -->
    <p v-else class="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-premium">
      Aucun établissement ne correspond à votre recherche.
    </p>
  </main>
</template>
