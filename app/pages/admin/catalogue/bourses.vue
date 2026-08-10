<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type BourseRow = {
  id: string
  slug: string
  titre: string
  programmeId: string
  partnerId: string
  coveragePercent: number
  montantMax: number | null
  quota: number
  dateLimite: string
  conditions: string | null
  documentsRequis: string | null
  isActive: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  programmeTitre: string
  partnerName: string
  candidaturesCount: number
}

type ProgrammeOpt = { id: string; slug: string; titre: string }
type PartnerOpt = { id: string; slug: string; name: string }

const bourses = ref<BourseRow[]>([])
const programmes = ref<ProgrammeOpt[]>([])
const partners = ref<PartnerOpt[]>([])
const searchQ = ref('')
const statusFilter = ref<string>('ALL')
const drawerOpen = ref(false)
const editingId = ref<string | null>(null)
const togglingId = ref<string | null>(null)

const emptyForm = () => ({
  slug: '',
  titre: '',
  programmeId: '',
  partnerId: '',
  coveragePercent: 50,
  montantMax: null as number | null,
  quota: 20,
  dateLimite: '2026-12-31',
  conditions: '',
  documentsRequis: '',
  isActive: true,
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
})

const form = ref(emptyForm())

async function loadAll() {
  const [b, p, part] = await Promise.all([
    $fetch<BourseRow[]>('/api/admin/bourses'),
    $fetch<Array<{ id: string; slug: string; titre: string }>>('/api/admin/programmes'),
    $fetch<Array<{ id: string; slug: string; name: string }>>('/api/admin/partners'),
  ])
  bourses.value = b
  programmes.value = p.map((x) => ({ id: x.id, slug: x.slug, titre: x.titre }))
  partners.value = part.map((x) => ({ id: x.id, slug: x.slug, name: x.name }))
}

await loadAll()

const filteredBourses = computed(() => {
  let res = bourses.value
  if (statusFilter.value !== 'ALL') {
    res = res.filter((b) => (b.status || (b.isActive ? 'ACTIVE' : 'INACTIVE')) === statusFilter.value)
  }
  if (searchQ.value.trim()) {
    const q = searchQ.value.toLowerCase()
    res = res.filter(
      (b) =>
        b.titre.toLowerCase().includes(q) ||
        b.programmeTitre.toLowerCase().includes(q) ||
        b.partnerName.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q)
    )
  }
  return res
})

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  if (programmes.value[0]) form.value.programmeId = programmes.value[0].id
  if (partners.value[0]) form.value.partnerId = partners.value[0].id
  drawerOpen.value = true
}

function openEdit(row: BourseRow) {
  editingId.value = row.id
  form.value = {
    slug: row.slug,
    titre: row.titre,
    programmeId: row.programmeId,
    partnerId: row.partnerId,
    coveragePercent: row.coveragePercent,
    montantMax: row.montantMax,
    quota: row.quota,
    dateLimite: row.dateLimite ? row.dateLimite.slice(0, 10) : '2026-12-31',
    conditions: row.conditions ?? '',
    documentsRequis: row.documentsRequis ?? '',
    isActive: row.isActive,
    status: row.status || (row.isActive ? 'ACTIVE' : 'INACTIVE'),
  }
  drawerOpen.value = true
}

async function save() {
  if (form.value.coveragePercent < 0 || form.value.coveragePercent > 100) {
    alert('Le pourcentage de prise en charge doit être compris entre 0 et 100 %.')
    return
  }

  try {
    const body = {
      ...form.value,
      montantMax: form.value.montantMax && form.value.montantMax > 0 ? form.value.montantMax : null,
      conditions: form.value.conditions.trim() || null,
      documentsRequis: form.value.documentsRequis.trim() || null,
    }
    if (editingId.value) {
      await $fetch(`/api/admin/bourses/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/bourses', { method: 'POST', body })
    }
    drawerOpen.value = false
    await loadAll()
  } catch (e) {
    alert(getAdminErrorMessage(e))
  }
}

async function toggleActive(row: BourseRow) {
  togglingId.value = row.id
  const nextStatus = row.status === 'ACTIVE' || row.isActive ? 'INACTIVE' : 'ACTIVE'
  try {
    await $fetch(`/api/admin/bourses/${row.id}`, {
      method: 'PATCH',
      body: { status: nextStatus },
    })
    await loadAll()
  } catch (e) {
    alert(getAdminErrorMessage(e))
  } finally {
    togglingId.value = null
  }
}

async function remove(id: string) {
  if (!confirm('Archiver cette bourse ? Les candidatures historiques resteront conservées.')) return
  await $fetch(`/api/admin/bourses/${id}`, { method: 'DELETE' })
  await loadAll()
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50/50">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="admin-page-title">Gestion des Bourses</h1>
          <p class="admin-page-desc">Offres de financement et pourcentages de prise en charge administrables.</p>
        </div>
        <button type="button" class="admin-btn-primary" @click="openCreate">Nouvelle bourse</button>
      </div>

      <!-- Filtres -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div class="flex flex-1 items-center gap-3">
          <div class="relative flex-1 max-w-md">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            <input
              v-model="searchQ"
              type="text"
              placeholder="Rechercher par titre, programme, partenaire..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>
          <select
            v-model="statusFilter"
            class="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actives</option>
            <option value="INACTIVE">Inactives</option>
            <option value="ARCHIVED">Archivées</option>
          </select>
        </div>
        <div class="text-xs font-semibold text-slate-500">
          {{ filteredBourses.length }} bourse{{ filteredBourses.length > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Tableau -->
      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Titre de la bourse</th>
              <th class="admin-th">Programme lié</th>
              <th class="admin-th">Partenaire</th>
              <th class="admin-th text-center">Prise en charge</th>
              <th class="admin-th text-center">Statut</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in filteredBourses" :key="b.id" class="hover:bg-slate-50/80">
              <td class="admin-td font-semibold text-primary">
                <NuxtLink :to="`/bourses/${b.slug}`" target="_blank" class="hover:underline flex items-center gap-1">
                  {{ b.titre }}
                  <span class="material-symbols-outlined text-xs text-slate-400">open_in_new</span>
                </NuxtLink>
                <div class="text-xs font-mono text-slate-400">{{ b.slug }}</div>
              </td>
              <td class="admin-td text-slate-700">{{ b.programmeTitre }}</td>
              <td class="admin-td text-slate-600">{{ b.partnerName }}</td>
              <td class="admin-td text-center">
                <span class="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                  {{ b.coveragePercent }} % de prise en charge
                </span>
              </td>
              <td class="admin-td text-center">
                <button
                  type="button"
                  class="rounded-full px-2.5 py-0.5 text-xs font-bold transition"
                  :class="{
                    'bg-emerald-100 text-emerald-800 hover:bg-emerald-200': b.status === 'ACTIVE' || b.isActive,
                    'bg-slate-100 text-slate-600 hover:bg-slate-200': b.status === 'INACTIVE',
                    'bg-red-100 text-red-700': b.status === 'ARCHIVED'
                  }"
                  :disabled="togglingId === b.id"
                  @click="toggleActive(b)"
                >
                  {{ b.status || (b.isActive ? 'ACTIVE' : 'INACTIVE') }}
                </button>
              </td>
              <td class="admin-td text-right whitespace-nowrap">
                <NuxtLink
                  :to="`/bourses/${b.slug}`"
                  target="_blank"
                  class="admin-btn-ghost mr-2 text-xs"
                >
                  Voir
                </NuxtLink>
                <button type="button" class="admin-btn-secondary px-3 py-1.5 text-xs mr-2" @click="openEdit(b)">
                  Modifier
                </button>
                <button type="button" class="text-xs font-semibold text-red-600 hover:underline" @click="remove(b.id)">
                  Archiver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Drawer édition -->
      <AdminDrawer v-model:open="drawerOpen" :title="editingId ? 'Modifier la bourse' : 'Créer une bourse'">
        <form class="space-y-4" @submit.prevent="save">
          <label class="admin-label">
            Slug
            <input v-model="form.slug" class="admin-input font-mono text-xs" required :readonly="Boolean(editingId)" />
          </label>
          <label class="admin-label">Titre de la bourse<input v-model="form.titre" class="admin-input" required /></label>
          <label class="admin-label">
            Programme lié
            <select v-model="form.programmeId" class="admin-input" required>
              <option v-for="p in programmes" :key="p.id" :value="p.id">{{ p.titre }}</option>
            </select>
          </label>
          <label class="admin-label">
            Partenaire bailleur
            <select v-model="form.partnerId" class="admin-input" required>
              <option v-for="p in partners" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </label>
          <div class="grid grid-cols-2 gap-4">
            <label class="admin-label">
              Pourcentage de prise en charge (0-100 %)
              <input v-model.number="form.coveragePercent" type="number" min="0" max="100" class="admin-input" required />
            </label>
            <label class="admin-label">
              Montant max financé (FCFA, optionnel)
              <input v-model.number="form.montantMax" type="number" min="0" class="admin-input" />
            </label>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <label class="admin-label">
              Quota de places
              <input v-model.number="form.quota" type="number" min="0" class="admin-input" />
            </label>
            <label class="admin-label">
              Statut
              <select v-model="form.status" class="admin-input" @change="form.isActive = form.status === 'ACTIVE'">
                <option value="ACTIVE">ACTIVE (Visible)</option>
                <option value="INACTIVE">INACTIVE (Masquée)</option>
                <option value="ARCHIVED">ARCHIVED (Archivée)</option>
              </select>
            </label>
          </div>
          <label class="admin-label">Date limite de candidature<input v-model="form.dateLimite" type="date" class="admin-input" /></label>
          <label class="admin-label">
            Conditions d'attribution
            <textarea v-model="form.conditions" class="admin-input min-h-24" rows="3" />
          </label>
          <label class="admin-label">
            Documents requis
            <textarea v-model="form.documentsRequis" class="admin-input min-h-24" rows="3" />
          </label>
          <button type="submit" class="admin-btn-primary w-full">Enregistrer la bourse</button>
        </form>
      </AdminDrawer>
    </main>
  </div>
</template>
