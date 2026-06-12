<script setup lang="ts">
import { computed } from 'vue'
import type { MetierHubEntry } from '~/types/metier-hub'
import { MARKETING_IMAGES, metierVisual } from '~/utils/marketing-visuals'

const { data: programmes } = await useFetch('/api/programmes')
const { data: site } = await usePublicSite()

const recommended = computed(() => (programmes.value ?? []).slice(0, 3))

const metiers = computed(() => site.value?.metiers ?? [])
const guideMetiers = computed(() => metiers.value.slice(0, 3))

const ori = computed(() => (site.value?.content?.orientation_page ?? {}) as Record<string, string>)
const visuals = computed(() => (site.value?.content?.visual_assets ?? {}) as Record<string, string>)

const heroTitle = computed(() => ori.value.heroTitle || 'Trouver votre voie professionnelle avec BourseFi')
const heroSubtitle = computed(
  () =>
    ori.value.heroSubtitle ||
    'Parcourez les métiers d’avenir reliés au catalogue de formations financées, puis affinez avec la comparaison ou la procédure de bourse sur chaque programme.'
)

const heroImg = computed(() => ori.value.heroImageUrl || visuals.value.heroOrientation || MARKETING_IMAGES.heroOrientation)

const guidesTitle = computed(() => ori.value.guidesTitle || 'Guides métiers')
const guidesSubtitle = computed(
  () =>
    ori.value.guidesSubtitle ||
    'Contenus alignés sur le même référentiel que vos filtres parcours  dans le catalogue.'
)

const comparisonTitle = computed(() => ori.value.comparisonTitle || 'Comparaison côte à côte')
const comparisonSubtitle = computed(
  () =>
    ori.value.comparisonSubtitle ||
    'Sélectionnez jusqu’à quatre programmes réels du catalogue et comparez frais, durée, bailleur et débouchés.'
)
const comparisonImg = computed(
  () => ori.value.comparisonImageUrl || visuals.value.comparisonSection || MARKETING_IMAGES.comparisonSection
)
const comparisonCtaLabel = computed(() => ori.value.comparisonCtaLabel || 'Ouvrir l’outil de comparaison')
const comparisonCtaHref = computed(() => ori.value.comparisonCtaHref || '/comparaison')

const domainsHeading = computed(() => ori.value.domainsHeading || 'Domaines d’orientation')

const docsImg = computed(() => ori.value.docsImageUrl || visuals.value.orientationDocs || MARKETING_IMAGES.orientationDocs)

const sampleMetiers = computed(() => metiers.value.slice(0, 2))

function coverFor(m: MetierHubEntry) {
  return m.coverImageUrl?.trim() || metierVisual(m.slug)
}

useHead({
  title: 'Orientation — BourseFi'
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-8 py-12">
    <section class="mb-16">
      <div
        class="relative flex flex-col items-center gap-12 overflow-hidden rounded-3xl bg-primary p-12 text-white md:flex-row"
      >
        <div class="z-10 flex-1">
          <h1 class="mb-6 font-headline text-5xl font-extrabold leading-tight">
            {{ heroTitle }}
          </h1>
          <p class="mb-8 max-w-xl text-lg text-on-primary-container">
            {{ heroSubtitle }}
          </p>
          <div class="flex flex-wrap gap-3">
            <NuxtLink
              to="/metiers"
              class="inline-flex items-center gap-2 rounded-xl bg-secondary-container px-8 py-4 font-bold text-on-secondary-container transition hover:opacity-95"
            >
              Guide des métiers
              <span class="material-symbols-outlined">trending_flat</span>
            </NuxtLink>
            <NuxtLink
              to="/programmes"
              class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Catalogue des formations
            </NuxtLink>
          </div>
        </div>
        <div class="relative h-64 w-full flex-1 overflow-hidden rounded-2xl shadow-2xl md:h-96">
          <img
            :src="heroImg"
            alt="Étudiants en cours et orientation"
            class="h-full w-full object-cover"
            width="1400"
            height="933"
            loading="eager"
          />
        </div>
        <div class="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>
    </section>

    <div class="mb-20 grid grid-cols-1 gap-6 md:grid-cols-12">
      <div class="col-span-12 flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-10 shadow-premium md:col-span-7">
        <div>
          <div class="mb-6 flex items-center gap-3">
            <div class="rounded-xl bg-primary/5 p-3 text-primary">
              <span class="material-symbols-outlined">explore</span>
            </div>
            <h2 class="font-headline text-4xl font-bold text-primary">Quel métier viser ? </h2>
          </div>
          <p class="mb-8 max-w-lg leading-relaxed text-slate-600">
            Chaque fiche métier est reliée aux formations présentes sur BourseFi (même filtre que le catalogue). Vous
            voyez tout de suite quels parcours peuvent vous y mener.
          </p>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="ex in sampleMetiers"
            :key="ex.slug"
            :to="`/metiers/${ex.slug}`"
            class="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-primary/20"
          >
            <span class="material-symbols-outlined text-secondary">work</span>
            <div>
              <div class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Exemple</div>
              <div class="font-bold text-primary">{{ ex.label }}</div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <aside class="col-span-12 flex flex-col rounded-3xl bg-primary p-8 text-white md:col-span-5">
        <div class="mb-6 flex items-start justify-between gap-2">
          <h3 class="font-headline text-2xl font-bold">Aperçu du catalogue</h3>
        </div>
        <p class="mb-6 text-xs uppercase tracking-widest text-slate-400">Formations tirées des données en ligne</p>
        <div class="flex-grow space-y-3">
          <NuxtLink
            v-for="p in recommended"
            :key="p.id"
            :to="`/programmes/${p.slug}`"
            class="group block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h4 class="font-bold leading-snug">{{ p.titre }}</h4>
                <p class="mt-1 text-xs text-slate-400">{{ p.etablissement }} · {{ p.ville }}</p>
              </div>
              <span class="material-symbols-outlined shrink-0 text-sm text-white/30 group-hover:text-secondary">
                arrow_forward_ios
              </span>
            </div>
          </NuxtLink>
          <p v-if="!recommended.length" class="text-sm text-slate-400">Catalogue en cours de chargement.</p>
        </div>
        <NuxtLink
          to="/programmes"
          class="mt-8 flex items-center justify-between border-b border-secondary py-2 text-sm font-semibold text-secondary transition hover:border-white hover:text-white"
        >
          VOIR TOUT LE CATALOGUE
          <span class="material-symbols-outlined text-sm">open_in_new</span>
        </NuxtLink>
      </aside>
    </div>

    <section class="mb-16">
      <h2 class="mb-6 font-headline text-2xl font-extrabold text-primary md:text-3xl">
        {{ domainsHeading }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="m in metiers"
          :key="m.slug"
          :to="`/metiers/${m.slug}`"
          class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:border-primary/30 hover:bg-slate-50"
        >
          {{ m.label }}
        </NuxtLink>
      </div>
    </section>

    <section class="mb-20">
      <div class="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="mb-2 font-headline text-4xl font-extrabold text-primary">
            {{ guidesTitle }}
          </h2>
          <p class="text-slate-500">
            {{ guidesSubtitle }}
          </p>
        </div>
      </div>
      <div class="flex snap-x gap-6 overflow-x-auto pb-8">
        <article
          v-for="g in guideMetiers"
          :key="g.slug"
          class="group min-w-[300px] max-w-[340px] shrink-0 snap-start md:min-w-[340px]"
        >
          <NuxtLink :to="`/metiers/${g.slug}`" class="block">
            <div class="relative mb-4 h-40 overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-100">
              <img
                :src="coverFor(g)"
                :alt="`Guide — ${g.label}`"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                width="900"
                height="320"
                loading="lazy"
              />
              <div
                class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-primary shadow-sm backdrop-blur-sm"
              >
                Métier
              </div>
            </div>
            <h3 class="mb-2 font-headline text-2xl font-bold text-primary transition group-hover:text-secondary">
              {{ g.label }}
            </h3>
            <p class="line-clamp-3 text-slate-600">
              {{ g.shortDescription }}
            </p>
          </NuxtLink>
        </article>
        <article class="group min-w-[300px] max-w-[340px] shrink-0 snap-start md:min-w-[340px]">
          <NuxtLink to="/documents/pre-admission" class="block">
            <div class="relative mb-4 h-40 overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-100">
              <img
                :src="docsImg"
                alt="Documents et dossier"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                width="900"
                height="320"
                loading="lazy"
              />
              <div
                class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-primary shadow-sm backdrop-blur-sm"
              >
                Documents
              </div>
            </div>
            <h3 class="mb-2 font-headline text-2xl font-bold text-primary transition group-hover:text-secondary">
              Pré-admission & pièces
            </h3>
            <p class="text-slate-600">Préparez votre dossier avant de lancer une candidature bourse.</p>
          </NuxtLink>
        </article>
      </div>
    </section>

    <section>
      <div class="rounded-3xl border border-slate-200 bg-surface-container p-10">
        <div class="flex flex-col items-center gap-10 md:flex-row">
          <div class="md:w-1/3">
            <h2 class="mb-4 font-headline text-4xl font-extrabold text-primary">
              {{ comparisonTitle }}
            </h2>
            <p class="mb-6 text-slate-600">
              {{ comparisonSubtitle }}
            </p>
            <NuxtLink
              :to="comparisonCtaHref"
              class="inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-95"
            >
              {{ comparisonCtaLabel }}
            </NuxtLink>
          </div>
          <div class="grid gap-4 md:w-2/3 md:grid-cols-2">
            <img
              :src="comparisonImg"
              alt="Équipe comparant des options"
              class="h-44 w-full rounded-2xl object-cover md:col-span-2"
              width="1200"
              height="480"
              loading="lazy"
            />
            <div class="origin-right scale-95 rounded-2xl border border-slate-100 bg-white p-6 opacity-60 shadow-sm">
              <p class="text-xs font-semibold text-slate-400">Programme A</p>
              <p class="mt-2 text-sm font-bold text-primary">{{ (programmes ?? [])[0]?.titre ?? '—' }}</p>
            </div>
            <div class="relative rounded-2xl border-2 border-secondary bg-white p-6 shadow-md ring-4 ring-secondary/5">
              <div class="absolute -right-3 -top-3 rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-white">
                CATALOGUE
              </div>
              <p class="text-xs font-semibold text-slate-400">Programme B</p>
              <p class="mt-2 text-sm font-bold text-primary">{{ (programmes ?? [])[1]?.titre ?? '—' }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
