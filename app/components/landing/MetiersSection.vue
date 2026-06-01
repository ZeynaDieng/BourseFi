<template>
  <section class="py-20">
    <div class="mx-auto max-w-7xl px-8">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {{ block.kicker || 'Orientation' }}
      </p>
      <h2 class="mx-auto mb-4 max-w-3xl text-center font-headline text-3xl font-extrabold text-primary md:text-4xl">
        {{ block.title || 'Métiers & débouchés' }}
      </h2>
      <p class="mx-auto mb-14 max-w-2xl text-center text-on-surface-variant">
        {{ block.subtitle ||
          "Des parcours alignés sur la demande des entreprises et institutions au Sénégal et en Afrique de l'Ouest." }}
      </p>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="metier in metiers"
          :key="metier.slug"
          class="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium transition duration-300 hover:border-primary/20 hover:shadow-lg"
        >
          <img
            :src="metier.coverImageUrl?.trim() || metierVisual(metier.slug)"
            :alt="`Illustration — ${metier.label}`"
            class="h-44 w-full object-cover"
            width="900"
            height="352"
            loading="lazy"
          />
          <div class="flex flex-1 flex-col p-7">
            <div class="mb-4 flex items-start justify-between gap-3">
              <h3 class="font-headline text-xl font-bold text-primary">{{ metier.label }}</h3>
              <span
                class="shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"
              >
                {{ metier.employability }}
              </span>
            </div>
            <p class="mb-5 flex-1 text-sm leading-relaxed text-on-surface-variant">{{ metier.shortDescription }}</p>
            <div class="mb-5 rounded-xl bg-surface-container-low px-4 py-3 text-sm">
              <span class="font-semibold text-primary">Salaire indicatif</span>
              <p class="mt-0.5 text-on-surface-variant">{{ metier.salary }}</p>
            </div>
            <div class="mt-auto flex flex-col gap-2 sm:flex-row">
              <NuxtLink
                :to="`/metiers/${metier.slug}`"
                class="inline-flex flex-1 items-center justify-center rounded-xl border border-primary bg-primary py-3 text-center text-sm font-semibold text-white transition duration-200 hover:opacity-95"
              >
                Fiche métier
              </NuxtLink>
              <NuxtLink
                :to="{ path: '/programmes', query: { metier: metier.slug } }"
                class="inline-flex flex-1 items-center justify-center rounded-xl border border-primary bg-white py-3 text-center text-sm font-semibold text-primary transition duration-200 hover:bg-primary hover:text-white"
              >
                Formations
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
      <p class="mt-10 text-center text-sm text-on-surface-variant">
        {{ block.footnote || defaultFootnote }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { metierVisual } from '~/utils/marketing-visuals'

const { data: site } = await usePublicSite()

const block = computed(() => (site.value?.content?.landing_metiers ?? {}) as Record<string, string>)
const metiers = computed(() => site.value?.metiers ?? [])
const defaultFootnote =
  'Les fourchettes sont indicatives (FCFA / an, Dakar et grandes villes) et évoluent selon l’expérience.'
</script>
