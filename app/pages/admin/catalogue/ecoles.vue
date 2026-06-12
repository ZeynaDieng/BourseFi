<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type EcoleRow = {
  id: string
  slug: string
  nom: string
  ville: string
  accreditation: string | null
  site: string | null
  resume: string | null
  coverImageUrl: string | null
  logoUrl: string | null
  typeLabel: string | null
  _count: { programmes: number }
}

const items = ref<EcoleRow[]>([])
const drawerOpen = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = () => ({
  slug: '',
  nom: '',
  ville: '',
  accreditation: '',
  site: '',
  resume: '',
  coverImageUrl: '',
  logoUrl: '',
  typeLabel: ''
})

const form = ref(emptyForm())

async function load() {
  items.value = await $fetch<EcoleRow[]>('/api/admin/etablissements')
}

await load()

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  drawerOpen.value = true
}

function openEdit(row: EcoleRow) {
  editingId.value = row.id
  form.value = {
    slug: row.slug,
    nom: row.nom,
    ville: row.ville,
    accreditation: row.accreditation ?? '',
    site: row.site ?? '',
    resume: row.resume ?? '',
    coverImageUrl: row.coverImageUrl ?? '',
    logoUrl: row.logoUrl ?? '',
    typeLabel: row.typeLabel ?? ''
  }
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

async function submitDrawer() {
  const body = {
    slug: form.value.slug,
    nom: form.value.nom,
    ville: form.value.ville,
    accreditation: form.value.accreditation || null,
    site: form.value.site || null,
    resume: form.value.resume || null,
    coverImageUrl: form.value.coverImageUrl || null,
    logoUrl: form.value.logoUrl || null,
    typeLabel: form.value.typeLabel || null
  }
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/etablissements/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/etablissements', { method: 'POST', body })
    }
    closeDrawer()
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function remove(row: EcoleRow) {
  if (
    !confirm(
      `Supprimer ${row.nom}  et ses programmes ? Impossible s’il existe des candidatures liées.`
    )
  ) {
    return
  }
  try {
    await $fetch(`/api/admin/etablissements/${row.id}`, { method: 'DELETE' })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Suppression impossible.'))
  }
}

const drawerTitle = computed(() => (editingId.value ? 'Modifier l’établissement' : 'Nouvel établissement'))
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="admin-page-title">Écoles</h2>
          <p class="admin-page-desc !mb-0">
            Établissements du catalogue public. La suppression est bloquée tant que des candidatures existent sur les
            programmes liés.
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
              <th class="admin-th">Ville</th>
              <th class="admin-th text-center">Programmes</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in items" :key="e.id" class="hover:bg-slate-50/80">
              <td class="admin-td admin-td-mono">{{ e.slug }}</td>
              <td class="admin-td font-semibold text-primary">{{ e.nom }}</td>
              <td class="admin-td">{{ e.ville }}</td>
              <td class="admin-td text-center">{{ e._count.programmes }}</td>
              <td class="admin-td text-right whitespace-nowrap">
                <button type="button" class="admin-btn-ghost mr-3" @click="openEdit(e)">Modifier</button>
                <button type="button" class="text-xs font-semibold text-red-600 hover:underline" @click="remove(e)">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminDrawer v-model:open="drawerOpen" :title="drawerTitle" size="xl" @close="closeDrawer">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="admin-label">
            Slug
            <input v-model="form.slug" class="admin-input" />
          </label>
          <label class="admin-label">
            Ville
            <input v-model="form.ville" class="admin-input" />
          </label>
          <label class="admin-label sm:col-span-2">
            Nom
            <input v-model="form.nom" class="admin-input" />
          </label>
          <label class="admin-label">
            Type / libellé
            <input v-model="form.typeLabel" class="admin-input" />
          </label>
          <label class="admin-label">
            Site web
            <input v-model="form.site" type="url" class="admin-input" placeholder="https://…" />
          </label>
          <label class="admin-label sm:col-span-2">
            Accréditation
            <input v-model="form.accreditation" class="admin-input" />
          </label>
          <label class="admin-label sm:col-span-2">
            Résumé
            <textarea v-model="form.resume" rows="4" class="admin-input min-h-[96px]" />
          </label>
          <label class="admin-label">
            URL photo couverture
            <input v-model="form.coverImageUrl" type="url" class="admin-input" />
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
