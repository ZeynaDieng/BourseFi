<template>
  <section class="border-b border-slate-100 bg-white py-20">
    <div class="mx-auto max-w-7xl px-8">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {{ block.kicker || 'Avantages' }}
      </p>
      <h2
        class="mx-auto mb-4 max-w-3xl text-center font-headline text-3xl font-extrabold text-primary md:text-4xl"
      >
        {{ block.title || 'Pourquoi choisir la plateforme' }}
      </h2>
      <p class="mx-auto mb-14 max-w-2xl text-center text-on-surface-variant">
        {{
          block.subtitle ||
          'Un parcours pensé pour les familles et les étudiants au Sénégal : moins de friction, plus de clarté.'
        }}
      </p>
      <div v-if="bannerUrl" class="mb-14 overflow-hidden rounded-2xl shadow-premium ring-1 ring-slate-100">
        <img
          :src="bannerUrl"
          alt="Étudiants en salle de cours"
          class="h-52 w-full object-cover md:h-64"
          width="1600"
          height="640"
          loading="lazy"
        />
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="item in reasons"
          :key="item.title"
          class="group rounded-2xl border border-slate-100 bg-surface-container-lowest p-8 shadow-premium transition duration-300 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-lg"
        >
          <div
            class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition duration-300 group-hover:bg-secondary/20"
          >
            <span class="material-symbols-outlined text-[26px]">{{ item.icon }}</span>
          </div>
          <h3 class="mb-3 font-headline text-lg font-bold text-primary">{{ item.title }}</h3>
          <p class="text-sm leading-relaxed text-on-surface-variant">{{ item.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MARKETING_IMAGES } from '~/utils/marketing-visuals'

type Reason = { icon: string; title: string; description: string }

const { data: site } = await usePublicSite()

const block = computed(() => (site.value?.content?.why_choose ?? {}) as Record<string, string>)
const visuals = computed(() => (site.value?.content?.visual_assets ?? {}) as Record<string, string>)

const bannerUrl = computed(() => {
  const b = site.value?.content?.why_choose as Record<string, string> | undefined
  const fromBlock = b?.bannerImageUrl
  return fromBlock || visuals.value.whyChooseBanner || MARKETING_IMAGES.whyChooseBanner
})

const defaultReasons: Reason[] = [
  {
    icon: 'schedule',
    title: 'Gain de temps',
    description:
      "Une seule interface pour explorer les formations, comprendre les conditions et lancer votre dossier sans multiplier les déplacements."
  },
  {
    icon: 'hub',
    title: 'Centralisation des bourses',
    description:
      'Les opportunités financées par mairies, agences et bailleurs sont regroupées avec des fiches claires et à jour.'
  },
  {
    icon: 'visibility',
    title: 'Suivi transparent',
    description:
      'Chaque étape de candidature est visible : statut, documents demandés et validation par le partenaire financier.'
  },
  {
    icon: 'smartphone',
    title: 'Mobile partout au Sénégal',
    description:
      'Interface responsive et pensée pour les connexions mobiles : postulez et suivez votre dossier depuis votre smartphone.'
  }
]

const reasons = computed(() => {
  const raw = (site.value?.content?.why_choose as { reasons?: Reason[] } | undefined)?.reasons
  return raw?.length ? raw : defaultReasons
})
</script>
