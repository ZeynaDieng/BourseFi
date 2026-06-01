<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type DashboardStats = {
  candidatures?: number
  candidaturesThisWeek?: number
  candidaturesThisMonth?: number
  conversion?: number
  enRevue?: number
  programmesCount?: number
  ecolesCount?: number
  partenairesCount?: number
  momentumVsPrevMonth?: number | null
}

type CandidatureRow = {
  id: string
  fullName: string
  phone?: string
  programmeTitre: string
  partnerName: string
  status: string
  statusLabel: string
  createdAt: string | Date
}

const { data: me } = await useFetch('/api/auth/me')
const { data: stats } = await useFetch<DashboardStats>('/api/dashboard/stats')
const { data: candidatures } = await useFetch<CandidatureRow[]>('/api/candidatures')

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
})

const displayName = computed(() => {
  const raw = me.value?.user?.name?.trim()
  if (!raw) return ''
  return raw.split(/\s+/)[0] ?? ''
})

const recentList = computed(() => (candidatures.value || []).slice(0, 10))

const shortcuts = [
  { to: '/admin/cms/site', label: 'Blocs du site', hint: 'Titres & sections' },
  { to: '/admin/cms/faq', label: 'FAQ', hint: 'Questions fréquentes' },
  { to: '/admin/cms/metiers', label: 'Métiers', hint: 'Hub orientation' },
  { to: '/admin/catalogue/programmes', label: 'Programmes', hint: 'Offre & frais' },
  { to: '/admin/catalogue/ecoles', label: 'Écoles', hint: 'Établissements' },
  { to: '/admin/audit', label: 'Audit', hint: 'Traçabilité' }
] as const

function formatRelative(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Il y a ${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `Il y a ${days} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function statusTone(status: string) {
  switch (status) {
    case 'ACCEPTE':
      return 'bg-emerald-500/15 text-emerald-900 ring-emerald-500/20'
    case 'REFUSE':
      return 'bg-rose-500/15 text-rose-900 ring-rose-500/20'
    case 'SOUMIS':
      return 'bg-sky-500/15 text-sky-900 ring-sky-500/20'
    case 'EN_REVUE_PARTENAIRE':
      return 'bg-amber-500/15 text-amber-950 ring-amber-500/25'
    case 'COMPLEMENT_DEMANDE':
      return 'bg-violet-500/15 text-violet-950 ring-violet-500/25'
    default:
      return 'bg-slate-500/10 text-primary ring-slate-400/20'
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="relative flex-1 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/90">
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-secondary-fixed/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 rounded-full bg-primary/5 blur-3xl"
      />

      <div class="relative z-10 space-y-8 p-8 pb-14">
        <header class="admin-dash-rise max-w-3xl space-y-2">
          <p class="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Espace administration
          </p>
          <h2 class="font-headline text-3xl font-extrabold text-primary md:text-4xl">
            {{ greeting }}<template v-if="displayName">, {{ displayName }}</template>
          </h2>
          <p class="max-w-2xl text-base leading-relaxed text-slate-600">
            Voici l’essentiel en un coup d’œil : volumes, rythme récent du dossier et les dernières
            candidatures, sans tableau rigide.
          </p>
        </header>

        <!-- Bento KPI -->
        <section class="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          <article
            class="admin-dash-rise relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#001a38] to-slate-900 p-6 text-white shadow-xl md:col-span-5 md:row-span-2"
            style="animation-delay: 40ms"
          >
            <div
              class="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-secondary-fixed/25 blur-2xl"
            />
            <div class="relative space-y-5">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                Dossiers cumulés
              </p>
              <p class="font-headline text-5xl font-black tracking-tight md:text-6xl">
                {{ stats?.candidatures ?? '—' }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm ring-1 ring-white/20"
                >
                  {{ stats?.candidaturesThisWeek ?? 0 }} cette semaine
                </span>
                <span
                  class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm ring-1 ring-white/20"
                >
                  {{ stats?.candidaturesThisMonth ?? 0 }} ce mois-ci
                </span>
              </div>
            </div>
          </article>

          <article class="admin-dash-card admin-dash-rise md:col-span-3" style="animation-delay: 90ms">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Taux de conversion
            </p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">
              {{ stats?.conversion ?? '—' }}<span v-if="stats?.conversion != null" class="text-xl">%</span>
            </p>
            <p class="mt-3 text-xs leading-snug text-slate-500">
              Part des dossiers avec paiement validé par rapport au total des candidatures.
            </p>
          </article>

          <article
            class="admin-dash-card admin-dash-rise border-secondary-fixed/25 bg-gradient-to-br from-secondary-container/40 to-white md:col-span-4"
            style="animation-delay: 120ms"
          >
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              Dynamique mensuelle
            </p>
            <template v-if="stats?.momentumVsPrevMonth != null">
              <p
                class="mt-2 flex items-baseline gap-1 font-headline text-3xl font-black md:text-4xl"
                :class="
                  stats.momentumVsPrevMonth >= 0 ? 'text-emerald-800' : 'text-rose-800'
                "
              >
                <span>{{ stats.momentumVsPrevMonth >= 0 ? '+' : '' }}</span>
                <span>{{ stats.momentumVsPrevMonth }}%</span>
              </p>
              <p class="mt-3 text-xs text-slate-600">
                Nouvelles candidatures ce mois-ci par rapport au mois précédent.
              </p>
            </template>
            <template v-else-if="(stats?.candidaturesThisMonth ?? 0) > 0">
              <p class="mt-2 font-headline text-2xl font-black text-primary">
                Première impulsion
              </p>
              <p class="mt-3 text-xs text-slate-600">
                Activité ce mois-ci sans mois précédent comparable pour calculer une variation.
              </p>
            </template>
            <template v-else>
              <p class="mt-2 font-headline text-2xl font-black text-slate-700">
                Calme pour l’instant
              </p>
              <p class="mt-3 text-xs text-slate-600">
                Les indicateurs se mettront à jour dès les prochains dossiers.
              </p>
            </template>
          </article>

          <article class="admin-dash-card admin-dash-rise md:col-span-3" style="animation-delay: 160ms">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              En revue active
            </p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">
              {{ stats?.enRevue ?? '—' }}
            </p>
            <p class="mt-3 text-xs text-slate-500">
              Dossiers côté partenaire : en revue, complément demandé ou acceptés en attente de
              suite.
            </p>
          </article>

          <article class="admin-dash-card admin-dash-rise md:col-span-3" style="animation-delay: 200ms">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Programmes publiés
            </p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">
              {{ stats?.programmesCount ?? '—' }}
            </p>
          </article>

          <article class="admin-dash-card admin-dash-rise md:col-span-3" style="animation-delay: 240ms">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Écoles
            </p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">
              {{ stats?.ecolesCount ?? '—' }}
            </p>
          </article>

          <article class="admin-dash-card admin-dash-rise md:col-span-3" style="animation-delay: 280ms">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Partenaires
            </p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">
              {{ stats?.partenairesCount ?? '—' }}
            </p>
          </article>
        </section>

        <!-- Raccourcis + flux -->
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <section class="lg:col-span-4">
            <h3 class="mb-4 font-headline text-lg font-bold text-primary">Aller vite</h3>
            <nav class="flex flex-col gap-2">
              <NuxtLink
                v-for="(item, i) in shortcuts"
                :key="item.to"
                :to="item.to"
                class="admin-dash-rise group flex items-center justify-between rounded-xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm transition hover:border-primary/20 hover:bg-white hover:shadow-md"
                :style="{ animationDelay: `${320 + i * 35}ms` }"
              >
                <span>
                  <span class="block font-semibold text-primary">{{ item.label }}</span>
                  <span class="text-xs text-slate-500">{{ item.hint }}</span>
                </span>
                <span
                  class="material-symbols-outlined text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary"
                >
                  arrow_forward
                </span>
              </NuxtLink>
            </nav>
          </section>

          <section class="lg:col-span-8">
            <div class="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 class="font-headline text-lg font-bold text-primary">Flux des candidatures</h3>
                <p class="text-sm text-slate-500">
                  Les entrées les plus récentes, avec le statut et le contexte programme.
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <article
                v-for="(c, i) in recentList"
                :key="c.id"
                class="admin-dash-rise flex flex-col gap-3 rounded-2xl border border-slate-100/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm transition hover:border-secondary-fixed/35 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                :style="{ animationDelay: `${380 + i * 40}ms` }"
              >
                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="truncate font-semibold text-primary">{{ c.fullName }}</p>
                    <span
                      class="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset"
                      :class="statusTone(c.status)"
                    >
                      {{ c.statusLabel }}
                    </span>
                  </div>
                  <p v-if="c.phone" class="truncate text-xs text-slate-500">{{ c.phone }}</p>
                  <p class="truncate text-sm text-slate-600">
                    {{ c.programmeTitre }}
                    <span class="text-slate-400">·</span>
                    {{ c.partnerName }}
                  </p>
                </div>
                <p class="shrink-0 text-xs font-medium text-slate-400">
                  {{ formatRelative(c.createdAt) }}
                </p>
              </article>

              <p
                v-if="!recentList.length"
                class="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center text-sm text-slate-500"
              >
                Aucune candidature pour le moment. Les nouvelles apparaîtront ici au fil de l’eau.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>
