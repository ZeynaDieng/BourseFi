<script setup lang="ts">
import { computed } from 'vue'
import type { MetierHubEntry } from '~/types/metier-hub'
import { metierVisual } from '~/utils/marketing-visuals'

const { data: site } = await usePublicSite()

const hub = computed(() => (site.value?.content?.metiers_hub_page ?? {}) as Record<string, string>)
const metiers = computed(() => site.value?.metiers ?? [])

const heroImg = computed(
  () =>
    hub.value.heroImageUrl ||
    (site.value?.content?.visual_assets as Record<string, string> | undefined)?.heroMetiersHub ||
    ''
)

function coverFor(m: MetierHubEntry) {
  return m.coverImageUrl?.trim() || metierVisual(m.slug)
}

useHead({
  title: 'Guide des métiers — BourseFi'
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-8 py-12">
    <header class="mb-12 grid gap-10 md:grid-cols-2 md:items-center">
      <div class="text-center md:text-left">
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          {{ hub.kicker || 'Orientation' }}
        </p>
        <h1 class="font-headline text-4xl font-extrabold text-primary md:text-5xl">
          {{ hub.title || 'Guide des métiers' }}
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-slate-600 md:mx-0">
          {{
            hub.subtitle ||
            'Chaque fiche relie un parcours professionnel aux formations financées sur la plateforme. Les contenus s’appuient sur le même référentiel que le catalogue des programmes.'
          }}
        </p>
      </div>
      <div v-if="heroImg" class="overflow-hidden rounded-2xl shadow-premium ring-1 ring-slate-100">
        <img
          :src="heroImg"
          alt="Remise de diplômes et parcours étudiants"
          class="h-56 w-full object-cover md:h-72"
          width="1400"
          height="800"
          loading="lazy"
        />
      </div>
    </header>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="m in metiers"
        :key="m.slug"
        class="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium transition hover:border-primary/15 hover:shadow-lg"
      >
        <img
          :src="coverFor(m)"
          :alt="`Visuel — ${m.label}`"
          class="h-40 w-full object-cover"
          width="900"
          height="320"
          loading="lazy"
        />
        <div class="flex flex-1 flex-col p-6">
          <div class="mb-3 flex items-start justify-between gap-2">
            <h2 class="font-headline text-lg font-bold text-primary md:text-xl">{{ m.label }}</h2>
            <span class="shrink-0 rounded-full bg-secondary/10 px-2.5 py-0.5 text-[10px] font-semibold text-secondary">
              {{ m.employability }}
            </span>
          </div>
          <p class="mb-4 flex-1 text-sm leading-relaxed text-slate-600">{{ m.shortDescription }}</p>
          <div class="mb-4 rounded-xl bg-surface-container-low px-3 py-2 text-xs">
            <span class="font-semibold text-primary">Salaire indicatif</span>
            <p class="text-slate-600">{{ m.salary }}</p>
          </div>
          <div class="mt-auto flex flex-wrap gap-2">
            <NuxtLink
              :to="`/metiers/${m.slug}`"
              class="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-95"
            >
              Ouvrir la fiche
            </NuxtLink>
            <NuxtLink
              :to="{ path: '/programmes', query: { metier: m.slug } }"
              class="inline-flex items-center justify-center rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              Formations
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <p class="mt-10 text-center text-sm text-slate-500">
      {{
        hub.footnote ||
          'Les fourchettes salariales sont indicatives et évoluent selon l’expérience et le secteur.'
      }}
    </p>
  </main>
</template>
