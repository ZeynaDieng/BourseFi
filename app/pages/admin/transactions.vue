<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'
import { useAdminListView } from '~/composables/useAdminListView'
import { useAdminDrawerLink } from '~/composables/useAdminDrawerLink'
import { copyToClipboard, downloadCsv } from '~/utils/admin-export'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type TransactionRow = {
  id: string
  userId: string
  candidatureId: string | null
  fullName: string
  email: string
  phone: string
  amount: number
  amountPartner: number
  amountPlatform: number
  currency: string
  method: string
  status: string
  provider: string | null
  refCommand: string | null
  programme: string | null
  programmeTitre: string | null
  partnerName: string | null
  createdAt: string
}

type TransactionDetail = TransactionRow & {
  token: string | null
  user: { id: string; name: string; email: string; phone: string | null }
  candidature: {
    id: string
    fullName: string
    status: string
    targetProgram: string
    programme: { titre: string; slug: string }
    partner: { name: string; slug: string }
  } | null
}

type TransactionsResponse = {
  totals: {
    count: number
    amount: number
    amountPartner: number
    amountPlatform: number
  }
  items: TransactionRow[]
}

const { data } = await useFetch<TransactionsResponse>('/api/admin/transactions')

const search = ref('')
const statusFilter = ref('')
const methodFilter = ref('')
const periodFilter = ref('')
const drawerOpen = ref(false)
const selectedId = ref<string | null>(null)
const detail = ref<TransactionDetail | null>(null)
const detailLoading = ref(false)

function formatStatus(status: string) {
  const map: Record<string, string> = {
    Valide: 'Validé',
    VALIDE: 'Validé',
    PENDING: 'En attente',
    EN_ATTENTE: 'En attente',
    COMPLETED: 'Validé',
    FAILED: 'Échoué',
    ECHEC: 'Échoué',
    REFUNDED: 'Remboursé',
  }
  return map[status] ?? status
}

function formatMethod(method: string) {
  const map: Record<string, string> = {
    WAVE: 'Wave',
    ORANGE_MONEY: 'Orange Money',
    CARD: 'Carte',
    BANK: 'Virement',
  }
  return map[method] ?? method
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusOptions = computed(() => {
  const set = new Set((data.value?.items ?? []).map((t) => t.status))
  return Array.from(set).sort()
})

const methodOptions = computed(() => {
  const set = new Set((data.value?.items ?? []).map((t) => t.method))
  return Array.from(set).sort()
})

const filtered = computed(() => {
  let list = data.value?.items ?? []
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.refCommand ?? '').toLowerCase().includes(q) ||
        (t.programmeTitre ?? t.programme ?? '').toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) list = list.filter((t) => t.status === statusFilter.value)
  if (methodFilter.value) list = list.filter((t) => t.method === methodFilter.value)
  if (periodFilter.value) {
    const since = periodStart(periodFilter.value)
    if (since) list = list.filter((t) => new Date(t.createdAt) >= since)
  }
  return list
})

function periodStart(period: string) {
  const now = new Date()
  if (period === '7d') return new Date(now.getTime() - 7 * 86400000)
  if (period === '30d') return new Date(now.getTime() - 30 * 86400000)
  if (period === '90d') return new Date(now.getTime() - 90 * 86400000)
  return null
}

const { paginated, page, totalPages, sorted, toggleSort, sortIcon, resetPage } = useAdminListView(filtered, {
  pageSize: 20,
  defaultSort: { key: 'createdAt', dir: 'desc' },
})

watch([search, statusFilter, methodFilter, periodFilter], resetPage)

const filteredTotals = computed(() => ({
  count: filtered.value.length,
  amount: filtered.value.reduce((s, t) => s + t.amount, 0),
  amountPlatform: filtered.value.reduce((s, t) => s + t.amountPlatform, 0),
}))

async function loadDetail(id: string) {
  selectedId.value = id
  drawerOpen.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await $fetch<TransactionDetail>(`/api/admin/transactions/${id}`)
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Impossible de charger le paiement.'))
    drawerOpen.value = false
  } finally {
    detailLoading.value = false
  }
}

async function openDetailById(id: string) {
  await loadDetail(id)
}

function openDetail(row: TransactionRow) {
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

function exportTransactions() {
  downloadCsv('paiements-boursefi.csv', sorted.value, [
    { key: 'fullName', header: 'Payeur' },
    { key: 'email', header: 'Email' },
    { key: 'amount', header: 'Montant' },
    { key: 'currency', header: 'Devise' },
    { key: 'status', header: 'Statut', format: (v) => formatStatus(String(v)) },
    { key: 'method', header: 'Méthode', format: (v) => formatMethod(String(v)) },
    { key: 'amountPlatform', header: 'Commission' },
    { key: 'refCommand', header: 'Référence' },
    { key: 'programmeTitre', header: 'Programme' },
    { key: 'createdAt', header: 'Date', format: (v) => formatDate(String(v)) },
  ])
}

async function copyRef(text: string) {
  if (await copyToClipboard(text)) alert('Référence copiée.')
}

function statusClass(status: string) {
  const s = status.toLowerCase()
  if (s.includes('valid') || s.includes('completed')) return 'bg-emerald-100 text-emerald-800'
  if (s.includes('pending') || s.includes('attente')) return 'bg-amber-100 text-amber-800'
  if (s.includes('fail') || s.includes('echec')) return 'bg-red-100 text-red-800'
  return 'bg-slate-100 text-slate-700'
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <h1 class="admin-page-title">Paiements</h1>
      <p class="admin-page-desc">Historique des transactions, statuts et commissions plateforme.</p>

      <!-- Stats globales -->
      <div v-if="data?.totals" class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ data.totals.count }}</p>
          <p class="text-xs text-slate-500">Paiements total</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ data.totals.amount.toLocaleString('fr-FR') }}</p>
          <p class="text-xs text-slate-500">Volume (FCFA)</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ data.totals.amountPartner.toLocaleString('fr-FR') }}</p>
          <p class="text-xs text-slate-500">Partenaires (FCFA)</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-emerald-600">{{ data.totals.amountPlatform.toLocaleString('fr-FR') }}</p>
          <p class="text-xs text-slate-500">Commissions (FCFA)</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mt-6 flex flex-wrap gap-3">
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher nom, email, référence, programme…"
          class="admin-input min-w-[220px] flex-1"
        />
        <select v-model="statusFilter" class="admin-input w-auto bg-white">
          <option value="">Tous les statuts</option>
          <option v-for="s in statusOptions" :key="s" :value="s">{{ formatStatus(s) }}</option>
        </select>
        <select v-model="methodFilter" class="admin-input w-auto bg-white">
          <option value="">Toutes les méthodes</option>
          <option v-for="m in methodOptions" :key="m" :value="m">{{ formatMethod(m) }}</option>
        </select>
        <select v-model="periodFilter" class="admin-input w-auto bg-white">
          <option value="">Toute période</option>
          <option value="7d">7 jours</option>
          <option value="30d">30 jours</option>
          <option value="90d">90 jours</option>
        </select>
        <button type="button" class="admin-btn-secondary text-sm" @click="exportTransactions">Exporter CSV</button>
      </div>

      <p v-if="search || statusFilter || methodFilter" class="mt-3 text-xs text-slate-500">
        {{ filteredTotals.count }} résultat(s) · {{ filteredTotals.amount.toLocaleString('fr-FR') }} FCFA
        · commissions {{ filteredTotals.amountPlatform.toLocaleString('fr-FR') }} FCFA
      </p>

      <!-- Table desktop -->
      <div class="admin-table-shell mt-4 hidden md:block">
        <table class="admin-table min-w-[960px]">
          <thead>
            <tr>
              <th class="admin-th">Payeur</th>
              <th class="admin-th">
                <button type="button" class="inline-flex items-center gap-1 font-semibold" @click="toggleSort('amount')">
                  Montant
                  <span class="material-symbols-outlined text-[16px]">{{ sortIcon('amount') }}</span>
                </button>
              </th>
              <th class="admin-th">Statut</th>
              <th class="admin-th">Méthode</th>
              <th class="admin-th">Commission</th>
              <th class="admin-th">Programme</th>
              <th class="admin-th">
                <button type="button" class="inline-flex items-center gap-1 font-semibold" @click="toggleSort('createdAt')">
                  Date
                  <span class="material-symbols-outlined text-[16px]">{{ sortIcon('createdAt') }}</span>
                </button>
              </th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in paginated" :key="t.id" class="hover:bg-slate-50/80">
              <td class="admin-td">
                <p class="font-semibold text-primary">{{ t.fullName }}</p>
                <p class="text-xs text-slate-500">{{ t.email }}</p>
                <p v-if="t.refCommand" class="text-[11px] text-slate-400">Réf. {{ t.refCommand }}</p>
              </td>
              <td class="admin-td font-semibold">
                {{ t.amount.toLocaleString('fr-FR') }} {{ t.currency }}
              </td>
              <td class="admin-td">
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusClass(t.status)">
                  {{ formatStatus(t.status) }}
                </span>
              </td>
              <td class="admin-td text-sm">{{ formatMethod(t.method) }}</td>
              <td class="admin-td text-sm">{{ t.amountPlatform.toLocaleString('fr-FR') }} {{ t.currency }}</td>
              <td class="admin-td">
                <p class="text-sm">{{ t.programmeTitre ?? t.programme ?? '—' }}</p>
                <p v-if="t.partnerName" class="text-xs text-slate-400">{{ t.partnerName }}</p>
              </td>
              <td class="admin-td text-xs text-slate-500">{{ formatDate(t.createdAt) }}</td>
              <td class="admin-td text-right">
                <button type="button" class="admin-btn-ghost" @click="openDetail(t)">Voir détail</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!paginated.length" class="p-6 text-sm text-slate-500">Aucune transaction.</p>
        <AdminPagination v-model:page="page" :total-pages="totalPages" :total-items="filtered.length" />
      </div>

      <!-- Cards mobile -->
      <div class="mt-4 flex flex-col gap-3 md:hidden">
        <article v-for="t in paginated" :key="t.id" class="admin-dash-card space-y-3 p-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold text-primary">{{ t.fullName }}</p>
              <p class="text-xs text-slate-500">{{ t.email }}</p>
            </div>
            <p class="font-bold text-primary">{{ t.amount.toLocaleString('fr-FR') }} {{ t.currency }}</p>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="rounded-full px-2 py-0.5 font-semibold" :class="statusClass(t.status)">
              {{ formatStatus(t.status) }}
            </span>
            <span class="text-slate-500">{{ formatMethod(t.method) }}</span>
          </div>
          <button type="button" class="admin-btn-primary w-full text-sm" @click="openDetail(t)">Voir détail</button>
        </article>
        <AdminPagination v-model:page="page" :total-pages="totalPages" :total-items="filtered.length" />
        <p v-if="!paginated.length" class="text-sm text-slate-500">Aucune transaction.</p>
      </div>
    </main>

    <!-- Drawer détail paiement -->
    <AdminDrawer
      v-model:open="drawerOpen"
      :title="detail ? `${detail.amount.toLocaleString('fr-FR')} ${detail.currency}` : 'Paiement'"
      :description="detail?.fullName"
      size="lg"
      @close="onDrawerClose"
    >
      <div v-if="detailLoading" class="py-12 text-center text-sm text-slate-500">Chargement…</div>

      <div v-else-if="detail" class="space-y-6">
        <section class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusClass(detail.status)">
              {{ formatStatus(detail.status) }}
            </span>
            <span class="text-xs text-slate-500">{{ formatMethod(detail.method) }}</span>
            <span v-if="detail.provider" class="text-xs text-slate-400">via {{ detail.provider }}</span>
          </div>
          <p class="mt-3 text-2xl font-bold text-primary">
            {{ detail.amount.toLocaleString('fr-FR') }} {{ detail.currency }}
          </p>
          <p class="mt-1 text-xs text-slate-500">{{ formatDate(detail.createdAt) }}</p>
        </section>

        <section>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Répartition</p>
          <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-slate-400">Partenaire</dt>
              <dd class="font-medium">{{ detail.amountPartner.toLocaleString('fr-FR') }} {{ detail.currency }}</dd>
            </div>
            <div>
              <dt class="text-slate-400">Commission plateforme</dt>
              <dd class="font-medium text-emerald-600">
                {{ detail.amountPlatform.toLocaleString('fr-FR') }} {{ detail.currency }}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Payeur</p>
          <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt class="text-slate-400">Nom</dt><dd class="font-medium">{{ detail.fullName }}</dd></div>
            <div><dt class="text-slate-400">Email</dt><dd>{{ detail.email }}</dd></div>
            <div><dt class="text-slate-400">Téléphone</dt><dd>{{ detail.phone || '—' }}</dd></div>
            <div v-if="detail.refCommand">
              <dt class="text-slate-400">Référence</dt>
              <dd class="flex items-center gap-2">
                <span class="font-mono text-xs">{{ detail.refCommand }}</span>
                <button type="button" class="text-[11px] text-primary underline" @click="copyRef(detail.refCommand!)">Copier</button>
              </dd>
            </div>
          </dl>
        </section>

        <section v-if="detail.candidature">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Dossier lié</p>
          <div class="mt-3 rounded-xl border border-slate-100 bg-white p-3 text-sm">
            <p class="font-semibold text-primary">{{ detail.candidature.programme.titre }}</p>
            <p class="text-xs text-slate-500">{{ detail.candidature.partner.name }}</p>
            <p class="mt-2 text-xs">
              Statut dossier : <strong>{{ detail.candidature.status }}</strong>
            </p>
            <NuxtLink
              :to="`/admin/candidatures?id=${detail.candidature.id}`"
              class="mt-2 inline-block text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              Voir le dossier →
            </NuxtLink>
            <NuxtLink
              :to="`/admin/users?id=${detail.userId}`"
              class="mt-1 block text-xs font-semibold text-slate-500 hover:underline"
            >
              Compte utilisateur →
            </NuxtLink>
          </div>
        </section>
        <section v-else>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Dossier lié</p>
          <p class="mt-2 text-sm text-slate-500">Aucun dossier de candidature associé.</p>
        </section>
      </div>
    </AdminDrawer>
  </div>
</template>
