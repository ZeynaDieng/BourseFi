<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminPortalNav } from '~/composables/useAdminPortalNav'
import { getAdminErrorMessage } from '~/utils/admin-error'

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

type PriorityCandidate = {
  id: string
  fullName: string
  email: string
  phone: string
  ecole: string
  formation: string
  montantRestant: number
  devise: string
  lastActivity: string
  conversionProbability: number
  priorityGroup: 'HIGH' | 'MED' | 'LOW'
  priorityReason: string
  interestLevel: string
  blockingReason?: string | null
}

type AutoStats = {
  today: {
    relancesSent: number
    whatsappSent: number
    emailsSent: number
    paiementsRecuperes: number
    revenusRecuperes: number
    conversionRate: number
    newCandidatures: number
    paiementsValidated: number
    montantEncaisse: number
  }
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
const { navItems, adminDrawerLinks } = useAdminPortalNav()
const { data: stats } = await useFetch<DashboardStats>('/api/dashboard/stats')
const { data: candidatures } = await useFetch<CandidatureRow[]>('/api/candidatures')
const { data: topPriorityData } = await useFetch<{ ok: boolean; candidates: PriorityCandidate[] }>('/api/admin/automatisations/top-priority')
const { data: autoStatsData } = await useFetch<{ ok: boolean } & AutoStats>('/api/admin/automatisations/stats')

const topCandidates = computed(() => topPriorityData.value?.candidates || [])
const autoStats = computed(() => autoStatsData.value?.today || {
  relancesSent: 0,
  whatsappSent: 0,
  emailsSent: 0,
  paiementsRecuperes: 0,
  revenusRecuperes: 0,
  conversionRate: 0,
  newCandidatures: 0,
  paiementsValidated: 0,
  montantEncaisse: 0,
})

const sendingRelanceId = ref<string | null>(null)

async function triggerQuickRelance(candidatureId: string, channel: 'WHATSAPP' | 'EMAIL') {
  sendingRelanceId.value = candidatureId
  try {
    const res = await $fetch<{ ok: boolean; whatsappUrl?: string }>('/api/admin/candidatures/relancer', {
      method: 'POST',
      body: { candidatureId, channel, codePromo: 'RENTREE2026' },
    })
    if (channel === 'WHATSAPP' && res.whatsappUrl) {
      window.open(res.whatsappUrl, '_blank')
    } else {
      alert('Relance effectuée avec succès !')
    }
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Erreur relance'))
  } finally {
    sendingRelanceId.value = null
  }
}

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
  { to: '/admin/automatisations', label: '🤖 Relances Automatiques', hint: 'Supervision & moteur', icon: 'smart_toy' },
  { to: '/admin/candidatures', label: 'Candidatures', hint: 'Valider & attestations', icon: 'fact_check' },
  { to: '/admin/catalogue/bourses', label: 'Bourses', hint: 'Offres & quotas', icon: 'school' },
  { to: '/admin/catalogue/programmes', label: 'Formations', hint: 'Catalogue programmes', icon: 'menu_book' },
  { to: '/admin/catalogue/ecoles', label: 'Écoles', hint: 'Établissements', icon: 'apartment' },
  { to: '/admin/transactions', label: 'Paiements', hint: 'Historique & commissions', icon: 'payments' },
  { to: '/admin/rapports/commissions', label: 'Commissions Écoles', hint: 'Orientations & facturation', icon: 'account_balance_wallet' },
  { to: '/admin/rapports', label: 'Rapports', hint: 'Export & KPI', icon: 'analytics' },
  { to: '/admin/users', label: 'Utilisateurs', hint: 'Comptes & rôles', icon: 'group' },
  { to: '/admin/cms/site', label: 'Blocs du site', hint: 'Titres & sections', icon: 'web' },
  { to: '/admin/audit', label: 'Audit', hint: 'Traçabilité', icon: 'history' },
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
  <PortalShell
    :nav-items="navItems"
    :drawer-links="adminDrawerLinks"
    drawer-title="Administration"
    logo-to="/admin/dashboard"
    aria-label="Navigation administration"
  >
    <template #sidebar>
      <AdminSidebar />
    </template>

    <div class="relative space-y-6 p-4 pb-14 md:space-y-8 md:p-8">
        <header class="portal-dash-rise flex flex-wrap items-center justify-between gap-4">
          <div class="max-w-2xl space-y-1">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Espace administration & pilotage commercial
            </p>
            <h2 class="font-headline text-2xl font-extrabold text-primary md:text-4xl">
              {{ greeting }}<template v-if="displayName">, {{ displayName }}</template>
            </h2>
          </div>

          <NuxtLink
            to="/admin/automatisations"
            class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
          >
            <span class="material-symbols-outlined text-[18px]">smart_toy</span>
            Relances Automatiques (Console)
          </NuxtLink>
        </header>

        <!-- BANNIÈRE RAPPORT QUOTIDIEN -->
        <section class="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-slate-50 to-emerald-50/50 p-5 shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[22px] text-primary">analytics</span>
              <h3 class="font-headline text-sm font-extrabold text-slate-900">📊 Rapport Quotidien des Conversions & Encaissements</h3>
            </div>
            <span class="text-xs font-bold text-slate-400">Aujourd'hui</span>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 text-xs">
            <div class="rounded-xl bg-white p-3 border border-slate-100 shadow-2xs">
              <p class="text-slate-400 text-[11px]">Nouvelles candidatures</p>
              <p class="text-lg font-black text-primary mt-0.5">{{ autoStats.newCandidatures }}</p>
            </div>
            <div class="rounded-xl bg-white p-3 border border-slate-100 shadow-2xs">
              <p class="text-slate-400 text-[11px]">Paiements validés</p>
              <p class="text-lg font-black text-emerald-700 mt-0.5">{{ autoStats.paiementsValidated }}</p>
            </div>
            <div class="rounded-xl bg-white p-3 border border-slate-100 shadow-2xs">
              <p class="text-slate-400 text-[11px]">Montant encaissé</p>
              <p class="text-lg font-black text-emerald-900 mt-0.5">{{ autoStats.montantEncaisse.toLocaleString('fr-FR') }} FCFA</p>
            </div>
            <div class="rounded-xl bg-white p-3 border border-slate-100 shadow-2xs">
              <p class="text-slate-400 text-[11px]">Relances automatiques</p>
              <p class="text-lg font-black text-sky-700 mt-0.5">{{ autoStats.relancesSent }}</p>
            </div>
            <div class="rounded-xl bg-white p-3 border border-slate-100 shadow-2xs col-span-2 sm:col-span-1">
              <p class="text-slate-400 text-[11px]">Paiements récupérés</p>
              <p class="text-lg font-black text-amber-700 mt-0.5">{{ autoStats.paiementsRecuperes }} ({{ autoStats.conversionRate }}%)</p>
            </div>
          </div>
        </section>

        <!-- Bento KPI -->
        <section class="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          <article
            class="portal-dash-rise relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#001a38] to-slate-900 p-5 text-white shadow-xl md:col-span-5 md:row-span-2 md:p-6"
          >
            <div
              class="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-secondary-fixed/25 blur-2xl"
            />
            <div class="relative space-y-5">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                Dossiers cumulés
              </p>
              <p class="font-headline text-4xl font-black tracking-tight md:text-6xl">
                {{ stats?.candidatures ?? '' }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm ring-1 ring-white/20">
                  {{ stats?.candidaturesThisWeek ?? 0 }} cette semaine
                </span>
                <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm ring-1 ring-white/20">
                  {{ stats?.candidaturesThisMonth ?? 0 }} ce mois-ci
                </span>
              </div>
            </div>
          </article>

          <article class="portal-dash-card portal-dash-rise hidden min-w-0 md:block md:col-span-3">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Taux de conversion</p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">
              {{ stats?.conversion ?? '' }}<span v-if="stats?.conversion != null" class="text-xl">%</span>
            </p>
            <p class="mt-3 text-xs leading-snug text-slate-500">
              Part des dossiers avec paiement validé par rapport au total.
            </p>
          </article>

          <article class="portal-dash-card portal-dash-rise hidden border-secondary-fixed/25 bg-gradient-to-br from-secondary-container/40 to-white md:block md:col-span-4">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-600">Dynamique mensuelle</p>
            <template v-if="stats?.momentumVsPrevMonth != null">
              <p
                class="mt-2 flex items-baseline gap-1 font-headline text-3xl font-black md:text-4xl"
                :class="stats.momentumVsPrevMonth >= 0 ? 'text-emerald-800' : 'text-rose-800'"
              >
                <span>{{ stats.momentumVsPrevMonth >= 0 ? '+' : '' }}</span>
                <span>{{ stats.momentumVsPrevMonth }}%</span>
              </p>
              <p class="mt-3 text-xs text-slate-600">
                Nouvelles candidatures ce mois-ci par rapport au mois précédent.
              </p>
            </template>
            <template v-else-if="(stats?.candidaturesThisMonth ?? 0) > 0">
              <p class="mt-2 font-headline text-2xl font-black text-primary">Première impulsion</p>
            </template>
          </article>

          <article class="portal-dash-card portal-dash-rise hidden md:block md:col-span-3">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">En revue active</p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">{{ stats?.enRevue ?? '' }}</p>
          </article>

          <article class="portal-dash-card portal-dash-rise hidden md:block md:col-span-3">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Programmes publiés</p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">{{ stats?.programmesCount ?? '' }}</p>
          </article>

          <article class="portal-dash-card portal-dash-rise hidden md:block md:col-span-3">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Écoles</p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">{{ stats?.ecolesCount ?? '' }}</p>
          </article>

          <article class="portal-dash-card portal-dash-rise hidden md:block md:col-span-3">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Partenaires</p>
            <p class="mt-2 font-headline text-3xl font-black text-primary md:text-4xl">{{ stats?.partenairesCount ?? '' }}</p>
          </article>
        </section>

        <!-- WIDGET CANDIDATS PRIORITAIRES AUJOURD'HUI -->
        <section v-if="topCandidates.length" class="rounded-2xl border border-red-200 bg-red-50/30 p-5 space-y-4 shadow-2xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[24px] text-red-600">local_fire_department</span>
              <div>
                <h3 class="font-headline text-base font-extrabold text-slate-900">🔥 Candidats Prioritaires Aujourd'hui</h3>
                <p class="text-xs text-slate-500">Classés automatiquement par probabilité de conversion et engagement récent</p>
              </div>
            </div>
            <NuxtLink to="/admin/candidatures?relanceFilter=HOT_HIGH" class="text-xs font-bold text-red-700 hover:underline">
              Voir tous les candidats prioritaires →
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              v-for="cand in topCandidates.slice(0, 6)"
              :key="cand.id"
              class="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs transition hover:border-red-300"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-bold text-slate-900 text-xs">{{ cand.fullName }}</p>
                  <p class="text-[11px] font-medium text-slate-600 truncate max-w-[200px]">{{ cand.formation }}</p>
                  <p class="text-[10px] text-slate-400">{{ cand.ecole }}</p>
                </div>

                <div class="text-right">
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-black inline-block"
                    :class="cand.priorityGroup === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ cand.conversionProbability }}% conversion
                  </span>
                  <p class="text-[10px] font-mono text-slate-500 mt-1">{{ cand.montantRestant.toLocaleString('fr-FR') }} {{ cand.devise }}</p>
                </div>
              </div>

              <!-- Actions Rapides -->
              <div class="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  class="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-[11px] font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95"
                  :disabled="sendingRelanceId === cand.id"
                  @click="triggerQuickRelance(cand.id, 'WHATSAPP')"
                >
                  <span class="material-symbols-outlined text-[14px]">chat</span>
                  WhatsApp
                </button>

                <a
                  v-if="cand.phone"
                  :href="`tel:${cand.phone}`"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  title="Appeler par téléphone"
                >
                  <span class="material-symbols-outlined text-[15px]">call</span>
                </a>

                <button
                  type="button"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  :disabled="sendingRelanceId === cand.id"
                  title="Envoyer un email"
                  @click="triggerQuickRelance(cand.id, 'EMAIL')"
                >
                  <span class="material-symbols-outlined text-[15px]">mail</span>
                </button>

                <NuxtLink
                  :to="`/admin/candidatures?id=${cand.id}`"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  title="Voir le dossier complet"
                >
                  <span class="material-symbols-outlined text-[15px]">visibility</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>

        <!-- Raccourcis + flux -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <section class="lg:col-span-4">
            <PortalActionList title="Aller vite" :items="[...shortcuts]" />
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
                class="portal-dash-rise flex flex-col gap-3 rounded-2xl border border-slate-100/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm transition hover:border-secondary-fixed/35 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4"
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
                Aucune candidature pour le moment.
              </p>
            </div>
          </section>
        </div>
    </div>
  </PortalShell>
</template>
