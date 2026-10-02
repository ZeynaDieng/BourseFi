<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
  referenceTarif: 15000,
  activeTarif: 10000,
  mode: 'standard' as 'standard' | 'promotion',
  isActive: false,
})

async function fetchConfig() {
  try {
    const res = await $fetch<any>('/api/settings/frais-dossier')
    if (res) {
      form.value = {
        referenceTarif: res.referenceTarif,
        activeTarif: res.activeTarif,
        mode: res.mode,
        isActive: res.isActive,
      }
    }
  } catch (error) {
    errorMessage.value = 'Erreur lors du chargement de la configuration.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})

async function saveConfig() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch('/api/admin/settings/frais-dossier', {
      method: 'POST',
      body: form.value,
    })
    successMessage.value = 'Configuration enregistrée avec succès.'
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Paramètres Généraux</h1>
    </div>

    <div v-if="loading" class="text-center text-slate-500 py-12">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2">
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-bold text-primary">Gestion des Frais de Dossier</h2>
        <p class="mb-6 text-sm text-slate-500">
          Contrôlez le montant des frais de dossier affiché sur tout le site de manière centralisée.
        </p>

        <form @submit.prevent="saveConfig" class="space-y-4">
          <label class="flex items-center gap-3 rounded-lg border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
            <input type="checkbox" v-model="form.isActive" class="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary">
            <div>
              <p class="font-bold text-slate-800">Activer le contrôle centralisé</p>
              <p class="text-xs text-slate-500">Si désactivé, les frais par défaut de la base de données seront appliqués.</p>
            </div>
          </label>

          <div class="grid gap-4 sm:grid-cols-2" :class="{'opacity-50 pointer-events-none': !form.isActive}">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tarif de référence (FCFA)</label>
              <input type="number" v-model="form.referenceTarif" min="0" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tarif Actif (FCFA)</label>
              <input type="number" v-model="form.activeTarif" min="0" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none">
            </div>
          </div>

          <div :class="{'opacity-50 pointer-events-none': !form.isActive}">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mode d'affichage</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.mode" value="standard" class="text-primary focus:ring-primary">
                <span class="text-sm font-semibold text-slate-700">Standard</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.mode" value="promotion" class="text-primary focus:ring-primary">
                <span class="text-sm font-semibold text-slate-700">Promotion (Prix barré)</span>
              </label>
            </div>
          </div>

          <!-- Preview -->
          <div class="mt-4 rounded-lg bg-slate-50 p-4 border border-slate-100" v-if="form.isActive">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aperçu pour l'étudiant</p>
            <div class="font-headline text-sm font-bold text-slate-500 flex flex-wrap items-center gap-1">
              <span>Frais de dossier :</span>
              <template v-if="form.mode === 'promotion'">
                <span class="line-through text-slate-400 font-normal">{{ form.referenceTarif.toLocaleString('fr-FR') }}</span>
                <span class="text-primary font-extrabold">{{ form.activeTarif.toLocaleString('fr-FR') }} FCFA</span>
                <span class="ml-1 rounded-sm bg-red-100 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700">Offre promotionnelle</span>
              </template>
              <template v-else>
                <span class="text-primary">{{ form.activeTarif.toLocaleString('fr-FR') }} FCFA</span>
              </template>
            </div>
          </div>

          <div v-if="errorMessage" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {{ successMessage }}
          </div>

          <button type="submit" class="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer la configuration' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>
