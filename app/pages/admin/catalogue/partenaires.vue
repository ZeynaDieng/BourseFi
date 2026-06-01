<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type PartnerRow = {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  contactEmail: string | null
  partnerSharePercent: number
  programmesCount: number
  usersCount: number
}

const items = ref<PartnerRow[]>([])
const drawerOpen = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = () => ({
  slug: '',
  name: '',
  logoUrl: '',
  contactEmail: '',
  partnerSharePercent: 75
})

const form = ref(emptyForm())

async function load() {
  items.value = await $fetch<PartnerRow[]>('/api/admin/partners')
}

await load()

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  drawerOpen.value = true
}

function openEdit(row: PartnerRow) {
  editingId.value = row.id
  form.value = {
    slug: row.slug,
    name: row.name,
    logoUrl: row.logoUrl ?? '',
    contactEmail: row.contactEmail ?? '',
    partnerSharePercent: row.partnerSharePercent
  }
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

async function submitDrawer() {
  const body = {
    slug: form.value.slug,
    name: form.value.name,
    logoUrl: form.value.logoUrl || null,
    contactEmail: form.value.contactEmail || null,
    partnerSharePercent: Number(form.value.partnerSharePercent)
  }
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/partners/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/partners', { method: 'POST', body })
    }
    closeDrawer()
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function remove(row: PartnerRow) {
  if (!confirm(`Supprimer « ${row.name} » ? Impossible s’il reste des programmes ou comptes liés.`)) return
  try {
    await $fetch(`/api/admin/partners/${row.id}`, { method: 'DELETE' })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

const drawerTitle = computed(() => (editingId.value ? 'Modifier le partenaire' : 'Nouveau partenaire'))
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="admin-page-title">Partenaires bailleurs</h2>
          <p class="admin-page-desc !mb-0">
            Rattachés aux programmes et aux flux financiers. Suppression impossible tant qu’il existe des programmes ou
            utilisateurs liés.
          </p>
        </div>
        <button type="button" class="admin-btn-primary" @click="openCreate">+ Ajouter</button>
      </div>

      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Slug</th>
              <th class="admin-th">Nom</th>
              <th class="admin-th text-right">Part %</th>
              <th class="admin-th text-center">Programmes</th>
              <th class="admin-th text-center">Comptes</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id" class="hover:bg-slate-50/80">
              <td class="admin-td admin-td-mono">{{ row.slug }}</td>
              <td class="admin-td font-semibold text-primary">{{ row.name }}</td>
              <td class="admin-td text-right">{{ row.partnerSharePercent }}</td>
              <td class="admin-td text-center">{{ row.programmesCount }}</td>
              <td class="admin-td text-center">{{ row.usersCount }}</td>
              <td class="admin-td text-right whitespace-nowrap">
                <button type="button" class="admin-btn-ghost mr-3" @click="openEdit(row)">Modifier</button>
                <button type="button" class="text-xs font-semibold text-red-600 hover:underline" @click="remove(row)">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminDrawer v-model:open="drawerOpen" :title="drawerTitle" size="lg" @close="closeDrawer">
        <div class="space-y-4">
          <label class="admin-label">
            Slug
            <input v-model="form.slug" class="admin-input font-mono text-xs" />
          </label>
          <label class="admin-label">
            Nom affiché
            <input v-model="form.name" class="admin-input" />
          </label>
          <label class="admin-label">
            Part du partenaire (%)
            <input v-model.number="form.partnerSharePercent" type="number" min="0" max="100" class="admin-input" />
          </label>
          <label class="admin-label">
            E-mail contact
            <input v-model="form.contactEmail" type="email" class="admin-input" />
          </label>
          <label class="admin-label">
            URL logo
            <input v-model="form.logoUrl" type="url" class="admin-input" />
          </label>
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
