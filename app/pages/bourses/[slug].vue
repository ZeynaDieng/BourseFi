<script setup lang="ts">
import type { BourseDto } from '~/types/bourse'

const route = useRoute()

const { data: bourse, error } = await useFetch<BourseDto>(
  () => `/api/bourses/${route.params.slug}`,
)

function openApply() {
  navigateTo(`/postuler/${route.params.slug}`)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

useSeoMeta({
  title: () => (bourse.value ? `${bourse.value.titre} — BourseFi` : 'Bourse — BourseFi'),
  description: () =>
    bourse.value
      ? `${bourse.value.programmeTitre} · ${bourse.value.etablissement} · couverture ${bourse.value.coveragePercent} %`
      : undefined,
})
</script>

<template>
  <main v-if="bourse" class="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-10">
    <nav class="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
      <NuxtLink to="/bourses" class="hover:text-primary">Bourses</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="truncate text-primary">{{ bourse.titre }}</span>
    </nav>

    <!-- Hero -->
    <header class="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/85 p-6 text-white shadow-premium md:p-10">
      <div class="flex flex-wrap gap-2">
        <span class="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          {{ bourse.coveragePercent }} % financé
        </span>
        <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
          {{ bourse.programmeNiveau }}
        </span>
        <span
          v-if="bourse.placesRestantes <= 5 && bourse.placesRestantes > 0"
          class="inline-flex rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container"
        >
          Places limitées
        </span>
      </div>
      <h1 class="mt-4 font-headline text-3xl font-extrabold leading-tight md:text-5xl">
        {{ bourse.titre }}
      </h1>
      <p class="mt-2 text-lg font-medium text-white/75">
        {{ bourse.programmeTitre }}
      </p>

      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl bg-white/10 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-white/60">Financé</p>
          <p class="mt-1 font-headline text-2xl font-extrabold text-secondary-container">{{ bourse.coveragePercent }} %</p>
        </div>
        <div class="rounded-2xl bg-white/10 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-white/60">Pris en charge</p>
          <p class="mt-1 font-headline text-2xl font-extrabold">
            <AnimatedNumber :value="bourse.montantBourse" />
            <span class="text-sm font-semibold text-white/70">{{ bourse.devise }}</span>
          </p>
        </div>
        <div class="rounded-2xl bg-white/10 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-white/60">Places restantes</p>
          <p class="mt-1 font-headline text-2xl font-extrabold">{{ bourse.placesRestantes }}</p>
        </div>
      </div>

      <button
        type="button"
        class="mt-6 w-full rounded-2xl bg-secondary-container px-8 py-4 font-bold text-on-secondary-container shadow-lg transition hover:opacity-95 active:scale-[0.99] sm:w-auto"
        @click="openApply"
      >
        Postuler à cette bourse
      </button>
    </header>

    <!-- Indicateurs -->
    <div class="mt-6 flex flex-wrap gap-2 text-sm">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-primary">
        <span class="material-symbols-outlined text-base">workspace_premium</span>
        Niveau : {{ bourse.programmeNiveau }}
      </span>
      <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">
        <span class="material-symbols-outlined text-base">location_on</span>
        {{ bourse.ville }}
      </span>
      <NuxtLink
        :to="`/etablissements/${bourse.etablissementSlug}`"
        class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-primary transition hover:bg-primary/5"
      >
        <span class="material-symbols-outlined text-base">school</span>
        {{ bourse.etablissement }}
      </NuxtLink>
      <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">
        <span class="material-symbols-outlined text-base">event</span>
        Limite : {{ formatDate(bourse.dateLimite) }}
      </span>
      <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">
        <span class="material-symbols-outlined text-base">group</span>
        {{ bourse.placesRestantes }} places
      </span>
    </div>

    <div class="mb-10 mt-8 grid gap-6 lg:grid-cols-2">
      <ScholarshipEconomyCalculator
        :frais-scolarite="bourse.fraisScolarite"
        :coverage-percent="bourse.coveragePercent"
        :montant-max="bourse.montantMax"
        :devise="bourse.devise"
        :frais-dossier="bourse.fraisDossier"
      />
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
        <h2 class="font-headline text-lg font-bold text-primary">Financement</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Montant couvert</dt>
            <dd class="font-bold text-secondary">
              {{ bourse.montantBourse.toLocaleString('fr-FR') }} {{ bourse.devise }}
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Reste à charge</dt>
            <dd class="font-semibold text-primary">
              {{ bourse.resteACharge.toLocaleString('fr-FR') }} {{ bourse.devise }}
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Places restantes</dt>
            <dd class="font-semibold">{{ bourse.placesRestantes }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Date limite</dt>
            <dd class="font-semibold">{{ formatDate(bourse.dateLimite) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Durée</dt>
            <dd class="font-semibold">{{ bourse.programmeDuree }}</dd>
          </div>
        </dl>
        <button
          type="button"
          class="mt-8 w-full rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition hover:opacity-95 active:scale-[0.99]"
          @click="openApply"
        >
          Postuler à cette bourse
        </button>
      </div>
    </div>

    <BourseProcessTimeline v-reveal class="mb-8" />

    <section v-if="bourse.programmeDescription" v-reveal class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary">Présentation de la formation</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {{ bourse.programmeDescription }}
      </p>
    </section>

    <section
      v-if="bourse.programmePerspectives || bourse.programmePlacement"
      v-reveal
      class="mb-8 rounded-2xl bg-slate-50 p-6 md:p-8"
    >
      <h2 class="font-headline text-lg font-bold text-primary">Débouchés</h2>
      <p v-if="bourse.programmePlacement" class="mt-2 text-sm font-semibold text-secondary">
        {{ bourse.programmePlacement }}
      </p>
      <p
        v-if="bourse.programmePerspectives"
        class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600"
      >
        {{ bourse.programmePerspectives }}
      </p>
    </section>

    <section v-if="bourse.programmeEligibilite" class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
      <h2 class="font-headline text-lg font-bold text-primary">Éligibilité</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {{ bourse.programmeEligibilite }}
      </p>
    </section>

    <section v-if="bourse.conditions" class="mb-8 rounded-2xl bg-slate-50 p-6 md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary">Conditions de la bourse</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{{ bourse.conditions }}</p>
    </section>

    <section v-if="bourse.documentsRequis" class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
      <h2 class="font-headline text-lg font-bold text-primary">Documents requis</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{{ bourse.documentsRequis }}</p>
    </section>

    <div v-if="bourse.programmeBrochureUrl" class="text-center">
      <a
        :href="bourse.programmeBrochureUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <span class="material-symbols-outlined text-lg">picture_as_pdf</span>
        Télécharger la brochure
      </a>
    </div>
  </main>

  <main v-else-if="error" class="mx-auto max-w-lg px-6 py-20 text-center">
    <p class="text-slate-600">Bourse introuvable.</p>
    <NuxtLink to="/bourses" class="mt-4 inline-block font-semibold text-primary">Retour au catalogue</NuxtLink>
  </main>
</template>
