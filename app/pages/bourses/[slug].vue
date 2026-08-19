<script setup lang="ts">
import type { BourseDto } from '~/types/bourse'

const route = useRoute()
const showCoveragePercent = useShowCoveragePercent()

const { data: bourse, error } = await useFetch<any>(
  () => `/api/bourses/${route.params.slug}`,
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const { whatsappUrl } = useBoursefiContact()

const parsedCompetences = computed(() => {
  if (!bourse.value?.programmeCompetences) return []
  try {
    const raw = JSON.parse(bourse.value.programmeCompetences)
    return Array.isArray(raw) ? raw : [bourse.value.programmeCompetences]
  } catch {
    return [bourse.value.programmeCompetences]
  }
})

const parsedDebouches = computed(() => {
  if (!bourse.value?.programmeDebouches) return []
  try {
    const raw = JSON.parse(bourse.value.programmeDebouches)
    return Array.isArray(raw) ? raw : [bourse.value.programmeDebouches]
  } catch {
    return [bourse.value.programmeDebouches]
  }
})

useSiteSeo({
  title: () => (bourse.value ? `${bourse.value.titre} — BourseFi` : 'Bourse — BourseFi'),
  description: () =>
    bourse.value
      ? `${bourse.value.programmeTitre} · ${bourse.value.etablissement} · prise en charge ${bourse.value.coveragePercent} %`
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
      <div class="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 via-slate-50 to-primary/5 md:h-48">
        <img
          v-if="bourse.etablissementCoverImageUrl"
          :src="bourse.etablissementCoverImageUrl"
          :alt="bourse.etablissement"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
        <div class="absolute bottom-4 left-5 flex items-center gap-3">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md">
            <img v-if="bourse.etablissementLogoUrl" :src="bourse.etablissementLogoUrl" :alt="bourse.etablissement" class="h-9 w-9 object-contain" />
            <span v-else class="material-symbols-outlined text-2xl text-primary">school</span>
          </div>
          <div>
            <NuxtLink :to="`/etablissements/${bourse.etablissementSlug}`" class="text-sm font-semibold text-white hover:underline flex items-center gap-1">
              {{ bourse.etablissement }}
              <span class="material-symbols-outlined text-xs">open_in_new</span>
            </NuxtLink>
            <p class="flex items-center gap-1 text-xs text-white/80">
              <span class="material-symbols-outlined text-sm">location_on</span>
              {{ bourse.ville }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-6 md:p-8">
        <div class="flex flex-wrap gap-2">
          <span v-if="showCoveragePercent && bourse.coveragePercent > 0" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">
            <span class="material-symbols-outlined text-sm">verified</span>
            {{ bourse.coveragePercent }} % de prise en charge
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

        <!-- Stats en grille -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50">
          <div class="p-4 text-center">
            <p class="font-headline text-xl font-bold text-primary">
              {{ bourse.fraisDossier.toLocaleString('fr-FR') }}
            </p>
            <p class="mt-0.5 text-xs text-slate-500">{{ bourse.devise }} de dossier</p>
          </div>
          <div v-if="showCoveragePercent && bourse.coveragePercent > 0" class="p-4 text-center">
            <p class="font-headline text-xl font-bold text-emerald-600">
              {{ bourse.coveragePercent }} %
            </p>
            <p class="mt-0.5 text-xs text-slate-500">Prise en charge</p>
          </div>
          <div class="p-4 text-center">
            <p class="font-headline text-xl font-bold text-primary">{{ bourse.programmeDuree }}</p>
            <p class="mt-0.5 text-xs text-slate-500">Durée formation</p>
          </div>
        </div>

        <NuxtLink
          :to="`/postuler/${route.params.slug}`"
          class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition hover:opacity-95 active:scale-[0.99]"
        >
          POSTULER À CETTE BOURSE
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </NuxtLink>
        <p class="mt-3 text-center text-xs text-slate-500">Compte requis · Environ 2 minutes</p>
      </div>
    </header>

    <!-- Section Détail du financement avec espacement aéré -->
    <section class="my-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-xl font-bold text-primary mb-4">Détail du financement</h2>

      <!-- Message Commercial Dynamique d'Économie -->
      <div v-if="bourse.economie && bourse.economie > 0" class="mb-6 rounded-2xl bg-amber-50/80 border border-amber-200 p-4 text-center shadow-sm">
        <p class="font-headline text-base font-extrabold text-amber-950">
          Cette opportunité vous permet d'économiser {{ bourse.economie.toLocaleString('fr-FR') }} {{ bourse.devise }} sur le tarif normal !
        </p>
      </div>
      <div v-else class="mb-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 p-4 text-center shadow-sm">
        <p class="font-headline text-base font-extrabold text-emerald-950">
          ✨ Tarif officiel réduit garanti 2026-2027 pour les candidats inscrits sur BourseFi !
        </p>
      </div>

      <div v-if="bourse.hasTuitionFee || (bourse.tarifs && bourse.tarifs.length > 0)">
        <div class="grid gap-4 sm:grid-cols-2 md:gap-x-12 text-sm">
          <div v-if="bourse.tuitionFee" class="flex items-center justify-between border-b border-slate-100 py-3 gap-4">
            <span class="text-slate-500 font-medium">Tarif public normal</span>
            <span class="font-bold text-slate-400 line-through whitespace-nowrap">{{ bourse.tuitionFee?.toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
          </div>

          <div v-if="bourse.fraisInscription" class="flex items-center justify-between border-b border-slate-100 py-3 gap-4">
            <span class="text-slate-700 font-medium">Frais d'inscription préférentiels</span>
            <span class="font-bold text-primary whitespace-nowrap">{{ bourse.fraisInscription.toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
          </div>

          <div v-if="bourse.mensualite" class="flex items-center justify-between border-b border-slate-100 py-3 gap-4">
            <span class="text-slate-700 font-medium">Mensualité préférentielle</span>
            <span class="font-bold text-primary whitespace-nowrap">{{ bourse.mensualite.toLocaleString('fr-FR') }} {{ bourse.devise }} / mois (× {{ bourse.nombreMois || 10 }} mois)</span>
          </div>
          
          <div class="flex items-center justify-between border-b border-slate-100 py-3 gap-4">
            <span class="text-slate-800 font-bold">Total après bourse</span>
            <span class="font-black text-emerald-700 text-base whitespace-nowrap">{{ (bourse.montantBourse || bourse.resteACharge || bourse.tuitionFee || 0).toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
          </div>

          <div v-if="bourse.economie && bourse.economie > 0" class="flex items-center justify-between border-b border-slate-100 py-3 gap-4">
            <span class="text-amber-900 font-extrabold">VOUS ÉCONOMISEZ</span>
            <span class="font-black text-amber-800 text-base whitespace-nowrap">{{ bourse.economie.toLocaleString('fr-FR') }} {{ bourse.devise }} <template v-if="bourse.economiePercent">({{ bourse.economiePercent }} %)</template></span>
          </div>

          <div v-if="bourse.etablissementSlug === 'ifaa-dakar'" class="flex items-center justify-between border-b border-slate-100 py-3 gap-4">
            <span class="text-slate-500 font-medium">Carte CIAE obligatoire (inscription)</span>
            <span class="font-bold text-slate-800 whitespace-nowrap">5 000 FCFA</span>
          </div>

          <div v-if="bourse.autresFrais" class="flex items-center justify-between border-b border-slate-100 py-3 gap-4">
            <span class="text-slate-500 font-medium">Frais d'examen Santé (L3)</span>
            <span class="font-bold text-slate-800 whitespace-nowrap">{{ bourse.autresFrais.toLocaleString('fr-FR') }} FCFA</span>
          </div>

          <div class="flex items-center justify-between border-b border-slate-100 py-3 gap-4">
            <span class="text-slate-500 font-medium">Frais de dossier BourseFi</span>
            <span class="font-bold text-slate-800 whitespace-nowrap">{{ bourse.fraisDossier.toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
          </div>
        </div>

        <!-- Décomposition détaillée des tarifs par année (Inscription, Mensualité, Durée) -->
        <div v-if="bourse.tarifs && bourse.tarifs.length > 0" class="mt-6 border-t border-slate-100 pt-5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Décomposition des tarifs par année</h3>
          <div class="grid gap-3 sm:grid-cols-3">
            <div v-for="t in bourse.tarifs" :key="t.id" class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs space-y-2">
              <div class="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span class="font-bold text-primary">{{ t.label || t.anneeAcademique }}</span>
                <span class="font-extrabold text-emerald-700">{{ (t.montantBourse || t.montant).toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
              </div>
              <div v-if="t.fraisInscription" class="flex justify-between text-slate-500">
                <span>Inscription :</span>
                <span class="font-semibold text-slate-700">{{ t.fraisInscription.toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
              </div>
              <div v-if="t.mensualite" class="flex justify-between text-slate-500">
                <span>Mensualités :</span>
                <span class="font-semibold text-slate-700">{{ t.mensualite.toLocaleString('fr-FR') }} {{ bourse.devise }} × {{ t.nombreMois || 10 }} mois</span>
              </div>
              <div v-if="t.fraisSoutenance" class="flex justify-between text-slate-500">
                <span>Soutenance :</span>
                <span class="font-semibold text-slate-700">{{ t.fraisSoutenance.toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
              </div>
              <div v-if="t.fraisUniforme" class="flex justify-between text-slate-500 border-t border-slate-200/40 pt-1.5 mt-1 text-[11px]">
                <span class="text-slate-400">Uniforme (frais annexe) :</span>
                <span class="font-medium text-slate-600">{{ t.fraisUniforme.toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="rounded-2xl bg-slate-50 p-5 text-sm">
        <div class="flex justify-between border-b border-slate-200/60 pb-3 mb-3">
          <span class="text-slate-500">Frais de scolarité</span>
          <span class="font-bold text-slate-800">À confirmer auprès de l'établissement.</span>
        </div>
        <div class="flex justify-between border-b border-slate-200/60 pb-3 mb-3">
          <span class="text-slate-500">Taux de prise en charge</span>
          <span class="font-bold text-emerald-600">{{ bourse.coveragePercent }} %</span>
        </div>
        <div class="flex justify-between pb-1">
          <span class="text-slate-500">Frais de dossier</span>
          <span class="font-bold text-slate-800">{{ bourse.fraisDossier.toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
        </div>
        <p class="mt-4 text-xs italic text-slate-500">
          Les frais de scolarité peuvent varier selon l'année académique et les conditions de l'établissement.
        </p>
      </div>

      <p v-if="bourse.fraisDossierEtranger && bourse.fraisDossierEtranger !== bourse.fraisDossier" class="mt-4 text-xs text-slate-500">
        Frais de dossier pour les résidents étrangers : {{ bourse.fraisDossierEtranger.toLocaleString('fr-FR') }} {{ bourse.devise }}
      </p>
    </section>

    <!-- Bloc Aide & Support BourseFi -->
    <section class="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary mb-2">Besoin d'aide ?</h2>
      <p class="text-xs leading-relaxed text-slate-600 mb-3">
        Une question sur cette bourse, votre candidature ou les démarches à suivre ? Notre équipe BourseFi est là pour vous accompagner.
      </p>

      <p class="text-xs font-medium text-slate-500 mb-5 flex items-center gap-1.5">
        <span class="material-symbols-outlined text-sm text-primary">info</span>
        Les candidatures à cette bourse se font directement sur BourseFi.
      </p>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <a
          :href="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-white transition hover:opacity-90 shadow-sm"
        >
          <span class="material-symbols-outlined text-base">support_agent</span>
          Contacter BourseFi
        </a>

        <a
          v-if="bourse.etablissementSite"
          :href="bourse.etablissementSite"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
        >
          <span class="material-symbols-outlined text-base">language</span>
          Site officiel de l'établissement
        </a>
      </div>

      <p class="mt-4 text-[11px] leading-normal text-slate-400 italic">
        Les frais de scolarité, les conditions d'inscription et certaines modalités peuvent évoluer. Consultez le site officiel de l'établissement pour obtenir les informations les plus récentes.
      </p>
    </section>

    <BourseProcessTimeline v-reveal class="mb-8" />

    <section v-if="bourse.programmeDescription" v-reveal class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary">Présentation de la formation</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {{ bourse.programmeDescription }}
      </p>
    </section>

    <!-- Objectifs de la formation -->
    <section v-if="bourse.programmeObjectifs" v-reveal class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary mb-3">Objectifs de la formation</h2>
      <p class="whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {{ bourse.programmeObjectifs }}
      </p>
    </section>

    <!-- Compétences visées -->
    <section v-if="parsedCompetences.length > 0" v-reveal class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary mb-4">Compétences visées</h2>
      <ul class="grid gap-2.5 sm:grid-cols-2 text-sm text-slate-700">
        <li v-for="(comp, idx) in parsedCompetences" :key="idx" class="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
          <span class="material-symbols-outlined text-base text-primary shrink-0 mt-0.5">check_circle</span>
          <span class="leading-normal">{{ comp }}</span>
        </li>
      </ul>
    </section>

    <!-- Programme Pédagogique -->
    <section v-if="bourse.programmePedagogique" v-reveal class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary mb-3">Programme pédagogique & Modules de formation</h2>
      <p class="whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {{ bourse.programmePedagogique }}
      </p>
    </section>

    <!-- Débouchés professionnels -->
    <section v-if="parsedDebouches.length > 0" v-reveal class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary mb-4">Débouchés professionnels</h2>
      <div class="flex flex-wrap gap-2.5">
        <span
          v-for="(job, idx) in parsedDebouches"
          :key="idx"
          class="inline-flex items-center gap-1.5 rounded-xl bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary ring-1 ring-primary/10"
        >
          <span class="material-symbols-outlined text-sm">work</span>
          {{ job }}
        </span>
      </div>
      <p v-if="bourse.programmeSecteurs" class="mt-4 text-xs text-slate-500 italic">
        Secteurs d'activité : {{ bourse.programmeSecteurs }}
      </p>
    </section>

    <!-- Modalités & Stages -->
    <section v-if="bourse.programmeModalites || bourse.programmeStage" v-reveal class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary mb-4">Modalités d'études & Stages</h2>
      <div class="grid gap-4 sm:grid-cols-2 text-xs">
        <div v-if="bourse.programmeModalites" class="rounded-xl bg-slate-50 p-4">
          <p class="font-bold text-slate-700 uppercase tracking-wider mb-1">Modalités de cours</p>
          <p class="text-slate-600 leading-relaxed">{{ bourse.programmeModalites }}</p>
        </div>
        <div v-if="bourse.programmeStage" class="rounded-xl bg-slate-50 p-4">
          <p class="font-bold text-slate-700 uppercase tracking-wider mb-1">Stage professionnel</p>
          <p class="text-slate-600 leading-relaxed">{{ bourse.programmeStage }}</p>
        </div>
      </div>
    </section>

    <section v-if="bourse.programmeEligibilite || bourse.programmeConditionsAdmission" class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
      <h2 class="font-headline text-lg font-bold text-primary">Éligibilité & Conditions d'admission</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {{ bourse.programmeConditionsAdmission || bourse.programmeEligibilite }}
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
            · {{ bourse.coveragePercent }} % de prise en charge
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
