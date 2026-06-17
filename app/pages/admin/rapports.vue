<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

const { data: stats } = await useFetch('/api/stats/public')
const { data: tx } = await useFetch('/api/admin/transactions')
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <h1 class="admin-page-title">Rapports</h1>
      <div class="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div v-for="s in stats?.heroStats ?? []" :key="s.label" class="admin-dash-card p-6">
          <p class="text-3xl font-extrabold text-primary">{{ s.value }}</p>
          <p class="text-xs uppercase tracking-widest text-slate-500">{{ s.label }}</p>
        </div>
      </div>
      <div class="admin-dash-card mt-8 p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="font-headline text-lg font-bold text-primary">Synthèse financière</h2>
          <a href="/api/admin/rapports/export" class="admin-btn-secondary text-sm" download>
            Exporter CSV
          </a>
        </div>
        <p class="mt-2 text-slate-600">
          Montant distribué aux partenaires :
          <strong>{{ (tx?.totals?.amountPartner ?? 0).toLocaleString('fr-FR') }} FCFA</strong>
        </p>
        <p class="mt-1 text-slate-600">
          Commissions plateforme :
          <strong>{{ (tx?.totals?.amountPlatform ?? 0).toLocaleString('fr-FR') }} FCFA</strong>
        </p>
      </div>
    </main>
  </div>
</template>
