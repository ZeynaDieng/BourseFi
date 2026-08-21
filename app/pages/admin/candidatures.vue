<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'
import { useAdminListView } from '~/composables/useAdminListView'
import { useAdminDrawerLink } from '~/composables/useAdminDrawerLink'
import { downloadCsv } from '~/utils/admin-export'
import {
  CANDIDATURE_STATUS_CHOICES,
  candidatureStatusLabel,
} from '~/utils/candidature-status-labels'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type CrmNote = {
  id: string
  agentName: string
  exchangeType: string
  content: string
  interestLevel: string | null
  blockingReason: string | null
  nextAction: string | null
  nextRelanceAt: string | null
  isPinned: boolean
  attachmentUrl: string | null
  createdAt: string
}

type DossierRow = {
  id: string
  userId: string
  fullName: string
  email: string
  phone?: string
  status: string
  statusLabel: string
  programmeTitre: string
  partnerName: string
  bourseTitre?: string | null
  documentUrl: string | null
  identityCardRectoUrl?: string | null
  identityCardVersoUrl?: string | null
  createdAt: string
  interestLevel?: string | null
  blockingReason?: string | null
  relanceCount?: number
  lastRelanceAt?: string | null
  lastChannelUsed?: string | null
  nextRelanceAt?: string | null
  conversionScore?: number
  fraisDossier?: number
  montantFinal?: number | null
}

type DossierDetail = DossierRow & {
  firstName: string
  lastName: string
  address: string
  institution: string
  field: string
  level: string
  lastEducationLevel: string
  lastDiploma: string
  graduationDate: string
  gpa: string
  targetProgram: string
  documentIssuedAt: string | null
  montantInitial: number | null
  montantReduction: number | null
  programme: {
    titre: string
    slug: string
    ville: string
    fraisDossier: number
    devise: string
    etablissement: { nom: string; slug: string }
  }
  partner: { id: string; name: string; slug: string }
  bourse: { titre: string; slug: string } | null
  user: { id: string; name: string; email: string; phone: string | null }
  paiement: {
    id: string
    amount: number
    status: string
    method: string
    refCommand: string | null
    createdAt: string
  } | null
  crmNotes: CrmNote[]
}

const { data: dossiers, refresh } = await useFetch<DossierRow[]>('/api/candidatures', { default: () => [] })

const search = ref('')
const filterStatus = ref('')
const partnerFilter = ref('')
const relanceFilter = ref('')
const drawerOpen = ref(false)
const selectedId = ref<string | null>(null)
const detail = ref<DossierDetail | null>(null)
const detailLoading = ref(false)
const activeTab = ref<'summary' | 'notes' | 'documents'>('summary')

// Multi-sélection & Relance en masse
const selectedIds = ref<string[]>([])
const bulkPromoCode = ref('RENTREE2026')
const bulkChannel = ref<'WHATSAPP' | 'EMAIL'>('WHATSAPP')
const bulkSending = ref(false)

// Formulaire Note Commerciale
const noteForm = reactive({
  exchangeType: 'WHATSAPP',
  content: '',
  interestLevel: 'HOT_HIGH',
  blockingReason: 'PARENT_APPROVAL',
  nextAction: 'SEND_PAYMENT_LINK',
  nextRelanceAt: '',
  isPinned: false,
})
const savingNote = ref(false)

// Action relance unitaire rapide
const singleRelanceSending = ref<string | null>(null)

// Libellés CRM
const INTEREST_OPTIONS: Record<string, { label: string; icon: string; className: string }> = {
  HOT_HIGH: { label: '🔥 Très chaud', icon: 'local_fire_department', className: 'bg-red-50 text-red-700 border-red-200' },
  HOT_MED: { label: '🟡 Chaud', icon: 'local_fire_department', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  WARM: { label: '🟠 Tiède', icon: 'thermostat', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  COLD: { label: '❄️ Froid', icon: 'ac_unit', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  NOT_INTERESTED: { label: '🚫 Non intéressé', icon: 'block', className: 'bg-slate-100 text-slate-600 border-slate-200' },
}

const BLOCKING_OPTIONS: Record<string, string> = {
  PARENT_APPROVAL: 'Attente accord des parents',
  FINANCIAL_DIFFICULTY: 'Difficultés financières',
  MISSING_DOCS: 'Documents manquants',
  SCHOOL_HESITATION: 'Hésitation entre écoles',
  PROGRAM_HESITATION: 'Hésitation formation',
  TECHNICAL_ISSUE: 'Problème technique paiement',
  WAITING_RESPONSE: 'Attente retour candidat',
  NO_LONGER_INTERESTED: 'Plus intéressé',
  EXPIRED: 'Date limite dépassée',
  OTHER: 'Autre motif',
}

const NEXT_ACTION_OPTIONS: Record<string, string> = {
  CALL_TOMORROW: 'Rappeler demain',
  SEND_BROCHURE: 'Envoyer la brochure',
  SEND_PROMO: 'Envoyer un code promo',
  SEND_PAYMENT_LINK: 'Envoyer le lien de paiement',
  WAIT_CANDIDATE: 'Attendre retour candidat',
  SCHEDULE_MEETING: 'Planifier un rendez-vous',
  VERIFY_DOCS: 'Vérifier les documents',
}

const EXCHANGE_OPTIONS: Record<string, string> = {
  CALL: 'Appel téléphonique',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  MEETING: 'Rendez-vous',
  SUPPORT: 'Support',
  OTHER: 'Autre',
}

const statusFilters = [
  { value: '', label: 'Tous' },
  { value: 'EN_ATTENTE_PAIEMENT', label: 'Paiement en attente' },
  { value: 'EN_REVUE_PARTENAIRE', label: 'En revue' },
  { value: 'COMPLEMENT_DEMANDE', label: 'Complément' },
  { value: 'ACCEPTE', label: 'Acceptés' },
  { value: 'DOCUMENT_EMIS', label: 'Attestation disponible' },
]

const draft = reactive({ status: '', documentDataUrl: '' })
const saving = ref(false)

function formatDate(iso?: string | null) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(iso?: string | null) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const stats = computed(() => {
  const list = dossiers.value ?? []
  const todayStr = new Date().toISOString().split('T')[0]
  return {
    total: list.length,
    pendingPayment: list.filter((d) => d.status === 'EN_ATTENTE_PAIEMENT').length,
    hotCount: list.filter((d) => d.interestLevel === 'HOT_HIGH' || d.interestLevel === 'HOT_MED').length,
    relanceToday: list.filter((d) => d.nextRelanceAt && d.nextRelanceAt.split('T')[0] === todayStr).length,
    accepted: list.filter((d) => d.status === 'ACCEPTE' || d.status === 'DOCUMENT_EMIS' || d.status === 'TERMINE').length,
  }
})

const filtered = computed(() => {
  let list = dossiers.value ?? []
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        (d.phone && d.phone.includes(q)) ||
        d.programmeTitre.toLowerCase().includes(q) ||
        d.partnerName.toLowerCase().includes(q)
    )
  }
  if (filterStatus.value) {
    list = list.filter((d) => d.status === filterStatus.value)
  }
  if (partnerFilter.value) {
    list = list.filter((d) => d.partnerName === partnerFilter.value)
  }
  if (relanceFilter.value === 'HOT_HIGH') {
    list = list.filter((d) => d.interestLevel === 'HOT_HIGH' || d.interestLevel === 'HOT_MED')
  } else if (relanceFilter.value === 'PENDING') {
    list = list.filter((d) => d.status === 'EN_ATTENTE_PAIEMENT')
  }
  return list
})

const partnerOptions = computed(() => {
  const set = new Set((dossiers.value ?? []).map((d) => d.partnerName))
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
})

const { paginated, page, totalPages, sorted, toggleSort, sortIcon, resetPage } = useAdminListView(filtered, {
  pageSize: 20,
  defaultSort: { key: 'createdAt', dir: 'desc' },
})

watch([search, filterStatus, partnerFilter, relanceFilter], resetPage)

const isAllSelected = computed(() => {
  return paginated.value.length > 0 && paginated.value.every((d) => selectedIds.value.includes(d.id))
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = paginated.value.map((d) => d.id)
  }
}

function toggleSelect(id: string) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((i) => i !== id)
  } else {
    selectedIds.value.push(id)
  }
}

async function loadDetail(id: string) {
  selectedId.value = id
  drawerOpen.value = true
  detailLoading.value = true
  detail.value = null
  activeTab.value = 'summary'
  try {
    detail.value = await $fetch<DossierDetail>(`/api/admin/candidatures/${id}`)
    draft.status = detail.value.status
    draft.documentDataUrl = ''
    noteForm.interestLevel = detail.value.interestLevel || 'HOT_HIGH'
    noteForm.blockingReason = detail.value.blockingReason || 'PARENT_APPROVAL'
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Impossible de charger le dossier.'))
    drawerOpen.value = false
  } finally {
    detailLoading.value = false
  }
}

async function openDetailById(id: string) {
  await loadDetail(id)
}

function openDetail(row: DossierRow) {
  linkOpen(row.id)
}

function closeDrawer() {
  drawerOpen.value = false
  selectedId.value = null
  detail.value = null
}

const { linkOpen, linkClose } = useAdminDrawerLink(openDetailById, closeDrawer)

function onDrawerClose() {
  linkClose()
}

// Action WhatsApp / Email 1-Clic
async function triggerRelance(candidatureId: string, channel: 'WHATSAPP' | 'EMAIL', codePromo = 'RENTREE2026') {
  singleRelanceSending.value = candidatureId
  try {
    const res = await $fetch<{ ok: boolean; whatsappUrl?: string; messageText?: string }>(
      '/api/admin/candidatures/relancer',
      {
        method: 'POST',
        body: { candidatureId, channel, codePromo },
      }
    )
    await refresh()
    if (detail.value && detail.value.id === candidatureId) {
      await loadDetail(candidatureId)
    }

    if (channel === 'WHATSAPP' && res.whatsappUrl) {
      window.open(res.whatsappUrl, '_blank')
    } else if (channel === 'EMAIL') {
      alert('Email de relance envoyé avec succès au candidat !')
    }
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Erreur lors de la relance.'))
  } finally {
    singleRelanceSending.value = null
  }
}

// Action Relance en Masse
async function executeBulkRelance() {
  if (!selectedIds.value.length) return
  bulkSending.value = true
  try {
    const res = await $fetch<{ ok: boolean; count: number; results: Array<{ id: string; whatsappUrl: string | null }> }>(
      '/api/admin/candidatures/relancer-masse',
      {
        method: 'POST',
        body: {
          candidatureIds: selectedIds.value,
          channel: bulkChannel.value,
          codePromo: bulkPromoCode.value || undefined,
        },
      }
    )

    await refresh()
    alert(`Relance exécutée avec succès pour ${res.count} candidat(s) !`)

    // Si WhatsApp, ouvrir les fenêtres pour les 3 premiers
    if (bulkChannel.value === 'WHATSAPP') {
      res.results.slice(0, 3).forEach((r) => {
        if (r.whatsappUrl) window.open(r.whatsappUrl, '_blank')
      })
    }
    selectedIds.value = []
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Erreur lors de la relance groupée.'))
  } finally {
    bulkSending.value = false
  }
}

// Soumission d'une Note Commerciale
async function submitNote() {
  if (!selectedId.value || !noteForm.content.trim()) return
  savingNote.value = true
  try {
    await $fetch(`/api/admin/candidatures/${selectedId.value}/notes`, {
      method: 'POST',
      body: {
        candidatureId: selectedId.value,
        exchangeType: noteForm.exchangeType,
        content: noteForm.content.trim(),
        interestLevel: noteForm.interestLevel,
        blockingReason: noteForm.blockingReason,
        nextAction: noteForm.nextAction,
        nextRelanceAt: noteForm.nextRelanceAt || null,
        isPinned: noteForm.isPinned,
      },
    })
    noteForm.content = ''
    noteForm.isPinned = false
    await refresh()
    if (selectedId.value) {
      await loadDetail(selectedId.value)
    }
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Erreur lors de l\'enregistrement de la note.'))
  } finally {
    savingNote.value = false
  }
}

async function saveStatusPatch() {
  if (!selectedId.value) return
  saving.value = true
  try {
    await $fetch(`/api/candidatures/${selectedId.value}`, {
      method: 'PATCH',
      body: { status: draft.status, documentDataUrl: draft.documentDataUrl || undefined },
    })
    draft.documentDataUrl = ''
    await refresh()
    if (detail.value) {
      await loadDetail(selectedId.value)
    }
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Impossible de modifier le dossier.'))
  } finally {
    saving.value = false
  }
}

function exportDossiers() {
  downloadCsv('candidatures-boursefi.csv', sorted.value, [
    { key: 'fullName', header: 'Candidat' },
    { key: 'email', header: 'Email' },
    { key: 'programmeTitre', header: 'Programme' },
    { key: 'partnerName', header: 'Partenaire' },
    { key: 'statusLabel', header: 'Statut' },
    { key: 'createdAt', header: 'Date', format: (v) => formatDate(String(v)) },
  ])
}
</script>

<template>
  <AdminLayout title="Gestion & Relance des Candidatures">
    <!-- En-tête & Bouton Export -->
    <template #actions>
      <button
        type="button"
        class="admin-btn-secondary inline-flex items-center gap-1.5 text-xs shadow-xs"
        @click="exportDossiers"
      >
        <span class="material-symbols-outlined text-[18px]">download</span>
        Exporter CSV
      </button>
    </template>

    <!-- Cartes KPI & Suivi CRM Commercial -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold uppercase tracking-wider">Total Dossiers</span>
          <span class="material-symbols-outlined text-[20px] text-primary">folder</span>
        </div>
        <p class="mt-2 font-headline text-2xl font-extrabold text-slate-800">{{ stats.total }}</p>
      </div>

      <div
        class="cursor-pointer rounded-2xl border p-4 shadow-2xs transition hover:shadow-md"
        :class="relanceFilter === 'PENDING' ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-200' : 'border-slate-100 bg-white'"
        @click="relanceFilter = relanceFilter === 'PENDING' ? '' : 'PENDING'"
      >
        <div class="flex items-center justify-between text-amber-600">
          <span class="text-xs font-semibold uppercase tracking-wider">Paiements En Attente</span>
          <span class="material-symbols-outlined text-[20px]">payments</span>
        </div>
        <p class="mt-2 font-headline text-2xl font-extrabold text-amber-700">{{ stats.pendingPayment }}</p>
        <span class="mt-1 block text-[11px] text-amber-600 font-medium">À relancer en priorité</span>
      </div>

      <div
        class="cursor-pointer rounded-2xl border p-4 shadow-2xs transition hover:shadow-md"
        :class="relanceFilter === 'HOT_HIGH' ? 'border-red-400 bg-red-50/50 ring-2 ring-red-200' : 'border-slate-100 bg-white'"
        @click="relanceFilter = relanceFilter === 'HOT_HIGH' ? '' : 'HOT_HIGH'"
      >
        <div class="flex items-center justify-between text-red-600">
          <span class="text-xs font-semibold uppercase tracking-wider">🔥 Très Chauds</span>
          <span class="material-symbols-outlined text-[20px]">local_fire_department</span>
        </div>
        <p class="mt-2 font-headline text-2xl font-extrabold text-red-700">{{ stats.hotCount }}</p>
        <span class="mt-1 block text-[11px] text-red-600 font-medium">Fort potentiel conversion</span>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
        <div class="flex items-center justify-between text-emerald-600">
          <span class="text-xs font-semibold uppercase tracking-wider">Attestations Émises</span>
          <span class="material-symbols-outlined text-[20px]">verified</span>
        </div>
        <p class="mt-2 font-headline text-2xl font-extrabold text-emerald-700">{{ stats.accepted }}</p>
      </div>

      <div class="col-span-2 sm:col-span-4 lg:col-span-1 rounded-2xl border border-slate-100 bg-gradient-to-br from-primary to-slate-800 p-4 text-white shadow-2xs">
        <span class="text-xs font-semibold uppercase tracking-wider text-amber-300">Conversion BourseFi</span>
        <p class="mt-1 font-headline text-2xl font-extrabold">{{ Math.round((stats.accepted / (stats.total || 1)) * 100) }}%</p>
        <span class="text-[11px] text-slate-300">Taux global d'admission</span>
      </div>
    </div>

    <!-- Barre de Filtres Avancés & Recherche -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
      <div class="flex flex-1 flex-wrap items-center gap-3">
        <!-- Recherche -->
        <div class="relative min-w-[220px] flex-1 sm:max-w-xs">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
          <input
            v-model="search"
            type="text"
            placeholder="Nom, email, téléphone..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none"
          />
        </div>

        <!-- Filtre Statut Candidature -->
        <select
          v-model="filterStatus"
          class="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-primary focus:outline-none"
        >
          <option v-for="s in statusFilters" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>

        <!-- Filtre Partenaire -->
        <select
          v-model="partnerFilter"
          class="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-primary focus:outline-none"
        >
          <option value="">Tous les partenaires</option>
          <option v-for="p in partnerOptions" :key="p" :value="p">{{ p }}</option>
        </select>

        <!-- Filtre Rapide Relance -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-95"
          :class="relanceFilter === 'PENDING' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
          @click="relanceFilter = relanceFilter === 'PENDING' ? '' : 'PENDING'"
        >
          <span class="material-symbols-outlined text-[16px]">schedule</span>
          À relancer (Paiement)
        </button>
      </div>
    </div>

    <!-- Barre d'Action Flottante de Relance en Masse -->
    <div
      v-if="selectedIds.length > 0"
      class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 px-4 shadow-sm"
    >
      <div class="flex items-center gap-2">
        <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {{ selectedIds.length }}
        </span>
        <span class="text-xs font-bold text-primary">candidat(s) sélectionné(s)</span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <select v-model="bulkChannel" class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
          <option value="WHATSAPP">🟢 WhatsApp Direct</option>
          <option value="EMAIL">✉️ Email Officiel</option>
        </select>

        <select v-model="bulkPromoCode" class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
          <option value="">Aucun code promo</option>
          <option value="RENTREE2026">RENTREE2026 (-5 000 FCFA)</option>
          <option value="BF50">BF50 (-50%)</option>
          <option value="BF100">BF100 (100% Gratuit)</option>
        </select>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95"
          :disabled="bulkSending"
          @click="executeBulkRelance"
        >
          <span class="material-symbols-outlined text-[16px]">send</span>
          {{ bulkSending ? 'Envoi en cours...' : 'Exécuter la relance groupée' }}
        </button>

        <button
          type="button"
          class="text-xs font-medium text-slate-500 hover:text-slate-700"
          @click="selectedIds = []"
        >
          Annuler
        </button>
      </div>
    </div>

    <!-- Tableau des Candidatures -->
    <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
            <tr>
              <th class="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  class="rounded border-slate-300 text-primary focus:ring-primary"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="cursor-pointer px-4 py-3" @click="toggleSort('fullName')">
                Candidat {{ sortIcon('fullName') }}
              </th>
              <th class="cursor-pointer px-4 py-3" @click="toggleSort('programmeTitre')">
                Programme & École {{ sortIcon('programmeTitre') }}
              </th>
              <th class="px-4 py-3">Statut Dossier</th>
              <th class="px-4 py-3">Niveau d'Intérêt</th>
              <th class="px-4 py-3">Suivi Relance</th>
              <th class="cursor-pointer px-4 py-3 text-right" @click="toggleSort('createdAt')">
                Date {{ sortIcon('createdAt') }}
              </th>
              <th class="px-4 py-3 text-center">Actions Relance 1-Clic</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="d in paginated"
              :key="d.id"
              class="transition hover:bg-slate-50/60"
              :class="{ 'bg-amber-50/30': d.status === 'EN_ATTENTE_PAIEMENT' }"
            >
              <!-- Checkbox -->
              <td class="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(d.id)"
                  class="rounded border-slate-300 text-primary focus:ring-primary"
                  @change="toggleSelect(d.id)"
                />
              </td>

              <!-- Candidat -->
              <td class="px-4 py-3 font-medium">
                <div class="flex items-center gap-2">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {{ (d.fullName[0] || 'C').toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <button
                      type="button"
                      class="text-left font-bold text-slate-900 hover:text-primary"
                      @click="openDetail(d)"
                    >
                      {{ d.fullName }}
                    </button>
                    <p class="truncate text-[11px] text-slate-400">{{ d.email }} • {{ d.phone || 'Sans tel' }}</p>
                  </div>
                </div>
              </td>

              <!-- Programme -->
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-800">{{ d.programmeTitre }}</p>
                <p class="text-[11px] text-slate-500">{{ d.etablissementNom || d.partnerName }}</p>
              </td>

              <!-- Statut -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  :class="{
                    'bg-amber-100 text-amber-800': d.status === 'EN_ATTENTE_PAIEMENT',
                    'bg-sky-100 text-sky-800': d.status === 'EN_REVUE_PARTENAIRE',
                    'bg-emerald-100 text-emerald-800': d.status === 'ACCEPTE' || d.status === 'DOCUMENT_EMIS',
                    'bg-red-100 text-red-800': d.status === 'REFUSE',
                    'bg-slate-100 text-slate-700': d.status === 'SOUMIS'
                  }"
                >
                  {{ d.statusLabel }}
                </span>
              </td>

              <!-- Niveau d'intérêt -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-bold"
                  :class="INTEREST_OPTIONS[d.interestLevel || 'HOT_MED']?.className"
                >
                  {{ INTEREST_OPTIONS[d.interestLevel || 'HOT_MED']?.label }}
                </span>
              </td>

              <!-- Relances -->
              <td class="px-4 py-3">
                <div class="flex flex-col text-[11px]">
                  <span class="font-bold text-slate-700">
                    {{ d.relanceCount ? `${d.relanceCount} relance(s)` : 'Aucune relance' }}
                  </span>
                  <span v-if="d.lastRelanceAt" class="text-slate-400">
                    Dernière: {{ formatDate(d.lastRelanceAt) }} ({{ d.lastChannelUsed || 'WhatsApp' }})
                  </span>
                </div>
              </td>

              <!-- Date -->
              <td class="px-4 py-3 text-right text-slate-500 font-mono text-[11px]">
                {{ formatDate(d.createdAt) }}
              </td>

              <!-- Action WhatsApp / Email 1-Clic -->
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Bouton WhatsApp 1-Clic -->
                  <button
                    type="button"
                    class="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95"
                    :disabled="singleRelanceSending === d.id"
                    title="Relancer directement sur WhatsApp"
                    @click.stop="triggerRelance(d.id, 'WHATSAPP')"
                  >
                    <span class="material-symbols-outlined text-[15px]">chat</span>
                    WhatsApp
                  </button>

                  <!-- Bouton Email 1-Clic -->
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:scale-95"
                    :disabled="singleRelanceSending === d.id"
                    title="Envoyer un email de relance"
                    @click.stop="triggerRelance(d.id, 'EMAIL')"
                  >
                    <span class="material-symbols-outlined text-[16px]">mail</span>
                  </button>

                  <!-- Bouton Consulter CRM -->
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-primary transition hover:bg-primary/5 active:scale-95"
                    title="Voir la fiche CRM complète"
                    @click.stop="openDetail(d)"
                  >
                    <span class="material-symbols-outlined text-[16px]">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-500">
        <span>Page {{ page }} sur {{ totalPages || 1 }} ({{ filtered.length }} dossiers)</span>
        <div class="flex gap-1">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 disabled:opacity-50"
            :disabled="page <= 1"
            @click="page--"
          >
            Précédent
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 disabled:opacity-50"
            :disabled="page >= totalPages"
            @click="page++"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Drawer Candidat 360° Multi-Onglets (CRM) -->
    <Teleport to="body">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        @click.self="onDrawerClose"
      >
        <div class="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-slide-in-right">
          <!-- En-tête Drawer -->
          <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <div>
              <h2 class="font-headline text-lg font-bold text-slate-900">
                Fiche Candidat & CRM
              </h2>
              <p class="text-xs text-slate-500">
                Dossier N° {{ selectedId?.slice(0, 8).toUpperCase() }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              @click="onDrawerClose"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Navigation par Onglets -->
          <div class="flex border-b border-slate-100 bg-white px-6">
            <button
              type="button"
              class="border-b-2 py-3 px-4 text-xs font-bold transition"
              :class="activeTab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
              @click="activeTab = 'summary'"
            >
              📊 Résumé Commercial
            </button>
            <button
              type="button"
              class="border-b-2 py-3 px-4 text-xs font-bold transition"
              :class="activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
              @click="activeTab = 'notes'"
            >
              💬 Notes & Timeline ({{ detail?.crmNotes?.length || 0 }})
            </button>
            <button
              type="button"
              class="border-b-2 py-3 px-4 text-xs font-bold transition"
              :class="activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
              @click="activeTab = 'documents'"
            >
              📄 Documents
            </button>
          </div>

          <!-- Contenu Drawer -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <div v-if="detailLoading" class="py-12 text-center text-slate-400">
              Chargement du dossier candidat...
            </div>

            <template v-else-if="detail">
              <!-- ONGLET 1 : RÉSUMÉ COMMERCIAL & FINANCIER -->
              <div v-if="activeTab === 'summary'" class="space-y-6">
                <!-- Bloc Résumé Automatique -->
                <div class="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-primary">Résumé Automatique du Dossier</span>
                    <span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-extrabold text-primary">
                      Probabilité : {{ detail.conversionScore || 85 }}%
                    </span>
                  </div>
                  <p class="text-xs text-slate-700 font-medium">
                    Candidat intéressé par <strong>{{ detail.programme.titre }}</strong> à <strong>{{ detail.programme.etablissement.nom }}</strong>.
                  </p>
                  <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-primary/10 text-slate-600">
                    <div>Motif principal : <strong>{{ BLOCKING_OPTIONS[detail.blockingReason || 'PARENT_APPROVAL'] }}</strong></div>
                    <div>Dernier échange : <strong>{{ formatDate(detail.lastRelanceAt) }}</strong></div>
                  </div>
                </div>

                <!-- Actions Rapides Directes -->
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-98"
                    @click="triggerRelance(detail.id, 'WHATSAPP')"
                  >
                    <span class="material-symbols-outlined text-[18px]">chat</span>
                    Relancer sur WhatsApp (1-Clic)
                  </button>
                  <button
                    type="button"
                    class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-98"
                    @click="triggerRelance(detail.id, 'EMAIL')"
                  >
                    <span class="material-symbols-outlined text-[18px]">mail</span>
                    Relancer par Email
                  </button>
                </div>

                <!-- Détails Financiers -->
                <section class="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Détails Financiers & Paiement</h3>
                  <div class="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span class="text-slate-400 block">Frais catalogue</span>
                      <span class="font-semibold text-slate-700">{{ (detail.programme.fraisDossier || 20000).toLocaleString('fr-FR') }} {{ detail.programme.devise }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block">Montant final à payer</span>
                      <span class="font-extrabold text-primary text-sm">{{ (detail.montantFinal ?? detail.programme.fraisDossier ?? 20000).toLocaleString('fr-FR') }} {{ detail.programme.devise }}</span>
                    </div>
                  </div>
                </section>

                <!-- Infos Candidat -->
                <section class="rounded-2xl border border-slate-100 bg-white p-4 space-y-3 shadow-2xs">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Informations Personnelles</h3>
                  <div class="grid grid-cols-2 gap-3 text-xs">
                    <div><span class="text-slate-400 block">Nom complet</span><span class="font-bold text-slate-900">{{ detail.fullName }}</span></div>
                    <div><span class="text-slate-400 block">Téléphone</span><span class="font-medium text-slate-800">{{ detail.phone || 'Non renseigné' }}</span></div>
                    <div><span class="text-slate-400 block">Email</span><span class="font-medium text-slate-800">{{ detail.email }}</span></div>
                    <div><span class="text-slate-400 block">Établissement actuel</span><span class="font-medium text-slate-800">{{ detail.institution || 'N/A' }}</span></div>
                  </div>
                </section>

                <!-- Modification du Statut du Dossier -->
                <section class="rounded-2xl border border-slate-100 bg-white p-4 space-y-3 shadow-2xs">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Changer le statut du dossier</h3>
                  <div class="flex gap-2">
                    <select v-model="draft.status" class="admin-input flex-1 text-xs">
                      <option v-for="s in statusChoices" :key="s" :value="s">{{ candidatureStatusLabel(s) }}</option>
                    </select>
                    <button type="button" class="admin-btn-primary text-xs" :disabled="saving" @click="saveStatusPatch">
                      Enregistrer
                    </button>
                  </div>
                </section>
              </div>

              <!-- ONGLET 2 : NOTES COMMERCIALES & TIMELINE -->
              <div v-else-if="activeTab === 'notes'" class="space-y-6">
                <!-- Formulaire Ajouter une note -->
                <div class="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">➕ Ajouter une note commerciale</h3>
                    <label class="flex items-center gap-1.5 text-xs text-amber-700 cursor-pointer">
                      <input v-model="noteForm.isPinned" type="checkbox" class="rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                      📌 Épingler cette note
                    </label>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label class="block text-slate-500 font-medium mb-1">Canal d'échange</label>
                      <select v-model="noteForm.exchangeType" class="admin-input text-xs">
                        <option v-for="(lbl, key) in EXCHANGE_OPTIONS" :key="key" :value="key">{{ lbl }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-slate-500 font-medium mb-1">Niveau d'intérêt</label>
                      <select v-model="noteForm.interestLevel" class="admin-input text-xs">
                        <option v-for="(opt, key) in INTEREST_OPTIONS" :key="key" :value="key">{{ opt.label }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-slate-500 font-medium mb-1">Motif de blocage</label>
                      <select v-model="noteForm.blockingReason" class="admin-input text-xs">
                        <option v-for="(lbl, key) in BLOCKING_OPTIONS" :key="key" :value="key">{{ lbl }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-slate-500 font-medium mb-1">Action suivante</label>
                      <select v-model="noteForm.nextAction" class="admin-input text-xs">
                        <option v-for="(lbl, key) in NEXT_ACTION_OPTIONS" :key="key" :value="key">{{ lbl }}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-slate-500 font-medium mb-1 text-xs">Compte-rendu de l'échange</label>
                    <textarea
                      v-model="noteForm.content"
                      rows="3"
                      placeholder="Ex: Le candidat attend la validation financière de ses parents. Prochaine relance prévue le 25 août."
                      class="admin-input text-xs"
                    ></textarea>
                  </div>

                  <button
                    type="button"
                    class="admin-btn-primary w-full text-xs py-2.5"
                    :disabled="savingNote || !noteForm.content.trim()"
                    @click="submitNote"
                  >
                    {{ savingNote ? 'Enregistrement...' : 'Enregistrer la note' }}
                  </button>
                </div>

                <!-- Timeline des Notes -->
                <div class="space-y-3">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Historique des Échanges & Notes</h3>

                  <div v-if="!detail.crmNotes?.length" class="py-8 text-center text-xs text-slate-400">
                    Aucune note enregistrée pour le moment.
                  </div>

                  <div v-else class="space-y-3">
                    <div
                      v-for="note in detail.crmNotes"
                      :key="note.id"
                      class="rounded-xl border p-3.5 space-y-2 transition"
                      :class="note.isPinned ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-200' : 'border-slate-100 bg-white shadow-2xs'"
                    >
                      <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2">
                          <span v-if="note.isPinned" class="text-amber-600 font-bold">📌 ÉPINGLÉ</span>
                          <span class="font-bold text-slate-800">{{ note.agentName }}</span>
                          <span class="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {{ EXCHANGE_OPTIONS[note.exchangeType] || note.exchangeType }}
                          </span>
                        </div>
                        <span class="text-[11px] text-slate-400">{{ formatDateTime(note.createdAt) }}</span>
                      </div>

                      <p class="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{{ note.content }}</p>

                      <div v-if="note.blockingReason || note.nextAction" class="flex flex-wrap gap-2 pt-1 text-[10px]">
                        <span v-if="note.blockingReason" class="rounded bg-red-50 text-red-700 px-2 py-0.5 font-semibold">
                          Motif: {{ BLOCKING_OPTIONS[note.blockingReason] }}
                        </span>
                        <span v-if="note.nextAction" class="rounded bg-sky-50 text-sky-700 px-2 py-0.5 font-semibold">
                          Action: {{ NEXT_ACTION_OPTIONS[note.nextAction] }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ONGLET 3 : DOCUMENTS & ATTESTATIONS -->
              <div v-else-if="activeTab === 'documents'" class="space-y-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Documents Officiels & Justificatifs</h3>
                <div class="space-y-2">
                  <a
                    v-if="detail.documentUrl"
                    :href="detail.documentUrl"
                    target="_blank"
                    class="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
                  >
                    <span>🎓 Télécharger l'Attestation Officielle PDF</span>
                    <span class="material-symbols-outlined text-[18px]">download</span>
                  </a>

                  <a
                    v-if="detail.identityCardRectoUrl"
                    :href="detail.identityCardRectoUrl"
                    target="_blank"
                    class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <span>🆔 Pièce d'Identité (Recto)</span>
                    <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>

                  <a
                    v-if="detail.identityCardVersoUrl"
                    :href="detail.identityCardVersoUrl"
                    target="_blank"
                    class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <span>🆔 Pièce d'Identité (Verso)</span>
                    <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>
