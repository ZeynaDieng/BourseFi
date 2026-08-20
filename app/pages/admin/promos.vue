<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin',
})

type PromoCode = {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  valeur: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  etablissementId: string | null
  createdAt: string
  updatedAt: string
}

const { data: promos, refresh, pending } = await useFetch<PromoCode[]>('/api/admin/promos')

const searchQ = ref('')
const statusFilter = ref<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

const filteredPromos = computed(() => {
  let list = promos.value ?? []
  if (searchQ.value.trim()) {
    const q = searchQ.value.trim().toLowerCase()
    list = list.filter((p) => p.code.toLowerCase().includes(q))
  }
  if (statusFilter.value === 'ACTIVE') {
    list = list.filter((p) => p.isActive)
  } else if (statusFilter.value === 'INACTIVE') {
    list = list.filter((p) => !p.isActive)
  }
  return list
})

const totalCodes = computed(() => (promos.value ?? []).length)
const activeCodes = computed(() => (promos.value ?? []).filter((p) => p.isActive).length)
const totalUses = computed(() => (promos.value ?? []).reduce((sum, p) => sum + p.usedCount, 0))
const freeCodes = computed(() => (promos.value ?? []).filter((p) => p.type === 'PERCENTAGE' && p.valeur === 100).length)

// Modal State
const isModalOpen = ref(false)
const editingId = ref<string | null>(null)
const formLoading = ref(false)
const formError = ref('')

const form = reactive({
  code: '',
  type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  valeur: 50,
  maxUses: null as number | null,
  hasMaxUses: false,
  expiresAt: '' as string,
  hasExpiration: false,
  isActive: true
})

function openCreateModal() {
  editingId.value = null
  formError.value = ''
  form.code = ''
  form.type = 'PERCENTAGE'
  form.valeur = 50
  form.maxUses = null
  form.hasMaxUses = false
  form.expiresAt = ''
  form.hasExpiration = false
  form.isActive = true
  isModalOpen.value = true
}

function openEditModal(p: PromoCode) {
  editingId.value = p.id
  formError.value = ''
  form.code = p.code
  form.type = p.type
  form.valeur = p.valeur
  form.maxUses = p.maxUses
  form.hasMaxUses = p.maxUses !== null
  form.expiresAt = p.expiresAt ? p.expiresAt.split('T')[0] : ''
  form.hasExpiration = Boolean(p.expiresAt)
  form.isActive = p.isActive
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function savePromo() {
  formError.value = ''
  if (!form.code.trim()) {
    formError.value = 'Le code promo est requis.'
    return
  }
  if (!form.valeur || form.valeur <= 0) {
    formError.value = 'La valeur de la réduction doit être supérieure à 0.'
    return
  }

  formLoading.value = true
  try {
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      valeur: form.valeur,
      maxUses: form.hasMaxUses ? form.maxUses : null,
      expiresAt: form.hasExpiration && form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      isActive: form.isActive
    }

    if (editingId.value) {
      await $fetch(`/api/admin/promos/${editingId.value}`, {
        method: 'PATCH',
        body: payload
      })
    } else {
      await $fetch('/api/admin/promos', {
        method: 'POST',
        body: payload
      })
    }

    await refresh()
    closeModal()
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || e?.data?.message || 'Erreur lors de la sauvegarde.'
  } finally {
    formLoading.value = false
  }
}

async function toggleActive(p: PromoCode) {
  try {
    await $fetch(`/api/admin/promos/${p.id}`, {
      method: 'PATCH',
      body: { isActive: !p.isActive }
    })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Erreur lors de la modification.')
  }
}

async function deletePromo(p: PromoCode) {
  if (!confirm(`Voulez-vous vraiment supprimer ou désactiver le code promo "${p.code}" ?`)) return
  try {
    await $fetch(`/api/admin/promos/${p.id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Erreur lors de la suppression.')
  }
}

function formatDate(dStr: string | null) {
  if (!dStr) return 'Illimitée'
  const d = new Date(dStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <h1 class="font-headline text-2xl md:text-3xl font-extrabold text-primary">Gestion des Codes Promo</h1>
        <p class="mt-1 text-sm text-slate-500">Créez et gérez les réductions et gratuités pour les candidatures BourseFi.</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
        @click="openCreateModal"
      >
        <span class="material-symbols-outlined text-lg">add_circle</span>
        Nouveau code promo
      </button>
    </div>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Codes</p>
        <p class="mt-2 text-3xl font-extrabold text-slate-800">{{ totalCodes }}</p>
      </div>
      <div class="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-emerald-600">Codes Actifs</p>
        <p class="mt-2 text-3xl font-extrabold text-emerald-700">{{ activeCodes }}</p>
      </div>
      <div class="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-blue-600">Utilisations Totales</p>
        <p class="mt-2 text-3xl font-extrabold text-blue-700">{{ totalUses }}</p>
      </div>
      <div class="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-purple-600">Gratuité 100%</p>
        <p class="mt-2 text-3xl font-extrabold text-purple-700">{{ freeCodes }}</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        <input
          v-model="searchQ"
          type="text"
          placeholder="Rechercher un code (ex: BF100, BF50)..."
          class="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-bold transition"
          :class="statusFilter === 'ALL' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="statusFilter = 'ALL'"
        >
          Tous ({{ totalCodes }})
        </button>
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-bold transition"
          :class="statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="statusFilter = 'ACTIVE'"
        >
          Actifs ({{ activeCodes }})
        </button>
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-bold transition"
          :class="statusFilter === 'INACTIVE' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="statusFilter = 'INACTIVE'"
        >
          Inactifs ({{ totalCodes - activeCodes }})
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div v-if="pending" class="p-12 text-center text-slate-400 text-sm">Chargement des codes promo…</div>
      <div v-else-if="!filteredPromos.length" class="p-12 text-center text-slate-400 text-sm">
        Aucun code promo ne correspond aux critères.
      </div>
      <table v-else class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
          <tr>
            <th class="px-6 py-4">Code Promo</th>
            <th class="px-6 py-4">Type & Valeur</th>
            <th class="px-6 py-4">Utilisations</th>
            <th class="px-6 py-4">Expiration</th>
            <th class="px-6 py-4">Statut</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr v-for="p in filteredPromos" :key="p.id" class="hover:bg-slate-50/80 transition">
            <td class="px-6 py-4">
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1 text-xs font-mono font-bold text-amber-400 tracking-wider">
                <span class="material-symbols-outlined text-xs">local_offer</span>
                {{ p.code }}
              </span>
            </td>
            <td class="px-6 py-4 font-semibold">
              <span v-if="p.type === 'PERCENTAGE' && p.valeur === 100" class="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-extrabold text-purple-800">
                100% Gratuit
              </span>
              <span v-else-if="p.type === 'PERCENTAGE'" class="text-primary font-bold">
                -{{ p.valeur }}%
              </span>
              <span v-else class="text-emerald-700 font-bold">
                -{{ p.valeur.toLocaleString('fr-FR') }} FCFA
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="font-medium text-slate-800">{{ p.usedCount }}</span>
              <span class="text-xs text-slate-400"> / {{ p.maxUses !== null ? p.maxUses : 'Illimité' }}</span>
            </td>
            <td class="px-6 py-4 text-xs font-medium text-slate-600">
              {{ formatDate(p.expiresAt) }}
            </td>
            <td class="px-6 py-4">
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition"
                :class="p.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-800 hover:bg-red-200'"
                @click="toggleActive(p)"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="p.isActive ? 'bg-emerald-600' : 'bg-red-600'"></span>
                {{ p.isActive ? 'Actif' : 'Inactif' }}
              </button>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button
                type="button"
                class="inline-flex items-center justify-center p-2 text-slate-500 hover:text-primary transition"
                title="Modifier"
                @click="openEditModal(p)"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-600 transition"
                title="Supprimer"
                @click="deletePromo(p)"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Création / Modification -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div class="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 class="font-headline text-lg font-extrabold text-primary">
            {{ editingId ? 'Modifier le code promo' : 'Nouveau code promo' }}
          </h3>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="closeModal">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="savePromo">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Code Promo</label>
            <input
              v-model="form.code"
              type="text"
              required
              placeholder="Ex: BF100, BF50, RENTREE2026..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm uppercase font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Type de réduction</label>
              <select
                v-model="form.type"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="PERCENTAGE">Pourcentage (%)</option>
                <option value="FIXED">Montant Fixe (FCFA)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Valeur {{ form.type === 'PERCENTAGE' ? '(%)' : '(FCFA)' }}
              </label>
              <input
                v-model.number="form.valeur"
                type="number"
                min="1"
                required
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div class="space-y-3 pt-2 border-t border-slate-100">
            <label class="flex items-center gap-3">
              <input v-model="form.hasMaxUses" type="checkbox" class="rounded border-slate-300 text-primary" />
              <span class="text-xs font-bold text-slate-700">Limiter le nombre d'utilisations</span>
            </label>

            <div v-if="form.hasMaxUses" class="pl-6">
              <input
                v-model.number="form.maxUses"
                type="number"
                min="1"
                placeholder="Ex: 50 utilisations max"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
              />
            </div>

            <label class="flex items-center gap-3">
              <input v-model="form.hasExpiration" type="checkbox" class="rounded border-slate-300 text-primary" />
              <span class="text-xs font-bold text-slate-700">Définir une date d'expiration</span>
            </label>

            <div v-if="form.hasExpiration" class="pl-6">
              <input
                v-model="form.expiresAt"
                type="date"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
              />
            </div>

            <label class="flex items-center gap-3">
              <input v-model="form.isActive" type="checkbox" class="rounded border-slate-300 text-primary" />
              <span class="text-xs font-bold text-slate-700">Activer immédiatement ce code promo</span>
            </label>
          </div>

          <div v-if="formError" class="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            {{ formError }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              @click="closeModal"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              :disabled="formLoading"
            >
              {{ formLoading ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
