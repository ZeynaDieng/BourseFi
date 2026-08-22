<script setup lang="ts">
import { computed, ref } from 'vue'
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

const { data: statsData, refresh: refreshStats } = await useFetch<{ ok: boolean } & EmailRelancesStats>('/api/admin/email-relances/stats')
const { data: segmentsData, refresh: refreshSegments } = await useFetch<{ ok: boolean; segments: SegmentsPayload }>('/api/admin/email-relances/segments')

const stats = computed(() => statsData.value || {
  vueGlobale: { totalCandidats: 0, paiementsValides: 0, paiementsEnAttente: 0, candidaturesAbandonnees: 0, candidatsARelancer: 0 },
  performanceEmail: { emailsToday: 0, emailsMonth: 0, tauxOuverture: 0, tauxClic: 0, paiementsRecuperes: 0, revenusRecuperes: 0 },
  revenusDormants: { candidatsNonConvertis: 0, montantPotentielRecuperable: 0, paiementsEnAttente: 0, paiementsEchoues: 0 },
})

const segments = computed(() => segmentsData.value?.segments || null)
const launchingCampaign = ref(false)
const selectedSegmentKey = ref<string>('all')

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
    alert(`🚀 Campagne de réactivation lancée avec succès auprès de ${res.count} candidat(s) !`)
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Erreur lors du lancement de la campagne.'))
  } finally {
    launchingCampaign.value = false
  }
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

      <!-- Scénarios d'Emailing Automatique (J+1, J+3, J+7, J+15) -->
      <div class="mt-8 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800">📧 Scénarios de Relance Email Automatique</h2>
          <NuxtLink to="/admin/email-relances/modeles" class="text-xs font-bold text-primary hover:underline">
            Gérer les modèles & textes →
          </NuxtLink>
        </div>

        <div class="grid gap-3 md:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary">SCÉNARIO 1 — J+1</span>
              <span class="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Actif</span>
            </div>
            <p class="text-xs font-bold text-slate-800">Votre dossier BourseFi est presque finalisé</p>
            <p class="text-[11px] text-slate-500">24h après la candidature si aucun paiement.</p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary">SCÉNARIO 2 — J+3</span>
              <span class="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Actif</span>
            </div>
            <p class="text-xs font-bold text-slate-800">Votre place est toujours réservée</p>
            <p class="text-[11px] text-slate-500">72h après la candidature (Rappel urgence).</p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary">SCÉNARIO 3 — J+7</span>
              <span class="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Actif</span>
            </div>
            <p class="text-xs font-bold text-slate-800">Offre spéciale pour finaliser votre inscription</p>
            <p class="text-[11px] text-slate-500">7 jours avec attribution du code promo RENTREE2026.</p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary">SCÉNARIO 4 — J+15</span>
              <span class="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Actif</span>
            </div>
            <p class="text-xs font-bold text-slate-800">Votre bourse est-elle toujours d'actualité ?</p>
            <p class="text-[11px] text-slate-500">15 jours (Dernier rappel avant classement).</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
