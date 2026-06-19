<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type Summary = {
  period: string
  overview: {
    candidaturesTotal: number
    candidaturesInPeriod: number
    boursesActives: number
    usersTotal: number
    conversion: number
  }
  usersByRole: { role: string; count: number }[]
  candidaturesByStatus: { status: string; label: string; count: number }[]
  finances: {
    paiementsCount: number
    amountTotal: number
    amountPartner: number
    amountPlatform: number
  }
  topProgrammes: { titre: string; slug: string; count: number }[]
  topPartners: { name: string; slug: string; count: number }[]
  trends: {
    candidatures: { month: string; count: number }[]
    paiements: { month: string; amount: number; count: number }[]
  }
}

const period = ref('30d')
const periodOptions = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: 'year', label: 'Cette année' },
  { value: 'all', label: 'Tout' },
]

const { data: summary, pending } = await useFetch<Summary>(
  () => `/api/admin/rapports/summary?period=${period.value}`,
  { watch: [period] }
)

const maxStatus = computed(() =>
  Math.max(1, ...(summary.value?.candidaturesByStatus.map((s) => s.count) ?? [1]))
)

const maxProgramme = computed(() =>
  Math.max(1, ...(summary.value?.topProgrammes.map((p) => p.count) ?? [1]))
)

const maxTrendCandidatures = computed(() =>
  Math.max(1, ...(summary.value?.trends.candidatures.map((m) => m.count) ?? [1]))
)

const maxTrendPaiements = computed(() =>
  Math.max(1, ...(summary.value?.trends.paiements.map((m) => m.amount) ?? [1]))
)

function roleLabel(role: string) {
  const map: Record<string, string> = { STUDENT: 'Étudiants', PARTNER: 'Partenaires', ADMIN: 'Admins' }
  return map[role] ?? role
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="admin-page-title">Rapports</h1>
          <p class="admin-page-desc">KPI, tendances et exports pour piloter la plateforme.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <select v-model="period" class="admin-input bg-white text-sm">
            <option v-for="p in periodOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
          <a href="/api/admin/rapports/export" class="admin-btn-secondary text-sm" download>
            Exporter CSV complet
          </a>
        </div>
      </div>

      <p v-if="pending" class="mt-6 text-sm text-slate-500">Chargement des indicateurs…</p>

      <template v-else-if="summary">
        <!-- KPI -->
        <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-primary">{{ summary.overview.candidaturesTotal }}</p>
            <p class="text-xs text-slate-500">Candidatures (total)</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-primary">{{ summary.overview.candidaturesInPeriod }}</p>
            <p class="text-xs text-slate-500">Sur la période</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-emerald-600">{{ summary.overview.conversion }}%</p>
            <p class="text-xs text-slate-500">Taux conversion</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-primary">{{ summary.overview.usersTotal }}</p>
            <p class="text-xs text-slate-500">Comptes</p>
          </div>
          <div class="admin-dash-card p-4 col-span-2 lg:col-span-1">
            <p class="text-2xl font-bold text-primary">{{ summary.overview.boursesActives }}</p>
            <p class="text-xs text-slate-500">Bourses actives</p>
          </div>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <!-- Finances -->
          <section class="admin-dash-card p-5">
            <h2 class="font-headline text-lg font-bold text-primary">Synthèse financière</h2>
            <p class="mt-1 text-xs text-slate-500">{{ summary.finances.paiementsCount }} paiement(s) sur la période</p>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between border-b border-slate-100 pb-2">
                <dt class="text-slate-500">Volume total</dt>
                <dd class="font-bold text-primary">
                  {{ summary.finances.amountTotal.toLocaleString('fr-FR') }} FCFA
                </dd>
              </div>
              <div class="flex justify-between border-b border-slate-100 pb-2">
                <dt class="text-slate-500">Partenaires</dt>
                <dd class="font-semibold">
                  {{ summary.finances.amountPartner.toLocaleString('fr-FR') }} FCFA
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-slate-500">Commissions plateforme</dt>
                <dd class="font-semibold text-emerald-600">
                  {{ summary.finances.amountPlatform.toLocaleString('fr-FR') }} FCFA
                </dd>
              </div>
            </dl>
            <NuxtLink to="/admin/transactions" class="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
              Voir tous les paiements →
            </NuxtLink>
          </section>

          <!-- Utilisateurs par rôle -->
          <section class="admin-dash-card p-5">
            <h2 class="font-headline text-lg font-bold text-primary">Répartition des comptes</h2>
            <ul class="mt-4 space-y-3">
              <li v-for="u in summary.usersByRole" :key="u.role" class="flex items-center gap-3">
                <span class="w-24 text-sm text-slate-600">{{ roleLabel(u.role) }}</span>
                <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full bg-primary"
                    :style="{ width: `${(u.count / summary.overview.usersTotal) * 100}%` }"
                  />
                </div>
                <span class="w-8 text-right text-sm font-bold text-primary">{{ u.count }}</span>
              </li>
            </ul>
            <NuxtLink to="/admin/users" class="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
              Gérer les utilisateurs →
            </NuxtLink>
          </section>
        </div>

        <!-- Candidatures par statut -->
        <section class="admin-dash-card mt-6 p-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-headline text-lg font-bold text-primary">Candidatures par statut</h2>
            <NuxtLink to="/admin/candidatures" class="text-xs font-semibold text-primary hover:underline">
              Ouvrir la liste →
            </NuxtLink>
          </div>
          <ul class="mt-4 space-y-2">
            <li v-for="s in summary.candidaturesByStatus" :key="s.status" class="flex items-center gap-3 text-sm">
              <span class="min-w-[10rem] truncate text-slate-600">{{ s.label }}</span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-secondary-fixed"
                  :style="{ width: `${(s.count / maxStatus) * 100}%` }"
                />
              </div>
              <span class="w-8 text-right font-bold">{{ s.count }}</span>
            </li>
          </ul>
        </section>

        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <!-- Top programmes -->
          <section class="admin-dash-card p-5">
            <h2 class="font-headline text-lg font-bold text-primary">Programmes les plus demandés</h2>
            <ul class="mt-4 space-y-2">
              <li v-for="p in summary.topProgrammes" :key="p.slug" class="flex items-center gap-3 text-sm">
                <span class="min-w-0 flex-1 truncate text-slate-700">{{ p.titre }}</span>
                <div class="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full rounded-full bg-primary" :style="{ width: `${(p.count / maxProgramme) * 100}%` }" />
                </div>
                <span class="font-bold text-primary">{{ p.count }}</span>
              </li>
              <li v-if="!summary.topProgrammes.length" class="text-sm text-slate-500">Aucune donnée.</li>
            </ul>
          </section>

          <!-- Top partenaires -->
          <section class="admin-dash-card p-5">
            <h2 class="font-headline text-lg font-bold text-primary">Partenaires les plus actifs</h2>
            <ul class="mt-4 space-y-2">
              <li v-for="p in summary.topPartners" :key="p.slug" class="flex items-center gap-3 text-sm">
                <span class="min-w-0 flex-1 truncate text-slate-700">{{ p.name }}</span>
                <div class="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full rounded-full bg-purple-500" :style="{ width: `${(p.count / maxProgramme) * 100}%` }" />
                </div>
                <span class="font-bold text-primary">{{ p.count }}</span>
              </li>
              <li v-if="!summary.topPartners.length" class="text-sm text-slate-500">Aucune donnée.</li>
            </ul>
          </section>
        </div>

        <!-- Tendances 6 mois -->
        <section class="admin-dash-card mt-6 p-5">
          <h2 class="font-headline text-lg font-bold text-primary">Tendances (6 derniers mois)</h2>
          <div class="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Nouvelles candidatures</p>
              <div class="mt-3 flex items-end gap-2" style="height: 140px">
                <div
                  v-for="m in summary.trends.candidatures"
                  :key="m.month"
                  class="flex flex-1 flex-col items-center justify-end gap-1"
                >
                  <span class="text-[10px] font-bold text-primary">{{ m.count }}</span>
                  <div
                    class="w-full rounded-t-md bg-primary/80"
                    :style="{ height: `${Math.max(4, (m.count / maxTrendCandidatures) * 100)}%` }"
                  />
                  <span class="text-[10px] text-slate-400">{{ m.month }}</span>
                </div>
              </div>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Paiements validés (FCFA)</p>
              <div class="mt-3 flex items-end gap-2" style="height: 140px">
                <div
                  v-for="m in summary.trends.paiements"
                  :key="m.month"
                  class="flex flex-1 flex-col items-center justify-end gap-1"
                >
                  <span class="text-[10px] font-bold text-emerald-700">
                    {{ m.amount >= 1000 ? `${Math.round(m.amount / 1000)}k` : m.amount }}
                  </span>
                  <div
                    class="w-full rounded-t-md bg-emerald-500/70"
                    :style="{ height: `${Math.max(4, (m.amount / maxTrendPaiements) * 100)}%` }"
                  />
                  <span class="text-[10px] text-slate-400">{{ m.month }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
