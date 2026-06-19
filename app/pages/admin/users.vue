<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'
import { useAdminListView } from '~/composables/useAdminListView'
import { useAdminDrawerLink } from '~/composables/useAdminDrawerLink'
import { copyToClipboard, downloadCsv } from '~/utils/admin-export'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  address: string | null
  partnerName: string | null
  candidaturesCount: number
  paiementsCount: number
  hasIdentity: boolean
  profileComplete: boolean
  createdAt: string
}

type UserDetail = UserRow & {
  identityCardRectoUrl: string | null
  identityCardVersoUrl: string | null
  updatedAt: string
  partner: { id: string; name: string; slug: string } | null
  counts: { candidatures: number; paiements: number; notifications: number }
  candidatures: Array<{
    id: string
    fullName: string
    status: string
    statusLabel: string
    programmeTitre: string
    bourseTitre: string | null
    documentUrl: string | null
    createdAt: string
  }>
  paiements: Array<{
    id: string
    amount: number
    status: string
    method: string
    createdAt: string
  }>
}

const { data: users, refresh } = await useFetch<UserRow[]>('/api/admin/users', { default: () => [] })

const search = ref('')
const roleFilter = ref('')
const profileFilter = ref('')
const drawerOpen = ref(false)
const selectedId = ref<string | null>(null)
const detail = ref<UserDetail | null>(null)
const detailLoading = ref(false)
const savingRole = ref(false)
const deleting = ref(false)
const draftRole = ref('STUDENT')
const draftProfile = reactive({
  name: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
})
const previewDoc = ref<{ url: string; label: string } | null>(null)

const roleOptions = [
  { value: 'STUDENT', label: 'Étudiant' },
  { value: 'PARTNER', label: 'Partenaire' },
  { value: 'ADMIN', label: 'Admin' },
]

function roleLabel(role: string) {
  return roleOptions.find((r) => r.value === role)?.label ?? role
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const stats = computed(() => {
  const list = users.value ?? []
  return {
    total: list.length,
    students: list.filter((u) => u.role === 'STUDENT').length,
    partners: list.filter((u) => u.role === 'PARTNER').length,
    admins: list.filter((u) => u.role === 'ADMIN').length,
    profilesComplete: list.filter((u) => u.profileComplete).length,
  }
})

const filtered = computed(() => {
  let list = users.value ?? []
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').includes(q)
    )
  }
  if (roleFilter.value) {
    list = list.filter((u) => u.role === roleFilter.value)
  }
  if (profileFilter.value === 'complete') list = list.filter((u) => u.profileComplete)
  if (profileFilter.value === 'incomplete') list = list.filter((u) => !u.profileComplete)
  return list
})

const { paginated, page, totalPages, sorted, toggleSort, sortIcon, resetPage } = useAdminListView(filtered, {
  pageSize: 20,
  defaultSort: { key: 'createdAt', dir: 'desc' },
})

watch([search, roleFilter, profileFilter], resetPage)

async function loadDetail(id: string) {
  selectedId.value = id
  drawerOpen.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await $fetch<UserDetail>(`/api/admin/users/${id}`)
    draftRole.value = detail.value.role
    draftProfile.name = detail.value.name
    draftProfile.firstName = detail.value.firstName ?? ''
    draftProfile.lastName = detail.value.lastName ?? ''
    draftProfile.phone = detail.value.phone ?? ''
    draftProfile.address = detail.value.address ?? ''
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Impossible de charger le profil.'))
    drawerOpen.value = false
  } finally {
    detailLoading.value = false
  }
}

async function openDetailById(id: string) {
  await loadDetail(id)
}

function openDetail(user: UserRow) {
  linkOpen(user.id)
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

function exportUsers() {
  downloadCsv('utilisateurs-boursefi.csv', sorted.value, [
    { key: 'name', header: 'Nom' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Rôle', format: (v) => roleLabel(String(v)) },
    { key: 'phone', header: 'Téléphone' },
    { key: 'profileComplete', header: 'Profil complet', format: (v) => (v ? 'Oui' : 'Non') },
    { key: 'candidaturesCount', header: 'Candidatures' },
    { key: 'paiementsCount', header: 'Paiements' },
    { key: 'createdAt', header: 'Inscrit le', format: (v) => formatDate(String(v)) },
  ])
}

async function copyText(text: string) {
  if (await copyToClipboard(text)) alert('Copié dans le presse-papier.')
}

async function saveUser() {
  if (!detail.value || !selectedId.value) return
  savingRole.value = true
  try {
    await $fetch(`/api/admin/users/${selectedId.value}`, {
      method: 'PATCH',
      body: {
        role: draftRole.value,
        name: draftProfile.name,
        firstName: draftProfile.firstName,
        lastName: draftProfile.lastName,
        phone: draftProfile.phone,
        address: draftProfile.address,
      },
    })
    await refresh()
    await loadDetail(selectedId.value)
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  } finally {
    savingRole.value = false
  }
}

async function deleteUser() {
  if (!detail.value || !selectedId.value) return
  const msg = detail.value.counts.candidatures
    ? `Supprimer ${detail.value.name} ? Ses ${detail.value.counts.candidatures} candidature(s) seront aussi supprimées.`
    : `Supprimer le compte ${detail.value.name} ?`
  if (!confirm(msg)) return

  deleting.value = true
  try {
    await $fetch(`/api/admin/users/${selectedId.value}`, { method: 'DELETE' })
    await refresh()
    onDrawerClose()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <h1 class="admin-page-title">Utilisateurs</h1>
      <p class="admin-page-desc">
        Gestion des comptes : profils, pièces d'identité, candidatures et rôles.
      </p>

      <!-- Stats -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ stats.total }}</p>
          <p class="text-xs text-slate-500">Total</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ stats.students }}</p>
          <p class="text-xs text-slate-500">Étudiants</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ stats.partners }}</p>
          <p class="text-xs text-slate-500">Partenaires</p>
        </div>
        <div class="admin-dash-card p-4">
          <p class="text-2xl font-bold text-primary">{{ stats.admins }}</p>
          <p class="text-xs text-slate-500">Admins</p>
        </div>
        <div class="admin-dash-card p-4 col-span-2 sm:col-span-1">
          <p class="text-2xl font-bold text-emerald-600">{{ stats.profilesComplete }}</p>
          <p class="text-xs text-slate-500">Profils complets</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mt-6 flex flex-wrap gap-3">
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher nom, email, téléphone…"
          class="admin-input min-w-[220px] flex-1"
        />
        <select v-model="roleFilter" class="admin-input w-auto bg-white">
          <option value="">Tous les rôles</option>
          <option v-for="r in roleOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
        <select v-model="profileFilter" class="admin-input w-auto bg-white">
          <option value="">Tous les profils</option>
          <option value="complete">Profils complets</option>
          <option value="incomplete">Profils incomplets</option>
        </select>
        <button type="button" class="admin-btn-secondary text-sm" @click="exportUsers">Exporter CSV</button>
      </div>
      <p class="mt-2 text-xs text-slate-500">{{ filtered.length }} utilisateur(s) trouvé(s)</p>

      <!-- Table desktop -->
      <div class="admin-table-shell mt-4 hidden md:block">
        <table class="admin-table min-w-[900px]">
          <thead>
            <tr>
              <th class="admin-th">
                <button type="button" class="inline-flex items-center gap-1 font-semibold" @click="toggleSort('name')">
                  Utilisateur
                  <span class="material-symbols-outlined text-[16px]">{{ sortIcon('name') }}</span>
                </button>
              </th>
              <th class="admin-th">Rôle</th>
              <th class="admin-th">Profil</th>
              <th class="admin-th">
                <button type="button" class="inline-flex items-center gap-1 font-semibold" @click="toggleSort('candidaturesCount')">
                  Candidatures
                  <span class="material-symbols-outlined text-[16px]">{{ sortIcon('candidaturesCount') }}</span>
                </button>
              </th>
              <th class="admin-th">
                <button type="button" class="inline-flex items-center gap-1 font-semibold" @click="toggleSort('createdAt')">
                  Inscrit le
                  <span class="material-symbols-outlined text-[16px]">{{ sortIcon('createdAt') }}</span>
                </button>
              </th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in paginated" :key="u.id" class="hover:bg-slate-50/80">
              <td class="admin-td">
                <p class="font-semibold text-primary">{{ u.name }}</p>
                <p class="text-xs text-slate-500">{{ u.email }}</p>
                <p v-if="u.phone" class="text-xs text-slate-400">{{ u.phone }}</p>
              </td>
              <td class="admin-td">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="{
                    'bg-blue-100 text-blue-800': u.role === 'STUDENT',
                    'bg-purple-100 text-purple-800': u.role === 'PARTNER',
                    'bg-slate-200 text-slate-800': u.role === 'ADMIN',
                  }"
                >
                  {{ roleLabel(u.role) }}
                </span>
                <p v-if="u.partnerName" class="mt-1 text-xs text-slate-400">{{ u.partnerName }}</p>
              </td>
              <td class="admin-td">
                <span
                  v-if="u.profileComplete"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"
                >
                  <span class="material-symbols-outlined text-[16px]">check_circle</span>
                  Complet
                </span>
                <span v-else class="text-xs text-amber-600">Incomplet</span>
                <span v-if="u.hasIdentity" class="mt-0.5 block text-[11px] text-slate-400">CNI enregistrée</span>
              </td>
              <td class="admin-td">
                <span class="font-semibold">{{ u.candidaturesCount }}</span>
                <span v-if="u.paiementsCount" class="text-xs text-slate-400"> · {{ u.paiementsCount }} paiement(s)</span>
              </td>
              <td class="admin-td text-xs text-slate-500">{{ formatDate(u.createdAt) }}</td>
              <td class="admin-td text-right">
                <button type="button" class="admin-btn-ghost" @click="openDetail(u)">Voir le dossier</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!paginated.length" class="p-6 text-sm text-slate-500">Aucun utilisateur trouvé.</p>
        <AdminPagination v-model:page="page" :total-pages="totalPages" :total-items="filtered.length" />
      </div>

      <!-- Cards mobile -->
      <div class="mt-4 flex flex-col gap-3 md:hidden">
        <article v-for="u in paginated" :key="u.id" class="admin-dash-card space-y-3 p-4">
          <div>
            <p class="font-semibold text-primary">{{ u.name }}</p>
            <p class="text-xs text-slate-500">{{ u.email }}</p>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="rounded-full bg-slate-100 px-2 py-0.5 font-semibold">{{ roleLabel(u.role) }}</span>
            <span :class="u.profileComplete ? 'text-emerald-600' : 'text-amber-600'">
              {{ u.profileComplete ? 'Profil complet' : 'Profil incomplet' }}
            </span>
            <span class="text-slate-500">{{ u.candidaturesCount }} candidature(s)</span>
          </div>
          <button type="button" class="admin-btn-primary w-full text-sm" @click="openDetail(u)">
            Voir le dossier
          </button>
        </article>
        <AdminPagination v-model:page="page" :total-pages="totalPages" :total-items="filtered.length" />
        <p v-if="!paginated.length" class="text-sm text-slate-500">Aucun utilisateur trouvé.</p>
      </div>
    </main>

    <!-- Drawer détail utilisateur -->
    <AdminDrawer
      v-model:open="drawerOpen"
      :title="detail?.name ?? 'Utilisateur'"
      :description="detail?.email"
      size="2xl"
      @close="onDrawerClose"
    >
      <div v-if="detailLoading" class="py-12 text-center text-sm text-slate-500">Chargement…</div>

      <div v-else-if="detail" class="space-y-6">
        <!-- Rôle & profil -->
        <section class="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Modifier le compte</p>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <label class="block sm:col-span-2">
              <span class="text-xs text-slate-500">Nom affiché</span>
              <input v-model="draftProfile.name" class="admin-input mt-1 w-full bg-white" />
            </label>
            <label class="block">
              <span class="text-xs text-slate-500">Prénom</span>
              <input v-model="draftProfile.firstName" class="admin-input mt-1 w-full bg-white" />
            </label>
            <label class="block">
              <span class="text-xs text-slate-500">Nom</span>
              <input v-model="draftProfile.lastName" class="admin-input mt-1 w-full bg-white" />
            </label>
            <label class="block">
              <span class="text-xs text-slate-500">Téléphone</span>
              <input v-model="draftProfile.phone" class="admin-input mt-1 w-full bg-white" />
            </label>
            <label class="block">
              <span class="text-xs text-slate-500">Rôle</span>
              <select v-model="draftRole" class="admin-input mt-1 w-full bg-white">
                <option v-for="r in roleOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </label>
            <label class="block sm:col-span-2">
              <span class="text-xs text-slate-500">Adresse</span>
              <textarea v-model="draftProfile.address" rows="2" class="admin-input mt-1 w-full bg-white" />
            </label>
          </div>
          <button type="button" class="admin-btn-primary mt-4 w-full text-sm" :disabled="savingRole" @click="saveUser">
            {{ savingRole ? 'Enregistrement…' : 'Enregistrer les modifications' }}
          </button>
          <p v-if="detail.partner" class="mt-2 text-xs text-slate-500">
            Partenaire lié : <strong>{{ detail.partner.name }}</strong>
          </p>
        </section>

        <!-- Infos lecture seule -->
        <section>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Informations</p>
          <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt class="text-slate-400">Email</dt><dd>{{ detail.email }}</dd></div>
            <div><dt class="text-slate-400">Inscrit le</dt><dd>{{ formatDate(detail.createdAt) }}</dd></div>
            <div>
              <dt class="text-slate-400">Profil</dt>
              <dd :class="detail.profileComplete ? 'text-emerald-600 font-semibold' : 'text-amber-600'">
                {{ detail.profileComplete ? 'Complet' : 'Incomplet' }}
              </dd>
            </div>
          </dl>
        </section>

        <!-- CNI -->
        <section v-if="detail.identityCardRectoUrl || detail.identityCardVersoUrl">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Carte d'identité (compte)</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <AdminDocumentThumb
              v-if="detail.identityCardRectoUrl"
              :url="detail.identityCardRectoUrl"
              label="Recto"
              @open="previewDoc = $event"
            />
            <AdminDocumentThumb
              v-if="detail.identityCardVersoUrl"
              :url="detail.identityCardVersoUrl"
              label="Verso"
              @open="previewDoc = $event"
            />
          </div>
        </section>

        <!-- Candidatures -->
        <section>
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Candidatures ({{ detail.counts.candidatures }})
            </p>
            <NuxtLink
              v-if="detail.counts.candidatures"
              :to="`/admin/candidatures?id=${detail.candidatures[0]?.id ?? ''}`"
              class="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              Voir toutes →
            </NuxtLink>
          </div>
          <div v-if="!detail.candidatures.length" class="mt-2 text-sm text-slate-500">Aucune candidature.</div>
          <ul v-else class="mt-3 space-y-2">
            <li
              v-for="c in detail.candidatures"
              :key="c.id"
              class="rounded-xl border border-slate-100 bg-white p-3 text-sm"
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <NuxtLink :to="`/admin/candidatures?id=${c.id}`" class="font-semibold text-primary hover:underline">
                    {{ c.programmeTitre }}
                  </NuxtLink>
                  <p v-if="c.bourseTitre" class="text-xs text-slate-500">{{ c.bourseTitre }}</p>
                  <p class="mt-1 text-[11px] text-slate-400">{{ formatDate(c.createdAt) }}</p>
                </div>
                <ApplicationStatusBadge :status="c.status" />
              </div>
              <div v-if="c.documentUrl" class="mt-2">
                <AdminDocumentThumb :url="c.documentUrl" label="Attestation" @open="previewDoc = $event" />
              </div>
            </li>
          </ul>
        </section>

        <!-- Paiements récents -->
        <section v-if="detail.paiements.length">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
            Paiements récents ({{ detail.counts.paiements }})
          </p>
          <ul class="mt-3 space-y-2">
            <li
              v-for="p in detail.paiements"
              :key="p.id"
              class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
            >
              <span class="font-semibold">{{ p.amount.toLocaleString('fr-FR') }} FCFA</span>
              <span class="text-xs text-slate-500">{{ p.status }} · {{ formatDate(p.createdAt) }}</span>
            </li>
          </ul>
        </section>
      </div>

      <template v-if="detail && !detailLoading" #footer>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="admin-btn-secondary text-sm" @click="copyText(detail!.email)">
            Copier l'email
          </button>
          <button
            type="button"
            class="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            :disabled="deleting"
            @click="deleteUser"
          >
            {{ deleting ? 'Suppression…' : 'Supprimer le compte' }}
          </button>
        </div>
      </template>
    </AdminDrawer>

    <AdminDocumentPreviewModal :doc="previewDoc" @close="previewDoc = null" />
  </div>
</template>
