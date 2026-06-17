<script setup lang="ts">
import {
  candidatureBadge,
  computeDossierProgress,
  userInitials,
} from '~/utils/student-dossier'

definePageMeta({ layout: 'student-app', middleware: 'student-auth' })

const { data: me, refresh: refreshMe } = await useFetch('/api/auth/me')
const { data: candidatures } = await useFetch('/api/candidatures')
const { data: paiements } = await useFetch('/api/paiements')

const firstName = computed(
  () => me.value?.user?.name?.split(/\s+/)[0] || 'Étudiant',
)
const initials = computed(() => userInitials(me.value?.user?.name))
const dossier = computed(() => computeDossierProgress(candidatures.value))

const documents = computed(() => {
  const list: { id: string; label: string; url?: string }[] = []
  for (const c of candidatures.value || []) {
    if (c.documentUrl) {
      list.push({
        id: `doc-${c.id}`,
        label: `Attestation — ${c.programmeTitre}`,
        url: c.documentUrl,
      })
    }
    if (c.identityCardRectoUrl) {
      list.push({
        id: `recto-${c.id}`,
        label: 'CNI recto',
        url: c.identityCardRectoUrl,
      })
    }
    if (c.identityCardVersoUrl) {
      list.push({
        id: `verso-${c.id}`,
        label: 'CNI verso',
        url: c.identityCardVersoUrl,
      })
    }
  }
  for (const p of paiements.value || []) {
    list.push({
      id: `pay-${p.id}`,
      label: `Reçu — ${p.amount.toLocaleString('fr-FR')} ${p.currency}`,
    })
  }
  return list
})

const stats = computed(() => ({
  candidatures: candidatures.value?.length ?? 0,
  documents: documents.value.length,
  paiements: paiements.value?.length ?? 0,
}))

const quickActions = [
  {
    to: '/programmes#programmes-catalog',
    icon: 'add_circle',
    label: 'Nouvelle bourse',
    tint: 'bg-primary text-white',
  },
  {
    to: '/paiement',
    icon: 'payments',
    label: 'Paiements',
    tint: 'bg-white text-primary ring-1 ring-slate-100',
  },
]

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshMe()
  await navigateTo('/auth/login')
}
</script>

<template>
  <main
    class="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-primary/[0.06] via-background to-background md:pb-12"
  >
    <div class="mx-auto max-w-lg px-4 pt-5 md:max-w-xl">
      <!-- En-tête léger -->
      <header class="flex items-center gap-4">
        <div
          class="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.35rem] bg-primary text-lg font-bold text-white shadow-lg shadow-primary/25"
        >
          <span
            class="absolute -inset-0.5 rounded-[1.4rem] bg-gradient-to-br from-secondary-fixed/80 to-secondary-fixed/20 opacity-70"
            aria-hidden="true"
          />
          <span class="relative">{{ initials }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-secondary"
          >
            Espace étudiant
          </p>
          <h1 class="font-headline text-2xl font-extrabold text-primary">
            Bonjour, {{ firstName }}
          </h1>
          <p class="truncate text-sm text-on-surface-variant">
            {{ me?.user?.email }}
          </p>
        </div>
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-red-500"
          aria-label="Déconnexion"
          title="Déconnexion"
          @click="logout"
        >
          <span class="material-symbols-outlined text-[22px]">logout</span>
        </button>
      </header>

      <!-- Stats rapides -->
      <div class="mt-5 grid grid-cols-3 gap-2">
        <div
          v-for="(value, key) in {
            Candidatures: stats.candidatures,
            Documents: stats.documents,
            Paiements: stats.paiements,
          }"
          :key="key"
          class="rounded-2xl bg-white/90 px-3 py-3 text-center shadow-premium ring-1 ring-white"
        >
          <p class="font-headline text-xl font-extrabold text-primary">
            {{ value }}
          </p>
          <p
            class="text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          >
            {{ key }}
          </p>
        </div>
      </div>

      <!-- Actions — grille pleine largeur, pas de scroll horizontal -->
      <div class="mt-4 grid grid-cols-2 gap-2">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.label"
          :to="action.to"
          class="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition active:scale-[0.98]"
          :class="action.tint"
        >
          <span class="material-symbols-outlined text-[20px]">{{
            action.icon
          }}</span>
          {{ action.label }}
        </NuxtLink>
      </div>

      <!-- Carte dossier -->
      <section
        class="mt-5 overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-premium"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <span class="flex gap-1.5" aria-hidden="true">
              <span class="h-2 w-2 rounded-full bg-slate-300" />
              <span class="h-2 w-2 rounded-full bg-slate-300" />
              <span class="h-2 w-2 rounded-full bg-slate-300" />
            </span>
            <span class="text-xs font-medium text-slate-500">Mon dossier</span>
          </div>
          <span class="font-headline text-sm font-extrabold text-primary"
            >{{ dossier.percent }}%</span
          >
        </div>

        <div class="space-y-4 p-4">
          <div class="rounded-xl bg-slate-50/80 p-3">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Progression
            </p>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full bg-gradient-to-r from-secondary to-secondary-fixed transition-all duration-700"
                :style="{ width: `${dossier.percent}%` }"
              />
            </div>
            <p class="mt-2 text-xs text-slate-600">{{ dossier.missingHint }}</p>
          </div>

          <div
            v-if="dossier.notification"
            class="flex gap-3 rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-3"
          >
            <span
              class="material-symbols-outlined shrink-0 text-[20px] text-secondary"
              >campaign</span
            >
            <p class="text-xs leading-relaxed text-slate-700">
              {{ dossier.notification }}
            </p>
          </div>

          <!-- Candidatures avec actions (ex-dashboard) -->
          <div>
            <p class="mb-2 text-xs font-semibold text-primary">Candidatures</p>
            <ul v-if="candidatures?.length" class="space-y-3">
              <li
                v-for="c in candidatures"
                :key="c.id"
                class="rounded-xl border border-slate-100 p-3"
              >
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-primary">{{ c.programmeTitre }}</p>
                    <p class="text-xs text-slate-600">
                      {{ c.etablissementNom }} · {{ c.partnerName }}
                    </p>
                    <span
                      class="mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      :class="candidatureBadge(c.status).className"
                    >
                      {{ candidatureBadge(c.status).label }}
                    </span>
                    <p class="mt-1 text-[11px] text-slate-500">
                      {{ c.statusLabel }}
                    </p>
                  </div>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <NuxtLink
                    v-if="c.status === 'EN_ATTENTE_PAIEMENT' && c.fraisDossier > 0"
                    :to="`/paiement?candidatureId=${c.id}`"
                    class="rounded-lg bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary-container"
                  >
                    Payer {{ c.fraisDossier.toLocaleString('fr-FR') }}
                    {{ c.devise }}
                  </NuxtLink>
                  <a
                    v-if="c.documentUrl"
                    :href="c.documentUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    Attestation bailleur
                  </a>
                  <NuxtLink
                    :to="`/programmes/${c.programmeSlug}`"
                    class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    Voir formation
                  </NuxtLink>
                </div>
              </li>
            </ul>
            <NuxtLink
              v-else
              to="/programmes#programmes-catalog"
              class="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-6 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-primary/5"
            >
              <span class="material-symbols-outlined text-[20px]">school</span>
              Trouver une formation
            </NuxtLink>
          </div>

          <div v-if="documents.length">
            <div class="mb-2 flex items-center justify-between">
              <p class="text-xs font-semibold text-primary">Documents</p>
              <span class="text-[11px] font-semibold text-secondary"
                >{{ documents.length }} fichier(s)</span
              >
            </div>
            <ul class="space-y-1.5">
              <li
                v-for="doc in documents"
                :key="doc.id"
                class="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
              >
                <span
                  class="flex min-w-0 items-center gap-2 text-xs text-slate-700"
                >
                  <span
                    class="material-symbols-outlined shrink-0 text-[16px] text-slate-400"
                    >description</span
                  >
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
                  <span class="material-symbols-outlined text-[18px]"
                    >download</span
                  >
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
