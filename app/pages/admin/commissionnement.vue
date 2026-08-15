<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type SchoolRecoveryRow = {
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

type StudentCommissionRow = {
  id: string
  studentName: string
  email: string
  phone: string
  schoolId: string
  schoolName: string
  isDirectPartner: boolean
  programmeTitre: string
  attestationNumber: string | null
  fraisDossierPayes: number
  commissionAmount: number
  commissionStatus: string
  commissionPaidAt: string | null
  commissionRef: string | null
  commissionNotes: string | null
  createdAt: string
}

const activeTab = ref<'schools' | 'students' | 'invoice'>('schools')
const loading = ref(true)
const schools = ref<SchoolRecoveryRow[]>([])
const studentCommissions = ref<StudentCommissionRow[]>([])

const searchSchool = ref('')
const filterDirectSchool = ref('ALL')
const filterStatusSchool = ref('ALL')

const searchStudent = ref('')
const filterStatusStudent = ref('ALL')

// Selection pour bordereau d'appel de fonds
const selectedSchoolForInvoice = ref<SchoolRecoveryRow | null>(null)

// Modal de validation du règlement école
const modalOpen = ref(false)
const schoolToValidate = ref<SchoolRecoveryRow | null>(null)
const validationForm = reactive({
  status: 'UP_TO_DATE',
  reference: '',
  notes: '',
  markCandidaturesAsPaid: true,
})
const validating = ref(false)

async function loadData() {
  loading.value = true
  try {
    const list = await $fetch<any[]>('/api/admin/etablissements')
    
    const schoolResults = await Promise.all(
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

    schools.value = schoolResults

    if (!selectedSchoolForInvoice.value && schoolResults.length > 0) {
      selectedSchoolForInvoice.value = schoolResults[0]
    }

    // Charger la liste détaillée des dossiers
    studentCommissions.value = await $fetch<StudentCommissionRow[]>('/api/admin/commissions/dossiers')

  } catch (err) {
    alert(getAdminErrorMessage(err, 'Erreur lors du chargement des données de commissionnement.'))
  } finally {
    loading.value = false
  }
}

await loadData()

function openValidationModal(school: SchoolRecoveryRow) {
  schoolToValidate.value = school
  validationForm.status = 'UP_TO_DATE'
  validationForm.reference = ''
  validationForm.notes = ''
  validationForm.markCandidaturesAsPaid = true
  modalOpen.value = true
}

async function handleValidatePayout() {
  if (!schoolToValidate.value) return
  validating.value = true
  try {
    await $fetch(`/api/admin/etablissements/${schoolToValidate.value.id}/valider-commission`, {
      method: 'POST',
      body: validationForm,
    })
    modalOpen.value = false
    await loadData()
  } catch (err) {
    alert(getAdminErrorMessage(err, 'Erreur lors de la validation du règlement.'))
  } finally {
    validating.value = false
  }
}

async function toggleStudentCommissionStatus(row: StudentCommissionRow, newStatus: 'EN_ATTENTE' | 'VALIDE') {
  try {
    await $fetch(`/api/admin/candidatures/${row.id}/commission`, {
      method: 'PATCH',
      body: { commissionStatus: newStatus }
    })
    await loadData()
  } catch (err) {
    alert(getAdminErrorMessage(err, 'Erreur lors de la mise à jour de la commission.'))
  }
}

function generateInvoiceForSchool(school: SchoolRecoveryRow) {
  selectedSchoolForInvoice.value = school
  activeTab.value = 'invoice'
}

// Filtres Écoles
const filteredSchools = computed(() => {
  let res = schools.value
  if (filterDirectSchool.value === 'DIRECT') {
    res = res.filter((s) => s.isDirectPartner)
  } else if (filterDirectSchool.value === 'STANDARD') {
    res = res.filter((s) => !s.isDirectPartner)
  }

  if (filterStatusSchool.value === 'PENDING') {
    res = res.filter((s) => s.totalCommissionPending > 0 || s.commissionPaidStatus === 'PENDING')
  } else if (filterStatusSchool.value === 'UP_TO_DATE') {
    res = res.filter((s) => s.totalCommissionPending === 0 && s.commissionPaidStatus === 'UP_TO_DATE')
  }

  if (searchSchool.value.trim()) {
    const q = searchSchool.value.toLowerCase()
    res = res.filter((s) => s.nom.toLowerCase().includes(q) || s.ville.toLowerCase().includes(q))
  }

  return res
})

// Filtres Candidats
const filteredStudents = computed(() => {
  let res = studentCommissions.value
  if (filterStatusStudent.value === 'PENDING') {
    res = res.filter((s) => s.commissionStatus === 'EN_ATTENTE')
  } else if (filterStatusStudent.value === 'VALIDE') {
    res = res.filter((s) => s.commissionStatus === 'VALIDE')
  }

  if (searchStudent.value.trim()) {
    const q = searchStudent.value.toLowerCase()
    res = res.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.schoolName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    )
  }

  return res
})

// KPIs Globaux
const totalGlobalPending = computed(() => schools.value.reduce((acc, s) => acc + s.totalCommissionPending, 0))
const totalGlobalPaid = computed(() => schools.value.reduce((acc, s) => acc + s.totalCommissionPaid, 0))
const totalGlobalCommissions = computed(() => schools.value.reduce((acc, s) => acc + s.totalCommissionDue, 0))
const schoolsPendingCount = computed(() => schools.value.filter((s) => s.totalCommissionPending > 0).length)

// Etudiants filtrés pour la facture/appel de fonds
const invoiceStudents = computed(() => {
  if (!selectedSchoolForInvoice.value) return []
  return studentCommissions.value.filter((s) => s.schoolId === selectedSchoolForInvoice.value!.id)
})

function formatDate(iso: string | null) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <AdminSidebar />
    <main class="flex-1 p-4 md:p-8 space-y-8">
      
      <!-- En-tête de la page -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
              Espace Financier Dédié
            </span>
          </div>
          <h1 class="font-headline text-3xl font-black text-primary mt-1">Commissionnement & Recouvrement</h1>
          <p class="mt-1 text-sm text-slate-600">
            Centre exclusif de pilotage des commissions BourseFi, bordereaux d'appels de fonds et encaissements écoles.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition"
          @click="loadData"
        >
          <span class="material-symbols-outlined text-[18px]">refresh</span>
          Actualiser les fonds
        </button>
      </div>

      <!-- KPIs Financiers de Recouvrement -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div class="rounded-2xl border border-amber-300 bg-amber-500/10 p-5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase tracking-wider text-amber-900">À Recouvrer (Fonds En Attente)</span>
            <span class="material-symbols-outlined text-amber-700">pending_actions</span>
          </div>
          <p class="text-3xl font-black text-amber-950 mt-2">{{ totalGlobalPending.toLocaleString('fr-FR') }} <span class="text-sm">FCFA</span></p>
          <p class="text-xs text-amber-800 font-medium mt-1">{{ schoolsPendingCount }} école(s) avec solde à verser</p>
        </div>

        <div class="rounded-2xl border border-emerald-300 bg-emerald-500/10 p-5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-900">Total Commissions Encaissées</span>
            <span class="material-symbols-outlined text-emerald-700">check_circle</span>
          </div>
          <p class="text-3xl font-black text-emerald-950 mt-2">{{ totalGlobalPaid.toLocaleString('fr-FR') }} <span class="text-sm">FCFA</span></p>
          <p class="text-xs text-emerald-800 font-medium mt-1">Règlements validés sur compte</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Commissions Générées</span>
            <span class="material-symbols-outlined text-slate-400">payments</span>
          </div>
          <p class="text-3xl font-black text-slate-900 mt-2">{{ totalGlobalCommissions.toLocaleString('fr-FR') }} <span class="text-sm">FCFA</span></p>
          <p class="text-xs text-slate-500 mt-1">Total brut toutes orientations</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Dossiers Facturables</span>
            <span class="material-symbols-outlined text-slate-400">school</span>
          </div>
          <p class="text-3xl font-black text-slate-900 mt-2">{{ studentCommissions.length }}</p>
          <p class="text-xs text-slate-500 mt-1">Étudiants donnant lieu à commission</p>
        </div>
      </div>

      <!-- Onglets d'action -->
      <div class="border-b border-slate-200">
        <nav class="flex gap-4">
          <button
            type="button"
            class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition"
            :class="activeTab === 'schools' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'schools'"
          >
            <span class="material-symbols-outlined text-[20px]">account_balance</span>
            1. Journal par École (Encaissements)
          </button>
          <button
            type="button"
            class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition"
            :class="activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'students'"
          >
            <span class="material-symbols-outlined text-[20px]">person_search</span>
            2. Traçabilité par Candidat ({{ studentCommissions.length }})
          </button>
          <button
            type="button"
            class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition"
            :class="activeTab === 'invoice' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'invoice'"
          >
            <span class="material-symbols-outlined text-[20px]">receipt_long</span>
            3. Bordereau / Appel de Fonds
          </button>
        </nav>
      </div>

      <!-- CONTENU TAB 1 : Journal des Appels de Fonds par École -->
      <div v-if="activeTab === 'schools'" class="space-y-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 select-none">search</span>
            <input
              v-model="searchSchool"
              type="search"
              placeholder="Filtrer une école..."
              class="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <select v-model="filterDirectSchool" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="ALL">Tous les partenariats</option>
              <option value="DIRECT">⚡ Partenaires Directs</option>
              <option value="STANDARD">Écoles Standard</option>
            </select>

            <select v-model="filterStatusSchool" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="ALL">Tous les statuts de solde</option>
              <option value="PENDING">🟡 Fonds en attente de versement</option>
              <option value="UP_TO_DATE">🟢 Totalement encaissé</option>
            </select>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">École Partenaire</th>
                <th class="px-4 py-3 text-center">Élèves Orientés</th>
                <th class="px-4 py-3 text-right">Commission Totale</th>
                <th class="px-4 py-3 text-right">Encaissé</th>
                <th class="px-4 py-3 text-right">Solde à Recouvrer</th>
                <th class="px-4 py-3 text-center">État Recouvrement</th>
                <th class="px-4 py-3 text-right">Actions Financières</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="s in filteredSchools" :key="s.id" class="hover:bg-slate-50 transition">
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-2">
                    <p class="font-extrabold text-slate-900">{{ s.nom }}</p>
                    <span v-if="s.isDirectPartner" class="rounded bg-sky-100 px-1.5 py-0.2 text-[10px] font-black text-sky-800">Direct</span>
                  </div>
                  <p class="text-xs text-slate-500">{{ s.ville }}</p>
                </td>
                <td class="px-4 py-3.5 text-center font-bold text-slate-900">
                  {{ s.orientedCount }}
                </td>
                <td class="px-4 py-3.5 text-right font-bold text-slate-800">
                  {{ s.totalCommissionDue.toLocaleString('fr-FR') }} FCFA
                </td>
                <td class="px-4 py-3.5 text-right font-bold text-emerald-700">
                  {{ s.totalCommissionPaid.toLocaleString('fr-FR') }} FCFA
                </td>
                <td class="px-4 py-3.5 text-right font-black" :class="s.totalCommissionPending > 0 ? 'text-amber-700 font-extrabold' : 'text-slate-400'">
                  {{ s.totalCommissionPending.toLocaleString('fr-FR') }} FCFA
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                    :class="s.totalCommissionPending === 0 && s.orientedCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'"
                  >
                    {{ s.totalCommissionPending === 0 && s.orientedCount > 0 ? '🟢 Encaissé' : '🟡 À Recouvrer' }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
                      @click="openValidationModal(s)"
                    >
                      <span class="material-symbols-outlined text-[16px]">price_check</span>
                      Encaissement
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                      title="Générer bordereau d'appel de fonds"
                      @click="generateInvoiceForSchool(s)"
                    >
                      <span class="material-symbols-outlined text-[16px]">receipt_long</span>
                      Appel de fonds
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CONTENU TAB 2 : Traçabilité par Dossier Candidat -->
      <div v-if="activeTab === 'students'" class="space-y-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 select-none">search</span>
            <input
              v-model="searchStudent"
              type="search"
              placeholder="Rechercher par étudiant, école..."
              class="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <select v-model="filterStatusStudent" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="ALL">Tous les statuts de commission</option>
            <option value="PENDING">🟡 En attente de paiement par l'école</option>
            <option value="VALIDE">🟢 Commission encaissée par BourseFi</option>
          </select>
        </div>

        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">Étudiant</th>
                <th class="px-4 py-3">École d'accueil</th>
                <th class="px-4 py-3">Formation</th>
                <th class="px-4 py-3 text-right">Commission BourseFi</th>
                <th class="px-4 py-3 text-center">Statut Encaissement</th>
                <th class="px-4 py-3 text-right">Action Directe</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="st in filteredStudents" :key="st.id" class="hover:bg-slate-50 transition">
                <td class="px-4 py-3.5">
                  <p class="font-bold text-slate-900">{{ st.studentName }}</p>
                  <p class="text-xs text-slate-500">{{ st.email }} · {{ st.phone }}</p>
                </td>
                <td class="px-4 py-3.5">
                  <p class="font-semibold text-slate-800">{{ st.schoolName }}</p>
                  <span v-if="st.isDirectPartner" class="text-[10px] font-bold text-sky-700">Partenaire Direct</span>
                </td>
                <td class="px-4 py-3.5 text-xs text-slate-600">
                  {{ st.programmeTitre }}
                </td>
                <td class="px-4 py-3.5 text-right font-black text-amber-900">
                  {{ st.commissionAmount.toLocaleString('fr-FR') }} FCFA
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                    :class="st.commissionStatus === 'VALIDE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'"
                  >
                    {{ st.commissionStatus === 'VALIDE' ? '🟢 Encaissé' : '🟡 En attente paye' }}
                  </span>
                  <p v-if="st.commissionRef" class="text-[10px] font-mono text-slate-400 mt-0.5">Réf: {{ st.commissionRef }}</p>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <button
                    v-if="st.commissionStatus !== 'VALIDE'"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                    @click="toggleStudentCommissionStatus(st, 'VALIDE')"
                  >
                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                    Marquer Encaissé
                  </button>
                  <button
                    v-else
                    type="button"
                    class="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    @click="toggleStudentCommissionStatus(st, 'EN_ATTENTE')"
                  >
                    Rétablir en attente
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CONTENU TAB 3 : Bordereau / Appel de Fonds Imprimable -->
      <div v-if="activeTab === 'invoice'" class="space-y-6">
        <div class="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <label class="text-sm font-bold text-slate-700">Sélectionner l'établissement :</label>
          <select v-model="selectedSchoolForInvoice" class="admin-input max-w-md bg-slate-50">
            <option v-for="s in schools" :key="s.id" :value="s">{{ s.nom }} ({{ s.ville }})</option>
          </select>
          <button
            type="button"
            class="ml-auto inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-xs"
            onclick="window.print()"
          >
            <span class="material-symbols-outlined text-[18px]">print</span>
            Imprimer l'Appel de Fonds
          </button>
        </div>

        <!-- Document Facture / Appel de Fonds Imprimable -->
        <div v-if="selectedSchoolForInvoice" class="mx-auto max-w-4xl rounded-2xl bg-white p-8 border border-slate-200 shadow-sm space-y-6">
          <div class="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <p class="font-headline text-2xl font-black text-primary">BOURSEFI SÉNÉGAL</p>
              <p class="text-xs text-slate-500">Plateforme de Gestion de Bourses & Orientations</p>
              <p class="text-xs text-slate-500">Dakar, Sénégal · Contact: finance@boursefi.sn</p>
            </div>
            <div class="text-right">
              <span class="inline-block rounded-lg bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">
                APPEL DE FONDS / RECOUVREMENT
              </span>
              <p class="text-xs text-slate-500 mt-2">Date d'émission : {{ formatDate(new Date().toISOString()) }}</p>
              <p class="text-xs font-mono font-bold text-slate-700">N° RECV-{{ new Date().getFullYear() }}-{{ selectedSchoolForInvoice.id.slice(-4).toUpperCase() }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
            <div>
              <p class="text-xs font-bold uppercase text-slate-400">Établissement Débiteur</p>
              <p class="font-headline font-bold text-slate-900 text-base mt-1">{{ selectedSchoolForInvoice.nom }}</p>
              <p class="text-xs text-slate-600">{{ selectedSchoolForInvoice.ville }}</p>
              <p class="text-xs text-slate-500">Statut : {{ selectedSchoolForInvoice.isDirectPartner ? 'Partenariat Direct' : 'Partenariat Standard' }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold uppercase text-slate-400">Résumé Financier</p>
              <p class="text-xs text-slate-600 mt-1">Étudiants orientés : <strong>{{ selectedSchoolForInvoice.orientedCount }}</strong></p>
              <p class="text-xs text-amber-900 font-bold">Montant Total des Commissions : {{ selectedSchoolForInvoice.totalCommissionDue.toLocaleString('fr-FR') }} FCFA</p>
            </div>
          </div>

          <div>
            <p class="text-xs font-bold uppercase text-slate-500 mb-3">Détail des candidatures orientées</p>
            <table class="w-full text-left text-xs border border-slate-200">
              <thead class="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th class="p-2.5 border-b">Étudiant</th>
                  <th class="p-2.5 border-b">Formation</th>
                  <th class="p-2.5 border-b text-right">Frais Dossier</th>
                  <th class="p-2.5 border-b text-right">Commission Dûe</th>
                  <th class="p-2.5 border-b text-center">Statut Encaissement</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="inv in invoiceStudents" :key="inv.id">
                  <td class="p-2.5 font-bold text-slate-900">{{ inv.studentName }}</td>
                  <td class="p-2.5 text-slate-600">{{ inv.programmeTitre }}</td>
                  <td class="p-2.5 text-right font-medium">{{ inv.fraisDossierPayes.toLocaleString('fr-FR') }} F</td>
                  <td class="p-2.5 text-right font-black text-amber-900">{{ inv.commissionAmount.toLocaleString('fr-FR') }} F</td>
                  <td class="p-2.5 text-center font-bold">
                    {{ inv.commissionStatus === 'VALIDE' ? '🟢 Encaissé' : '🟡 En attente' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-between items-center bg-amber-50 p-4 rounded-xl border border-amber-200">
            <div>
              <p class="text-xs font-bold text-amber-900">RIB / Coordonnées de règlement :</p>
              <p class="text-xs text-amber-800">Banque : BOA Sénégal · Compte : 0123456789 · Intitulé : BourseFi Sénégal</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-amber-800">Total Net à Verser à BourseFi :</p>
              <p class="font-headline text-2xl font-black text-amber-950">{{ selectedSchoolForInvoice.totalCommissionDue.toLocaleString('fr-FR') }} FCFA</p>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Modal de Validation d'Encaissement -->
    <div
      v-if="modalOpen && schoolToValidate"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-secondary">Encaissement de Commission</p>
            <h3 class="font-headline text-lg font-bold text-primary">{{ schoolToValidate.nom }}</h3>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="modalOpen = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1 text-sm">
          <p class="text-xs font-bold text-amber-900 uppercase">Solde restant à recouvrer</p>
          <p class="font-headline text-2xl font-black text-amber-950">{{ schoolToValidate.totalCommissionPending.toLocaleString('fr-FR') }} FCFA</p>
          <p class="text-xs text-amber-800">Total commissions dues : {{ schoolToValidate.totalCommissionDue.toLocaleString('fr-FR') }} FCFA</p>
        </div>

        <div class="space-y-3 pt-2">
          <label class="block">
            <span class="text-xs font-semibold text-slate-700">Statut du versement école</span>
            <select v-model="validationForm.status" class="admin-input mt-1 w-full bg-white">
              <option value="UP_TO_DATE">🟢 Réglé / Encaissé (Commissions 100% perçues)</option>
              <option value="PENDING">🟡 En attente de paiement par l'école</option>
              <option value="PARTIAL">🟠 Versement partiel</option>
            </select>
          </label>

          <label class="block">
            <span class="text-xs font-semibold text-slate-700">Référence N° de virement ou chèque</span>
            <input
              v-model="validationForm.reference"
              type="text"
              placeholder="Ex: VIR-2026-08-001 / Chèque N°45892"
              class="admin-input mt-1 w-full"
            />
          </label>

          <label class="block">
            <span class="text-xs font-semibold text-slate-700">Remarques / Observations (Optionnel)</span>
            <textarea
              v-model="validationForm.notes"
              rows="2"
              placeholder="Notes sur la réception des fonds..."
              class="admin-input mt-1 w-full"
            ></textarea>
          </label>

          <label class="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
            <input
              v-model="validationForm.markCandidaturesAsPaid"
              type="checkbox"
              class="rounded text-primary focus:ring-primary"
            />
            <span>Marquer tous les étudiants de cette école comme commissions encaissées</span>
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
            {{ validating ? 'Enregistrement…' : 'Valider l\'Encaissement' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
