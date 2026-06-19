<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'
import { useAdminListView } from '~/composables/useAdminListView'
import { useAdminDrawerLink } from '~/composables/useAdminDrawerLink'
import { downloadCsv } from '~/utils/admin-export'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type AuditRow = {
  id: string
  actorId: string | null
  actorName: string | null
  actorEmail: string | null
  actorRole: string
  action: string
  actionLabel: string
  entityType: string
  entityId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

type AuditDetail = AuditRow & {
  actor: { id: string; name: string; email: string; role: string } | null
}

type AuditResponse = {
  total: number
  items: AuditRow[]
  stats: {
    topActions: { action: string; label: string; count: number }[]
    topEntities: { entityType: string; count: number }[]
  }
}

const search = ref('')
const actionFilter = ref('')
const entityFilter = ref('')
const roleFilter = ref('')

const queryParams = computed(() => {
  const q: Record<string, string> = { limit: '200' }
  if (search.value.trim()) q.search = search.value.trim()
  if (actionFilter.value) q.action = actionFilter.value
  if (entityFilter.value) q.entityType = entityFilter.value
  if (roleFilter.value) q.actorRole = roleFilter.value
  return q
})

const { data, pending } = await useFetch<AuditResponse>(
  () => `/api/admin/audit-logs?${new URLSearchParams(queryParams.value).toString()}`,
  { watch: [queryParams] }
)

const drawerOpen = ref(false)
const selectedId = ref<string | null>(null)
const detail = ref<AuditDetail | null>(null)
const detailLoading = ref(false)

const items = computed(() => data.value?.items ?? [])

const { paginated, page, totalPages, toggleSort, sortIcon, resetPage } = useAdminListView(items, {
  pageSize: 25,
  defaultSort: { key: 'createdAt', dir: 'desc' },
})

watch([search, actionFilter, entityFilter, roleFilter], resetPage)

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMeta(meta: Record<string, unknown> | null): string {
  if (!meta || !Object.keys(meta).length) return '—'
  return Object.entries(meta)
    .map(([k, v]) => `${k} : ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join(' · ')
}

function actionTone(action: string) {
  if (action.includes('DELETE')) return 'bg-red-100 text-red-800'
  if (action.includes('CREATED') || action.includes('REGISTER')) return 'bg-emerald-100 text-emerald-800'
  if (action.includes('UPDATED') || action.includes('STATUS')) return 'bg-blue-100 text-blue-800'
  if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'bg-slate-100 text-slate-700'
  return 'bg-violet-100 text-violet-800'
}

async function openDetailById(id: string) {
  selectedId.value = id
  drawerOpen.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await $fetch<AuditDetail>(`/api/admin/audit-logs/${id}`)
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Impossible de charger l\'événement.'))
    drawerOpen.value = false
  } finally {
    detailLoading.value = false
  }
}

function openDetail(row: AuditRow) {
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

function exportLogs() {
  downloadCsv('audit-boursefi.csv', items.value, [
    { key: 'createdAt', header: 'Date', format: (v) => formatDate(String(v)) },
    { key: 'actorName', header: 'Acteur' },
    { key: 'actorRole', header: 'Rôle' },
    { key: 'actionLabel', header: 'Action' },
    { key: 'entityType', header: 'Entité' },
    { key: 'entityId', header: 'ID entité' },
    { key: 'metadata', header: 'Métadonnées', format: (v) => formatMeta(v as Record<string, unknown> | null) },
  ])
}

const actionOptions = computed(() => data.value?.stats.topActions ?? [])
const entityOptions = computed(() => data.value?.stats.topEntities ?? [])
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="admin-page-title">Journal d'audit</h1>
          <p class="admin-page-desc">Traçabilité des actions sensibles : auth, candidatures, catalogue, CMS…</p>
        </div>
        <button type="button" class="admin-btn-secondary text-sm" @click="exportLogs">Exporter CSV</button>
      </div>

      <!-- Stats rapides -->
      <div v-if="data?.stats" class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ data.total }}</p>
          <p class="text-xs text-slate-500">Événements (filtrés)</p>
        </div>
        <div
          v-for="a in data.stats.topActions.slice(0, 3)"
          :key="a.action"
          class="admin-dash-card p-4"
        >
          <p class="text-2xl font-bold text-primary">{{ a.count }}</p>
          <p class="truncate text-xs text-slate-500">{{ a.label }}</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mt-6 flex flex-wrap gap-3">
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher action, entité, ID…"
          class="admin-input min-w-[220px] flex-1"
        />
        <select v-model="actionFilter" class="admin-input w-auto bg-white">
          <option value="">Toutes les actions</option>
          <option v-for="a in actionOptions" :key="a.action" :value="a.action">
            {{ a.label }} ({{ a.count }})
          </option>
        </select>
        <select v-model="entityFilter" class="admin-input w-auto bg-white">
          <option value="">Toutes les entités</option>
          <option v-for="e in entityOptions" :key="e.entityType" :value="e.entityType">
            {{ e.entityType }} ({{ e.count }})
          </option>
        </select>
        <select v-model="roleFilter" class="admin-input w-auto bg-white">
          <option value="">Tous les rôles</option>
          <option value="ADMIN">Admin</option>
          <option value="STUDENT">Étudiant</option>
          <option value="PARTNER">Partenaire</option>
          <option value="ANONYMOUS">Anonyme</option>
        </select>
      </div>

      <p v-if="pending" class="mt-4 text-sm text-slate-500">Chargement…</p>

      <!-- Table -->
      <div class="admin-table-shell mt-4 hidden md:block">
        <table class="admin-table min-w-[960px]">
          <thead>
            <tr>
              <th class="admin-th">
                <button type="button" class="inline-flex items-center gap-1 font-semibold" @click="toggleSort('createdAt')">
                  Date
                  <span class="material-symbols-outlined text-[16px]">{{ sortIcon('createdAt') }}</span>
                </button>
              </th>
              <th class="admin-th">Acteur</th>
              <th class="admin-th">Action</th>
              <th class="admin-th">Entité</th>
              <th class="admin-th max-w-xs">Résumé</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in paginated" :key="log.id" class="hover:bg-slate-50/80">
              <td class="admin-td whitespace-nowrap text-xs text-slate-500">{{ formatDate(log.createdAt) }}</td>
              <td class="admin-td">
                <p class="text-sm font-semibold text-primary">{{ log.actorName ?? '—' }}</p>
                <p class="text-[11px] text-slate-400">{{ log.actorRole }}</p>
              </td>
              <td class="admin-td">
                <span class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="actionTone(log.action)">
                  {{ log.actionLabel }}
                </span>
              </td>
              <td class="admin-td text-sm">
                {{ log.entityType }}
                <p v-if="log.entityId" class="truncate font-mono text-[10px] text-slate-400">{{ log.entityId }}</p>
              </td>
              <td class="admin-td max-w-xs truncate text-xs text-slate-600">
                {{ formatMeta(log.metadata) }}
              </td>
              <td class="admin-td text-right">
                <button type="button" class="admin-btn-ghost" @click="openDetail(log)">Détail</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!paginated.length && !pending" class="p-6 text-sm text-slate-500">Aucun événement.</p>
        <AdminPagination v-model:page="page" :total-pages="totalPages" :total-items="items.length" />
      </div>

      <!-- Mobile -->
      <div class="mt-4 flex flex-col gap-3 md:hidden">
        <article v-for="log in paginated" :key="log.id" class="admin-dash-card space-y-2 p-4">
          <div class="flex items-start justify-between gap-2">
            <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="actionTone(log.action)">
              {{ log.actionLabel }}
            </span>
            <span class="text-[10px] text-slate-400">{{ formatDate(log.createdAt) }}</span>
          </div>
          <p class="text-sm font-semibold text-primary">{{ log.actorName ?? log.actorRole }}</p>
          <p class="text-xs text-slate-500">{{ log.entityType }}</p>
          <button type="button" class="admin-btn-primary w-full text-sm" @click="openDetail(log)">Détail</button>
        </article>
        <AdminPagination v-model:page="page" :total-pages="totalPages" :total-items="items.length" />
      </div>
    </main>

    <AdminDrawer
      v-model:open="drawerOpen"
      :title="detail?.actionLabel ?? 'Événement audit'"
      :description="detail ? formatDate(detail.createdAt) : ''"
      size="lg"
      @close="onDrawerClose"
    >
      <div v-if="detailLoading" class="py-12 text-center text-sm text-slate-500">Chargement…</div>
      <div v-else-if="detail" class="space-y-5">
        <section class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="actionTone(detail.action)">
            {{ detail.actionLabel }}
          </span>
          <p class="mt-2 font-mono text-xs text-slate-500">{{ detail.action }}</p>
        </section>

        <section>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Acteur</p>
          <dl class="mt-2 grid gap-2 text-sm">
            <div v-if="detail.actor">
              <dt class="text-slate-400">Nom</dt>
              <dd class="font-medium">{{ detail.actor.name }}</dd>
            </div>
            <div v-if="detail.actor?.email">
              <dt class="text-slate-400">Email</dt>
              <dd>{{ detail.actor.email }}</dd>
            </div>
            <div>
              <dt class="text-slate-400">Rôle session</dt>
              <dd>{{ detail.actorRole }}</dd>
            </div>
          </dl>
        </section>

        <section>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Cible</p>
          <dl class="mt-2 grid gap-2 text-sm">
            <div><dt class="text-slate-400">Type</dt><dd>{{ detail.entityType }}</dd></div>
            <div v-if="detail.entityId">
              <dt class="text-slate-400">Identifiant</dt>
              <dd class="break-all font-mono text-xs">{{ detail.entityId }}</dd>
            </div>
          </dl>
        </section>

        <section v-if="detail.metadata && Object.keys(detail.metadata).length">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Métadonnées</p>
          <pre class="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{{ JSON.stringify(detail.metadata, null, 2) }}</pre>
        </section>
      </div>
    </AdminDrawer>
  </div>
</template>
