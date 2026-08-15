<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

const route = useRoute()
const router = useRouter()
const schoolId = computed(() => route.params.id as string)

type RapportData = {
  etablissement: {
    id: string
    nom: string
    slug: string
    ville: string
    logoUrl: string | null
    isDirectPartner: boolean
    fraisDossier: number
    autoIssueAttestation: boolean
    commissionType: string
    commissionValue: number
    commissionPaidStatus: string
  }
  metrics: {
    totalOriented: number
    totalPaidCount: number
    totalFraisDossierCollectes: number
    totalCommissionsDues: number
  }
  programmesBreakdown: Array<{
    id: string
    slug: string
    titre: string
    niveau: string
    duree: string
    tuitionFee: number | null
    orientedCount: number
    totalCommission: number
  }>
  studentList: Array<{
    id: string
    fullName: string
    email: string
    phone: string
    formation: string
    niveau: string
    status: string
    hasPaid: boolean
    fraisDossierPayes: number
    attestationNumber: string | null
    commissionAmount: number
    createdAt: string
  }>
}

const data = ref<RapportData | null>(null)
const loading = ref(true)
const errorMsg = ref('')
const activeTab = ref<'orientations' | 'programmes' | 'settings'>('orientations')

const searchStudent = ref('')
const statusFilter = ref('ALL')

// Formulaire d'édition des paramètres partenaire
const partnerForm = ref({
  isDirectPartner: false,
  fraisDossier: 20000,
  autoIssueAttestation: false,
  commissionType: 'FIXED_AMOUNT',
  commissionValue: 0,
  commissionPaidStatus: 'UP_TO_DATE',
})

const savingPartnerSettings = ref(false)
const saveSuccess = ref(false)

async function loadRapport() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch<RapportData>(`/api/admin/etablissements/${schoolId.value}/rapport`)
    data.value = res
    partnerForm.value = {
      isDirectPartner: res.etablissement.isDirectPartner ?? false,
      fraisDossier: res.etablissement.fraisDossier ?? 20000,
      autoIssueAttestation: res.etablissement.autoIssueAttestation ?? false,
      commissionType: res.etablissement.commissionType || 'FIXED_AMOUNT',
      commissionValue: res.etablissement.commissionValue ?? 0,
      commissionPaidStatus: res.etablissement.commissionPaidStatus || 'UP_TO_DATE',
    }
  } catch (err) {
    errorMsg.value = getAdminErrorMessage(err, 'Erreur lors du chargement du rapport.')
  } finally {
    loading.value = false
  }
}

await loadRapport()

const filteredStudents = computed(() => {
  if (!data.value) return []
  let list = data.value.studentList
  if (statusFilter.value !== 'ALL') {
    if (statusFilter.value === 'PAID') {
      list = list.filter((s) => s.hasPaid)
    } else {
      list = list.filter((s) => s.status === statusFilter.value)
    }
  }
  if (searchStudent.value.trim()) {
    const q = searchStudent.value.toLowerCase()
    list = list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.formation.toLowerCase().includes(q) ||
        (s.attestationNumber && s.attestationNumber.toLowerCase().includes(q))
    )
  }
  return list
})

async function saveSettings() {
  savingPartnerSettings.value = true
  saveSuccess.value = false
  try {
    await $fetch(`/api/admin/etablissements/${schoolId.value}`, {
      method: 'PATCH',
      body: partnerForm.value,
    })
    saveSuccess.value = true
    await loadRapport()
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err) {
    alert(getAdminErrorMessage(err, 'Impossible d\'enregistrer les paramètres.'))
  } finally {
    savingPartnerSettings.value = false
  }
}

function exportExcel() {
  window.open(`/api/admin/etablissements/${schoolId.value}/export-orientations`, '_blank')
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <AdminSidebar />
    <main class="flex-1 p-4 md:p-8 space-y-8">
      <!-- Chargement / Erreur -->
      <div v-if="loading" class="py-12 text-center text-slate-500">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
        <p class="mt-2 text-sm">Chargement du rapport d'établissement...</p>
      </div>

      <div v-else-if="errorMsg" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p class="font-bold">{{ errorMsg }}</p>
        <NuxtLink to="/admin/catalogue/ecoles" class="mt-3 inline-block text-xs font-bold underline">
          ← Retour aux établissements
        </NuxtLink>
      </div>

      <template v-else-if="data">
        <!-- Top Navigation & Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
          <div>
            <NuxtLink to="/admin/catalogue/ecoles" class="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-2">
              ← Établissements
            </NuxtLink>
            <div class="flex items-center gap-3">
              <h1 class="font-headline text-3xl font-extrabold text-primary">{{ data.etablissement.nom }}</h1>
              <span v-if="data.etablissement.isDirectPartner" class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                ⚡ Partenaire Direct
              </span>
              <span v-else class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Standard
              </span>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Ville : <strong>{{ data.etablissement.ville }}</strong> | Frais dossier : <strong>{{ (data.etablissement.fraisDossier || 20000).toLocaleString('fr-FR') }} FCFA</strong>
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
              @click="exportExcel"
            >
              <span class="material-symbols-outlined text-[18px]">download</span>
              Exporter les Orientations (CSV/Excel)
            </button>
          </div>
        </div>

        <!-- Grille KPIs Financiers -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Étudiants Orientés -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider">Étudiants Orientés</span>
              <span class="material-symbols-outlined text-primary">school</span>
            </div>
            <p class="text-3xl font-black text-slate-900">{{ data.metrics.totalOriented }}</p>
            <p class="mt-1 text-xs text-slate-500">
              dont <strong class="text-emerald-600">{{ data.metrics.totalPaidCount }}</strong> avec dossier payé
            </p>
          </div>

          <!-- Frais dossier collectés -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider">Frais de Dossier</span>
              <span class="material-symbols-outlined text-blue-600">payments</span>
            </div>
            <p class="text-3xl font-black text-slate-900">{{ data.metrics.totalFraisDossierCollectes.toLocaleString('fr-FR') }} <span class="text-sm font-semibold">FCFA</span></p>
            <p class="mt-1 text-xs text-slate-500">Montant total perçu par BourseFi</p>
          </div>

          <!-- Commissions Dues -->
          <div class="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
            <div class="flex items-center justify-between text-amber-700 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider">Commission École Dûe</span>
              <span class="material-symbols-outlined text-amber-600">account_balance_wallet</span>
            </div>
            <p class="text-3xl font-black text-amber-900">{{ data.metrics.totalCommissionsDues.toLocaleString('fr-FR') }} <span class="text-sm font-semibold">FCFA</span></p>
            <p class="mt-1 text-xs text-amber-800 font-medium">À facturer à l'établissement</p>
          </div>

          <!-- Réglages Partenariat -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-xs font-bold uppercase tracking-wider">Tarif Frais Dossier</span>
              <span class="material-symbols-outlined text-slate-600">tune</span>
            </div>
            <div>
              <p class="text-2xl font-extrabold text-slate-900">
                {{ (data.etablissement.fraisDossier || 20000).toLocaleString('fr-FR') }} FCFA
              </p>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ data.etablissement.isDirectPartner ? 'Tarif préférentiel direct' : 'Tarif standard' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Navigation par Onglets -->
        <div class="border-b border-slate-200">
          <nav class="flex gap-6">
            <button
              type="button"
              class="py-3 font-headline text-sm font-bold border-b-2 transition"
              :class="activeTab === 'orientations' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
              @click="activeTab = 'orientations'"
            >
              Liste des Étudiants Orientés ({{ data.studentList.length }})
            </button>
            <button
              type="button"
              class="py-3 font-headline text-sm font-bold border-b-2 transition"
              :class="activeTab === 'programmes' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
              @click="activeTab = 'programmes'"
            >
              Orientations par Formation ({{ data.programmesBreakdown.length }})
            </button>
            <button
              type="button"
              class="py-3 font-headline text-sm font-bold border-b-2 transition"
              :class="activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
              @click="activeTab = 'settings'"
            >
              ⚙️ Paramètres Partenariat & Commissions
            </button>
          </nav>
        </div>

        <!-- ONGLET 1 : Liste des Étudiants Orientés -->
        <div v-if="activeTab === 'orientations'" class="space-y-4">
          <!-- Barre de recherche & Filtres -->
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 select-none">search</span>
              <input
                v-model="searchStudent"
                type="search"
                placeholder="Rechercher par nom, email, téléphone, attestation..."
                class="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm focus:bg-white focus:outline-none"
              />
            </div>

            <div class="flex items-center gap-3">
              <select v-model="statusFilter" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <option value="ALL">Tous les statuts</option>
                <option value="PAID">Payés uniquement</option>
                <option value="VALIDE">Validés</option>
                <option value="SOUMIS">Soumis</option>
              </select>

              <button type="button" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold hover:bg-slate-100" @click="exportExcel">
                📥 Télécharger CSV
              </button>
            </div>
          </div>

          <!-- Tableau des Étudiants -->
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3">Étudiant</th>
                  <th class="px-4 py-3">Formation</th>
                  <th class="px-4 py-3">Date</th>
                  <th class="px-4 py-3">Frais Dossier</th>
                  <th class="px-4 py-3">Commission École</th>
                  <th class="px-4 py-3">N° Attestation</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-slate-50/80 transition">
                  <td class="px-4 py-3.5">
                    <p class="font-bold text-slate-900">{{ student.fullName }}</p>
                    <p class="text-xs text-slate-500">{{ student.email }} • {{ student.phone }}</p>
                  </td>
                  <td class="px-4 py-3.5">
                    <p class="font-semibold text-primary">{{ student.formation }}</p>
                    <span class="text-[11px] font-medium text-slate-500">{{ student.niveau }}</span>
                  </td>
                  <td class="px-4 py-3.5 text-xs text-slate-500">
                    {{ new Date(student.createdAt).toLocaleDateString('fr-FR') }}
                  </td>
                  <td class="px-4 py-3.5">
                    <span v-if="student.hasPaid" class="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                      ✓ {{ student.fraisDossierPayes.toLocaleString('fr-FR') }} FCFA
                    </span>
                    <span v-else class="text-xs text-amber-600 font-medium">En attente</span>
                  </td>
                  <td class="px-4 py-3.5 font-extrabold text-amber-900">
                    {{ (student.commissionAmount || 0).toLocaleString('fr-FR') }} FCFA
                  </td>
                  <td class="px-4 py-3.5 font-mono text-xs text-slate-600">
                    {{ student.attestationNumber || 'En attente' }}
                  </td>
                  <td class="px-4 py-3.5 text-right">
                    <a
                      :href="`/api/attestations/${student.id}`"
                      target="_blank"
                      class="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      <span class="material-symbols-outlined text-[16px]">verified</span>
                      Attestation PDF
                    </a>
                  </td>
                </tr>

                <tr v-if="!filteredStudents.length">
                  <td colspan="7" class="p-8 text-center text-slate-400">
                    Aucun étudiant orienté correspondant à votre recherche.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ONGLET 2 : Orientations par Formation -->
        <div v-else-if="activeTab === 'programmes'" class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">Formation</th>
                <th class="px-4 py-3">Niveau</th>
                <th class="px-4 py-3">Tarif Scolarité Officiel</th>
                <th class="px-4 py-3 text-center">Élèves Orientés</th>
                <th class="px-4 py-3 text-right">Total Commission Générée</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="prog in data.programmesBreakdown" :key="prog.id" class="hover:bg-slate-50">
                <td class="px-4 py-3.5 font-bold text-slate-900">{{ prog.titre }}</td>
                <td class="px-4 py-3.5 text-xs text-slate-500">{{ prog.niveau }} ({{ prog.duree }})</td>
                <td class="px-4 py-3.5 font-medium">
                  {{ prog.tuitionFee ? `${prog.tuitionFee.toLocaleString('fr-FR')} FCFA` : 'Non renseigné' }}
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span class="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-900">
                    {{ prog.orientedCount }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right font-extrabold text-amber-900">
                  {{ prog.totalCommission.toLocaleString('fr-FR') }} FCFA
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ONGLET 3 : Paramètres Partenariat & Commissions -->
        <div v-else-if="activeTab === 'settings'" class="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 class="font-headline text-lg font-bold text-primary">Configuration du Partenariat Direct</h2>
            <p class="text-xs text-slate-500 mt-1">Définissez les privilèges, frais de dossier réduits et règles de commission pour {{ data.etablissement.nom }}.</p>
          </div>

          <form @submit.prevent="saveSettings" class="space-y-5">
            <!-- Toggle Partenaire Direct -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <p class="text-sm font-bold text-slate-900">Activer le statut "Partenaire Direct"</p>
                <p class="text-xs text-slate-500">Permet la personnalisation des frais de dossier et la délivrance automatique.</p>
              </div>
              <input type="checkbox" v-model="partnerForm.isDirectPartner" class="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" />
            </div>

            <!-- Frais de dossier -->
            <div class="space-y-1">
              <label class="text-xs font-bold uppercase text-slate-600">Frais de dossier personnalisés (FCFA)</label>
              <input
                type="number"
                v-model.number="partnerForm.fraisDossier"
                placeholder="20000"
                class="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
              <p class="text-[11px] text-slate-400">Ex: 10000 ou 15000 FCFA pour ce partenaire direct. Par défaut : 20000 FCFA.</p>
            </div>

            <!-- Toggle Délivrance Auto Attestation -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <p class="text-sm font-bold text-slate-900">Téléchargement automatique immédiat de l'Attestation</p>
                <p class="text-xs text-slate-500">Permet à l'étudiant de télécharger l'attestation officielle immédiatement après le paiement.</p>
              </div>
              <input type="checkbox" v-model="partnerForm.autoIssueAttestation" class="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" />
            </div>

            <!-- Mode de Commission Interne -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold uppercase text-slate-600">Type de Commission Interne</label>
                <select v-model="partnerForm.commissionType" class="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none">
                  <option value="FIXED_AMOUNT">Montant fixe par étudiant (FCFA)</option>
                  <option value="PERCENTAGE">Pourcentage de la scolarité (%)</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold uppercase text-slate-600">Valeur de la Commission</label>
                <input
                  type="number"
                  v-model.number="partnerForm.commissionValue"
                  placeholder="50000"
                  class="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-amber-900 focus:border-primary focus:outline-none"
                />
                <p class="text-[11px] text-slate-400">Ex: 50000 FCFA par étudiant inscrit ou 10%.</p>
              </div>
            </div>

            <!-- Statut de paiement des commissions -->
            <div class="space-y-1">
              <label class="text-xs font-bold uppercase text-slate-600">Statut de Règlement des Commissions par l'École</label>
              <select v-model="partnerForm.commissionPaidStatus" class="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none">
                <option value="UP_TO_DATE">🟢 À jour / Règlements reçus</option>
                <option value="PENDING">🟡 En attente de paiement par l'école</option>
                <option value="PARTIAL">🟠 Réglé partiellement</option>
              </select>
            </div>

            <div class="pt-4 flex items-center gap-4">
              <button
                type="submit"
                :disabled="savingPartnerSettings"
                class="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
              >
                {{ savingPartnerSettings ? 'Enregistrement...' : 'Enregistrer les paramètres' }}
              </button>
              <span v-if="saveSuccess" class="text-xs font-bold text-emerald-600">✓ Paramètres enregistrés avec succès !</span>
            </div>
          </form>
        </div>
      </template>
    </main>
  </div>
</template>
