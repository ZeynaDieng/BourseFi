<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

const { data } = await useFetch('/api/admin/transactions')

function formatStatus(status: string) {
  const map: Record<string, string> = {
    Valide: 'Validé',
    VALIDE: 'Validé',
    PENDING: 'En attente',
    EN_ATTENTE: 'En attente',
    COMPLETED: 'Validé',
    FAILED: 'Échoué',
    ECHEC: 'Échoué',
    REFUNDED: 'Remboursé',
  }
  return map[status] ?? status
}

function formatMethod(method: string) {
  const map: Record<string, string> = {
    WAVE: 'Wave',
    ORANGE_MONEY: 'Orange Money',
    CARD: 'Carte',
    BANK: 'Virement',
  }
  return map[method] ?? method
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <h1 class="admin-page-title">Paiements</h1>
      <p class="admin-page-desc">Historique des transactions, statuts et commissions plateforme.</p>
      <div v-if="data?.totals" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
      <div class="admin-table-shell mt-8 overflow-x-auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Montant</th>
              <th class="admin-th">Statut</th>
              <th class="admin-th">Méthode</th>
              <th class="admin-th">Commission</th>
              <th class="admin-th">Partenaire</th>
              <th class="admin-th">Programme</th>
              <th class="admin-th">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in data?.items ?? []" :key="t.id">
              <td class="admin-td font-semibold">
                {{ t.amount.toLocaleString('fr-FR') }} {{ t.currency }}
              </td>
              <td class="admin-td">{{ formatStatus(t.status) }}</td>
              <td class="admin-td">{{ formatMethod(t.method) }}</td>
              <td class="admin-td">{{ t.amountPlatform.toLocaleString('fr-FR') }} {{ t.currency }}</td>
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
