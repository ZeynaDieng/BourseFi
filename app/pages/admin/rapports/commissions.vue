<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type SchoolCommissionRow = {
  id: string
  nom: string
  slug: string
  ville: string
  isDirectPartner: boolean
  fraisDossier: number
  commissionType: string
  commissionValue: number
  commissionPaidStatus: string
  orientedCount: number
  paidCount: number
  totalFraisDossier: number
  totalCommissionDue: number
  totalCommissionPaid: number
  totalCommissionPending: number
}

const loading = ref(true)
const schools = ref<SchoolCommissionRow[]>([])
const searchQ = ref('')
const filterDirect = ref('ALL')
const filterStatus = ref('ALL')

// Modal de validation du règlement
const modalOpen = ref(false)
const selectedSchool = ref<SchoolCommissionRow | null>(null)
const validationForm = reactive({
  status: 'UP_TO_DATE',
  reference: '',
  notes: '',
  markCandidaturesAsPaid: true,
})
const validating = ref(false)

async function load() {
  loading.value = true
  try {
    const list = await $fetch<any[]>('/api/admin/etablissements')
    
    // Charger les métriques et commissions pour chaque établissement
    const results = await Promise.all(
      list.map(async (e) => {
        try {
          const r = await $fetch<any>(`/api/admin/etablissements/${e.id}/rapport`)
          return {
            id: e.id,
            nom: e.nom,
            slug: e.slug,
            ville: e.ville,
            isDirectPartner: e.isDirectPartner ?? false,
            fraisDossier: e.fraisDossier ?? 20000,
            commissionType: e.commissionType || 'FIXED_AMOUNT',
            commissionValue: e.commissionValue ?? 0,
            commissionPaidStatus: e.commissionPaidStatus || 'PENDING',
            orientedCount: r.metrics.totalOriented || 0,
            paidCount: r.metrics.totalPaidCount || 0,
            totalFraisDossier: r.metrics.totalFraisDossierCollectes || 0,
            totalCommissionDue: r.metrics.totalCommissionsDues || 0,
            totalCommissionPaid: r.metrics.totalCommissionsPayees || 0,
            totalCommissionPending: r.metrics.totalCommissionsEnAttente || 0,
          }
        } catch {
          return {
            id: e.id,
            nom: e.nom,
            slug: e.slug,
            ville: e.ville,
            isDirectPartner: e.isDirectPartner ?? false,
            fraisDossier: e.fraisDossier ?? 20000,
            commissionType: e.commissionType || 'FIXED_AMOUNT',
            commissionValue: e.commissionValue ?? 0,
            commissionPaidStatus: e.commissionPaidStatus || 'PENDING',
            orientedCount: 0,
            paidCount: 0,
            totalFraisDossier: 0,
            totalCommissionDue: 0,
            totalCommissionPaid: 0,
            totalCommissionPending: 0,
          }
        }
      })
    )

    schools.value = results
  } catch (err) {
    if (import.meta.client) {
      alert(getAdminErrorMessage(err, 'Erreur lors du chargement des commissions.'))
    }
  } finally {
    loading.value = false
  }
}

await load()

function openValidationModal(school: SchoolCommissionRow) {
  selectedSchool.value = school
  validationForm.status = 'UP_TO_DATE'
  validationForm.reference = ''
  validationForm.notes = ''
  validationForm.markCandidaturesAsPaid = true
  modalOpen.value = true
}

async function handleValidatePayout() {
  if (!selectedSchool.value) return
  validating.value = true
  try {
    await $fetch(`/api/admin/etablissements/${selectedSchool.value.id}/valider-commission`, {
      method: 'POST',
      body: validationForm,
    })
    modalOpen.value = false
    await load()
  } catch (err) {
    if (import.meta.client) {
      alert(getAdminErrorMessage(err, 'Erreur lors de la validation du règlement.'))
    }
  } finally {
    validating.value = false
  }
}

const filteredSchools = computed(() => {
  let res = schools.value
  if (filterDirect.value === 'DIRECT') {
    res = res.filter((s) => s.isDirectPartner)
  } else if (filterDirect.value === 'STANDARD') {
    res = res.filter((s) => !s.isDirectPartner)
  }

  if (filterStatus.value === 'PENDING') {
    res = res.filter((s) => s.commissionPaidStatus === 'PENDING')
  } else if (filterStatus.value === 'UP_TO_DATE') {
    res = res.filter((s) => s.commissionPaidStatus === 'UP_TO_DATE')
  }

  if (searchQ.value.trim()) {
    const q = searchQ.value.toLowerCase()
    res = res.filter((s) => s.nom.toLowerCase().includes(q) || s.ville.toLowerCase().includes(q))
  }

  return res
})

const grandTotalOriented = computed(() => schools.value.reduce((acc, s) => acc + s.orientedCount, 0))
const grandTotalCommissions = computed(() => schools.value.reduce((acc, s) => acc + s.totalCommissionDue, 0))
const grandTotalPaidCommissions = computed(() => schools.value.reduce((acc, s) => acc + s.totalCommissionPaid, 0))
const grandTotalPendingCommissions = computed(() => schools.value.reduce((acc, s) => acc + s.totalCommissionPending, 0))
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <AdminSidebar />
    <main class="flex-1 p-4 md:p-8 space-y-8">
      <!-- Header -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-secondary">Finances & Recouvrement</p>
          <h1 class="font-headline text-3xl font-extrabold text-primary">Commissions & Orientations Écoles</h1>
          <p class="mt-1 text-sm text-slate-600">
            Suivi et traçabilité complète des commissions dues par les établissements et validation des règlements.
          </p>
        </div>
      </div>

      <!-- KPIs Globaux -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Étudiants Orientés</span>
          <p class="text-3xl font-black text-slate-900 mt-2">{{ grandTotalOriented }}</p>
          <p class="text-xs text-slate-500 mt-1">Toutes écoles confondues</p>
        </div>

        <div class="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs">
          <span class="text-xs font-bold uppercase tracking-wider text-amber-800">Total Commissions Dues</span>
          <p class="text-3xl font-black text-amber-900 mt-2">{{ grandTotalCommissions.toLocaleString('fr-FR') }} <span class="text-sm">FCFA</span></p>
          <p class="text-xs text-amber-700 font-medium mt-1">Générées par les orientations</p>
        </div>

        <div class="rounded-2xl border border-amber-300 bg-amber-100/70 p-5 shadow-xs">
          <span class="text-xs font-bold uppercase tracking-wider text-amber-900">Commissions En Attente</span>
          <p class="text-3xl font-black text-amber-950 mt-2">{{ grandTotalPendingCommissions.toLocaleString('fr-FR') }} <span class="text-sm">FCFA</span></p>
          <p class="text-xs text-amber-800 font-medium mt-1">À percevoir de l'école (En attente paye)</p>
        </div>

        <div class="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-800">Commissions Encaissées</span>
          <p class="text-3xl font-black text-emerald-900 mt-2">{{ grandTotalPaidCommissions.toLocaleString('fr-FR') }} <span class="text-sm">FCFA</span></p>
          <p class="text-xs text-emerald-700 font-medium mt-1">Règlements écoles validés</p>
        </div>
      </div>

      <!-- Filtres & Tableau -->
      <div class="space-y-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 select-none">search</span>
            <input
              v-model="searchQ"
              type="search"
              placeholder="Rechercher une école..."
              class="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <select v-model="filterDirect" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="ALL">Tous les partenaires</option>
              <option value="DIRECT">Partenaires Directs uniquement</option>
              <option value="STANDARD">Écoles Standard</option>
            </select>

            <select v-model="filterStatus" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="ALL">Tous les états de règlement</option>
              <option value="PENDING">🟡 En attente de paiement</option>
              <option value="UP_TO_DATE">🟢 Réglé / Encaissé</option>
            </select>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">Établissement</th>
                <th class="px-4 py-3">Partenariat</th>
                <th class="px-4 py-3 text-center">Élèves Orientés</th>
                <th class="px-4 py-3 text-right">Commission Totale (FCFA)</th>
                <th class="px-4 py-3 text-center">État Règlement</th>
                <th class="px-4 py-3 text-center">Action Règlement</th>
                <th class="px-4 py-3 text-right">Rapport</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="s in filteredSchools" :key="s.id" class="hover:bg-slate-50 transition">
                <td class="px-4 py-3.5">
                  <p class="font-bold text-slate-900">{{ s.nom }}</p>
                  <p class="text-xs text-slate-500">{{ s.ville }}</p>
                </td>
                <td class="px-4 py-3.5">
                  <span v-if="s.isDirectPartner" class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    ⚡ Direct
                  </span>
                  <span v-else class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    Standard
                  </span>
                </td>
                <td class="px-4 py-3.5 text-center font-bold text-slate-900">
                  {{ s.orientedCount }}
                </td>
                <td class="px-4 py-3.5 text-right font-extrabold text-amber-900">
                  {{ s.totalCommissionDue.toLocaleString('fr-FR') }} FCFA
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                    :class="{
                      'bg-emerald-100 text-emerald-800': s.commissionPaidStatus === 'UP_TO_DATE',
                      'bg-amber-100 text-amber-800': s.commissionPaidStatus === 'PENDING',
                      'bg-orange-100 text-orange-800': s.commissionPaidStatus === 'PARTIAL',
                    }"
                  >
                    {{ s.commissionPaidStatus === 'UP_TO_DATE' ? '🟢 Réglé / Encaissé' : s.commissionPaidStatus === 'PENDING' ? '🟡 En attente' : '🟠 Partiel' }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition"
                    :class="s.commissionPaidStatus === 'UP_TO_DATE' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs'"
                    @click="openValidationModal(s)"
                  >
                    <span class="material-symbols-outlined text-[16px]">price_check</span>
                    {{ s.commissionPaidStatus === 'UP_TO_DATE' ? 'Modifier' : 'Valider la Paye' }}
                  </button>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <NuxtLink
                    :to="`/admin/catalogue/ecoles/${s.id}`"
                    class="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                  >
                    <span class="material-symbols-outlined text-[16px]">analytics</span>
                    Détail
                  </NuxtLink>
                </td>
              </tr>

              <tr v-if="!filteredSchools.length">
                <td colspan="7" class="p-8 text-center text-slate-400">
                  Aucun établissement trouvé.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal de validation du règlement de la commission -->
    <div
      v-if="modalOpen && selectedSchool"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-secondary">Règlement Établissement</p>
            <h3 class="font-headline text-lg font-bold text-primary">{{ selectedSchool.nom }}</h3>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="modalOpen = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1 text-sm">
          <p class="text-xs font-bold text-amber-900 uppercase">Montant total des commissions dues</p>
          <p class="font-headline text-2xl font-black text-amber-950">{{ selectedSchool.totalCommissionDue.toLocaleString('fr-FR') }} FCFA</p>
          <p class="text-xs text-amber-800">Pour {{ selectedSchool.orientedCount }} étudiant(s) orienté(s)</p>
        </div>

        <div class="space-y-3 pt-2">
          <label class="block">
            <span class="text-xs font-semibold text-slate-700">Statut du règlement par l'école</span>
            <select v-model="validationForm.status" class="admin-input mt-1 w-full bg-white">
              <option value="UP_TO_DATE">🟢 Réglé / Encaissé (Commissions payées à BourseFi)</option>
              <option value="PENDING">🟡 En attente de paiement par l'école</option>
              <option value="PARTIAL">🟠 Règlement partiel</option>
            </select>
          </label>

          <label class="block">
            <span class="text-xs font-semibold text-slate-700">Référence du règlement / N° de virement ou chèque</span>
            <input
              v-model="validationForm.reference"
              type="text"
              placeholder="Ex: VIR-2026-08-001 ou Chèque N°45892"
              class="admin-input mt-1 w-full"
            />
          </label>

          <label class="block">
            <span class="text-xs font-semibold text-slate-700">Remarques / Observations (Optionnel)</span>
            <textarea
              v-model="validationForm.notes"
              rows="2"
              placeholder="Précisions sur le versement de l'école..."
              class="admin-input mt-1 w-full"
            ></textarea>
          </label>

          <label class="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
            <input
              v-model="validationForm.markCandidaturesAsPaid"
              type="checkbox"
              class="rounded text-primary focus:ring-primary"
            />
            <span>Marquer toutes les candidatures en attente de cette école comme valides/payées</span>
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" class="admin-btn-secondary text-sm" @click="modalOpen = false">
            Annuler
          </button>
          <button
            type="button"
            class="admin-btn-primary text-sm bg-emerald-700 hover:bg-emerald-800"
            :disabled="validating"
            @click="handleValidatePayout"
          >
            {{ validating ? 'Enregistrement…' : 'Valider le Règlement' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
