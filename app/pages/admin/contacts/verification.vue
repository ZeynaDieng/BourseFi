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
}

type EtabVerificationRow = {
  id: string
  slug: string
  nom: string
  ville: string
  phone: string | null
  phoneSecondary: string | null
  whatsapp: string | null
  email: string | null
  site: string | null
  contactStatus: 'VERIFIED' | 'TO_VERIFY' | 'UNVERIFIED'
  contactVerifiedAt: string | null
  source: string | null
  contacts: ContactRow[]
}

const etabs = ref<EtabVerificationRow[]>([])
const filterStatus = ref<string>('ALL')

async function load() {
  etabs.value = await $fetch<EtabVerificationRow[]>('/api/admin/contacts/verification')
}

await load()

const filteredEtabs = computed(() => {
  if (filterStatus.value === 'ALL') return etabs.value
  if (filterStatus.value === 'MISSING_PHONE') return etabs.value.filter((e) => !e.phone)
  if (filterStatus.value === 'MISSING_SITE') return etabs.value.filter((e) => !e.site)
  return etabs.value.filter((e) => e.contactStatus === filterStatus.value)
})

async function setVerification(etabId: string, status: 'VERIFIED' | 'TO_VERIFY') {
  try {
    await $fetch('/api/admin/contacts/verification', {
      method: 'PATCH',
      body: { etablissementId: etabId, contactStatus: status },
    })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

function formatDate(iso: string | null) {
  if (!iso) return 'Non renseignée'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50/50">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <NuxtLink to="/admin/catalogue/ecoles" class="text-xs font-bold text-slate-400 hover:text-primary mb-1 inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Retour au catalogue Écoles
          </NuxtLink>
          <h2 class="admin-page-title">Vérification des Contacts</h2>
          <p class="admin-page-desc !mb-0">
            Contrôlez et validez les coordonnées officielles des 22 établissements avant publication.
          </p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-bold transition"
          :class="filterStatus === 'ALL' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-100'"
          @click="filterStatus = 'ALL'"
        >
          Tous ({{ etabs.length }})
        </button>
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-bold transition"
          :class="filterStatus === 'TO_VERIFY' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'"
          @click="filterStatus = 'TO_VERIFY'"
        >
          🟠 À vérifier ({{ etabs.filter((e) => e.contactStatus === 'TO_VERIFY').length }})
        </button>
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-bold transition"
          :class="filterStatus === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'"
          @click="filterStatus = 'VERIFIED'"
        >
          🟢 Vérifiés ({{ etabs.filter((e) => e.contactStatus === 'VERIFIED').length }})
        </button>
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-bold transition"
          :class="filterStatus === 'MISSING_PHONE' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'"
          @click="filterStatus = 'MISSING_PHONE'"
        >
          Sans téléphone ({{ etabs.filter((e) => !e.phone).length }})
        </button>
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-bold transition"
          :class="filterStatus === 'MISSING_SITE' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'"
          @click="filterStatus = 'MISSING_SITE'"
        >
          Sans site ({{ etabs.filter((e) => !e.site).length }})
        </button>
      </div>

      <!-- Tableau d'audit -->
      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Établissement</th>
              <th class="admin-th">Téléphone principal</th>
              <th class="admin-th">WhatsApp</th>
              <th class="admin-th">Site officiel</th>
              <th class="admin-th text-center">Contacts DB</th>
              <th class="admin-th text-center">Statut</th>
              <th class="admin-th text-right">Action de vérification</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filteredEtabs" :key="e.id" class="hover:bg-slate-50/80">
              <td class="admin-td font-semibold text-primary">
                {{ e.nom }}
                <div class="text-xs text-slate-400 font-mono">{{ e.slug }} · {{ e.ville }}</div>
              </td>
              <td class="admin-td">
                <span v-if="e.phone" class="font-mono text-xs font-bold text-slate-800">{{ e.phone }}</span>
                <span v-else class="text-xs italic text-red-500">Non renseigné</span>
              </td>
              <td class="admin-td">
                <span v-if="e.whatsapp" class="font-mono text-xs font-bold text-emerald-700">🟢 {{ e.whatsapp }}</span>
                <span v-else class="text-xs text-slate-400">—</span>
              </td>
              <td class="admin-td">
                <a
                  v-if="e.site"
                  :href="e.site"
                  target="_blank"
                  rel="noopener"
                  class="text-xs font-medium text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]"
                >
                  {{ e.site.replace(/^https?:\/\//, '') }}
                  <span class="material-symbols-outlined text-xs">open_in_new</span>
                </a>
                <span v-else class="text-xs italic text-amber-600">Aucun site</span>
              </td>
              <td class="admin-td text-center">
                <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {{ e.contacts.length }} contact{{ e.contacts.length > 1 ? 's' : '' }}
                </span>
              </td>
              <td class="admin-td text-center">
                <span
                  v-if="e.contactStatus === 'VERIFIED'"
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700"
                >
                  🟢 Vérifié
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700"
                >
                  🟠 À vérifier
                </span>
                <div v-if="e.contactVerifiedAt" class="text-[10px] text-slate-400 mt-0.5">
                  {{ formatDate(e.contactVerifiedAt) }}
                </div>
              </td>
              <td class="admin-td text-right whitespace-nowrap">
                <button
                  v-if="e.contactStatus !== 'VERIFIED'"
                  type="button"
                  class="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  @click="setVerification(e.id, 'VERIFIED')"
                >
                  Valider comme vérifié
                </button>
                <button
                  v-else
                  type="button"
                  class="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-200 transition"
                  @click="setVerification(e.id, 'TO_VERIFY')"
                >
                  Marquer à vérifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>
