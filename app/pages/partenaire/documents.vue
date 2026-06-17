<script setup lang="ts">
import { usePartnerPortalNav } from '~/composables/usePartnerPortalNav'

definePageMeta({ layout: 'portal', middleware: 'partner-auth' })

const { navItems, partnerDrawerLinks } = usePartnerPortalNav()
const { data: dossiers } = await useFetch('/api/candidatures', { default: () => [] })

const pendingDocs = computed(() =>
  (Array.isArray(dossiers.value) ? dossiers.value : []).filter(
    (d: { status: string; documentUrl: string | null }) =>
      ['ACCEPTE', 'EN_REVUE_PARTENAIRE'].includes(d.status) && !d.documentUrl,
  ),
)

const issued = computed(() =>
  (Array.isArray(dossiers.value) ? dossiers.value : []).filter(
    (d: { documentUrl: string | null }) => !!d.documentUrl,
  ),
)
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
        title="Documents"
        subtitle="Attestations à émettre et documents déjà publiés."
      />

      <section>
        <h2 class="mb-3 font-headline text-base font-bold text-primary md:text-lg">À émettre</h2>
        <ul class="space-y-3">
          <li
            v-for="d in pendingDocs"
            :key="d.id"
            class="portal-dash-card flex flex-col gap-3 border-amber-100 bg-amber-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="font-semibold text-primary">{{ d.fullName }}</p>
              <p class="text-sm text-slate-600">{{ d.programmeTitre }}</p>
            </div>
            <NuxtLink
              to="/partenaire/candidatures"
              class="flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white active:scale-[0.98] sm:w-auto"
            >
              Traiter →
            </NuxtLink>
          </li>
        </ul>
        <p v-if="!pendingDocs.length" class="text-sm text-slate-500">Aucun document en attente.</p>
      </section>

      <section>
        <h2 class="mb-3 font-headline text-base font-bold text-primary md:text-lg">Attestations publiées</h2>
        <ul class="space-y-3">
          <li v-for="d in issued" :key="d.id" class="portal-dash-card p-4">
            <p class="font-semibold text-primary">{{ d.fullName }} — {{ d.programmeTitre }}</p>
            <a
              :href="d.documentUrl!"
              target="_blank"
              rel="noopener"
              class="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline active:scale-[0.98]"
            >
              Télécharger l'attestation
            </a>
          </li>
        </ul>
        <p v-if="!issued.length" class="text-sm text-slate-500">Aucune attestation publiée.</p>
      </section>
    </div>
  </PortalShell>
</template>
