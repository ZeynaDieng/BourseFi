<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type Row = {
  id: string
  sortOrder: number
  published: boolean
  initials: string | null
  name: string
  role: string
  quote: string
  avatarUrl: string | null
}

const items = ref<Row[]>([])
const drawerOpen = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = () => ({
  name: '',
  role: '',
  quote: '',
  initials: '',
  avatarUrl: '',
  published: true,
  sortOrder: 0
})

const form = ref(emptyForm())

function truncate(s: string, n = 64) {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= n ? t : `${t.slice(0, n)}…`
}

async function load() {
  items.value = await $fetch<Row[]>('/api/admin/testimonials')
}

await load()

function openCreate() {
  editingId.value = null
  const max = items.value.reduce((m, x) => Math.max(m, x.sortOrder), -1)
  form.value = { ...emptyForm(), sortOrder: max + 1 }
  drawerOpen.value = true
}

function openEdit(row: Row) {
  editingId.value = row.id
  form.value = {
    name: row.name,
    role: row.role,
    quote: row.quote,
    initials: row.initials ?? '',
    avatarUrl: row.avatarUrl ?? '',
    published: row.published,
    sortOrder: row.sortOrder
  }
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

async function submitDrawer() {
  if (!form.value.name.trim() || !form.value.role.trim() || !form.value.quote.trim()) return
  try {
    const body = {
      ...form.value,
      initials: form.value.initials.trim() || null,
      avatarUrl: form.value.avatarUrl.trim() || null
    }
    if (editingId.value) {
      await $fetch(`/api/admin/testimonials/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/testimonials', { method: 'POST', body })
    }
    closeDrawer()
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function togglePublished(row: Row) {
  try {
    await $fetch(`/api/admin/testimonials/${row.id}`, {
      method: 'PATCH',
      body: { published: !row.published }
    })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function remove(row: Row) {
  if (!confirm('Supprimer ce témoignage ?')) return
  try {
    await $fetch(`/api/admin/testimonials/${row.id}`, { method: 'DELETE' })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

const drawerTitle = computed(() => (editingId.value ? 'Modifier le témoignage' : 'Nouveau témoignage'))
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="admin-page-title">Témoignages</h2>
          <p class="admin-page-desc !mb-0">Citations affichées sur la landing.</p>
        </div>
        <button type="button" class="admin-btn-primary" @click="openCreate">+ Ajouter</button>
      </div>

      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th w-20">Ordre</th>
              <th class="admin-th">Nom</th>
              <th class="admin-th">Rôle</th>
              <th class="admin-th max-w-xs">Citation</th>
              <th class="admin-th w-28">Statut</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id" class="hover:bg-slate-50/80">
              <td class="admin-td text-center font-mono text-xs">{{ row.sortOrder }}</td>
              <td class="admin-td font-semibold text-primary">{{ row.name }}</td>
              <td class="admin-td text-slate-600">{{ row.role }}</td>
              <td class="admin-td max-w-xs text-slate-600">{{ truncate(row.quote, 80) }}</td>
              <td class="admin-td">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="row.published ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'"
                >
                  {{ row.published ? 'Publié' : 'Masqué' }}
                </span>
              </td>
              <td class="admin-td text-right whitespace-nowrap">
                <button type="button" class="admin-btn-ghost mr-2" @click="openEdit(row)">Modifier</button>
                <button type="button" class="admin-btn-ghost mr-2" @click="togglePublished(row)">
                  {{ row.published ? 'Masquer' : 'Publier' }}
                </button>
                <button type="button" class="text-xs font-semibold text-red-600 hover:underline" @click="remove(row)">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminDrawer v-model:open="drawerOpen" :title="drawerTitle" size="xl" @close="closeDrawer">
        <div class="space-y-4">
          <label class="admin-label">
            Ordre
            <input v-model.number="form.sortOrder" type="number" class="admin-input" />
          </label>
          <label class="admin-label flex items-center gap-2 !normal-case">
            <input v-model="form.published" type="checkbox" class="mt-0 h-4 w-4 rounded border-slate-300" />
            <span class="text-sm font-normal text-slate-800">Publié sur le site</span>
          </label>
          <label class="admin-label">Nom</label>
          <input v-model="form.name" class="admin-input" />
          <label class="admin-label">Rôle ou contexte</label>
          <input v-model="form.role" class="admin-input" />
          <label class="admin-label">Citation</label>
          <textarea v-model="form.quote" rows="6" class="admin-input min-h-[120px]" />
          <label class="admin-label">Initiales (optionnel, max 8 car.)</label>
          <input v-model="form.initials" class="admin-input" maxlength="8" />
          <label class="admin-label">URL photo (optionnel)</label>
          <input v-model="form.avatarUrl" type="url" class="admin-input" placeholder="https://…" />
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-btn-secondary" @click="closeDrawer">Annuler</button>
            <button type="button" class="admin-btn-primary" @click="submitDrawer">Enregistrer</button>
          </div>
        </template>
      </AdminDrawer>
    </main>
  </div>
</template>
