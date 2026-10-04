<template>
  <div class="mx-auto max-w-5xl space-y-8 p-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Campagnes d'Emails</h1>
        <p class="mt-1 text-sm text-slate-500">
          Envoyez des communications ciblées aux étudiants selon leur profil et l'avancement de leur dossier.
        </p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Colonne Filtres (Gauche) -->
      <div class="space-y-6 lg:col-span-1">
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="text-base font-semibold text-slate-800">Ciblage (Filtres)</h2>
          <p class="mb-4 text-xs text-slate-500">Sélectionnez qui recevra ce mail.</p>
          
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Avoir un dossier ?</label>
              <select v-model="filters.hasCandidature" class="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm focus:border-primary focus:ring-primary" @change="fetchCount">
                <option :value="false">Tous les étudiants (même sans dossier)</option>
                <option :value="true">Uniquement ceux avec au moins un dossier</option>
              </select>
            </div>

            <div v-if="filters.hasCandidature">
              <label class="mb-2 block text-sm font-medium text-slate-700">Niveau d'études visé</label>
              <div class="space-y-2">
                <label v-for="nv in niveaux" :key="nv" class="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" :value="nv" v-model="filters.niveau" class="rounded border-slate-300 text-primary focus:ring-primary" @change="fetchCount" />
                  {{ nv }}
                </label>
              </div>
            </div>

            <div v-if="filters.hasCandidature">
              <label class="mb-2 block text-sm font-medium text-slate-700">Statut du dossier</label>
              <div class="space-y-2">
                <label v-for="st in statuts" :key="st.val" class="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" :value="st.val" v-model="filters.status" class="rounded border-slate-300 text-primary focus:ring-primary" @change="fetchCount" />
                  {{ st.label }}
                </label>
              </div>
            </div>
          </div>
          
          <div class="mt-6 rounded-lg bg-slate-50 p-4 text-center">
            <p class="text-sm text-slate-500">Destinataires estimés</p>
            <p class="text-3xl font-black text-primary">
              <span v-if="countLoading" class="animate-pulse">...</span>
              <span v-else>{{ userCount }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Colonne Contenu (Droite) -->
      <div class="space-y-6 lg:col-span-2">
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="text-base font-semibold text-slate-800">Contenu de l'Email</h2>
          
          <div class="mt-4 space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Sujet de l'email</label>
              <input v-model="subject" type="text" placeholder="Ex: Offre exceptionnelle pour votre Licence" class="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm focus:border-primary focus:ring-primary" />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                Message (HTML autorisé)
              </label>
              <div class="mb-2 flex gap-2 text-xs text-slate-500">
                <span class="font-mono bg-slate-100 px-1 rounded" v-pre>{{prenom}}</span> pour le prénom, 
                <span class="font-mono bg-slate-100 px-1 rounded" v-pre>{{nom}}</span> pour le nom.
              </div>
              <textarea 
                v-model="bodyHtml" 
                rows="8" 
                class="w-full rounded-lg border-slate-300 font-mono text-sm shadow-sm focus:border-primary focus:ring-primary"
                placeholder="<p>Bonjour {{prenom}},</p><p>Votre message ici...</p>"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">
            L'email utilisera le modèle BourseFi (avec logo et bas de page officiel).
          </p>
          <button 
            type="button" 
            class="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            :disabled="isSending || userCount === 0 || !subject || !bodyHtml"
            @click="confirmSend"
          >
            {{ isSending ? 'Envoi en cours...' : `Envoyer à ${userCount} étudiant(s)` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })
useSeoMeta({ title: "Campagnes d'Emails - Admin" })

const niveaux = ['Licence', 'Master', 'Doctorat', 'BTS', 'Autre']
const statuts = [
  { val: 'SOUMIS', label: 'Soumis' },
  { val: 'EN_ATTENTE_PAIEMENT', label: 'En attente de paiement' },
  { val: 'EN_REVUE_PARTENAIRE', label: 'En revue' },
  { val: 'ACCEPTE', label: 'Accepté' },
]

const filters = ref({
  hasCandidature: false,
  niveau: [] as string[],
  status: [] as string[],
})

const userCount = ref(0)
const countLoading = ref(false)
const isSending = ref(false)

const subject = ref('')
const bodyHtml = ref('<p>Bonjour {{prenom}},</p>\n<p>...</p>')

async function fetchCount() {
  countLoading.value = true
  try {
    const res = await $fetch('/api/admin/emails/count', {
      method: 'POST',
      body: filters.value
    })
    userCount.value = res.count
  } catch (e) {
    console.error(e)
  } finally {
    countLoading.value = false
  }
}

async function confirmSend() {
  if (userCount.value === 0) return
  if (!confirm(`Confirmez-vous l'envoi de cette campagne à ${userCount.value} étudiant(s) ?`)) return

  isSending.value = true
  try {
    await $fetch('/api/admin/emails/mass-send', {
      method: 'POST',
      body: {
        ...filters.value,
        subject: subject.value,
        bodyHtml: bodyHtml.value
      }
    })
    alert("La campagne a été lancée avec succès en tâche de fond !")
    subject.value = ''
  } catch (e: any) {
    alert("Une erreur est survenue : " + (e.data?.statusMessage || e.message))
  } finally {
    isSending.value = false
  }
}

onMounted(() => {
  fetchCount()
})
</script>
