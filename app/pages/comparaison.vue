<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const { data: allProgrammes } = await useFetch('/api/programmes')

type Programme = NonNullable<typeof allProgrammes.value>[number]

const MAX_COMPARE = 4

const selectedSlugs = ref<string[]>([])

function parseCompareQuery(): string[] {
  const q = route.query.compare
  if (typeof q === 'string' && q.length > 0) {
    return q
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_COMPARE)
  }
  return []
}

function syncSelectionFromRoute() {
  const fromQuery = parseCompareQuery()
  if (fromQuery.length > 0) {
    const list = allProgrammes.value ?? []
    selectedSlugs.value = fromQuery.filter((s) => list.some((p) => p.slug === s))
    return
  }
  const list = allProgrammes.value ?? []
  selectedSlugs.value = list.slice(0, Math.min(3, list.length)).map((p) => p.slug)
}

watch(
  () => [route.query.compare, allProgrammes.value],
  () => syncSelectionFromRoute(),
  { immediate: true }
)

const comparedProgrammes = computed(() => {
  const list = allProgrammes.value ?? []
  const order = selectedSlugs.value
  return order.map((s) => list.find((p) => p.slug === s)).filter((p): p is Programme => Boolean(p))
})

function toggleSlug(slug: string) {
  const set = new Set(selectedSlugs.value)
  if (set.has(slug)) set.delete(slug)
  else if (set.size < MAX_COMPARE) set.add(slug)
  selectedSlugs.value = Array.from(set)
  const compare = selectedSlugs.value.join(',')
  router.replace({ query: { ...route.query, compare: compare || undefined } })
}

function selectDefaults() {
  const list = allProgrammes.value ?? []
  selectedSlugs.value = list.slice(0, Math.min(3, list.length)).map((p) => p.slug)
  router.replace({ query: { ...route.query, compare: selectedSlugs.value.join(',') } })
}

useHead({
  title: 'Comparaison de programmes — BourseFi'
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-8 py-12">
    <header class="mb-8">
      <h1 class="font-headline text-4xl font-extrabold text-primary">Comparaison de programmes</h1>
      <p class="mt-2 max-w-2xl text-slate-600">
        Sélectionnez jusqu’à {{ MAX_COMPARE }} formations du catalogue. La matrice est générée à partir des données
        réelles de l’API. Partagez une URL avec
        <code class="rounded bg-slate-100 px-1 text-sm">?compare=slug1,slug2</code>.
      </p>
    </header>

    <section class="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-premium">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-headline text-lg font-bold text-primary">Sélection ({{ selectedSlugs.length }} / {{ MAX_COMPARE }})</h2>
        <button
          type="button"
          class="text-sm font-semibold text-primary underline-offset-2 hover:underline"
          @click="selectDefaults"
        >
          Réinitialiser (3 premiers du catalogue)
        </button>
      </div>
      <div class="max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-3 md:max-h-64">
        <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="p in allProgrammes ?? []" :key="p.id">
            <label
              class="flex cursor-pointer items-start gap-2 rounded-lg border border-transparent bg-white px-3 py-2 text-sm transition hover:border-primary/20"
              :class="selectedSlugs.includes(p.slug) ? 'ring-1 ring-primary/30' : ''"
            >
              <input
                type="checkbox"
                class="mt-1 rounded border-slate-300 text-primary"
                :checked="selectedSlugs.includes(p.slug)"
                :disabled="!selectedSlugs.includes(p.slug) && selectedSlugs.length >= MAX_COMPARE"
                @change="toggleSlug(p.slug)"
              />
              <span class="min-w-0">
                <span class="line-clamp-2 font-medium text-primary">{{ p.titre }}</span>
                <span class="block truncate text-xs text-slate-500">{{ p.etablissement }}</span>
              </span>
            </label>
          </li>
        </ul>
      </div>
    </section>

    <div v-if="comparedProgrammes.length === 0" class="rounded-xl border border-amber-200 bg-amber-50/50 p-6 text-amber-900">
      Aucun programme valide dans la sélection. Choisissez au moins une formation dans la liste ci-dessus.
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-blue-900/5">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-left text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="sticky left-0 z-10 min-w-[10rem] bg-slate-50 p-4 text-xs uppercase tracking-widest text-slate-500">
                Critère
              </th>
              <th
                v-for="p in comparedProgrammes"
                :key="p.id"
                class="max-w-[14rem] p-4 align-top"
              >
                <div class="mb-3 flex h-16 items-center justify-center rounded-lg bg-primary/5 text-xs font-semibold text-primary">
                  {{ p.etablissement.slice(0, 1).toUpperCase() }}
                </div>
                <h3 class="font-headline text-base font-bold leading-snug text-primary">
                  {{ p.titre }}
                </h3>
                <p class="mt-1 text-xs text-slate-500">{{ p.etablissement }} · {{ p.ville }}</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-slate-100">
              <td class="sticky left-0 z-10 bg-white p-4 font-semibold text-primary shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                Bailleur
              </td>
              <td v-for="p in comparedProgrammes" :key="`${p.id}-bailleur`" class="p-4 text-slate-600">
                {{ p.partnerName }}
              </td>
            </tr>
            <tr class="border-t border-slate-100">
              <td class="sticky left-0 z-10 bg-white p-4 font-semibold text-primary shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                Frais dossier
              </td>
              <td v-for="p in comparedProgrammes" :key="`${p.id}-fraisd`" class="p-4 text-slate-600">
                {{ (p.fraisDossier ?? 0).toLocaleString('fr-FR') }} {{ p.devise }}
              </td>
            </tr>
            <tr class="border-t border-slate-100">
              <td class="sticky left-0 z-10 bg-white p-4 font-semibold text-primary shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                Niveau
              </td>
              <td v-for="p in comparedProgrammes" :key="`${p.id}-niveau`" class="p-4 text-slate-600">{{ p.niveau }}</td>
            </tr>
            <tr class="border-t border-slate-100">
              <td class="sticky left-0 z-10 bg-white p-4 font-semibold text-primary shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                Scolarité ref.
              </td>
              <td v-for="p in comparedProgrammes" :key="`${p.id}-frais`" class="p-4 font-bold text-primary">
                {{ p.frais.toLocaleString('fr-FR') }} {{ p.devise }}
              </td>
            </tr>
            <tr class="border-t border-slate-100">
              <td class="sticky left-0 z-10 bg-white p-4 font-semibold text-primary shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                Durée
              </td>
              <td v-for="p in comparedProgrammes" :key="`${p.id}-duree`" class="p-4 text-slate-600">{{ p.duree }}</td>
            </tr>
            <tr class="border-t border-slate-100">
              <td class="sticky left-0 z-10 bg-white p-4 font-semibold text-primary shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                Insertion
              </td>
              <td v-for="p in comparedProgrammes" :key="`${p.id}-placement`" class="p-4 text-slate-600">
                {{ p.placement || '—' }}
              </td>
            </tr>
            <tr class="border-t border-slate-100">
              <td class="sticky left-0 z-10 bg-white p-4 font-semibold text-primary shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                Débouchés (extrait)
              </td>
              <td v-for="p in comparedProgrammes" :key="`${p.id}-proj`" class="p-4 text-xs text-slate-600">
                {{ (p.perspectives || p.description || '').slice(0, 160) }}<span
                  v-if="(p.perspectives || p.description || '').length > 160"
                >…</span>
              </td>
            </tr>
            <tr class="border-t border-slate-100 bg-slate-50/30">
              <td class="sticky left-0 z-10 bg-slate-50/30 p-4" />
              <td v-for="p in comparedProgrammes" :key="`${p.id}-cta`" class="p-4">
                <NuxtLink
                  :to="`/programmes/${p.slug}#procedure-bourse`"
                  class="block rounded-lg bg-primary px-3 py-2.5 text-center text-xs font-bold text-white"
                >
                  Procédure & candidature
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <section class="mt-16 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
      <div class="space-y-4">
        <h2 class="font-headline text-3xl font-extrabold text-primary">Besoin d'un conseil ?</h2>
        <p class="text-slate-600">
          Explorez le <NuxtLink to="/metiers" class="font-semibold text-primary underline-offset-2 hover:underline">guide des métiers</NuxtLink>
          ou la page <NuxtLink to="/orientation" class="font-semibold text-primary underline-offset-2 hover:underline">orientation</NuxtLink>.
        </p>
        <div class="flex gap-3">
          <NuxtLink to="/candidature" class="rounded-lg bg-primary px-6 py-3 font-semibold text-white">Candidature</NuxtLink>
          <NuxtLink to="/programmes" class="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-primary">
            Catalogue
          </NuxtLink>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-premium">
        <p class="text-sm text-slate-600">Comparez des programmes financés par différents bailleurs avant de lancer votre dossier sur BourseFi.</p>
      </div>
    </section>
  </main>
</template>
