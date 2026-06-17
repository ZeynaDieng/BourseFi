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
  placesRestantes: number
  dateLimite: string
  conditions: string | null
  documentsRequis: string | null
  isActive: boolean
  programmeTitre: string
  partnerName: string
  candidaturesCount: number
}

type ProgrammeOpt = { id: string; slug: string; titre: string }
type PartnerOpt = { id: string; slug: string; name: string }

const bourses = ref<BourseRow[]>([])
const programmes = ref<ProgrammeOpt[]>([])
const partners = ref<PartnerOpt[]>([])
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
  placesRestantes: 20,
  dateLimite: '2026-12-31',
  conditions: '',
  documentsRequis: '',
  isActive: true,
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
    placesRestantes: row.placesRestantes,
    dateLimite: row.dateLimite.slice(0, 10),
    conditions: row.conditions ?? '',
    documentsRequis: row.documentsRequis ?? '',
    isActive: row.isActive,
  }
  drawerOpen.value = true
}

async function save() {
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
  try {
    await $fetch(`/api/admin/bourses/${row.id}`, {
      method: 'PATCH',
      body: { isActive: !row.isActive },
    })
    await loadAll()
  } catch (e) {
    alert(getAdminErrorMessage(e))
  } finally {
    togglingId.value = null
  }
}

async function remove(id: string) {
  if (!confirm('Supprimer cette bourse ?')) return
  await $fetch(`/api/admin/bourses/${id}`, { method: 'DELETE' })
  await loadAll()
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="admin-page-title">Bourses</h1>
          <p class="admin-page-desc">Offres de financement liées aux programmes.</p>
        </div>
        <button type="button" class="admin-btn-primary" @click="openCreate">Nouvelle bourse</button>
      </div>
      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Titre</th>
              <th class="admin-th">Programme</th>
              <th class="admin-th">Partenaire</th>
              <th class="admin-th">Couverture</th>
              <th class="admin-th">Places</th>
              <th class="admin-th">Statut</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in bourses" :key="b.id">
              <td class="admin-td font-semibold">{{ b.titre }}</td>
              <td class="admin-td">{{ b.programmeTitre }}</td>
              <td class="admin-td">{{ b.partnerName }}</td>
              <td class="admin-td">{{ b.coveragePercent }} %</td>
              <td class="admin-td">{{ b.placesRestantes }} / {{ b.quota }}</td>
              <td class="admin-td">
                <button
                  type="button"
                  class="rounded-full px-2.5 py-0.5 text-xs font-semibold transition"
                  :class="b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'"
                  :disabled="togglingId === b.id"
                  @click="toggleActive(b)"
                >
                  {{ b.isActive ? 'Active' : 'Inactive' }}
                </button>
              </td>
              <td class="admin-td text-right">
                <div class="flex justify-end gap-2">
                  <button type="button" class="admin-btn-secondary px-3 py-1.5 text-xs" @click="openEdit(b)">
                    Modifier
                  </button>
                  <button type="button" class="admin-btn-danger text-xs" @click="remove(b.id)">Suppr.</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <AdminDrawer v-model:open="drawerOpen" :title="editingId ? 'Modifier la bourse' : 'Créer une bourse'">
        <form class="space-y-4" @submit.prevent="save">
          <label class="admin-label">
            Slug
            <input v-model="form.slug" class="admin-input" required :readonly="Boolean(editingId)" />
          </label>
          <label class="admin-label">Titre<input v-model="form.titre" class="admin-input" required /></label>
          <label class="admin-label">
            Programme
            <select v-model="form.programmeId" class="admin-input" required>
              <option v-for="p in programmes" :key="p.id" :value="p.id">{{ p.titre }}</option>
            </select>
          </label>
          <label class="admin-label">
            Partenaire
            <select v-model="form.partnerId" class="admin-input" required>
              <option v-for="p in partners" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </label>
          <div class="grid grid-cols-2 gap-4">
            <label class="admin-label">
              Couverture %
              <input v-model.number="form.coveragePercent" type="number" min="0" max="100" class="admin-input" />
            </label>
            <label class="admin-label">
              Montant max (optionnel)
              <input v-model.number="form.montantMax" type="number" min="0" class="admin-input" />
            </label>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <label class="admin-label">
              Quota
              <input v-model.number="form.quota" type="number" min="0" class="admin-input" />
            </label>
            <label class="admin-label">
              Places restantes
              <input v-model.number="form.placesRestantes" type="number" min="0" class="admin-input" />
            </label>
          </div>
          <label class="admin-label">Date limite<input v-model="form.dateLimite" type="date" class="admin-input" /></label>
          <label class="admin-label">
            Conditions
            <textarea v-model="form.conditions" class="admin-input min-h-24" rows="3" />
          </label>
          <label class="admin-label">
            Documents requis
            <textarea v-model="form.documentsRequis" class="admin-input min-h-24" rows="3" />
          </label>
          <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input v-model="form.isActive" type="checkbox" class="rounded border-slate-300" />
            Bourse active (visible sur le site)
          </label>
          <button type="submit" class="admin-btn-primary w-full">Enregistrer</button>
        </form>
      </AdminDrawer>
    </main>
  </div>
</template>
