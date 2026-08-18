<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type DirectPartnerSchool = {
  id: string
  slug: string
  nom: string
  ville: string
  logoUrl: string | null
  coverImageUrl: string | null
  phone: string | null
  email: string | null
  site: string | null
  status: string
  isDirectPartner: boolean
  commissionType: string
  commissionValue: number
  commissionPaidStatus: string
  programmesCount: number
  activeProgrammesCount: number
  totalOriented: number
  totalCommissionsDues: number
  totalCommissionsPayees: number
  soldeRestantDu: number
}

type FunderPartnerRow = {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  contactEmail: string | null
  partnerSharePercent: number
  programmesCount: number
  usersCount: number
}

const activeTab = ref<'direct_schools' | 'funders'>('direct_schools')

const directSchools = ref<DirectPartnerSchool[]>([])
const funders = ref<FunderPartnerRow[]>([])

// Drawer & Modal state
const drawerOpen = ref(false)
const reportModalOpen = ref(false)
const selectedSchool = ref<DirectPartnerSchool | null>(null)
const schoolReportData = ref<any>(null)
const isLoadingReport = ref(false)

const editingFunderId = ref<string | null>(null)
const funderForm = ref({
  slug: '',
  name: '',
  logoUrl: '',
  contactEmail: '',
  partnerSharePercent: 75
})

// Configuration commission école
const commissionForm = ref({
  commissionType: 'FIXED_AMOUNT',
  commissionValue: 0
})

async function loadData() {
  const headers = useRequestHeaders(['cookie']) as Record<string, string>
  try {
    const [schoolsData, fundersData] = await Promise.all([
      $fetch<DirectPartnerSchool[]>('/api/admin/partenaires-directs', { headers }),
      $fetch<FunderPartnerRow[]>('/api/admin/partners', { headers })
    ])
    directSchools.value = schoolsData
    funders.value = fundersData
  } catch (err: unknown) {
    console.error('Error loading partners data:', err)
  }
}

if (import.meta.client) {
  onMounted(loadData)
} else {
  await loadData()
}

// Métriques globales pour les partenaires directs
const globalMetrics = computed(() => {
  const totalSchools = directSchools.value.length
  const totalOriented = directSchools.value.reduce((sum, s) => sum + s.totalOriented, 0)
  const totalDues = directSchools.value.reduce((sum, s) => sum + s.totalCommissionsDues, 0)
  const totalPayees = directSchools.value.reduce((sum, s) => sum + s.totalCommissionsPayees, 0)
  const totalRestant = directSchools.value.reduce((sum, s) => sum + s.soldeRestantDu, 0)
  return { totalSchools, totalOriented, totalDues, totalPayees, totalRestant }
})

// Gestions des Bailleurs tiers (Funder partners)
function openCreateFunder() {
  editingFunderId.value = null
  funderForm.value = { slug: '', name: '', logoUrl: '', contactEmail: '', partnerSharePercent: 75 }
  drawerOpen.value = true
}

function openEditFunder(row: FunderPartnerRow) {
  editingFunderId.value = row.id
  funderForm.value = {
    slug: row.slug,
    name: row.name,
    logoUrl: row.logoUrl ?? '',
    contactEmail: row.contactEmail ?? '',
    partnerSharePercent: row.partnerSharePercent
  }
  drawerOpen.value = true
}

async function submitFunder() {
  const body = {
    slug: funderForm.value.slug,
    name: funderForm.value.name,
    logoUrl: funderForm.value.logoUrl || null,
    contactEmail: funderForm.value.contactEmail || null,
    partnerSharePercent: Number(funderForm.value.partnerSharePercent)
  }
  try {
    if (editingFunderId.value) {
      await $fetch(`/api/admin/partners/${editingFunderId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/partners', { method: 'POST', body })
    }
    drawerOpen.value = false
    await loadData()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function removeFunder(row: FunderPartnerRow) {
  if (!confirm(`Supprimer ${row.name} ? Impossible s'il reste des programmes liés.`)) return
  try {
    await $fetch(`/api/admin/partners/${row.id}`, { method: 'DELETE' })
    await loadData()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

// Ouvrir le rapport financier détaillé d'une école partenaire directe
async function openSchoolReport(school: DirectPartnerSchool) {
  selectedSchool.value = school
  commissionForm.value = {
    commissionType: school.commissionType || 'FIXED_AMOUNT',
    commissionValue: school.commissionValue || 0
  }
  reportModalOpen.value = true
  isLoadingReport.value = true
  try {
    schoolReportData.value = await $fetch(`/api/admin/etablissements/${school.id}/rapport`)
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  } finally {
    isLoadingReport.value = false
  }
}

// Marquer tout payé pour une école
async function handlePayAllCommissions() {
  if (!selectedSchool.value) return
  if (!confirm(`Confirmer le versement total des commissions pour ${selectedSchool.value.nom} ?`)) return
  try {
    await $fetch(`/api/admin/etablissements/${selectedSchool.value.id}/regler-commissions`, {
      method: 'POST',
      body: { action: 'PAY_ALL', notes: 'Règlement global validé depuis le tableau partenaire' }
    })
    await openSchoolReport(selectedSchool.value)
    await loadData()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

// Réinitialiser le compte de l'école (Remise à zéro / Redémarrer le compte)
async function handleResetCommissions() {
  if (!selectedSchool.value) return
  if (!confirm(`ATTENTION : Réinitialiser le compte de commission pour ${selectedSchool.value.nom} ? Remettra toutes les commissions en attente.`)) return
  try {
    await $fetch(`/api/admin/etablissements/${selectedSchool.value.id}/regler-commissions`, {
      method: 'POST',
      body: { action: 'RESET', notes: 'Compte réinitialisé par admin' }
    })
    await openSchoolReport(selectedSchool.value)
    await loadData()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

// Mettre à jour la règle de commission de l'école
async function saveSchoolCommissionRule() {
  if (!selectedSchool.value) return
  try {
    await $fetch(`/api/admin/etablissements/${selectedSchool.value.id}`, {
      method: 'PATCH',
      body: {
        commissionType: commissionForm.value.commissionType,
        commissionValue: Number(commissionForm.value.commissionValue)
      }
    })
    alert('Règle de commission mise à jour avec succès !')
    await openSchoolReport(selectedSchool.value)
    await loadData()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <AdminSidebar />
    <main class="flex-1 p-6 md:p-10">
      
      <!-- En-tête de page -->
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="font-headline text-2xl font-black text-primary md:text-3xl">
            Gestion des Partenaires & Flux Financiers
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            Suivi en direct des Écoles Partenaires Directes, du calcul des commissions dues à BourseFi et des versements.
          </p>
        </div>

        <div class="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200">
          <button
            type="button"
            :class="[
              'rounded-xl px-4 py-2 text-xs font-bold transition',
              activeTab === 'direct_schools' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            ]"
            @click="activeTab = 'direct_schools'"
          >
            Écoles Partenaires Directes ({{ directSchools.length }})
          </button>
          <button
            type="button"
            :class="[
              'rounded-xl px-4 py-2 text-xs font-bold transition',
              activeTab === 'funders' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            ]"
            @click="activeTab = 'funders'"
          >
            Organismes Bailleurs ({{ funders.length }})
          </button>
        </div>
      </div>

      <!-- ONGLET 1: ÉCOLES PARTENAIRES DIRECTES -->
      <div v-if="activeTab === 'direct_schools'" class="space-y-6">
        
        <!-- Cartes de métriques financières globales -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase text-slate-400">Écoles Partenaires</span>
              <span class="material-symbols-outlined text-primary text-xl">school</span>
            </div>
            <p class="mt-3 font-headline text-2xl font-black text-primary">{{ globalMetrics.totalSchools }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ globalMetrics.totalOriented }} étudiants orientés au total</p>
          </div>

          <div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase text-slate-400">Total Commissions Dues</span>
              <span class="material-symbols-outlined text-blue-600 text-xl">payments</span>
            </div>
            <p class="mt-3 font-headline text-2xl font-black text-slate-900">{{ globalMetrics.totalDues.toLocaleString('fr-FR') }} FCFA</p>
            <p class="mt-1 text-xs text-slate-500">Générées par les orientations</p>
          </div>

          <div class="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase text-emerald-800">Commissions Encaissées</span>
              <span class="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
            </div>
            <p class="mt-3 font-headline text-2xl font-black text-emerald-900">{{ globalMetrics.totalPayees.toLocaleString('fr-FR') }} FCFA</p>
            <p class="mt-1 text-xs text-emerald-700">Déjà versées par les écoles</p>
          </div>

          <div class="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase text-amber-800">Restant à Encaisser</span>
              <span class="material-symbols-outlined text-amber-600 text-xl">pending_actions</span>
            </div>
            <p class="mt-3 font-headline text-2xl font-black text-amber-950">{{ globalMetrics.totalRestant.toLocaleString('fr-FR') }} FCFA</p>
            <p class="mt-1 text-xs text-amber-800 font-bold">Solde dû à BourseFi</p>
          </div>
        </div>

        <!-- Tableau des Écoles Partenaires Directes -->
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="p-4">Établissement Partenaire</th>
                <th class="p-4 text-center">Formations</th>
                <th class="p-4 text-center">Étudiants Orientés</th>
                <th class="p-4">Règle Commission</th>
                <th class="p-4 text-right">Commissions Dues</th>
                <th class="p-4 text-right">Solde Dû</th>
                <th class="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              <tr v-for="school in directSchools" :key="school.id" class="hover:bg-slate-50/80 transition">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
                      <img v-if="school.logoUrl" :src="school.logoUrl" :alt="school.nom" class="h-7 w-7 object-contain" />
                      <span v-else class="material-symbols-outlined text-slate-400">school</span>
                    </div>
                    <div>
                      <p class="font-extrabold text-primary text-sm">{{ school.nom }}</p>
                      <p class="text-[11px] text-slate-400">{{ school.ville }} · {{ school.phone || 'Sans tel' }}</p>
                    </div>
                  </div>
                </td>

                <td class="p-4 text-center font-bold">
                  {{ school.activeProgrammesCount }} / {{ school.programmesCount }}
                </td>

                <td class="p-4 text-center">
                  <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-800">
                    {{ school.totalOriented }} étudiants
                  </span>
                </td>

                <td class="p-4">
                  <span v-if="school.commissionValue > 0" class="font-semibold text-slate-700">
                    {{ school.commissionValue.toLocaleString('fr-FR') }}
                    {{ school.commissionType === 'PERCENTAGE' ? '%' : 'FCFA / cand.' }}
                  </span>
                  <span v-else class="italic text-slate-400">Non configurée</span>
                </td>

                <td class="p-4 text-right font-extrabold text-slate-900">
                  {{ school.totalCommissionsDues.toLocaleString('fr-FR') }} FCFA
                </td>

                <td class="p-4 text-right">
                  <span v-if="school.soldeRestantDu > 0" class="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-900">
                    {{ school.soldeRestantDu.toLocaleString('fr-FR') }} FCFA dû
                  </span>
                  <span v-else class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    À jour (0 FCFA)
                  </span>
                </td>

                <td class="p-4 text-center">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1.5 font-bold text-primary hover:bg-primary hover:text-white transition"
                    @click="openSchoolReport(school)"
                  >
                    <span class="material-symbols-outlined text-sm">finance_chip</span>
                    Finances & Rapports
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ONGLET 2: ORGANISMES BAILLEURS TIERS -->
      <div v-else class="space-y-6">
        <div class="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200">
          <div>
            <h3 class="font-headline text-lg font-bold text-primary">Organismes Bailleurs Tiers</h3>
            <p class="text-xs text-slate-500">Partenaires de financement externes (Fondations, Bailleurs sociaux)</p>
          </div>
          <button type="button" class="admin-btn-primary" @click="openCreateFunder">+ Ajouter un bailleur</button>
        </div>

        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
              <tr>
                <th class="p-4">Slug</th>
                <th class="p-4">Nom du bailleur</th>
                <th class="p-4 text-right">Part (%)</th>
                <th class="p-4 text-center">Programmes</th>
                <th class="p-4 text-center">Comptes</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr v-for="row in funders" :key="row.id" class="hover:bg-slate-50">
                <td class="p-4 font-mono text-slate-500">{{ row.slug }}</td>
                <td class="p-4 font-extrabold text-primary">{{ row.name }}</td>
                <td class="p-4 text-right font-bold">{{ row.partnerSharePercent }} %</td>
                <td class="p-4 text-center">{{ row.programmesCount }}</td>
                <td class="p-4 text-center">{{ row.usersCount }}</td>
                <td class="p-4 text-right space-x-2">
                  <button type="button" class="admin-btn-ghost" @click="openEditFunder(row)">Modifier</button>
                  <button type="button" class="text-red-600 font-bold hover:underline" @click="removeFunder(row)">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODALE DE RAPPORT FINANCIER & COMPTABILITÉ D'ÉCOLE -->
      <div v-if="reportModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div class="relative w-full max-w-4xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span class="inline-flex rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                Partenaire Direct BourseFi
              </span>
              <h2 class="font-headline text-2xl font-black text-primary mt-1">
                {{ selectedSchool?.nom }} — Tableau de Comptes & Commissions
              </h2>
            </div>
            <button type="button" class="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200" @click="reportModalOpen = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div v-if="isLoadingReport" class="py-12 text-center text-slate-500 font-bold">
            Chargement des données comptables...
          </div>

          <template v-else-if="schoolReportData">
            <!-- Métriques du rapport d'école -->
            <div class="grid gap-3 sm:grid-cols-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Total Orientés</p>
                <p class="text-xl font-black text-primary">{{ schoolReportData.metrics.totalOriented }} candidats</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Commissions Dues</p>
                <p class="text-xl font-black text-slate-900">{{ schoolReportData.metrics.totalCommissionsDues.toLocaleString('fr-FR') }} FCFA</p>
              </div>
              <div>
                <p class="text-xs text-amber-800 font-bold uppercase">Solde Restant Dû</p>
                <p class="text-xl font-black text-amber-950">{{ schoolReportData.metrics.totalCommissionsEnAttente.toLocaleString('fr-FR') }} FCFA</p>
              </div>
            </div>

            <!-- Configuration de la règle de commission -->
            <div class="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <h3 class="font-headline text-sm font-bold text-slate-800">Règle de Commission de l'Établissement</h3>
              <div class="flex flex-wrap items-center gap-3">
                <select v-model="commissionForm.commissionType" class="admin-input max-w-[200px]">
                  <option value="FIXED_AMOUNT">Montant Fixe par candidat (FCFA)</option>
                  <option value="PERCENTAGE">Pourcentage de la scolarité (%)</option>
                </select>
                <input v-model.number="commissionForm.commissionValue" type="number" class="admin-input max-w-[150px]" placeholder="Valeur" />
                <button type="button" class="admin-btn-primary text-xs" @click="saveSchoolCommissionRule">
                  Enregistrer la règle
                </button>
              </div>
            </div>

            <!-- Actions de règlement & réinitialisation de compte -->
            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                  @click="handlePayAllCommissions"
                >
                  ✓ Marquer tout versé / payé
                </button>
                <button
                  type="button"
                  class="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                  @click="handleResetCommissions"
                >
                  🔄 Réinitialiser le compte (Redémarrer)
                </button>
              </div>
            </div>

            <!-- Liste détaillée des candidatures orientées -->
            <div class="space-y-3">
              <h3 class="font-headline text-sm font-bold text-primary">Liste des candidats orientés ({{ schoolReportData.studentList.length }})</h3>
              <div class="max-h-60 overflow-y-auto rounded-2xl border border-slate-200">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Étudiant</th>
                      <th class="p-3">Formation</th>
                      <th class="p-3 text-right">Commission</th>
                      <th class="p-3 text-center">Statut Commission</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="st in schoolReportData.studentList" :key="st.id">
                      <td class="p-3 font-bold text-slate-800">{{ st.fullName }} <span class="block text-[10px] text-slate-400">{{ st.phone }}</span></td>
                      <td class="p-3 text-slate-600">{{ st.formation }}</td>
                      <td class="p-3 text-right font-extrabold text-primary">{{ st.commissionAmount.toLocaleString('fr-FR') }} FCFA</td>
                      <td class="p-3 text-center">
                        <span v-if="st.commissionStatus === 'VALIDE'" class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          PAYÉ
                        </span>
                        <span v-else class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          EN ATTENTE
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Drawer de création/édition de Funder -->
      <AdminDrawer v-model:open="drawerOpen" title="Bailleur Tiers" size="lg" @close="drawerOpen = false">
        <div class="space-y-4">
          <label class="admin-label">Slug <input v-model="funderForm.slug" class="admin-input font-mono text-xs" /></label>
          <label class="admin-label">Nom <input v-model="funderForm.name" class="admin-input" /></label>
          <label class="admin-label">Part (%) <input v-model.number="funderForm.partnerSharePercent" type="number" class="admin-input" /></label>
          <label class="admin-label">E-mail <input v-model="funderForm.contactEmail" type="email" class="admin-input" /></label>
          <label class="admin-label">URL Logo <input v-model="funderForm.logoUrl" type="url" class="admin-input" /></label>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-btn-secondary" @click="drawerOpen = false">Annuler</button>
            <button type="button" class="admin-btn-primary" @click="submitFunder">Enregistrer</button>
          </div>
        </template>
      </AdminDrawer>

    </main>
  </div>
</template>
