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
})
</script>

<template>
  <main v-if="bourse" class="mx-auto max-w-4xl px-6 py-10 md:py-16">
    <nav class="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
      <NuxtLink to="/bourses" class="hover:text-primary">Bourses</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-primary">Fiche</span>
    </nav>

    <div class="mb-8">
      <span class="inline-flex rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
        Couverture {{ bourse.coveragePercent }} %
      </span>
      <h1 class="mt-4 font-headline text-3xl font-extrabold text-primary md:text-5xl">
        {{ bourse.titre }}
      </h1>
      <div class="mt-4 flex flex-wrap gap-3">
        <span class="rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary">
          {{ bourse.etablissement }}
        </span>
        <span class="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600">
          {{ bourse.partnerName }}
        </span>
        <span class="rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900">
          {{ bourse.placesRestantes }} place(s) restante(s)
        </span>
        <span class="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600">
          Limite : {{ formatDate(bourse.dateLimite) }}
        </span>
      </div>
    </div>

    <div class="mb-10 grid gap-6 lg:grid-cols-2">
      <ScholarshipEconomyCalculator
        :frais-scolarite="bourse.fraisScolarite"
        :coverage-percent="bourse.coveragePercent"
        :montant-max="bourse.montantMax"
        :devise="bourse.devise"
        :frais-dossier="bourse.fraisDossier"
      />
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
        <h2 class="font-headline text-lg font-bold text-primary">Formation associée</h2>
        <p class="mt-2 text-slate-600">{{ bourse.programmeTitre }}</p>
        <NuxtLink
          :to="`/programmes/${bourse.programmeSlug}`"
          class="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Voir la fiche formation →
        </NuxtLink>
        <div id="procedure-bourse" class="mt-8">
          <button
            type="button"
            class="w-full rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition hover:opacity-95"
            @click="openApply"
          >
            Postuler à cette bourse
          </button>
        </div>
      </div>
    </div>

    <section v-if="bourse.conditions" class="mb-8 rounded-2xl bg-slate-50 p-6 md:p-8">
      <h2 class="font-headline text-lg font-bold text-primary">Conditions</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{{ bourse.conditions }}</p>
    </section>

    <section v-if="bourse.documentsRequis" class="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
      <h2 class="font-headline text-lg font-bold text-primary">Documents requis</h2>
      <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{{ bourse.documentsRequis }}</p>
    </section>
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
