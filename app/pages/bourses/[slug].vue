<script setup lang="ts">
import type { BourseDto } from '~/types/bourse'

const route = useRoute()

const { data: bourse, error } = await useFetch<BourseDto>(
  () => `/api/bourses/${route.params.slug}`,
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

useSiteSeo({
  title: () => (bourse.value ? `${bourse.value.titre}  BourseFi` : 'Bourse  BourseFi'),
  description: () =>
    bourse.value
      ? `${bourse.value.programmeTitre} · ${bourse.value.etablissement} · couverture ${bourse.value.coveragePercent} %`
      : undefined,
  canonical: () => (bourse.value ? `/bourses/${bourse.value.slug}` : '/bourses'),
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
    <header class="overflow-hidden rounded-3xl bg-white shadow-premium">
      <!-- Bandeau école : image + logo, remplace le simple gradient plat -->
      <div class="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 via-slate-50 to-primary/5 md:h-48">
        <img
          v-if="bourse.etablissementCoverImageUrl"
          :src="bourse.etablissementCoverImageUrl"
          :alt="bourse.etablissement"
          class="absolute inset-0 h-full w-full object-cover"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
        <div class="absolute bottom-4 left-5 flex items-center gap-3">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md">
            <img v-if="bourse.etablissementLogoUrl" :src="bourse.etablissementLogoUrl" :alt="bourse.etablissement" class="h-9 w-9 object-contain">
            <span v-else class="material-symbols-outlined text-2xl text-primary">school</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-white">{{ bourse.etablissement }}</p>
            <p class="flex items-center gap-1 text-xs text-white/80">
              <span class="material-symbols-outlined text-sm">location_on</span>
              {{ bourse.ville }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-6 md:p-8">
        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span class="material-symbols-outlined text-sm">check_circle</span>
            {{ bourse.coveragePercent === 100 ? 'Bourse complète' : 'Demi-bourse' }}
          </span>
          <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {{ bourse.programmeNiveau }}
          </span>
        </div>

        <h1 class="mt-3 font-headline text-2xl font-bold leading-snug text-primary md:text-4xl">
          {{ bourse.titre }}
        </h1>
        <p class="mt-1 text-sm text-slate-500 md:text-base">
          {{ bourse.programmeTitre }}
        </p>

        <!-- Stats en grille avec séparateurs, plus de contraste que 3 cards blanches identiques -->
        <div class="mt-6 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50">
          <div class="p-4 text-center">
            <p class="font-headline text-xl font-bold text-primary">
              {{ bourse.fraisDossier.toLocaleString('fr-FR') }}
            </p>
            <p class="mt-0.5 text-xs text-slate-500">{{ bourse.devise }} de dossier</p>
          </div>
          <div class="p-4 text-center">
            <p class="font-headline text-xl font-bold text-emerald-600">
              {{ bourse.coveragePercent === 100 ? 'Complète' : '50 %' }}
            </p>
            <p class="mt-0.5 text-xs text-slate-500">de couverture</p>
          </div>
          <div class="p-4 text-center">
            <p class="font-headline text-xl font-bold text-primary">{{ bourse.programmeDuree }}</p>
            <p class="mt-0.5 text-xs text-slate-500">de formation</p>
          </div>
        </div>

       

        <NuxtLink
          :to="`/postuler/${route.params.slug}`"
          class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition hover:opacity-95 active:scale-[0.99]"
        >
          Postuler à cette bourse
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </NuxtLink>
        <p class="mt-3 text-center text-xs text-slate-500">Compte requis · Environ 2 minutes</p>
      </div>
    </header>

    <!-- Détail financement, désormais secondaire visuellement puisque le hero porte déjà les chiffres clés -->
    <section class="mb-10 mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary">Détail du financement</h2>
      <dl class="mt-4 grid gap-4 sm:grid-cols-2">
       
        <div class="flex justify-between gap-3">
          <dt class="text-slate-500">Reste à charge</dt>
          <dd class="font-semibold text-primary">
            {{ bourse.resteACharge.toLocaleString('fr-FR') }} {{ bourse.devise }}
          </dd>
        </div>
      </dl>
      <p
        v-if="bourse.fraisDossierEtranger && bourse.fraisDossierEtranger !== bourse.fraisDossier"
        class="mt-4 text-xs text-slate-500"
      >
        Frais de dossier pour les résidents étrangers : {{ bourse.fraisDossierEtranger.toLocaleString('fr-FR') }} {{ bourse.devise }}
      </p>
    </section>

    <BourseProcessTimeline v-reveal class="mb-8" />

    <section v-if="bourse.programmeDescription" v-reveal class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary">Présentation de la formation</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {{ bourse.programmeDescription }}
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

    <div v-if="bourse.programmeBrochureUrl" class="mb-24 text-center md:mb-0">
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

    <!-- CTA sticky mobile -->
    <div class="fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <div class="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-primary">
            {{ bourse.fraisDossier.toLocaleString('fr-FR') }} {{ bourse.devise }}
            · {{ bourse.coveragePercent === 100 ? 'Bourse complète' : 'Demi-bourse' }}
          </p>
          
        </div>
        <NuxtLink
          :to="`/postuler/${route.params.slug}`"
          class="flex-shrink-0 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
        >
          Postuler
        </NuxtLink>
      </div>
    </div>
  </main>

  <main v-else-if="error" class="mx-auto max-w-lg px-6 py-20 text-center">
    <p class="text-slate-600">Bourse introuvable.</p>
    <NuxtLink to="/bourses" class="mt-4 inline-block font-semibold text-primary">Retour au catalogue</NuxtLink>
  </main>
</template>
