<script setup lang="ts">
import { computed } from 'vue'
import type { MetierHubEntry } from '~/types/metier-hub'
import { isKnownMetierTrack } from '~/utils/metier-tracks'
import { metierVisual } from '~/utils/marketing-visuals'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const { data: entry, status } = await useAsyncData(
  () => `metier-detail:${slug.value}`,
  () => $fetch<MetierHubEntry>(`/api/metiers-hub/${encodeURIComponent(slug.value)}`),
  { watch: [slug] }
)

if (status.value === 'error' || !entry.value) {
  throw createError({ statusCode: 404, statusMessage: 'Métier introuvable' })
}

const { data: formationsMetier } = await useAsyncData(
  () => `metier-formations:${slug.value}`,
  async () => {
    if (!isKnownMetierTrack(slug.value)) return []
    return $fetch('/api/programmes', { query: { metier: slug.value } })
  },
  { watch: [slug] }
)

const pageTitle = computed(() => `${entry.value!.label} — Guide métier | BourseFi`)

const heroCover = computed(() => entry.value!.coverImageUrl?.trim() || metierVisual(entry.value!.slug))

useHead({
  title: pageTitle
})
</script>

<template>
  <main v-if="entry" class="mx-auto max-w-7xl px-8 py-12">
    <nav class="mb-6 text-xs text-slate-500">
      <NuxtLink to="/metiers" class="hover:text-primary">Guide des métiers</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-slate-800">{{ entry.label }}</span>
    </nav>

    <section class="mb-12 rounded-2xl border border-slate-100 bg-white p-8 shadow-premium md:p-10">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-secondary">Fiche métier</p>
          <h1 class="font-headline text-4xl font-extrabold text-primary md:text-5xl">
            {{ entry.label }}
          </h1>
          <p class="mt-4 max-w-xl text-slate-600">{{ entry.shortDescription }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <span class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-primary">
              Employabilité : {{ entry.employability }}
            </span>
            <span class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-primary">
              {{ entry.salary }}
            </span>
          </div>
          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink
              :to="{ path: '/programmes', query: { metier: slug } }"
              class="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Voir les formations liées
            </NuxtLink>
            <NuxtLink
              to="/comparaison"
              class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-slate-50"
            >
              Comparer des programmes
            </NuxtLink>
          </div>
        </div>
        <div class="relative min-h-[220px] overflow-hidden rounded-2xl shadow-inner ring-1 ring-slate-100">
          <img
            :src="heroCover"
            :alt="`Contexte professionnel — ${entry.label}`"
            class="h-full min-h-[220px] w-full object-cover"
            width="900"
            height="440"
            loading="lazy"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
          <p class="absolute bottom-0 left-0 right-0 p-6 text-sm leading-relaxed text-white/95">
            Les programmes listés ci-dessous sont issus du
            <strong class="text-secondary-container">catalogue BourseFi</strong>
            filtré automatiquement sur ce parcours (titres, contenu et débouchés).
          </p>
        </div>
      </div>
    </section>

    <section class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-12">
      <article class="rounded-2xl border border-slate-100 bg-white p-8 shadow-premium md:col-span-7">
        <h2 class="mb-6 font-headline text-2xl font-bold text-primary">Missions types</h2>
        <ul class="space-y-3 text-slate-700">
          <li v-for="(mission, i) in entry.missions" :key="i" class="flex gap-3">
            <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
            <span>{{ mission }}</span>
          </li>
        </ul>
      </article>
      <aside class="rounded-2xl bg-primary p-8 text-white md:col-span-5">
        <h3 class="mb-4 font-headline text-xl font-bold">Rémunération indicative</h3>
        <p class="text-3xl font-extrabold text-secondary-container">{{ entry.salary }}</p>
        <p class="mt-4 text-sm text-slate-300">{{ entry.salaryNote }}</p>
      </aside>
    </section>

    <section class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-12">
      <article class="rounded-2xl border border-slate-100 bg-white p-8 shadow-premium md:col-span-8">
        <h3 class="mb-6 font-headline text-2xl font-bold text-primary">Progression de carrière</h3>
        <div class="space-y-4 text-sm text-slate-700">
          <p v-for="step in entry.career" :key="step.level">
            <strong class="text-primary">{{ step.level }} :</strong>
            {{ step.text }}
          </p>
        </div>
      </article>
      <aside class="rounded-2xl border border-slate-100 bg-white p-8 shadow-premium md:col-span-4">
        <h3 class="mb-4 font-headline text-xl font-bold text-primary">Compétences fréquentes</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in entry.skills"
            :key="skill"
            class="rounded-lg bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
          >
            {{ skill }}
          </span>
        </div>
      </aside>
    </section>

    <section class="rounded-2xl border border-slate-100 bg-slate-50/50 p-8">
      <h2 class="mb-2 font-headline text-2xl font-bold text-primary">Formations sur BourseFi pour ce métier</h2>
      <p class="mb-6 text-sm text-slate-600">
        {{ formationsMetier?.length ?? 0 }} programme{{ (formationsMetier?.length ?? 0) !== 1 ? 's' : '' }} dans le
        catalogue actuel (filtré comme sur la page programmes).
      </p>
      <ul v-if="formationsMetier?.length" class="space-y-2">
        <li v-for="p in formationsMetier" :key="p.id">
          <NuxtLink
            :to="`/programmes/${p.slug}`"
            class="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-primary/20"
          >
            <span class="font-semibold text-primary">{{ p.titre }}</span>
            <span class="text-xs text-slate-500">{{ p.etablissement }} · {{ p.ville }}</span>
          </NuxtLink>
        </li>
      </ul>
      <p v-else class="text-sm text-slate-500">
        Aucune formation indexée pour l’instant sur ce volet — consultez le
        <NuxtLink to="/programmes" class="font-semibold text-primary underline-offset-2 hover:underline">catalogue complet</NuxtLink>.
      </p>
    </section>
  </main>
</template>
