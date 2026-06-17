<script setup lang="ts">
definePageMeta({})

const route = useRoute()

const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))

const { data: bourses } = await useFetch('/api/bourses')
const { data: ecoles } = await useFetch('/api/etablissements')
const { data: partners } = await useFetch('/api/partners')

const tab = ref('all')

type SearchItem = { type: string; label: string; sub: string; to: string }

const allItems = computed((): SearchItem[] => {
  const items: SearchItem[] = []
  for (const b of bourses.value ?? []) {
    items.push({
      type: 'bourse',
      label: b.titre,
      sub: `${b.etablissement} · ${b.programmeTitre}`,
      to: `/bourses/${b.slug}`,
    })
  }
  for (const e of ecoles.value ?? []) {
    items.push({
      type: 'ecole',
      label: e.nom,
      sub: e.ville,
      to: `/etablissements/${e.slug}`,
    })
  }
  for (const p of partners.value ?? []) {
    items.push({
      type: 'partenaire',
      label: p.name,
      sub: `${p.boursesCount} bourse(s)`,
      to: `/partenaires/${p.slug}`,
    })
  }
  return items
})

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  let list = allItems.value
  if (tab.value !== 'all') {
    list = list.filter((i) => i.type === tab.value)
  }
  if (!query) return list.slice(0, 50)
  return list
    .filter(
      (i) =>
        i.label.toLowerCase().includes(query) ||
        i.sub.toLowerCase().includes(query),
    )
    .slice(0, 50)
})

function setTab(t: string) {
  tab.value = t
}

useSeoMeta({
  title: () => (q.value ? `Recherche : ${q.value} — BourseFi` : 'Recherche — BourseFi'),
})
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
    <h1 class="font-headline text-2xl font-extrabold text-primary md:text-3xl">Recherche</h1>
    <p v-if="q" class="mt-2 text-slate-600">Résultats pour « {{ q }} »</p>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="t in [
          { id: 'all', label: 'Tout' },
          { id: 'bourse', label: 'Bourses' },
          { id: 'ecole', label: 'Écoles' },
          { id: 'partenaire', label: 'Partenaires' },
        ]"
        :key="t.id"
        type="button"
        class="rounded-full px-4 py-2 text-xs font-semibold transition"
        :class="tab === t.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'"
        @click="setTab(t.id)"
      >
        {{ t.label }}
      </button>
    </div>

    <ul class="mt-8 space-y-2">
      <li v-for="(item, i) in filtered" :key="i">
        <NuxtLink
          :to="item.to"
          class="block rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-primary/20 hover:shadow-md"
        >
          <p class="font-semibold text-primary">{{ item.label }}</p>
          <p class="text-xs text-slate-500">{{ item.sub }}</p>
        </NuxtLink>
      </li>
    </ul>

    <p v-if="!filtered.length" class="mt-12 text-center text-slate-500">Aucun résultat.</p>
  </main>
</template>
