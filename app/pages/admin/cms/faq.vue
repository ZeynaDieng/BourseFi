<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type FaqRow = {
  id: string
  sortOrder: number
  published: boolean
  question: string
  answer: string
}

const items = ref<FaqRow[]>([])
const drawerOpen = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = () => ({
  question: '',
  answer: '',
  published: true,
  sortOrder: 0
})

const form = ref(emptyForm())

async function load() {
  items.value = await $fetch<FaqRow[]>('/api/admin/faq')
}

await load()

function truncate(s: string, n = 72) {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= n ? t : `${t.slice(0, n)}…`
}

function openCreate() {
  editingId.value = null
  const max = items.value.reduce((m, x) => Math.max(m, x.sortOrder), -1)
  form.value = { ...emptyForm(), sortOrder: max + 1 }
  drawerOpen.value = true
}

function openEdit(row: FaqRow) {
  editingId.value = row.id
  form.value = {
    question: row.question,
    answer: row.answer,
    published: row.published,
    sortOrder: row.sortOrder
  }
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

async function submitDrawer() {
  if (!form.value.question.trim() || !form.value.answer.trim()) return
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/faq/${editingId.value}`, { method: 'PATCH', body: form.value })
    } else {
      await $fetch('/api/admin/faq', { method: 'POST', body: form.value })
    }
    closeDrawer()
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function togglePublished(row: FaqRow) {
  try {
    await $fetch(`/api/admin/faq/${row.id}`, {
      method: 'PATCH',
      body: { published: !row.published }
    })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function remove(row: FaqRow) {
  if (!confirm('Supprimer cette entrée ?')) return
  try {
    await $fetch(`/api/admin/faq/${row.id}`, { method: 'DELETE' })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

const drawerTitle = computed(() => (editingId.value ? 'Modifier une question' : 'Nouvelle question FAQ'))
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="admin-page-title">FAQ</h2>
          <p class="admin-page-desc !mb-0">
            Questions-réponses du site. L’ordre d’affichage suit le champ numérique « Ordre ».
          </p>
        </div>
        <button type="button" class="admin-btn-primary" @click="openCreate">+ Ajouter</button>
      </div>

      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th w-20">Ordre</th>
              <th class="admin-th">Question</th>
              <th class="admin-th max-w-[280px]">Réponse</th>
              <th class="admin-th w-28">Statut</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id" class="hover:bg-slate-50/80">
              <td class="admin-td text-center font-mono text-xs">{{ row.sortOrder }}</td>
              <td class="admin-td font-semibold text-primary">{{ row.question }}</td>
              <td class="admin-td max-w-[280px] text-slate-600">{{ truncate(row.answer, 96) }}</td>
              <td class="admin-td">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="row.published ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'"
                >
                  {{ row.published ? 'Publiée' : 'Masquée' }}
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
            Ordre d’affichage
            <input v-model.number="form.sortOrder" type="number" class="admin-input" />
          </label>
          <label class="admin-label flex items-center gap-2 !normal-case">
            <input v-model="form.published" type="checkbox" class="mt-0 h-4 w-4 rounded border-slate-300" />
            <span class="text-sm font-normal text-slate-800">Visible sur le site</span>
          </label>
          <label class="admin-label">Question</label>
          <input v-model="form.question" class="admin-input" placeholder="Question" />
          <label class="admin-label">Réponse</label>
          <textarea v-model="form.answer" rows="8" class="admin-input min-h-[160px]" placeholder="Réponse complète" />
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
