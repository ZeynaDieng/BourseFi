<script setup lang="ts">
definePageMeta({})

const route = useRoute()
const router = useRouter()

const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))

const { data: bourses } = await useFetch('/api/bourses')
const { data: programmes } = await useFetch('/api/programmes')
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
      sub: `${b.etablissement} · ${b.partnerName}`,
      to: `/bourses/${b.slug}`,
    })
  }
  for (const p of programmes.value ?? []) {
    items.push({
      type: 'formation',
      label: p.titre,
      sub: p.etablissement,
      to: `/programmes/${p.slug}`,
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

watch(
  () => route.query.q,
  () => {},
  { immediate: true },
)

useSeoMeta({ title: () => `Recherche${q.value ? `: ${q.value}` : ''} — BourseFi` })
</script>

<template>
  <main class="mx-auto max-w-4xl px-6 py-12">
    <h1 class="font-headline text-3xl font-extrabold text-primary">Recherche</h1>
    <form class="mt-6" @submit.prevent="router.replace({ query: { q: ($event.target as HTMLFormElement).q.value } })">
      <input
        name="q"
        :value="q"
        type="search"
        placeholder="Rechercher une bourse, une école, une formation..."
        class="w-full rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-premium"
      />
    </form>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="t in [
          { id: 'all', label: 'Tout' },
          { id: 'bourse', label: 'Bourses' },
          { id: 'formation', label: 'Formations' },
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

    <ul class="mt-8 space-y-3">
      <li v-for="(item, i) in filtered" :key="i">
        <NuxtLink
          :to="item.to"
          class="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-premium transition hover:border-primary/25"
        >
          <div>
            <p class="font-semibold text-primary">{{ item.label }}</p>
            <p class="text-sm text-slate-500">{{ item.sub }}</p>
          </div>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
            {{ item.type }}
          </span>
        </NuxtLink>
      </li>
    </ul>
    <p v-if="!filtered.length" class="mt-8 text-center text-slate-500">Aucun résultat.</p>
  </main>
</template>
