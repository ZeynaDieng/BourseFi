<script setup lang="ts">
import { usePartnerPortalNav } from '~/composables/usePartnerPortalNav'

definePageMeta({ layout: 'portal', middleware: 'partner-auth' })

const { navItems, partnerDrawerLinks } = usePartnerPortalNav()
const { data: logs } = await useFetch('/api/audit-logs?limit=100')
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
      <PortalPageHeader title="Journal des actions" />

      <div class="flex flex-col gap-3 md:hidden">
        <article v-for="log in logs || []" :key="log.id" class="portal-dash-card p-4 text-sm">
          <p class="font-semibold text-primary">{{ log.action }}</p>
          <p class="text-slate-500">{{ log.entityType }} · {{ log.actorRole }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ new Date(log.createdAt).toLocaleString('fr-FR') }}</p>
        </article>
      </div>

      <div class="portal-dash-card hidden overflow-hidden md:block">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
            <tr><th class="p-4">Date</th><th class="p-4">Action</th><th class="p-4">Entite</th><th class="p-4">Role</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in logs || []" :key="log.id">
              <td class="p-4 text-sm">{{ new Date(log.createdAt).toLocaleString('fr-FR') }}</td>
              <td class="p-4 text-sm">{{ log.action }}</td>
              <td class="p-4 text-sm">{{ log.entityType }}</td>
              <td class="p-4 text-sm font-semibold text-primary">{{ log.actorRole }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </PortalShell>
</template>
