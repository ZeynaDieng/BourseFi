<script setup lang="ts">
import { usePartnerPortalNav } from '~/composables/usePartnerPortalNav'

definePageMeta({ layout: 'portal', middleware: 'partner-auth' })

const { navItems, partnerDrawerLinks, stats } = usePartnerPortalNav()
const { data: me } = await useFetch('/api/auth/me')
const { data: dossiers } = await useFetch('/api/candidatures', { default: () => [] })

const recent = computed(() => (Array.isArray(dossiers.value) ? dossiers.value.slice(0, 8) : []))

const pipelineItems = computed(() => [
  {
    key: 'enRevue',
    label: 'En revue',
    count: stats.value?.statusBreakdown?.enRevue ?? 0,
    to: '/partenaire/candidatures?status=EN_REVUE_PARTENAIRE',
  },
  {
    key: 'complement',
    label: 'Complément',
    count: stats.value?.statusBreakdown?.complementDemande ?? 0,
    to: '/partenaire/candidatures?status=COMPLEMENT_DEMANDE',
  },
  {
    key: 'sansDoc',
    label: 'Sans attestation',
    count: stats.value?.statusBreakdown?.acceptesSansDoc ?? 0,
    to: '/partenaire/candidatures?status=ACCEPTE',
  },
  {
    key: 'acceptes',
    label: 'Acceptés',
    count: stats.value?.dossiersAcceptes ?? 0,
    to: '/partenaire/candidatures?status=ACCEPTE',
  },
])

const shortcuts = [
  { to: '/partenaire/candidatures', label: 'Valider les dossiers', hint: 'Statuts & attestations', icon: 'fact_check' },
  { to: '/partenaire/documents', label: 'Documents', hint: 'Pièces déposées', icon: 'folder' },
  { to: '/partenaire/paiements', label: 'Paiements', hint: 'Montants reçus', icon: 'payments' },
  { to: '/partenaire/bourses', label: 'Bourses', hint: 'Offres actives', icon: 'school' },
  { to: '/partenaire/statistiques', label: 'Statistiques', hint: 'Performance globale', icon: 'bar_chart' },
  { to: '/partenaire/parametres', label: 'Paramètres', hint: 'Profil partenaire', icon: 'settings' },
]

const secondaryKpis = computed(() => [
  { label: 'Ce mois', value: stats.value?.candidaturesMonth ?? 0, hint: '30 jours' },
  { label: 'Bourses actives', value: stats.value?.boursesActives ?? 0 },
  {
    label: 'Montant reçu',
    value: `${(stats.value?.montantRecu ?? 0).toLocaleString('fr-FR')} FCFA`,
  },
  {
    label: 'Taux acceptation',
    value: stats.value?.tauxAcceptation != null ? `${stats.value.tauxAcceptation} %` : '—',
  },
])

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
</script>

<template>
  <PortalShell
    :nav-items="navItems"
    :drawer-links="partnerDrawerLinks"
    drawer-title="Portail partenaire"
    logo-to="/partenaire/dashboard"
    aria-label="Navigation partenaire"
  >
    <template #sidebar>
      <PartnerSidebar />
    </template>

    <div class="space-y-6 p-4 md:space-y-8 md:p-8">
      <PortalPageHeader
        kicker="Portail partenaire"
        title="Tableau de bord"
        :subtitle="me?.user?.partnerName ?? ''"
      />

      <!-- Hero KPI mobile-first -->
      <section class="space-y-4">
        <article
          class="portal-dash-rise relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#001a38] to-slate-900 p-5 text-white shadow-xl md:p-6"
        >
          <div
            class="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-secondary-fixed/25 blur-2xl"
          />
          <div class="relative space-y-4">
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              Dossiers reçus
            </p>
            <p class="font-headline text-4xl font-black tracking-tight md:text-5xl">
              {{ stats?.candidaturesTotal ?? 0 }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                {{ stats?.candidaturesWeek ?? 0 }} cette semaine
              </span>
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                {{ stats?.candidaturesMonth ?? 0 }} ce mois
              </span>
            </div>
          </div>
        </article>

        <!-- KPI secondaires — scroll horizontal mobile -->
        <div class="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
          <article
            v-for="kpi in secondaryKpis"
            :key="kpi.label"
            class="portal-dash-card min-w-[10rem] shrink-0 snap-start p-4 md:min-w-0"
          >
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ kpi.label }}</p>
            <p class="mt-1 font-headline text-2xl font-black text-primary">{{ kpi.value }}</p>
            <p v-if="kpi.hint" class="mt-1 text-xs text-slate-500">{{ kpi.hint }}</p>
          </article>
        </div>
      </section>

      <!-- Pipeline actions -->
      <section>
        <h2 class="mb-3 font-headline text-base font-bold text-primary md:text-lg">
          Actions prioritaires
        </h2>
        <PortalStatusPipeline :items="pipelineItems" />
      </section>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <section class="lg:col-span-4">
          <PortalActionList title="Aller vite" :items="shortcuts" />
        </section>

        <section class="lg:col-span-8">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h2 class="font-headline text-base font-bold text-primary md:text-lg">
              Dernières candidatures
            </h2>
            <NuxtLink
              to="/partenaire/candidatures"
              class="text-sm font-semibold text-primary"
            >
              Voir tout →
            </NuxtLink>
          </div>

          <div v-if="recent.length" class="flex flex-col gap-3">
            <PortalDataCard
              v-for="d in recent"
              :key="d.id"
              :title="d.fullName"
              :subtitle="d.programmeTitre"
              :meta="formatRelative(d.createdAt)"
              :status="d.status"
            />
          </div>
          <PortalEmptyState
            v-else
            icon="inbox"
            title="Aucune candidature"
            description="Les nouveaux dossiers apparaîtront ici dès qu'un étudiant postule."
            to="/partenaire/candidatures"
            cta-label="Voir les candidatures"
          />
        </section>
      </div>
    </div>
  </PortalShell>
</template>
