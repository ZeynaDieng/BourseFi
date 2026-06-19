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
}

const { data: dossiers, refresh } = await useFetch<DossierRow[]>('/api/candidatures', { default: () => [] })

const search = ref('')
const filterStatus = ref('')
const partnerFilter = ref('')
const drawerOpen = ref(false)
const selectedId = ref<string | null>(null)
const detail = ref<DossierDetail | null>(null)
const detailLoading = ref(false)
const previewDoc = ref<{ url: string; label: string } | null>(null)

const statusChoices = CANDIDATURE_STATUS_CHOICES

const statusFilters = [
  { value: '', label: 'Tous' },
  { value: 'EN_ATTENTE_PAIEMENT', label: 'Paiement' },
  { value: 'EN_REVUE_PARTENAIRE', label: 'En revue' },
  { value: 'COMPLEMENT_DEMANDE', label: 'Complément' },
  { value: 'ACCEPTE', label: 'Acceptés' },
  { value: 'REFUSE', label: 'Refusés' },
  { value: 'DOCUMENT_EMIS', label: 'Attestation' },
]

const draft = reactive({ status: '', documentDataUrl: '' })
const saving = ref(false)
const deleting = ref(false)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const stats = computed(() => {
  const list = dossiers.value ?? []
  return {
    total: list.length,
    pendingPayment: list.filter((d) => d.status === 'EN_ATTENTE_PAIEMENT').length,
    inReview: list.filter((d) => d.status === 'EN_REVUE_PARTENAIRE').length,
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

watch([search, filterStatus, partnerFilter], resetPage)

async function loadDetail(id: string) {
  selectedId.value = id
  drawerOpen.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await $fetch<DossierDetail>(`/api/admin/candidatures/${id}`)
    draft.status = detail.value.status
    draft.documentDataUrl = ''
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
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <h1 class="admin-page-title">Candidatures</h1>
      <p class="admin-page-desc">
        Validation des dossiers, émission des attestations et suivi des statuts.
      </p>

      <!-- Stats -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ stats.total }}</p>
          <p class="text-xs text-slate-500">Total</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-amber-600">{{ stats.pendingPayment }}</p>
          <p class="text-xs text-slate-500">Paiement</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-blue-600">{{ stats.inReview }}</p>
          <p class="text-xs text-slate-500">En revue</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-emerald-600">{{ stats.accepted }}</p>
          <p class="text-xs text-slate-500">Acceptés / émis</p>
        </div>
        <div class="admin-dash-card p-4 col-span-2 sm:col-span-1">
          <p class="text-2xl font-bold text-red-600">{{ stats.refused }}</p>
          <p class="text-xs text-slate-500">Refusés</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mt-6 flex flex-wrap gap-3">
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher candidat, programme, partenaire…"
          class="admin-input min-w-[220px] flex-1"
        />
        <select v-model="filterStatus" class="admin-input w-auto bg-white">
          <option v-for="f in statusFilters" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
        <select v-model="partnerFilter" class="admin-input w-auto bg-white">
          <option value="">Tous les partenaires</option>
          <option v-for="p in partnerOptions" :key="p" :value="p">{{ p }}</option>
        </select>
        <button type="button" class="admin-btn-secondary text-sm" @click="exportDossiers">Exporter CSV</button>
      </div>
      <p class="mt-2 text-xs text-slate-500">{{ filtered.length }} dossier(s)</p>

      <!-- Table desktop -->
      <div class="admin-table-shell mt-4 hidden md:block">
        <table class="admin-table min-w-[900px]">
          <thead>
            <tr>
              <th class="admin-th">
                <button type="button" class="inline-flex items-center gap-1 font-semibold" @click="toggleSort('fullName')">
                  Candidat
                  <span class="material-symbols-outlined text-[16px]">{{ sortIcon('fullName') }}</span>
                </button>
              </th>
              <th class="admin-th">Programme</th>
              <th class="admin-th">Partenaire</th>
              <th class="admin-th">Statut</th>
              <th class="admin-th">Documents</th>
              <th class="admin-th">
                <button type="button" class="inline-flex items-center gap-1 font-semibold" @click="toggleSort('createdAt')">
                  Déposé le
                  <span class="material-symbols-outlined text-[16px]">{{ sortIcon('createdAt') }}</span>
                </button>
              </th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in paginated" :key="d.id" class="hover:bg-slate-50/80">
              <td class="admin-td">
                <p class="font-semibold text-primary">{{ d.fullName }}</p>
                <p class="text-xs text-slate-500">{{ d.email }}</p>
              </td>
              <td class="admin-td">
                <p class="text-sm">{{ d.programmeTitre }}</p>
                <p v-if="d.bourseTitre" class="text-xs text-slate-400">{{ d.bourseTitre }}</p>
              </td>
              <td class="admin-td text-sm">{{ d.partnerName }}</td>
              <td class="admin-td">
                <ApplicationStatusBadge :status="d.status" />
                <p class="mt-1 text-[11px] text-slate-400">{{ d.statusLabel }}</p>
              </td>
              <td class="admin-td">
                <div class="flex flex-wrap gap-1">
                  <span v-if="d.identityCardRectoUrl" class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">CNI</span>
                  <span v-if="d.documentUrl" class="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">Attest.</span>
                  <span v-if="!d.identityCardRectoUrl && !d.documentUrl" class="text-xs text-slate-400">—</span>
                </div>
              </td>
              <td class="admin-td text-xs text-slate-500">{{ formatDate(d.createdAt) }}</td>
              <td class="admin-td text-right">
                <button type="button" class="admin-btn-ghost" @click="openDetail(d)">Gérer le dossier</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!paginated.length" class="p-6 text-sm text-slate-500">Aucun dossier.</p>
        <AdminPagination v-model:page="page" :total-pages="totalPages" :total-items="filtered.length" />
      </div>

      <!-- Cards mobile -->
      <div class="mt-4 flex flex-col gap-3 md:hidden">
        <article v-for="d in paginated" :key="d.id" class="admin-dash-card space-y-3 p-4">
          <div>
            <p class="font-semibold text-primary">{{ d.fullName }}</p>
            <p class="text-xs text-slate-500">{{ d.email }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ d.programmeTitre }}</p>
            <ApplicationStatusBadge :status="d.status" class="mt-2" />
          </div>
          <button type="button" class="admin-btn-primary w-full text-sm" @click="openDetail(d)">
            Gérer le dossier
          </button>
        </article>
        <AdminPagination v-model:page="page" :total-pages="totalPages" :total-items="filtered.length" />
        <p v-if="!paginated.length" class="text-sm text-slate-500">Aucun dossier.</p>
      </div>
    </main>

    <!-- Drawer détail candidature -->
    <AdminDrawer
      v-model:open="drawerOpen"
      :title="detail?.fullName ?? 'Candidature'"
      :description="detail?.programme?.titre"
      size="2xl"
      @close="onDrawerClose"
    >
      <div v-if="detailLoading" class="py-12 text-center text-sm text-slate-500">Chargement…</div>

      <div v-else-if="detail" class="space-y-6">
        <!-- Statut & actions -->
        <section class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <ApplicationStatusBadge :status="detail.status" />
            <NuxtLink
              :to="`/admin/users?id=${detail.user.id}`"
              class="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              Compte : {{ detail.user.name }} →
            </NuxtLink>
          </div>
          <div class="mt-4 space-y-3">
            <label class="block">
              <span class="text-xs font-semibold text-slate-500">Changer le statut</span>
              <select v-model="draft.status" class="admin-input mt-1 w-full bg-white">
                <option v-for="s in statusChoices" :key="s" :value="s">
                  {{ candidatureStatusLabel(s) }}
                </option>
              </select>
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-slate-500">Attestation — importer un fichier (PDF ou image)</span>
              <CandidatureDocumentDropzone v-model="draft.documentDataUrl" label="Attestation" class="mt-2" />
            </label>
            <button type="button" class="admin-btn-primary w-full text-sm" :disabled="saving" @click="savePatch">
              {{ saving ? 'Enregistrement…' : 'Enregistrer les modifications' }}
            </button>
          </div>
        </section>

        <!-- Candidat -->
        <section>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Candidat</p>
          <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt class="text-slate-400">Nom complet</dt><dd class="font-medium">{{ detail.fullName }}</dd></div>
            <div><dt class="text-slate-400">Email</dt><dd>{{ detail.email }}</dd></div>
            <div><dt class="text-slate-400">Téléphone</dt><dd>{{ detail.phone || '—' }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-slate-400">Adresse</dt><dd>{{ detail.address || '—' }}</dd></div>
            <div><dt class="text-slate-400">Déposé le</dt><dd>{{ formatDate(detail.createdAt) }}</dd></div>
          </dl>
        </section>

        <!-- Parcours -->
        <section>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Parcours académique</p>
          <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt class="text-slate-400">Établissement</dt><dd>{{ detail.institution || '—' }}</dd></div>
            <div><dt class="text-slate-400">Filière</dt><dd>{{ detail.field || '—' }}</dd></div>
            <div><dt class="text-slate-400">Niveau</dt><dd>{{ detail.level || '—' }}</dd></div>
            <div><dt class="text-slate-400">Dernier diplôme</dt><dd>{{ detail.lastDiploma || '—' }}</dd></div>
            <div><dt class="text-slate-400">Année obtention</dt><dd>{{ detail.graduationDate || '—' }}</dd></div>
            <div><dt class="text-slate-400">Moyenne</dt><dd>{{ detail.gpa || '—' }}</dd></div>
          </dl>
        </section>

        <!-- Programme -->
        <section>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Programme visé</p>
          <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div class="sm:col-span-2"><dt class="text-slate-400">Programme</dt><dd class="font-medium">{{ detail.programme.titre }}</dd></div>
            <div><dt class="text-slate-400">École</dt><dd>{{ detail.programme.etablissement.nom }}</dd></div>
            <div><dt class="text-slate-400">Ville</dt><dd>{{ detail.programme.ville }}</dd></div>
            <div><dt class="text-slate-400">Partenaire</dt><dd>{{ detail.partner.name }}</dd></div>
            <div v-if="detail.bourse"><dt class="text-slate-400">Bourse</dt><dd>{{ detail.bourse.titre }}</dd></div>
            <div>
              <dt class="text-slate-400">Frais de dossier</dt>
              <dd>{{ detail.programme.fraisDossier.toLocaleString('fr-FR') }} {{ detail.programme.devise }}</dd>
            </div>
          </dl>
        </section>

        <!-- Paiement -->
        <section v-if="detail.paiement">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Paiement</p>
          <div class="mt-3 rounded-xl border border-slate-100 bg-white p-3 text-sm">
            <p class="font-semibold">{{ detail.paiement.amount.toLocaleString('fr-FR') }} FCFA</p>
            <p class="mt-2 text-xs text-slate-500">
              {{ detail.paiement.status }} · {{ detail.paiement.method }}
              <span v-if="detail.paiement.refCommand"> · Réf. {{ detail.paiement.refCommand }}</span>
            </p>
            <NuxtLink
              :to="`/admin/transactions?id=${detail.paiement.id}`"
              class="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
            >
              Voir le paiement →
            </NuxtLink>
            <p class="text-[11px] text-slate-400">{{ formatDate(detail.paiement.createdAt) }}</p>
          </div>
        </section>
        <section v-else>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Paiement</p>
          <p class="mt-2 text-sm text-amber-600">Aucun paiement enregistré pour ce dossier.</p>
        </section>

        <!-- Documents -->
        <section>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Documents</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <AdminDocumentThumb
              v-if="detail.identityCardRectoUrl"
              :url="detail.identityCardRectoUrl"
              label="CNI recto"
              @open="previewDoc = $event"
            />
            <AdminDocumentThumb
              v-if="detail.identityCardVersoUrl"
              :url="detail.identityCardVersoUrl"
              label="CNI verso"
              @open="previewDoc = $event"
            />
            <AdminDocumentThumb
              v-if="detail.documentUrl"
              :url="detail.documentUrl"
              label="Attestation"
              @open="previewDoc = $event"
            />
            <span
              v-if="!detail.identityCardRectoUrl && !detail.identityCardVersoUrl && !detail.documentUrl"
              class="text-sm text-slate-400"
            >
              Aucun document disponible.
            </span>
          </div>
          <p v-if="detail.documentIssuedAt" class="mt-2 text-xs text-slate-400">
            Attestation émise le {{ formatDate(detail.documentIssuedAt) }}
          </p>
        </section>
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
