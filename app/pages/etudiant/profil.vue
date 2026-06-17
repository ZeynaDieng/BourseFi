<script setup lang="ts">
import {
  buildCandidatureTimeline,
  candidatureBadge,
  computeDossierProgress,
  estimatedResponse,
} from '~/utils/student-dossier'
import { buildStudentDocuments } from '~/composables/useStudentDossier'

definePageMeta({ layout: 'student-app', middleware: 'student-auth' })

const { data: me, refresh: refreshMe } = await useFetch('/api/auth/me')
const { data: candidatures } = await useFetch('/api/candidatures')
const { data: paiements } = await useFetch('/api/paiements')

const firstName = computed(() => me.value?.user?.name?.split(/\s+/)[0] || 'Étudiant')
const dossier = computed(() => computeDossierProgress(candidatures.value))

const latest = computed(() => candidatures.value?.[0] ?? null)
const timeline = computed(() => buildCandidatureTimeline(latest.value?.status))
const responseHint = computed(() => estimatedResponse(latest.value?.status))
const statusInfo = computed(() => candidatureBadge(latest.value?.status ?? ''))
const reference = computed(() => latest.value?.id?.slice(0, 8).toUpperCase() ?? '')
const nextStep = computed(
  () => timeline.value.find((s) => s.state === 'active')?.label ?? 'Dossier finalisé',
)

function formatShort(value?: string | Date | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const timelineDates = computed(() => {
  const l = latest.value
  return [formatShort(l?.createdAt), '', '', '', formatShort(l?.documentIssuedAt)]
})

const statusPercent = ref(0)
onMounted(() => {
  requestAnimationFrame(() => {
    statusPercent.value = dossier.value.percent
  })
})

const documents = computed(() => buildStudentDocuments(candidatures.value, paiements.value))

const stats = computed(() => [
  { label: 'Candidatures', value: candidatures.value?.length ?? 0 },
  { label: 'Documents', value: documents.value.length },
  { label: 'Paiements', value: paiements.value?.length ?? 0 },
])

const quickActions = [
  { to: '/bourses', icon: 'add_circle', label: 'Nouvelle demande' },
  { to: '/etudiant/documents', icon: 'folder', label: 'Mes documents' },
  { to: '/etudiant/candidatures', icon: 'description', label: 'Mes candidatures' },
  { to: '/etudiant/paiements', icon: 'payments', label: 'Paiements' },
  { to: '/etudiant/notifications', icon: 'notifications', label: 'Notifications' },
  { to: '/etudiant/support', icon: 'help', label: 'Support' },
]

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshMe()
  await navigateTo('/auth/login')
}
</script>

<template>
  <main class="min-h-[calc(100dvh-4rem)] bg-slate-50 pb-8 md:pb-12">
    <div class="mx-auto w-full max-w-lg space-y-4 px-4 pt-5 md:max-w-3xl md:px-6">
      <!-- Section 1 : Hero principal -->
      <section v-reveal class="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1 class="font-headline text-xl font-extrabold text-primary">Bonjour, {{ firstName }} 👋</h1>
            <p class="truncate text-xs text-slate-400">{{ me?.user?.email }}</p>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-red-500"
            aria-label="Déconnexion"
            title="Déconnexion"
            @click="logout"
          >
            <span class="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>

        <!-- Avec candidature -->
        <div v-if="latest" class="mt-5">
          <div class="flex items-center justify-between gap-3">
            <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold" :class="statusInfo.className">
              {{ statusInfo.label }}
            </span>
            <span class="font-headline text-lg font-extrabold text-primary">{{ dossier.percent }}%</span>
          </div>

          <div class="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
              :style="{ width: `${statusPercent}%` }"
            />
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
            <span v-if="responseHint" class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
              {{ responseHint }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
              {{ nextStep }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-slate-400">tag</span>
              Réf. {{ reference }}
            </span>
          </div>
        </div>

        <!-- Sans candidature -->
        <div v-else class="mt-4">
          <p class="text-sm text-slate-600">
            Vous n’avez pas encore de demande de bourse. Lancez-vous, cela prend moins de 2 minutes.
          </p>
          <NuxtLink
            to="/bourses"
            class="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-95"
          >
            <span class="material-symbols-outlined text-[20px]">search</span>
            Trouver une bourse
          </NuxtLink>
        </div>
      </section>

      <!-- Section 2 : Timeline du dossier -->
      <section v-if="latest" v-reveal class="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
        <h2 class="font-headline text-base font-bold text-primary">Suivi de mon dossier</h2>
        <ol class="mt-4">
          <li v-for="(s, i) in timeline" :key="s.label" class="flex gap-3">
            <div class="flex flex-col items-center">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition"
                :class="{
                  'bg-emerald-500 text-white': s.state === 'done',
                  'bg-blue-500 text-white ring-4 ring-blue-100': s.state === 'active',
                  'bg-slate-100 text-slate-400': s.state === 'todo',
                }"
              >
                <span v-if="s.state === 'done'" class="material-symbols-outlined text-[18px]">check</span>
                <span v-else class="material-symbols-outlined text-[18px]">{{ s.icon }}</span>
              </span>
              <span
                v-if="i < timeline.length - 1"
                class="my-1 w-0.5 flex-1"
                :class="s.state === 'done' ? 'bg-emerald-300' : 'bg-slate-200'"
                aria-hidden="true"
              />
            </div>
            <div class="flex-1 pb-5">
              <p
                class="text-sm font-semibold"
                :class="{
                  'text-emerald-700': s.state === 'done',
                  'text-blue-700': s.state === 'active',
                  'text-slate-400': s.state === 'todo',
                }"
              >
                {{ s.label }}
              </p>
              <p v-if="timelineDates[i]" class="text-xs text-slate-400">{{ timelineDates[i] }}</p>
              <p v-else-if="s.state === 'active'" class="text-xs text-blue-500">En cours…</p>
            </div>
          </li>
        </ol>
      </section>

      <!-- Section 3 : Statistiques compactes -->
      <div class="grid grid-cols-3 gap-3">
        <div
          v-for="s in stats"
          :key="s.label"
          class="rounded-[20px] bg-white px-2 py-4 text-center shadow-sm ring-1 ring-slate-100"
        >
          <p class="font-headline text-2xl font-extrabold text-primary">{{ s.value }}</p>
          <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{{ s.label }}</p>
        </div>
      </div>

      <!-- Section 4 : Actions rapides -->
      <section v-reveal>
        <h2 class="mb-3 px-1 font-headline text-base font-bold text-primary">Actions rapides</h2>
        <div class="grid grid-cols-3 gap-3">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            class="flex flex-col items-center gap-2 rounded-[20px] bg-white px-2 py-4 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
          >
            <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <span class="material-symbols-outlined text-[22px]">{{ action.icon }}</span>
            </span>
            <span class="text-[11px] font-semibold leading-tight text-slate-600">{{ action.label }}</span>
          </NuxtLink>
        </div>
      </section>

      <!-- Documents récents -->
      <section v-if="documents.length" v-reveal class="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-headline text-base font-bold text-primary">Documents récents</h2>
          <NuxtLink to="/etudiant/documents" class="text-xs font-semibold text-primary hover:underline">
            Tout voir
          </NuxtLink>
        </div>
        <ul class="space-y-2">
          <li
            v-for="doc in documents"
            :key="doc.id"
            class="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2.5"
          >
            <span class="flex min-w-0 items-center gap-2 text-sm text-slate-700">
              <span class="material-symbols-outlined shrink-0 text-[18px] text-slate-400">description</span>
              <span class="truncate">{{ doc.label }}</span>
            </span>
            <a
              v-if="doc.url"
              :href="doc.url"
              target="_blank"
              rel="noopener noreferrer"
              class="shrink-0 text-slate-400 transition hover:text-primary"
              :aria-label="`Télécharger ${doc.label}`"
            >
              <span class="material-symbols-outlined text-[20px]">download</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
