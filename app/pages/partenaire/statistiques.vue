<script setup lang="ts">
import { usePartnerPortalNav } from '~/composables/usePartnerPortalNav'

definePageMeta({ layout: 'portal', middleware: 'partner-auth' })

const { navItems, partnerDrawerLinks } = usePartnerPortalNav()
const { data: stats } = await useFetch('/api/partner/stats')
const { data: bourses } = await useFetch('/api/partner/bourses')

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
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
        title="Statistiques"
        subtitle="Performance de vos bourses et dossiers."
      />

      <section class="space-y-4">
        <div class="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          <article class="portal-dash-card min-w-[10rem] shrink-0 snap-start p-4 md:min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dossiers acceptés</p>
            <p class="mt-1 font-headline text-2xl font-black text-primary">{{ stats?.dossiersAcceptes ?? 0 }}</p>
          </article>
          <article class="portal-dash-card min-w-[10rem] shrink-0 snap-start p-4 md:min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Paiements reçus</p>
            <p class="mt-1 font-headline text-2xl font-black text-primary">{{ stats?.paiementsCount ?? 0 }}</p>
          </article>
          <article class="portal-dash-card min-w-[10rem] shrink-0 snap-start p-4 md:min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Montant cumulé</p>
            <p class="mt-1 font-headline text-xl font-black text-primary">
              {{ (stats?.montantRecu ?? 0).toLocaleString('fr-FR') }} FCFA
            </p>
          </article>
        </div>
      </section>

      <section class="portal-dash-card p-4 md:p-6">
        <h2 class="font-headline text-lg font-bold text-primary">Répartition par bourse</h2>
        <ul class="mt-4 space-y-4">
          <li v-for="b in bourses ?? []" :key="b.id">
            <div class="mb-1 flex justify-between text-sm">
              <span class="font-medium text-primary">{{ b.titre }}</span>
              <span class="font-semibold text-slate-600">{{ b.candidaturesCount }} dossier(s)</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-secondary transition-all"
                :style="{
                  width: `${Math.min(100, ((b.candidaturesCount ?? 0) / Math.max(1, stats?.candidaturesTotal ?? 1)) * 100)}%`,
                }"
              />
            </div>
            <p class="mt-1 text-xs text-slate-500">Limite {{ formatDate(b.dateLimite) }}</p>
          </li>
        </ul>
        <p v-if="!(bourses?.length)" class="mt-4 text-sm text-slate-500">Aucune bourse rattachée.</p>
      </section>
    </div>
  </PortalShell>
</template>
