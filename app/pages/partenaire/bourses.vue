<script setup lang="ts">
import { usePartnerPortalNav } from '~/composables/usePartnerPortalNav'

definePageMeta({ layout: 'portal', middleware: 'partner-auth' })

const { navItems, partnerDrawerLinks } = usePartnerPortalNav()
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
        title="Bourses"
        subtitle="Offres de financement rattachées à votre structure."
      />

      <div class="grid gap-4">
        <article
          v-for="b in bourses ?? []"
          :key="b.id"
          class="portal-dash-card p-4 md:p-6"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span class="rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-semibold text-on-secondary-container">
                {{ b.coveragePercent }} %
              </span>
              <h2 class="mt-2 font-headline text-lg font-bold text-primary">{{ b.titre }}</h2>
              <p class="text-sm text-slate-500">{{ b.etablissement }} · {{ b.programmeTitre }}</p>
            </div>
            <div class="text-right text-sm">
              <p class="font-semibold text-primary">{{ b.placesRestantes }} places</p>
              <p class="text-slate-500">Limite {{ formatDate(b.dateLimite) }}</p>
              <p class="text-slate-400">{{ b.candidaturesCount }} candidature(s)</p>
            </div>
          </div>
          <NuxtLink
            :to="`/bourses/${b.slug}`"
            class="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary active:scale-[0.98]"
          >
            Voir la fiche publique →
          </NuxtLink>
        </article>
      </div>
      <PortalEmptyState
        v-if="!(bourses?.length)"
        icon="school"
        title="Aucune bourse"
        description="Aucune offre n'est rattachée à votre compte pour le moment."
      />
    </div>
  </PortalShell>
</template>
