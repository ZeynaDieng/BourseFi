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
  attestationNumber?: string | null
  montantInitial: number | null
  montantReduction: number | null
  programme: {
    titre: string
    slug: string
    ville: string
    fraisDossier: number
    devise: string
    etablissement: { nom: string; slug: string; fraisDossier?: number | null }
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
const previewDoc = ref<{ url: string; label: string } | null>(null)
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
const singleRelanceSending = ref<string | null>(null)

const statusChoices = CANDIDATURE_STATUS_CHOICES

// Libellés CRM Commercial
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
  { value: 'REFUSE', label: 'Refusés' },
  { value: 'DOCUMENT_EMIS', label: 'Attestation disponible' },
]

const draft = reactive({ status: '', documentDataUrl: '' })
const saving = ref(false)
const deleting = ref(false)

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
  return {
    total: list.length,
    pendingPayment: list.filter((d) => d.status === 'EN_ATTENTE_PAIEMENT').length,
    inReview: list.filter((d) => d.status === 'EN_REVUE_PARTENAIRE').length,
    hotCount: list.filter((d) => d.interestLevel === 'HOT_HIGH' || d.interestLevel === 'HOT_MED').length,
    accepted: list.filter((d) => d.status === 'ACCEPTE' || d.status === 'DOCUMENT_EMIS' || d.status === 'TERMINE').length,
    refused: list.filter((d) => d.status === 'REFUSE').length,
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

async function savePatch() {
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
    alert(getAdminErrorMessage(e))
  } finally {
    saving.value = false
  }
}

async function deleteDossier() {
  if (!selectedId.value || !detail.value) return
  if (detail.value.paiement) {
    alert('Impossible de supprimer : un paiement est lié à ce dossier.')
    return
  }
  if (!confirm(`Supprimer la candidature de ${detail.value.fullName} pour ${detail.value.programme.titre} ?`)) return

  deleting.value = true
  try {
    await $fetch(`/api/admin/candidatures/${selectedId.value}`, { method: 'DELETE' })
    await refresh()
    onDrawerClose()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  } finally {
    deleting.value = false
  }
}

// Relances WhatsApp & Email 1-Clic
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

// Relance en Masse
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

// Soumettre une Note Commerciale
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
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="admin-page-title">Candidatures & CRM Relances</h1>
          <p class="admin-page-desc">
            Validation des dossiers, relances WhatsApp/Email, émission d'attestations et suivi commercial.
          </p>
        </div>
        <button
          type="button"
          class="admin-btn-secondary inline-flex items-center gap-1.5 text-xs shadow-xs"
          @click="exportDossiers"
        >
          <span class="material-symbols-outlined text-[18px]">download</span>
          Exporter CSV
        </button>
      </div>

      <!-- Stats KPIs -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ stats.total }}</p>
          <p class="text-xs text-slate-500">Total Dossiers</p>
        </div>
        <div
          class="admin-dash-card p-4 cursor-pointer transition hover:scale-[1.02]"
          :class="{ 'ring-2 ring-amber-500 bg-amber-50/40': relanceFilter === 'PENDING' }"
          @click="relanceFilter = relanceFilter === 'PENDING' ? '' : 'PENDING'"
        >
          <p class="text-2xl font-bold text-amber-600">{{ stats.pendingPayment }}</p>
          <p class="text-xs text-slate-500">Paiement en attente</p>
        </div>
        <div
          class="admin-dash-card p-4 cursor-pointer transition hover:scale-[1.02]"
          :class="{ 'ring-2 ring-red-500 bg-red-50/40': relanceFilter === 'HOT_HIGH' }"
          @click="relanceFilter = relanceFilter === 'HOT_HIGH' ? '' : 'HOT_HIGH'"
        >
          <p class="text-2xl font-bold text-red-600">{{ stats.hotCount }}</p>
          <p class="text-xs text-slate-500">🔥 Très Chauds</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-blue-600">{{ stats.inReview }}</p>
          <p class="text-xs text-slate-500">En revue</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-emerald-600">{{ stats.accepted }}</p>
          <p class="text-xs text-slate-500">Attestations émises</p>
        </div>
      </div>

      <!-- Barre de Recherche & Filtres -->
      <div class="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
        <div class="flex flex-1 flex-wrap items-center gap-3">
          <div class="relative min-w-[200px] flex-1 sm:max-w-xs">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
            <input
              v-model="search"
              type="text"
              placeholder="Nom, email, téléphone..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <select
            v-model="filterStatus"
            class="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-primary focus:outline-none"
          >
            <option v-for="s in statusFilters" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>

          <select
            v-model="partnerFilter"
            class="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-primary focus:outline-none"
          >
            <option value="">Tous les partenaires</option>
            <option v-for="p in partnerOptions" :key="p" :value="p">{{ p }}</option>
          </select>

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

      <!-- Barre de Relance en Masse -->
      <div
        v-if="selectedIds.length > 0"
        class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 px-4 shadow-sm"
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
            {{ bulkSending ? 'Envoi...' : 'Exécuter la relance groupée' }}
          </button>

          <button type="button" class="text-xs font-medium text-slate-500 hover:text-slate-700" @click="selectedIds = []">
            Annuler
          </button>
        </div>
      </div>

      <!-- Tableau des Dossiers -->
      <div class="mt-4">
        <AdminTable :columns="6">
          <template #head>
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
                Programme & Partenaire {{ sortIcon('programmeTitre') }}
              </th>
              <th class="px-4 py-3">Statut Dossier</th>
              <th class="px-4 py-3">Intérêt & Suivi</th>
              <th class="cursor-pointer px-4 py-3 text-right" @click="toggleSort('createdAt')">
                Date {{ sortIcon('createdAt') }}
              </th>
              <th class="px-4 py-3 text-center">Relance 1-Clic</th>
            </tr>
          </template>

          <template #body>
            <tr
              v-for="d in paginated"
              :key="d.id"
              class="cursor-pointer transition hover:bg-slate-50/80"
              :class="{ 'bg-amber-50/30': d.status === 'EN_ATTENTE_PAIEMENT' }"
              @click="openDetail(d)"
            >
              <td class="px-4 py-3 text-center" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(d.id)"
                  class="rounded border-slate-300 text-primary focus:ring-primary"
                  @change="toggleSelect(d.id)"
                />
              </td>

              <td class="px-4 py-3 font-medium">
                <div class="flex items-center gap-2">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {{ (d.fullName[0] || 'C').toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 truncate">{{ d.fullName }}</p>
                    <p class="truncate text-[11px] text-slate-400">{{ d.email }} • {{ d.phone || 'Sans tel' }}</p>
                  </div>
                </div>
              </td>

              <td class="px-4 py-3">
                <p class="font-semibold text-slate-800 truncate max-w-xs">{{ d.programmeTitre }}</p>
                <p class="text-[11px] text-slate-500">{{ d.partnerName }}</p>
              </td>

              <td class="px-4 py-3">
                <AdminStatusBadge :status="d.status" :label="d.statusLabel" />
              </td>

              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <span
                    class="inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold w-fit"
                    :class="INTEREST_OPTIONS[d.interestLevel || 'HOT_MED']?.className"
                  >
                    {{ INTEREST_OPTIONS[d.interestLevel || 'HOT_MED']?.label }}
                  </span>
                  <span class="text-[10px] text-slate-400">
                    {{ d.relanceCount ? `${d.relanceCount} relance(s)` : '0 relance' }}
                  </span>
                </div>
              </td>

              <td class="px-4 py-3 text-right font-mono text-[11px] text-slate-400">
                {{ formatDate(d.createdAt) }}
              </td>

              <td class="px-4 py-3 text-center" @click.stop>
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Bouton WhatsApp Direct -->
                  <button
                    type="button"
                    class="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95"
                    :disabled="singleRelanceSending === d.id"
                    title="Envoyer un message WhatsApp avec lien de paiement"
                    @click="triggerRelance(d.id, 'WHATSAPP')"
                  >
                    <span class="material-symbols-outlined text-[15px]">chat</span>
                    WhatsApp
                  </button>

                  <!-- Bouton Email Direct -->
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:scale-95"
                    :disabled="singleRelanceSending === d.id"
                    title="Envoyer un email de relance"
                    @click="triggerRelance(d.id, 'EMAIL')"
                  >
                    <span class="material-symbols-outlined text-[16px]">mail</span>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </AdminTable>

        <AdminPagination
          v-model:page="page"
          :total-pages="totalPages"
          :filtered-count="filtered.length"
          :total-count="stats.total"
        />
      </div>
    </main>

    <!-- AdminDrawer Intégral Restauré & Enrichi CRM -->
    <AdminDrawer :open="drawerOpen" title="Détail du Dossier Candidat" @close="onDrawerClose">
      <div v-if="detailLoading" class="p-6 text-slate-400 text-xs">
        Chargement des informations...
      </div>

      <div v-else-if="detail" class="space-y-6">
        <!-- Navigation Onglets CRM -->
        <div class="flex border-b border-slate-100 bg-white -mx-6 px-6">
          <button
            type="button"
            class="border-b-2 py-2.5 px-3 text-xs font-bold transition"
            :class="activeTab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
            @click="activeTab = 'summary'"
          >
            📊 Résumé & Validation
          </button>
          <button
            type="button"
            class="border-b-2 py-2.5 px-3 text-xs font-bold transition"
            :class="activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
            @click="activeTab = 'notes'"
          >
            💬 Notes Commerciales ({{ detail.crmNotes?.length || 0 }})
          </button>
          <button
            type="button"
            class="border-b-2 py-2.5 px-3 text-xs font-bold transition"
            :class="activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
            @click="activeTab = 'documents'"
          >
            📄 Documents & Pièces
          </button>
        </div>

        <!-- ONGLET 1 : RÉSUMÉ & GESTION DOSSIER -->
        <div v-if="activeTab === 'summary'" class="space-y-6">
          <!-- Bloc Résumé Automatique -->
          <div class="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-primary">Résumé Automatique du Dossier</span>
              <span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-extrabold text-primary">
                Probabilité conversion : {{ detail.conversionScore || 85 }}%
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

          <!-- Relances Rapides Directes -->
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

          <!-- Section Statut et Attestation personnalisée -->
          <section class="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <div v-if="detail.documentUrl" class="flex items-center justify-between rounded-lg bg-emerald-50 p-3 border border-emerald-200">
              <div>
                <p class="text-xs font-bold text-emerald-900">Attestation Officielle Générée</p>
                <p class="text-[11px] text-emerald-800">Réf : {{ detail.attestationNumber || detail.id }}</p>
              </div>
              <a
                :href="`/api/attestations/${detail.id}`"
                target="_blank"
                class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"
              >
                <span class="material-symbols-outlined text-[16px]">visibility</span>
                Voir / Imprimer
              </a>
            </div>

            <div class="space-y-3 pt-2">
              <label class="block">
                <span class="text-xs font-semibold text-slate-500">Changer le statut du dossier</span>
                <select v-model="draft.status" class="admin-input mt-1 w-full bg-white">
                  <option v-for="s in statusChoices" :key="s" :value="s">
                    {{ candidatureStatusLabel(s) }}
                  </option>
                </select>
              </label>
              <label class="block">
                <span class="text-xs font-semibold text-slate-500">Document / Attestation personnalisée (Optionnel)</span>
                <CandidatureDocumentDropzone v-model="draft.documentDataUrl" label="Attestation complémentaire" class="mt-2" />
              </label>
              <button type="button" class="admin-btn-primary w-full text-sm" :disabled="saving" @click="savePatch">
                {{ saving ? 'Enregistrement…' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </section>

          <!-- Informations Candidat -->
          <section class="rounded-xl border border-slate-100 bg-white p-4 shadow-2xs">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span class="material-symbols-outlined text-[18px] text-primary">person</span>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Informations du Candidat</p>
            </div>
            <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt class="text-xs text-slate-400">Nom complet</dt><dd class="font-bold text-primary">{{ detail.fullName }}</dd></div>
              <div><dt class="text-xs text-slate-400">Email</dt><dd class="font-medium text-slate-700">{{ detail.email }}</dd></div>
              <div><dt class="text-xs text-slate-400">Téléphone</dt><dd class="font-medium text-slate-700">{{ detail.phone || 'Non renseigné' }}</dd></div>
              <div><dt class="text-xs text-slate-400">Adresse</dt><dd class="font-medium text-slate-700">{{ detail.address || 'Non renseignée' }}</dd></div>
              <div><dt class="text-xs text-slate-400">Déposé le</dt><dd class="font-medium text-slate-700">{{ formatDate(detail.createdAt) }}</dd></div>
              <div><dt class="text-xs text-slate-400">Identifiant Dossier</dt><dd class="font-mono text-xs text-slate-500">{{ detail.id }}</dd></div>
            </dl>
          </section>

          <!-- Parcours Académique -->
          <section class="rounded-xl border border-slate-100 bg-white p-4 shadow-2xs">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span class="material-symbols-outlined text-[18px] text-primary">school</span>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Parcours Académique du Candidat</p>
            </div>
            <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt class="text-xs text-slate-400">Établissement fréquenté</dt><dd class="font-medium text-slate-700">{{ detail.institution || 'N/A' }}</dd></div>
              <div><dt class="text-xs text-slate-400">Filière / Domaine</dt><dd class="font-medium text-slate-700">{{ detail.field || 'N/A' }}</dd></div>
              <div><dt class="text-xs text-slate-400">Niveau d'études actuel</dt><dd class="font-medium text-slate-700">{{ detail.level || 'N/A' }}</dd></div>
              <div><dt class="text-xs text-slate-400">Dernier diplôme obtenu</dt><dd class="font-medium text-slate-700">{{ detail.lastDiploma || 'N/A' }}</dd></div>
              <div><dt class="text-xs text-slate-400">Année d'obtention</dt><dd class="font-medium text-slate-700">{{ detail.graduationDate || 'N/A' }}</dd></div>
              <div><dt class="text-xs text-slate-400">Moyenne générale / Notes</dt><dd class="font-medium text-slate-700">{{ detail.gpa || 'N/A' }}</dd></div>
            </dl>
          </section>

          <!-- Programme & Établissement Visés -->
          <section class="rounded-xl border border-slate-100 bg-white p-4 shadow-2xs">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span class="material-symbols-outlined text-[18px] text-primary">domain</span>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Programme & Établissement Visés</p>
            </div>
            <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div class="sm:col-span-2"><dt class="text-xs text-slate-400">Programme choisi</dt><dd class="font-bold text-primary">{{ detail.programme.titre }}</dd></div>
              <div><dt class="text-xs text-slate-400">Établissement d'accueil</dt><dd class="font-medium text-slate-700">{{ detail.programme.etablissement.nom }}</dd></div>
              <div><dt class="text-xs text-slate-400">Ville</dt><dd class="font-medium text-slate-700">{{ detail.programme.ville }}</dd></div>
              <div><dt class="text-xs text-slate-400">Partenaire référent</dt><dd class="font-medium text-slate-700">{{ detail.partner.name }}</dd></div>
              <div v-if="detail.bourse"><dt class="text-xs text-slate-400">Bourse associée</dt><dd class="font-bold text-amber-700">{{ detail.bourse.titre }}</dd></div>
              <div>
                <dt class="text-xs text-slate-400">Frais de dossier</dt>
                <dd class="font-semibold text-slate-800">{{ (detail.montantFinal ?? detail.programme.fraisDossier ?? detail.programme.etablissement?.fraisDossier ?? 20000).toLocaleString('fr-FR') }} {{ detail.programme.devise }}</dd>
              </div>
            </dl>
          </section>

          <!-- Détails Financiers & Paiement -->
          <section class="rounded-xl border border-slate-100 bg-white p-4 shadow-2xs">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span class="material-symbols-outlined text-[18px] text-primary">payments</span>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Finances & Paiement du Dossier</p>
            </div>

            <div v-if="detail.paiement" class="mt-3 space-y-2 text-sm">
              <div class="flex items-center justify-between rounded-lg bg-emerald-50/60 p-3 border border-emerald-100">
                <div>
                  <p class="text-xs text-emerald-800">Montant réglé par le candidat</p>
                  <p class="font-headline text-lg font-black text-emerald-900">{{ detail.paiement.amount.toLocaleString('fr-FR') }} FCFA</p>
                </div>
                <span class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  Paiement {{ detail.paiement.status }}
                </span>
              </div>
              <dl class="grid gap-2 text-xs pt-1 sm:grid-cols-2">
                <div><dt class="text-slate-400">Mode de paiement</dt><dd class="font-semibold text-slate-700">{{ detail.paiement.method || 'PayTech / Mobile Money' }}</dd></div>
                <div><dt class="text-slate-400">Référence transaction</dt><dd class="font-mono text-slate-700">{{ detail.paiement.refCommand || 'N/A' }}</dd></div>
                <div><dt class="text-slate-400">Date du règlement</dt><dd class="text-slate-700">{{ formatDate(detail.paiement.createdAt) }}</dd></div>
              </dl>
              <div class="pt-2">
                <NuxtLink
                  :to="`/admin/transactions?id=${detail.paiement.id}`"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Voir le détail de la transaction →
                </NuxtLink>
              </div>
            </div>
            <div v-else class="mt-3 p-2 text-sm text-amber-700 font-medium">
              Aucun paiement enregistré pour ce dossier.
            </div>
          </section>
        </div>

        <!-- ONGLET 2 : NOTES COMMERCIALES & TIMELINE -->
        <div v-else-if="activeTab === 'notes'" class="space-y-6">
          <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
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

        <!-- ONGLET 3 : DOCUMENTS & PIÈCES FOURNIES -->
        <div v-else-if="activeTab === 'documents'" class="space-y-4">
          <section class="rounded-xl border border-slate-100 bg-white p-4 shadow-2xs">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span class="material-symbols-outlined text-[18px] text-primary">folder_open</span>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Documents & Pièces Justificatives</p>
            </div>
            <div class="mt-3 flex flex-wrap gap-3">
              <a
                :href="`/api/attestations/${detail.id}`"
                target="_blank"
                class="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <span class="material-symbols-outlined text-[18px] text-emerald-600">picture_as_pdf</span>
                Attestation BourseFi (PDF)
              </a>
              <AdminDocumentThumb
                v-if="detail.identityCardRectoUrl"
                :url="detail.identityCardRectoUrl"
                label="CNI Recto"
                @open="previewDoc = $event"
              />
              <AdminDocumentThumb
                v-if="detail.identityCardVersoUrl"
                :url="detail.identityCardVersoUrl"
                label="CNI Verso"
                @open="previewDoc = $event"
              />
              <AdminDocumentThumb
                v-if="detail.documentUrl"
                :url="detail.documentUrl"
                label="Fichier joint"
                @open="previewDoc = $event"
              />
            </div>
            <p v-if="detail.documentIssuedAt" class="mt-3 text-xs text-slate-400">
              Attestation émise le {{ formatDate(detail.documentIssuedAt) }}
            </p>
          </section>
        </div>
      </div>

      <template v-if="detail && !detailLoading" #footer>
        <button
          type="button"
          class="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          :disabled="deleting || !!detail.paiement"
          :title="detail.paiement ? 'Suppression impossible : paiement lié' : undefined"
          @click="deleteDossier"
        >
          {{ deleting ? 'Suppression…' : 'Supprimer le dossier' }}
        </button>
      </template>
    </AdminDrawer>

    <AdminDocumentPreviewModal :doc="previewDoc" @close="previewDoc = null" />
  </div>
</template>
