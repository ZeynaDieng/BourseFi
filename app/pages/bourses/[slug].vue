<script setup lang="ts">
import { STUDENT_HOME } from '~/utils/routes'
import type { BourseDto } from '~/types/bourse'

const route = useRoute()
const router = useRouter()

const { data: bourse, error } = await useFetch<BourseDto>(
  () => `/api/bourses/${route.params.slug}`,
)

const procedureOpen = ref(false)
const candidatureOpen = ref(false)

const programmeForModal = computed(() => {
  if (!bourse.value) return null
  return {
    id: bourse.value.programmeId,
    slug: bourse.value.programmeSlug,
    titre: bourse.value.programmeTitre,
    etablissement: bourse.value.etablissement,
    partnerName: bourse.value.partnerName,
    ville: bourse.value.ville,
    fraisDossier: bourse.value.fraisDossier,
    devise: bourse.value.devise,
  }
})

function openApply() {
  procedureOpen.value = true
}

function onProcedureApply() {
  procedureOpen.value = false
  candidatureOpen.value = true
}

function onCandidatureSubmitted(payload: { candidatureId: string; requiresPayment: boolean }) {
  if (payload.requiresPayment) {
    router.push(`/paiement?candidatureId=${encodeURIComponent(payload.candidatureId)}`)
  } else {
    router.push(STUDENT_HOME)
  }
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
  <main v-if="bourse" class="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16">
    <nav class="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
      <NuxtLink to="/bourses" class="hover:text-primary">Bourses</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="truncate text-primary">{{ bourse.titre }}</span>
    </nav>

    <header class="mb-10">
      <div class="flex flex-wrap gap-2">
        <span class="inline-flex rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
          {{ bourse.coveragePercent }} % financé
        </span>
        <span class="inline-flex rounded-full bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
          {{ bourse.programmeNiveau }}
        </span>
        <span
          v-if="bourse.placesRestantes <= 5 && bourse.placesRestantes > 0"
          class="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"
        >
          Places limitées
        </span>
      </div>
      <h1 class="mt-4 font-headline text-3xl font-extrabold leading-tight text-primary md:text-5xl">
        {{ bourse.titre }}
      </h1>
      <p class="mt-3 text-lg font-medium text-slate-600">
        {{ bourse.programmeTitre }}
      </p>
      <div class="mt-4 flex flex-wrap gap-2 text-sm">
        <NuxtLink
          :to="`/etablissements/${bourse.etablissementSlug}`"
          class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-primary hover:bg-primary/5"
        >
          <span class="material-symbols-outlined text-base">school</span>
          {{ bourse.etablissement }}
        </NuxtLink>
        <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
          <span class="material-symbols-outlined text-base">location_on</span>
          {{ bourse.ville }}
        </span>
        <NuxtLink
          :to="`/partenaires/${bourse.partnerSlug}`"
          class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600 hover:bg-primary/5"
        >
          {{ bourse.partnerName }}
        </NuxtLink>
      </div>
    </header>

    <div class="mb-10 grid gap-6 lg:grid-cols-2">
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

    <section v-if="bourse.programmeDescription" class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary">Présentation de la formation</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {{ bourse.programmeDescription }}
      </p>
    </section>

    <section
      v-if="bourse.programmePerspectives || bourse.programmePlacement"
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

  <ProcedureBourseModal
    :open="procedureOpen"
    :programme="programmeForModal"
    :bourse="bourse"
    @close="procedureOpen = false"
    @apply="onProcedureApply"
  />
  <CandidatureModal
    :open="candidatureOpen"
    :programme="programmeForModal"
    :bourse="bourse"
    @close="candidatureOpen = false"
    @submitted="onCandidatureSubmitted"
  />
</template>
