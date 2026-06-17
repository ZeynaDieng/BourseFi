<script setup lang="ts">
import { STUDENT_HOME } from '~/utils/routes'
import type { BourseDto } from '~/types/bourse'

const route = useRoute()
const router = useRouter()
const { data: programmes } = await useFetch('/api/programmes')
const { data: bourses } = await useFetch('/api/bourses', {
  query: { programme: route.params.slug as string },
})

const programme = computed(() =>
  programmes.value?.find((item: { slug: string }) => item.slug === route.params.slug),
)

const bourse = computed(() => (bourses.value ?? [])[0] as BourseDto | undefined)

const procedureOpen = ref(false)
const candidatureOpen = ref(false)

const programmeForModal = computed(() => {
  const p = programme.value
  if (!p) return null
  return {
    id: p.id,
    slug: p.slug,
    titre: p.titre,
    etablissement: p.etablissement,
    partnerName: p.partnerName,
    ville: p.ville,
    fraisDossier: p.fraisDossier,
    devise: p.devise,
    niveau: p.niveau,
    eligibilite: p.eligibilite,
    fraisScolarite: p.fraisScolarite ?? p.frais,
  }
})

function openApply() {
  if (bourse.value) {
    procedureOpen.value = true
  } else {
    candidatureOpen.value = true
  }
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
</script>

<template>
  <main v-if="programme" class="mx-auto max-w-4xl px-6 py-10 md:py-16">
    <nav class="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
      <NuxtLink to="/programmes" class="hover:text-primary">Formations</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-primary">Détails</span>
    </nav>

    <div class="mb-10">
      <h1 class="font-headline text-3xl font-extrabold text-primary md:text-5xl">
        {{ programme.titre }}
      </h1>
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <span class="flex items-center gap-1.5 rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary">
          {{ programme.etablissement }}
        </span>
        <span class="flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600">
          {{ programme.ville }}
        </span>
        <span class="flex items-center gap-1.5 rounded-full bg-secondary-container/10 px-4 py-1.5 text-xs font-bold text-primary">
          {{ programme.partnerName }}
        </span>
        <NuxtLink
          v-if="bourse"
          :to="`/bourses/${bourse.slug}`"
          class="rounded-full bg-secondary-container px-4 py-1.5 text-xs font-bold text-on-secondary-container"
        >
          Bourse {{ bourse.coveragePercent }} %
        </NuxtLink>
      </div>
    </div>

    <div class="mb-12 grid gap-6 lg:grid-cols-2">
      <ScholarshipEconomyCalculator
        v-if="bourse"
        :frais-scolarite="programme.fraisScolarite ?? programme.frais"
        :coverage-percent="bourse.coveragePercent"
        :montant-max="bourse.montantMax"
        :devise="programme.devise"
        :frais-dossier="programme.fraisDossier"
      />
      <div
        v-else
        class="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium"
      >
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Frais de scolarité</p>
        <p class="mt-2 text-3xl font-extrabold text-primary">
          {{ programme.frais.toLocaleString('fr-FR') }} {{ programme.devise }}
        </p>
      </div>

      <div id="procedure-bourse" class="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
        <p v-if="programme.fraisDossier > 0" class="mb-4 text-xs text-slate-500">
          Frais de dossier : {{ programme.fraisDossier.toLocaleString('fr-FR') }} {{ programme.devise }}
        </p>
        <button
          type="button"
          class="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition hover:opacity-95"
          @click="openApply"
        >
          Postuler à cette bourse
        </button>
        <NuxtLink
          v-if="bourse"
          :to="`/bourses/${bourse.slug}`"
          class="mt-4 block text-center text-sm font-semibold text-primary hover:underline"
        >
          Voir la fiche bourse →
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <section class="mb-12">
          <h2 class="mb-6 font-headline text-xl font-bold uppercase tracking-wider text-primary md:text-2xl">
            À propos de la formation
          </h2>
          <p class="text-lg leading-relaxed text-slate-600">{{ programme.description }}</p>
        </section>
        <section v-if="programme.eligibilite" class="mb-12 rounded-2xl bg-slate-50 p-6 md:p-8">
          <h3 class="mb-4 font-headline text-lg font-bold italic text-primary">Éligibilité & pièces</h3>
          <p class="whitespace-pre-line text-sm leading-relaxed text-slate-600">{{ programme.eligibilite }}</p>
        </section>
      </div>
      <aside class="lg:col-span-4">
        <div class="sticky top-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h4 class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">En résumé</h4>
          <p class="text-sm font-bold text-primary">Durée : {{ programme.duree }}</p>
          <p class="mt-2 text-sm font-bold text-primary">Niveau : {{ programme.niveau }}</p>
          <p v-if="programme.placement" class="mt-2 text-sm text-slate-600">Insertion : {{ programme.placement }}</p>
        </div>
      </aside>
    </div>
  </main>

  <ProcedureBourseModal
    :open="procedureOpen"
    :programme="programmeForModal"
    :bourse="bourse ?? null"
    @close="procedureOpen = false"
    @apply="onProcedureApply"
  />
  <CandidatureModal
    :open="candidatureOpen"
    :programme="programmeForModal"
    :bourse="bourse ?? null"
    @close="candidatureOpen = false"
    @submitted="onCandidatureSubmitted"
  />
</template>
