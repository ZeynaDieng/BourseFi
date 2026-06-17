<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

const { data } = await useFetch('/api/admin/transactions')
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <h1 class="admin-page-title">Transactions</h1>
      <div v-if="data?.totals" class="mt-6 grid grid-cols-3 gap-4">
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ data.totals.count }}</p>
          <p class="text-xs text-slate-500">Paiements</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ data.totals.amountPartner.toLocaleString('fr-FR') }}</p>
          <p class="text-xs text-slate-500">Partenaires (FCFA)</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ data.totals.amountPlatform.toLocaleString('fr-FR') }}</p>
          <p class="text-xs text-slate-500">Commissions (FCFA)</p>
        </div>
      </div>
      <div class="admin-table-shell mt-8">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Montant</th>
              <th class="admin-th">Partenaire</th>
              <th class="admin-th">Programme</th>
              <th class="admin-th">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in data?.items ?? []" :key="t.id">
              <td class="admin-td">{{ t.amount.toLocaleString('fr-FR') }} {{ t.currency }}</td>
              <td class="admin-td">{{ t.partnerName ?? '—' }}</td>
              <td class="admin-td">{{ t.programme ?? '—' }}</td>
              <td class="admin-td">{{ new Date(t.createdAt).toLocaleDateString('fr-FR') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>
