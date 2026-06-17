<script setup lang="ts">
import { usePartnerPortalNav } from '~/composables/usePartnerPortalNav'

definePageMeta({ layout: 'portal', middleware: 'partner-auth' })

const { navItems, partnerDrawerLinks } = usePartnerPortalNav()
const { data: paiements } = await useFetch('/api/partner/paiements')
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
        title="Paiements"
        subtitle="Reversements des frais de dossier (part partenaire)."
      />

      <!-- Cartes mobile -->
      <div class="flex flex-col gap-3 md:hidden">
        <article v-for="p in paiements ?? []" :key="p.id" class="portal-dash-card p-4">
          <p class="font-semibold text-primary">{{ p.fullName }}</p>
          <p class="text-sm text-slate-500">{{ p.programme ?? '—' }}</p>
          <div class="mt-3 flex justify-between text-sm">
            <span class="text-slate-600">Total</span>
            <span>{{ p.amount.toLocaleString('fr-FR') }} {{ p.currency }}</span>
          </div>
          <div class="mt-1 flex justify-between text-sm font-semibold text-primary">
            <span>Votre part</span>
            <span>{{ p.amountPartner.toLocaleString('fr-FR') }} {{ p.currency }}</span>
          </div>
          <p class="mt-2 text-xs text-slate-400">
            {{ new Date(p.createdAt).toLocaleDateString('fr-FR') }}
          </p>
        </article>
        <PortalEmptyState
          v-if="!(paiements?.length)"
          icon="payments"
          title="Aucun paiement"
          description="Les reversements apparaîtront ici après validation des frais de dossier."
        />
      </div>

      <!-- Table desktop -->
      <div class="portal-dash-card hidden overflow-hidden md:block">
        <div class="overflow-x-auto">
          <table class="admin-table min-w-full">
            <thead>
              <tr>
                <th class="admin-th">Candidat</th>
                <th class="admin-th">Programme</th>
                <th class="admin-th">Montant total</th>
                <th class="admin-th">Votre part</th>
                <th class="admin-th">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in paiements ?? []" :key="p.id">
                <td class="admin-td">{{ p.fullName }}</td>
                <td class="admin-td">{{ p.programme ?? '—' }}</td>
                <td class="admin-td">{{ p.amount.toLocaleString('fr-FR') }} {{ p.currency }}</td>
                <td class="admin-td font-semibold text-primary">{{ p.amountPartner.toLocaleString('fr-FR') }} {{ p.currency }}</td>
                <td class="admin-td">{{ new Date(p.createdAt).toLocaleDateString('fr-FR') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!(paiements?.length)" class="p-6 text-sm text-slate-500">Aucun paiement enregistré.</p>
      </div>
    </div>
  </PortalShell>
</template>
