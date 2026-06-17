<script setup lang="ts">
import { candidatureBadge } from '~/utils/student-dossier'

definePageMeta({ layout: 'student-app', middleware: 'student-auth' })

const route = useRoute()
const { data: candidatures } = await useFetch('/api/candidatures')

const filterStatus = computed(() => (route.query.status as string) || '')

const statusFilters = [
  { value: '', label: 'Tous' },
  { value: 'EN_ATTENTE_PAIEMENT', label: 'Paiement' },
  { value: 'EN_REVUE_PARTENAIRE', label: 'En analyse' },
  { value: 'ACCEPTE', label: 'Acceptés' },
  { value: 'REFUSE', label: 'Refusés' },
]

const filtered = computed(() => {
  const list = candidatures.value ?? []
  if (!filterStatus.value) return list
  return list.filter((c) => c.status === filterStatus.value)
})

useSeoMeta({ title: 'Mes candidatures — BourseFi' })
</script>

<template>
  <main class="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-primary/[0.04] to-background pb-8">
    <StudentPageShell title="Mes candidatures" subtitle="Suivez l'avancement de vos dossiers de bourse.">
      <div class="-mx-4 mb-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        <NuxtLink
          v-for="f in statusFilters"
          :key="f.value"
          :to="f.value ? `/etudiant/candidatures?status=${f.value}` : '/etudiant/candidatures'"
          class="shrink-0 snap-start rounded-full px-4 py-2 text-xs font-semibold transition active:scale-[0.98]"
          :class="filterStatus === f.value ? 'bg-primary text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'"
        >
          {{ f.label }}
        </NuxtLink>
      </div>

      <ul class="space-y-4">
        <li
          v-for="c in filtered"
          :key="c.id"
          class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium"
        >
          <div class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-primary">{{ c.programmeTitre }}</p>
                <p class="text-sm text-slate-500">{{ c.etablissementNom }}</p>
                <p class="text-xs text-slate-400">{{ c.partnerName }}</p>
              </div>
              <ApplicationStatusBadge :status="c.status" />
            </div>
            <p class="mt-2 text-xs text-slate-500">{{ c.statusLabel }}</p>
          </div>
          <div class="flex flex-wrap gap-2 border-t border-slate-50 bg-slate-50/50 p-3">
            <NuxtLink
              v-if="c.status === 'EN_ATTENTE_PAIEMENT' && c.fraisDossier > 0"
              :to="`/paiement?candidatureId=${c.id}`"
              class="flex min-h-10 flex-1 items-center justify-center rounded-xl bg-secondary-container px-3 text-xs font-bold text-on-secondary-container active:scale-[0.98] sm:flex-none"
            >
              Payer {{ c.fraisDossier.toLocaleString('fr-FR') }} {{ c.devise }}
            </NuxtLink>
            <a
              v-if="c.documentUrl"
              :href="c.documentUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex min-h-10 items-center justify-center rounded-xl border border-primary px-3 text-xs font-semibold text-primary active:scale-[0.98]"
            >
              Attestation
            </a>
            <NuxtLink
              :to="`/programmes/${c.programmeSlug}`"
              class="flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 active:scale-[0.98]"
            >
              Formation
            </NuxtLink>
          </div>
        </li>
      </ul>

      <div
        v-if="!filtered.length"
        class="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"
      >
        <span class="material-symbols-outlined text-[40px] text-slate-300">inbox</span>
        <p class="mt-3 text-slate-500">Aucune candidature pour ce filtre.</p>
        <NuxtLink
          to="/bourses"
          class="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white active:scale-[0.98]"
        >
          Trouver une bourse
        </NuxtLink>
      </div>
    </StudentPageShell>
  </main>
</template>
