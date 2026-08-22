<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type EmailRelancesStats = {
  vueGlobale: {
    totalCandidats: number
    paiementsValides: number
    paiementsEnAttente: number
    candidaturesAbandonnees: number
    candidatsARelancer: number
  }
  performanceEmail: {
    emailsToday: number
    emailsMonth: number
    tauxOuverture: number
    tauxClic: number
    paiementsRecuperes: number
    revenusRecuperes: number
  }
  revenusDormants: {
    candidatsNonConvertis: number
    montantPotentielRecuperable: number
    paiementsEnAttente: number
    paiementsEchoues: number
  }
}

type SegmentData = {
  name: string
  count: number
  revenue: number
  items: Array<{
    id: string
    fullName: string
    email: string
    phone: string
    formation: string
    ecole: string
    montant: number
    ageDays: number
  }>
}

type SegmentsPayload = {
  segmentA: SegmentData
  segmentB: SegmentData
  segmentC: SegmentData
  segmentD: SegmentData
  segmentE: SegmentData
  segmentF: SegmentData
}

type HistoriqueItem = {
  id: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  formation: string
  ecole: string
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'BOTH'
  subject: string
  messageContent: string
  scenarioStep?: number | null
  scenarioName?: string
  sentAt: string
  status: string
  isPaid: boolean
  recoveredAmount?: number | null
}

const searchQuery = ref('')
const selectedChannel = ref('ALL')

const { data: statsData, refresh: refreshStats } = await useFetch<{ ok: boolean } & EmailRelancesStats>('/api/admin/email-relances/stats')
const { data: segmentsData, refresh: refreshSegments } = await useFetch<{ ok: boolean; segments: SegmentsPayload }>('/api/admin/email-relances/segments')
const { data: histoData, refresh: refreshHisto } = await useFetch<{ ok: boolean; total: number; historique: HistoriqueItem[] }>('/api/admin/email-relances/historique', {
  query: computed(() => ({ search: searchQuery.value, channel: selectedChannel.value })),
})

const stats = computed(() => statsData.value || {
  vueGlobale: { totalCandidats: 0, paiementsValides: 0, paiementsEnAttente: 0, candidaturesAbandonnees: 0, candidatsARelancer: 0 },
  performanceEmail: { emailsToday: 0, emailsMonth: 0, tauxOuverture: 0, tauxClic: 0, paiementsRecuperes: 0, revenusRecuperes: 0 },
  revenusDormants: { candidatsNonConvertis: 0, montantPotentielRecuperable: 0, paiementsEnAttente: 0, paiementsEchoues: 0 },
})

const segments = computed(() => segmentsData.value?.segments || null)
const historique = computed(() => histoData.value?.historique || [])

const launchingCampaign = ref(false)
const selectedSegmentKey = ref<string>('all')
const selectedMessageModal = ref<HistoriqueItem | null>(null)

async function launchReactivationCampaign() {
  if (!confirm(`Lancer la campagne d'emailing de réactivation auprès de ${stats.value.revenusDormants.candidatsNonConvertis} candidat(s) dormants ?`)) return

  launchingCampaign.value = true
  try {
    const res = await $fetch<{ ok: boolean; count: number }>('/api/admin/email-relances/reactivation-campaign', {
      method: 'POST',
      body: { codePromo: 'RENTREE2026' },
    })
    await refreshStats()
    await refreshSegments()
    await refreshHisto()
    alert(`🚀 Campagne de réactivation lancée avec succès auprès de ${res.count} candidat(s) !`)
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Erreur lors du lancement de la campagne.'))
  } finally {
    launchingCampaign.value = false
  }
}

function formatDate(iso?: string) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="admin-page-title flex items-center gap-2">
            <span>📧 Relances Email & Réactivation Base</span>
          </h1>
          <p class="admin-page-desc">
            Pilotage des e-mails automatiques, réactivation de la base existante et conversion des paiements en attente.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink to="/admin/email-relances/modeles" class="admin-btn-secondary text-xs inline-flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">edit_note</span>
            Modèles d'Email
          </NuxtLink>
          <NuxtLink to="/admin/email-relances/analytics" class="admin-btn-secondary text-xs inline-flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">analytics</span>
            Analytics Email
          </NuxtLink>
        </div>
      </div>

      <!-- WIDGET REVENUS DORMANTS ET CAMPAGNE DE RÉACTIVATION -->
      <div class="mt-6 overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-6 text-white shadow-lg">
        <div class="flex flex-wrap items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[24px]">monetization_on</span>
              <h2 class="text-lg font-black uppercase tracking-wider">💰 WIDGET REVENUS DORMANTS</h2>
            </div>
            <p class="text-xs text-amber-100 leading-relaxed">
              {{ stats.revenusDormants.candidatsNonConvertis }} candidats ont initié leur candidature ou leur dossier de bourse mais n'ont pas finalisé leur règlement.
            </p>
            <div class="pt-2 flex flex-wrap gap-3">
              <div class="rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20">
                <p class="text-[10px] text-amber-200 uppercase font-bold">Montant Potentiel Récupérable</p>
                <p class="text-2xl font-black">{{ stats.revenusDormants.montantPotentielRecuperable.toLocaleString('fr-FR') }} FCFA</p>
              </div>
              <div class="rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20">
                <p class="text-[10px] text-amber-200 uppercase font-bold">Paiements en attente</p>
                <p class="text-2xl font-black">{{ stats.revenusDormants.paiementsEnAttente }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 shrink-0">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-amber-950 shadow-md transition hover:bg-amber-50 active:scale-95"
              :disabled="launchingCampaign || !stats.revenusDormants.candidatsNonConvertis"
              @click="launchReactivationCampaign"
            >
              <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
              {{ launchingCampaign ? 'Envoi en cours...' : '🚀 Lancer la Campagne de Réactivation' }}
            </button>

            <p class="text-[11px] text-center text-amber-100 font-medium">
              Cible : {{ stats.revenusDormants.candidatsNonConvertis }} destinataire(s) avec Code Promo
            </p>
          </div>
        </div>
      </div>

      <!-- Vue Globale Candidats & Performance Email -->
      <div class="mt-6 space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500">📊 Dashboard Relances Email</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-primary">{{ stats.vueGlobale.totalCandidats }}</p>
            <p class="text-xs text-slate-500">Total candidats</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-amber-600">{{ stats.vueGlobale.paiementsEnAttente }}</p>
            <p class="text-xs text-slate-500">Paiements en attente</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-emerald-600">{{ stats.vueGlobale.paiementsValides }}</p>
            <p class="text-xs text-slate-500">Paiements validés</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-blue-600">{{ stats.performanceEmail.tauxOuverture }}%</p>
            <p class="text-xs text-slate-500">Taux d'ouverture email</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-emerald-700">{{ stats.performanceEmail.revenusRecuperes.toLocaleString('fr-FR') }} FCFA</p>
            <p class="text-xs text-slate-500">Revenus récupérés ({{ stats.performanceEmail.paiementsRecuperes }} paiements)</p>
          </div>
        </div>
      </div>

      <!-- TABLEAU HISTORIQUE DÉTAILLÉ DES RELANCES & DESTINATAIRES -->
      <div class="mt-8 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800">📋 Historique Détaillé des Relances & Destinataires</h2>
            <p class="text-xs text-slate-500">Recherchez et consultez l'ensemble des candidats relancés, le contenu exact du message et l'état de conversion.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="🔍 Nom, e-mail, téléphone, formation..."
              class="admin-input text-xs w-64"
            />
            <select v-model="selectedChannel" class="admin-input text-xs w-36">
              <option value="ALL">Tous les canaux</option>
              <option value="EMAIL">✉️ Email</option>
              <option value="WHATSAPP">🟢 WhatsApp</option>
            </select>
          </div>
        </div>

        <div class="admin-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="admin-table min-w-[950px]">
              <thead>
                <tr>
                  <th class="admin-th">Date & Heure</th>
                  <th class="admin-th">Candidat (Destinataire)</th>
                  <th class="admin-th">Formation & Établissement</th>
                  <th class="admin-th">Canal & Sujet</th>
                  <th class="admin-th">Statut Paiement</th>
                  <th class="admin-th text-right">Message</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in historique" :key="item.id" class="hover:bg-slate-50/80">
                  <td class="admin-td text-xs font-mono text-slate-600 whitespace-nowrap">
                    {{ formatDate(item.sentAt) }}
                  </td>
                  <td class="admin-td">
                    <p class="font-bold text-slate-900 text-xs">{{ item.candidateName }}</p>
                    <p class="text-[11px] text-slate-500 font-mono">{{ item.candidateEmail }}</p>
                    <p class="text-[10px] text-slate-400 font-mono font-medium">📞 {{ item.candidatePhone }}</p>
                  </td>
                  <td class="admin-td">
                    <p class="text-xs font-semibold text-slate-800">{{ item.formation }}</p>
                    <p class="text-[11px] text-slate-500">{{ item.ecole }}</p>
                  </td>
                  <td class="admin-td">
                    <div class="flex flex-col gap-1 items-start">
                      <span v-if="item.channel === 'EMAIL'" class="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">mail</span> Email
                      </span>
                      <span v-else-if="item.channel === 'WHATSAPP'" class="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">chat</span> WhatsApp
                      </span>
                      <span v-else class="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        {{ item.channel }}
                      </span>
                      <p class="text-xs font-bold text-slate-700 max-w-xs truncate">{{ item.subject }}</p>
                    </div>
                  </td>
                  <td class="admin-td">
                    <span v-if="item.isPaid" class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 inline-flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">check_circle</span> 🎉 Payé
                    </span>
                    <span v-else class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                      ⏳ En attente
                    </span>
                  </td>
                  <td class="admin-td text-right">
                    <button
                      type="button"
                      class="admin-btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                      @click="selectedMessageModal = item"
                    >
                      <span class="material-symbols-outlined text-[14px]">visibility</span>
                      Voir le message
                    </button>
                  </td>
                </tr>
                <tr v-if="!historique.length">
                  <td colspan="6" class="p-8 text-center text-xs text-slate-500">
                    Aucun historique de relance trouvé pour vos critères de recherche.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Segmentation Automatique des Candidats Existants -->
      <div v-if="segments" class="mt-8 space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800">📂 Segmentation de la Base de Candidats</h2>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(seg, key) in segments"
            :key="key"
            class="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs transition hover:border-primary/40 cursor-pointer"
            :class="{ 'ring-2 ring-primary bg-primary/5': selectedSegmentKey === key }"
            @click="selectedSegmentKey = key"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900">{{ seg.name }}</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{{ seg.count }}</span>
            </div>
            <p class="text-xs font-black text-amber-700">
              Potentiel : {{ seg.revenue.toLocaleString('fr-FR') }} FCFA
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Aperçu du Message Envoyé -->
    <Teleport to="body">
      <div v-if="selectedMessageModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Message envoyé à {{ selectedMessageModal.candidateName }}</h3>
              <p class="text-xs text-slate-500 font-mono">{{ selectedMessageModal.candidateEmail }} | {{ selectedMessageModal.candidatePhone }}</p>
            </div>
            <button type="button" class="text-slate-400 hover:text-slate-600" @click="selectedMessageModal = null">✕</button>
          </div>

          <div class="space-y-2 text-xs">
            <p class="font-bold text-slate-700">Objet : {{ selectedMessageModal.subject }}</p>
            <p class="text-slate-500">Date d'envoi : {{ formatDate(selectedMessageModal.sentAt) }}</p>
            <div class="rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-800 border border-slate-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {{ selectedMessageModal.messageContent }}
            </div>
          </div>

          <div class="flex justify-end pt-3 border-t">
            <button type="button" class="admin-btn-primary text-xs" @click="selectedMessageModal = null">Fermer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
