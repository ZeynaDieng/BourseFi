<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

const route = useRoute()
const { data: dossiers, refresh } = await useFetch('/api/candidatures', { default: () => [] })

type Dossier = {
  id: string
  fullName: string
  email: string
  phone?: string
  status: string
  statusLabel: string
  programmeTitre: string
  partnerName: string
  documentUrl: string | null
  identityCardRectoUrl?: string | null
  identityCardVersoUrl?: string | null
}

const statusChoices = [
  'SOUMIS',
  'EN_ATTENTE_PAIEMENT',
  'EN_REVUE_PARTENAIRE',
  'COMPLEMENT_DEMANDE',
  'ACCEPTE',
  'REFUSE',
  'DOCUMENT_EMIS',
  'TERMINE',
]

const filterStatus = computed(() => (route.query.status as string) || '')

const filtered = computed(() => {
  const list = (Array.isArray(dossiers.value) ? dossiers.value : []) as Dossier[]
  if (!filterStatus.value) return list
  return list.filter((d) => d.status === filterStatus.value)
})

const statusFilters = [
  { value: '', label: 'Tous' },
  { value: 'EN_ATTENTE_PAIEMENT', label: 'Paiement' },
  { value: 'EN_REVUE_PARTENAIRE', label: 'En revue' },
  { value: 'COMPLEMENT_DEMANDE', label: 'Complément' },
  { value: 'ACCEPTE', label: 'Acceptés' },
  { value: 'REFUSE', label: 'Refusés' },
  { value: 'DOCUMENT_EMIS', label: 'Document émis' },
]

const drafts = reactive<Record<string, { status: string; documentDataUrl: string }>>({})

function draftFor(d: Dossier) {
  if (!drafts[d.id]) {
    drafts[d.id] = { status: d.status, documentDataUrl: '' }
  }
  return drafts[d.id]
}

const saving = reactive<Record<string, boolean>>({})

async function savePatch(id: string) {
  const d = drafts[id]
  if (!d) return
  saving[id] = true
  try {
    await $fetch(`/api/candidatures/${id}`, {
      method: 'PATCH',
      body: { status: d.status, documentDataUrl: d.documentDataUrl || undefined },
    })
    d.documentDataUrl = ''
    await refresh()
  } finally {
    saving[id] = false
  }
}

const previewDoc = ref<{ url: string; label: string } | null>(null)
function openPreview(payload: { url: string; label: string }) {
  previewDoc.value = payload
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <h1 class="admin-page-title">Candidatures</h1>
      <p class="mt-1 text-sm text-slate-500">
        Validation des dossiers, émission des attestations et suivi des statuts.
      </p>

      <div class="mt-6 flex flex-wrap gap-2">
        <NuxtLink
          v-for="f in statusFilters"
          :key="f.value"
          :to="f.value ? `/admin/candidatures?status=${f.value}` : '/admin/candidatures'"
          class="rounded-full px-4 py-2 text-xs font-semibold transition"
          :class="
            filterStatus === f.value
              ? 'bg-primary text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-200'
          "
        >
          {{ f.label }}
        </NuxtLink>
      </div>

      <div class="mt-6 flex flex-col gap-4 md:hidden">
        <article
          v-for="d in filtered"
          :key="d.id"
          class="admin-dash-card space-y-4 p-4"
        >
          <div>
            <p class="font-semibold text-primary">{{ d.fullName }}</p>
            <p class="text-xs text-slate-500">{{ d.email }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ d.programmeTitre }} · {{ d.partnerName }}</p>
            <ApplicationStatusBadge :status="d.status" class="mt-2" />
          </div>
          <div class="flex flex-wrap gap-2">
            <AdminDocumentThumb
              v-if="d.identityCardRectoUrl"
              :url="d.identityCardRectoUrl"
              label="CNI recto"
              @open="openPreview"
            />
            <AdminDocumentThumb
              v-if="d.identityCardVersoUrl"
              :url="d.identityCardVersoUrl"
              label="CNI verso"
              @open="openPreview"
            />
            <AdminDocumentThumb
              v-if="d.documentUrl"
              :url="d.documentUrl"
              label="Attestation"
              @open="openPreview"
            />
            <span
              v-if="!d.identityCardRectoUrl && !d.identityCardVersoUrl && !d.documentUrl"
              class="text-xs text-slate-400"
            >
              Aucun document
            </span>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-500">Statut</label>
            <select v-model="draftFor(d).status" class="admin-input w-full">
              <option v-for="s in statusChoices" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-500">Attestation — importer un fichier (PDF ou image)</label>
            <CandidatureDocumentDropzone v-model="draftFor(d).documentDataUrl" label="Attestation" />
          </div>
          <button type="button" class="admin-btn-primary w-full" :disabled="saving[d.id]" @click="savePatch(d.id)">
            {{ saving[d.id] ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </article>
        <p v-if="!filtered.length" class="text-sm text-slate-500">Aucun dossier.</p>
      </div>

      <section class="admin-table-shell mt-6 hidden md:block">
        <table class="admin-table min-w-[1000px]">
          <thead>
            <tr>
              <th class="admin-th">Candidat</th>
              <th class="admin-th">Programme</th>
              <th class="admin-th">Partenaire</th>
              <th class="admin-th">Statut</th>
              <th class="admin-th">CNI</th>
              <th class="admin-th">URL attestation</th>
              <th class="admin-th" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in filtered" :key="d.id">
              <td class="admin-td">
                <p class="font-semibold text-primary">{{ d.fullName }}</p>
                <p class="text-xs text-slate-500">{{ d.email }}</p>
                <ApplicationStatusBadge :status="d.status" class="mt-2" />
              </td>
              <td class="admin-td">{{ d.programmeTitre }}</td>
              <td class="admin-td">{{ d.partnerName }}</td>
              <td class="admin-td">
                <select v-model="draftFor(d).status" class="admin-input text-xs">
                  <option v-for="s in statusChoices" :key="s" :value="s">{{ s }}</option>
                </select>
              </td>
              <td class="admin-td">
                <div class="flex flex-col gap-1.5">
                  <AdminDocumentThumb
                    v-if="d.identityCardRectoUrl"
                    :url="d.identityCardRectoUrl"
                    label="Recto"
                    @open="openPreview"
                  />
                  <AdminDocumentThumb
                    v-if="d.identityCardVersoUrl"
                    :url="d.identityCardVersoUrl"
                    label="Verso"
                    @open="openPreview"
                  />
                  <span v-if="!d.identityCardRectoUrl && !d.identityCardVersoUrl" class="text-xs text-slate-400">—</span>
                </div>
              </td>
              <td class="admin-td">
                <div class="min-w-[220px] space-y-2">
                  <AdminDocumentThumb
                    v-if="d.documentUrl"
                    :url="d.documentUrl"
                    label="Attestation actuelle"
                    @open="openPreview"
                  />
                  <CandidatureDocumentDropzone v-model="draftFor(d).documentDataUrl" label="Importer" />
                </div>
              </td>
              <td class="admin-td">
                <button type="button" class="admin-btn-primary text-xs" :disabled="saving[d.id]" @click="savePatch(d.id)">
                  {{ saving[d.id] ? '…' : 'Enregistrer' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filtered.length" class="p-6 text-sm text-slate-500">Aucun dossier.</p>
      </section>
    </main>

    <AdminDocumentPreviewModal :doc="previewDoc" @close="previewDoc = null" />
  </div>
</template>
