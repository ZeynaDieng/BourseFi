<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'
import { SITE_CONTENT_LABELS } from '~/utils/site-content-labels'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type Row = { key: string; payload: unknown }

const keysList = ref<Row[]>([])
const drawerOpen = ref(false)
const selectedKey = ref('')
const seedPayload = ref<Record<string, unknown>>({})
const message = ref('')
const saving = ref(false)

const siteFormRef = ref<{ buildPayload: () => Record<string, unknown> } | null>(null)

function payloadSummary(payload: unknown) {
  if (payload === null || typeof payload !== 'object') return '—'
  try {
    const s = JSON.stringify(payload)
    const kb = Math.round((s.length / 1024) * 10) / 10
    const count = Array.isArray(payload) ? payload.length : Object.keys(payload as object).length
    const unit = Array.isArray(payload) ? 'éléments' : 'champs'
    return `${kb} ko · ${count} ${unit}`
  } catch {
    return '—'
  }
}

async function loadKeys() {
  const res = await $fetch<{ keys: Row[] }>('/api/admin/site-content')
  keysList.value = res.keys
}

await loadKeys()

const drawerTitle = computed(() => SITE_CONTENT_LABELS[selectedKey.value] || selectedKey.value)

function supportsForm(key: string) {
  return Boolean(SITE_CONTENT_LABELS[key])
}

function openDrawer(row: Row) {
  if (!supportsForm(row.key)) return
  message.value = ''
  selectedKey.value = row.key
  seedPayload.value = structuredClone((row.payload ?? {}) as Record<string, unknown>)
  drawerOpen.value = true
}

async function saveDrawer() {
  if (!selectedKey.value || !siteFormRef.value) return
  message.value = ''
  saving.value = true
  try {
    const payload = siteFormRef.value.buildPayload()
    await $fetch(`/api/admin/site-content/${encodeURIComponent(selectedKey.value)}`, {
      method: 'PUT',
      body: { payload }
    })
    drawerOpen.value = false
    await loadKeys()
  } catch (e: unknown) {
    message.value = getAdminErrorMessage(e)
  } finally {
    saving.value = false
  }
}

function closeDrawer() {
  drawerOpen.value = false
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <h2 class="admin-page-title">Blocs du site</h2>
      <p class="admin-page-desc">
        Modifiez les textes et visuels sans code : ouvrez un bloc dans le panneau latéral, adaptez les champs puis
        enregistrez.
      </p>

      <div class="mb-4 flex flex-wrap gap-2">
        <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          {{ keysList.length }} blocs
        </span>
      </div>

      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Bloc</th>
              <th class="admin-th font-mono text-[10px]">Identifiant</th>
              <th class="admin-th">Volume</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in keysList" :key="row.key" class="hover:bg-slate-50/80">
              <td class="admin-td font-semibold text-primary">
                {{ SITE_CONTENT_LABELS[row.key] || '—' }}
              </td>
              <td class="admin-td admin-td-mono text-[11px]">{{ row.key }}</td>
              <td class="admin-td text-slate-600">{{ payloadSummary(row.payload) }}</td>
              <td class="admin-td text-right">
                <button
                  type="button"
                  class="admin-btn-secondary px-3 py-1.5 text-xs"
                  :disabled="!supportsForm(row.key)"
                  @click="openDrawer(row)"
                >
                  {{ supportsForm(row.key) ? 'Modifier' : '—' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="message" class="mt-4 text-sm text-red-700">{{ message }}</p>

      <AdminDrawer
        v-model:open="drawerOpen"
        :title="drawerTitle"
        description="Tous les champs sont enregistrés dans la base et fusionnés avec les valeurs par défaut du projet."
        size="2xl"
        @close="closeDrawer"
      >
        <AdminSiteContentForm
          v-if="drawerOpen && selectedKey"
          ref="siteFormRef"
          :key="selectedKey"
          :content-key="selectedKey"
          :seed="seedPayload"
        />

        <template #footer>
          <div class="flex flex-wrap justify-end gap-2">
            <button type="button" class="admin-btn-secondary" @click="closeDrawer">Annuler</button>
            <button type="button" class="admin-btn-primary" :disabled="saving" @click="saveDrawer">
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </template>
      </AdminDrawer>
    </main>
  </div>
</template>
