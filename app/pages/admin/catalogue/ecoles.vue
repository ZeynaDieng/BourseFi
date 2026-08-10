<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type ContactRow = {
  id: string
  type: string
  valeur: string
  label: string | null
  isPrincipal: boolean
  isWhatsapp: boolean
  status: string
  source: string | null
  isActive: boolean
}

type EcoleRow = {
  id: string
  slug: string
  nom: string
  ville: string
  adresse: string | null
  accreditation: string | null
  site: string | null
  phone: string | null
  phoneSecondary: string | null
  whatsapp: string | null
  email: string | null
  resume: string | null
  coverImageUrl: string | null
  logoUrl: string | null
  typeLabel: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  source: string | null
  contactStatus: 'VERIFIED' | 'TO_VERIFY' | 'UNVERIFIED'
  contactVerifiedAt: string | null
  contacts?: ContactRow[]
  _count: { programmes: number }
}

const items = ref<EcoleRow[]>([])
const searchQ = ref('')
const statusFilter = ref<string>('ALL')
const drawerOpen = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = () => ({
  slug: '',
  nom: '',
  ville: '',
  adresse: '',
  accreditation: '',
  site: '',
  phone: '',
  phoneSecondary: '',
  whatsapp: '',
  email: '',
  resume: '',
  coverImageUrl: '',
  logoUrl: '',
  typeLabel: '',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
  source: '' as string,
  contactStatus: 'TO_VERIFY' as 'VERIFIED' | 'TO_VERIFY' | 'UNVERIFIED',
})

const form = ref(emptyForm())

async function load() {
  items.value = await $fetch<EcoleRow[]>('/api/admin/etablissements')
}

await load()

const filteredItems = computed(() => {
  let res = items.value
  if (statusFilter.value !== 'ALL') {
    res = res.filter((e) => e.status === statusFilter.value)
  }
  if (searchQ.value.trim()) {
    const q = searchQ.value.toLowerCase()
    res = res.filter(
      (e) =>
        e.nom.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        e.ville.toLowerCase().includes(q) ||
        (e.phone && e.phone.includes(q))
    )
  }
  return res
})

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
    adresse: row.adresse ?? '',
    accreditation: row.accreditation ?? '',
    site: row.site ?? '',
    phone: row.phone ?? '',
    phoneSecondary: row.phoneSecondary ?? '',
    whatsapp: row.whatsapp ?? '',
    email: row.email ?? '',
    resume: row.resume ?? '',
    coverImageUrl: row.coverImageUrl ?? '',
    logoUrl: row.logoUrl ?? '',
    typeLabel: row.typeLabel ?? '',
    status: row.status,
    source: row.source ?? '',
    contactStatus: row.contactStatus,
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
    adresse: form.value.adresse || null,
    accreditation: form.value.accreditation || null,
    site: form.value.site || null,
    phone: form.value.phone || null,
    phoneSecondary: form.value.phoneSecondary || null,
    whatsapp: form.value.whatsapp || null,
    email: form.value.email || null,
    resume: form.value.resume || null,
    coverImageUrl: form.value.coverImageUrl || null,
    logoUrl: form.value.logoUrl || null,
    typeLabel: form.value.typeLabel || null,
    status: form.value.status,
    source: form.value.source || null,
    contactStatus: form.value.contactStatus,
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

async function toggleStatus(row: EcoleRow) {
  const nextStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  try {
    await $fetch(`/api/admin/etablissements/${row.id}`, {
      method: 'PATCH',
      body: { status: nextStatus },
    })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function quickVerify(row: EcoleRow, status: 'VERIFIED' | 'TO_VERIFY') {
  try {
    await $fetch('/api/admin/contacts/verification', {
      method: 'PATCH',
      body: { etablissementId: row.id, contactStatus: status },
    })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function archiveRow(row: EcoleRow) {
  if (!confirm(`Archiver ${row.nom} ? Les candidatures historiques resteront conservées.`)) {
    return
  }
  try {
    await $fetch(`/api/admin/etablissements/${row.id}`, { method: 'DELETE' })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

const drawerTitle = computed(() => (editingId.value ? 'Modifier l’établissement' : 'Nouvel établissement'))
</script>

<template>
  <div class="flex min-h-screen bg-slate-50/50">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="admin-page-title">Gestion des Établissements</h2>
          <p class="admin-page-desc !mb-0">
            Administrez les coordonnées, la visibilité, la vérification des contacts et le statut des écoles.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/admin/contacts/verification" class="admin-btn-secondary flex items-center gap-1.5 text-xs font-semibold">
            <span class="material-symbols-outlined text-sm">verified</span>
            Auditer les contacts
          </NuxtLink>
          <button type="button" class="admin-btn-primary" @click="openCreate">+ Ajouter un établissement</button>
        </div>
      </div>

      <!-- Filtres & Recherche -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div class="flex flex-1 items-center gap-3">
          <div class="relative flex-1 max-w-md">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            <input
              v-model="searchQ"
              type="text"
              placeholder="Rechercher par nom, slug, ville, téléphone..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>
          <select
            v-model="statusFilter"
            class="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="INACTIVE">Inactifs</option>
            <option value="ARCHIVED">Archivés</option>
          </select>
        </div>
        <div class="text-xs font-semibold text-slate-500">
          {{ filteredItems.length }} établissement{{ filteredItems.length > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Tableau -->
      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Établissement</th>
              <th class="admin-th">Ville</th>
              <th class="admin-th text-center">Formations</th>
              <th class="admin-th">Contact principal</th>
              <th class="admin-th text-center">Vérification</th>
              <th class="admin-th text-center">Statut</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filteredItems" :key="e.id" class="hover:bg-slate-50/80">
              <td class="admin-td">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 overflow-hidden ring-1 ring-slate-200">
                    <img v-if="e.logoUrl" :src="e.logoUrl" :alt="e.nom" class="h-full w-full object-contain p-1" />
                    <span v-else class="text-xs font-extrabold text-primary">{{ e.nom.slice(0, 2).toUpperCase() }}</span>
                  </div>
                  <div>
                    <div class="font-semibold text-primary hover:underline">
                      <NuxtLink :to="`/etablissements/${e.slug}`" target="_blank" class="flex items-center gap-1">
                        {{ e.nom }}
                        <span class="material-symbols-outlined text-xs text-slate-400">open_in_new</span>
                      </NuxtLink>
                    </div>
                    <div class="text-xs text-slate-400 font-mono">{{ e.slug }}</div>
                  </div>
                </div>
              </td>
              <td class="admin-td font-medium text-slate-700">{{ e.ville }}</td>
              <td class="admin-td text-center">
                <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {{ e._count.programmes }}
                </span>
              </td>
              <td class="admin-td text-xs text-slate-600">
                <div v-if="e.phone" class="font-semibold text-slate-800">{{ e.phone }}</div>
                <div v-if="e.whatsapp" class="text-emerald-700 font-medium">WhatsApp: {{ e.whatsapp }}</div>
                <div v-if="e.site" class="truncate max-w-[160px] text-slate-400 hover:text-primary">
                  <a :href="e.site" target="_blank" rel="noopener">{{ e.site.replace(/^https?:\/\//, '') }}</a>
                </div>
                <span v-if="!e.phone && !e.site" class="text-amber-600 italic">Aucun contact</span>
              </td>
              <td class="admin-td text-center">
                <span
                  v-if="e.contactStatus === 'VERIFIED'"
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700"
                  title="Contact vérifié"
                >
                  🟢 Vérifié
                </span>
                <span
                  v-else-if="e.contactStatus === 'TO_VERIFY'"
                  class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 cursor-pointer"
                  title="Cliquer pour vérifier"
                  @click="quickVerify(e, 'VERIFIED')"
                >
                  🟠 À vérifier
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500"
                >
                  ⚪ Non vérifié
                </span>
              </td>
              <td class="admin-td text-center">
                <button
                  type="button"
                  class="rounded-full px-2.5 py-0.5 text-xs font-bold transition"
                  :class="{
                    'bg-emerald-100 text-emerald-800 hover:bg-emerald-200': e.status === 'ACTIVE',
                    'bg-slate-100 text-slate-600 hover:bg-slate-200': e.status === 'INACTIVE',
                    'bg-red-100 text-red-700': e.status === 'ARCHIVED'
                  }"
                  @click="toggleStatus(e)"
                >
                  {{ e.status }}
                </button>
              </td>
              <td class="admin-td text-right whitespace-nowrap">
                <NuxtLink
                  :to="`/etablissements/${e.slug}`"
                  target="_blank"
                  class="admin-btn-ghost mr-2 text-xs"
                  title="Prévisualiser la page publique"
                >
                  Voir
                </NuxtLink>
                <button type="button" class="admin-btn-ghost mr-2 text-xs" @click="openEdit(e)">Modifier</button>
                <button
                  v-if="e.status !== 'ARCHIVED'"
                  type="button"
                  class="text-xs font-semibold text-red-600 hover:underline"
                  @click="archiveRow(e)"
                >
                  Archiver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Drawer édition -->
      <AdminDrawer v-model:open="drawerOpen" :title="drawerTitle" size="2xl" @close="closeDrawer">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="admin-label sm:col-span-2">
            Nom de l'établissement
            <input v-model="form.nom" class="admin-input" required />
          </label>
          <label class="admin-label">
            Slug
            <input v-model="form.slug" class="admin-input font-mono text-xs" required />
          </label>
          <label class="admin-label">
            Ville
            <input v-model="form.ville" class="admin-input" required />
          </label>
          <label class="admin-label sm:col-span-2">
            Adresse physique
            <input v-model="form.adresse" class="admin-input" placeholder="ex: Sicap Liberté 4, Dakar" />
          </label>
          <label class="admin-label">
            Téléphone principal
            <input v-model="form.phone" class="admin-input" placeholder="+221338000000" />
          </label>
          <label class="admin-label">
            Téléphone secondaire
            <input v-model="form.phoneSecondary" class="admin-input" placeholder="+221770000000" />
          </label>
          <label class="admin-label">
            WhatsApp Officiel
            <input v-model="form.whatsapp" class="admin-input" placeholder="+221770000000" />
          </label>
          <label class="admin-label">
            Email de contact
            <input v-model="form.email" type="email" class="admin-input" placeholder="contact@ecole.sn" />
          </label>
          <label class="admin-label sm:col-span-2">
            Site web officiel
            <input v-model="form.site" type="url" class="admin-input" placeholder="https://..." />
          </label>
          <label class="admin-label">
            Statut de visibilité
            <select v-model="form.status" class="admin-input">
              <option value="ACTIVE">ACTIVE (Public)</option>
              <option value="INACTIVE">INACTIVE (Masqué)</option>
              <option value="ARCHIVED">ARCHIVED (Archivé)</option>
            </select>
          </label>
          <label class="admin-label">
            Statut de Vérification des contacts
            <select v-model="form.contactStatus" class="admin-input">
              <option value="VERIFIED">🟢 VERIFIED (Vérifié)</option>
              <option value="TO_VERIFY">🟠 TO_VERIFY (À vérifier)</option>
              <option value="UNVERIFIED">⚪ UNVERIFIED (Non vérifié)</option>
            </select>
          </label>
          <label class="admin-label sm:col-span-2">
            Type / Libellé métier
            <input v-model="form.typeLabel" class="admin-input" placeholder="ex: Business School, Institut Supérieur" />
          </label>
          <label class="admin-label sm:col-span-2">
            Accréditation
            <input v-model="form.accreditation" class="admin-input" placeholder="ex: Homologué par le Ministère" />
          </label>
          <label class="admin-label sm:col-span-2">
            Résumé / Présentation
            <textarea v-model="form.resume" rows="4" class="admin-input min-h-[96px]" />
          </label>
          <label class="admin-label">
            URL Photo Couverture
            <input v-model="form.coverImageUrl" type="url" class="admin-input" />
          </label>
          <label class="admin-label">
            URL Logo
            <input v-model="form.logoUrl" type="url" class="admin-input" />
          </label>
        </div>
        <template #footer>
          <div class="flex justify-between items-center w-full">
            <div class="flex gap-2">
              <button
                v-if="form.contactStatus !== 'VERIFIED'"
                type="button"
                class="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                @click="form.contactStatus = 'VERIFIED'"
              >
                🟢 Marquer comme vérifié
              </button>
              <button
                v-else
                type="button"
                class="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                @click="form.contactStatus = 'TO_VERIFY'"
              >
                🟠 Marquer à vérifier
              </button>
            </div>
            <div class="flex gap-2">
              <button type="button" class="admin-btn-secondary" @click="closeDrawer">Annuler</button>
              <button type="button" class="admin-btn-primary" @click="submitDrawer">Enregistrer</button>
            </div>
          </div>
        </template>
      </AdminDrawer>
    </main>
  </div>
</template>
