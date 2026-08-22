<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type AnalyticsPayload = {
  performance: {
    totalSent: number
    totalDelivered: number
    totalOpened: number
    totalClicked: number
    totalConverted: number
    totalRecoveredAmount: number
    tauxOuverture: number
    tauxClic: number
    tauxConversion: number
    avgHoursBeforePayment: number
  }
  bestSubjects: Array<{ subject: string; openRate: string; conversionRate: string }>
  logs: Array<{
    id: string
    subject: string
    sentAt: string
    status: string
    candidature?: { fullName: string; email: string; programme: { titre: string } }
  }>
}

const { data: analyticsData } = await useFetch<{ ok: boolean } & AnalyticsPayload>('/api/admin/email-relances/analytics')

const perf = computed(() => analyticsData.value?.performance || {
  totalSent: 0, totalDelivered: 0, totalOpened: 0, totalClicked: 0, totalConverted: 0,
  totalRecoveredAmount: 0, tauxOuverture: 0, tauxClic: 0, tauxConversion: 0, avgHoursBeforePayment: 0,
})

const bestSubjects = computed(() => analyticsData.value?.bestSubjects || [])
const logs = computed(() => analyticsData.value?.logs || [])

function formatDate(iso?: string) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="admin-page-title flex items-center gap-2">
            <span>📈 Analytics & Rapports Emailing</span>
          </h1>
          <p class="admin-page-desc">
            Analyse complète de la délivrabilité, des taux d'ouverture, des clics et de l'efficacité par modèle d'email.
          </p>
        </div>
      </div>

      <!-- KPIs Performance Globale -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ perf.totalSent }}</p>
          <p class="text-xs text-slate-500">Emails envoyés</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-emerald-600">{{ perf.totalDelivered }}</p>
          <p class="text-xs text-slate-500">Emails délivrés (98%)</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-sky-600">{{ perf.tauxOuverture }}%</p>
          <p class="text-xs text-slate-500">Taux d'ouverture</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-purple-600">{{ perf.tauxClic }}%</p>
          <p class="text-xs text-slate-500">Taux de clic</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-amber-600">{{ perf.totalConverted }}</p>
          <p class="text-xs text-slate-500">Paiements récupérés</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-emerald-700">{{ perf.totalRecoveredAmount.toLocaleString('fr-FR') }} FCFA</p>
          <p class="text-xs text-slate-500">Revenus générés</p>
        </div>
      </div>

      <!-- Meilleurs Objets d'Email -->
      <div class="mt-8 space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800">⭐ Meilleurs Objets d'Email (Performances)</h2>
        <div class="grid gap-3 sm:grid-cols-3">
          <div
            v-for="(sub, i) in bestSubjects"
            :key="i"
            class="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs"
          >
            <div class="flex items-center justify-between">
              <span class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Top {{ i + 1 }}</span>
              <span class="text-xs font-extrabold text-emerald-700">{{ sub.conversionRate }} conversion</span>
            </div>
            <p class="font-bold text-slate-900 text-xs">"{{ sub.subject }}"</p>
            <p class="text-[11px] text-slate-500">Taux d'ouverture : <strong>{{ sub.openRate }}</strong></p>
          </div>
        </div>
      </div>

      <!-- Journal Récent des Envois -->
      <div class="mt-8 space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800">📋 Dernières Relances Email Envoyées</h2>
        <div class="admin-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="admin-table min-w-[800px]">
              <thead>
                <tr>
                  <th class="admin-th">Date</th>
                  <th class="admin-th">Destinataire</th>
                  <th class="admin-th">Formation</th>
                  <th class="admin-th">Objet Email</th>
                  <th class="admin-th">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/80">
                  <td class="admin-td text-xs font-mono text-slate-500">{{ formatDate(log.sentAt) }}</td>
                  <td class="admin-td">
                    <p class="font-bold text-slate-900">{{ log.candidature?.fullName || 'Candidat' }}</p>
                    <p class="text-[11px] text-slate-400">{{ log.candidature?.email }}</p>
                  </td>
                  <td class="admin-td text-xs font-medium">{{ log.candidature?.programme.titre || 'N/A' }}</td>
                  <td class="admin-td text-xs font-medium text-slate-700 max-w-xs truncate">{{ log.subject }}</td>
                  <td class="admin-td">
                    <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      Delivered / Sent
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
