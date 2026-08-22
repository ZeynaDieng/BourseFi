<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type EmailTemplate = {
  id: string
  name: string
  subject: string
  bodyHtml: string
  bodyText?: string | null
  scenarioStep?: number | null
  isActive: boolean
  updatedAt: string
}

const { data: templatesData, refresh } = await useFetch<{ ok: boolean; templates: EmailTemplate[] }>('/api/admin/email-relances/modeles')
const templates = computed(() => templatesData.value?.templates || [])

const previewTemplate = ref<EmailTemplate | null>(null)
const editingTemplate = ref<EmailTemplate | null>(null)
const modalOpen = ref(false)
const saving = ref(false)
const testEmailInput = ref('')
const sendingTest = ref(false)

const form = reactive({
  id: '',
  name: '',
  subject: '',
  bodyHtml: '',
  scenarioStep: 1,
  isActive: true,
})

const availableVariables = [
  '{{prenom}}', '{{nom}}', '{{email}}', '{{telephone}}',
  '{{ecole}}', '{{formation}}', '{{niveau}}', '{{montant}}',
  '{{pourcentage_bourse}}', '{{code_promo}}', '{{date_limite}}',
  '{{lien_paiement}}', '{{lien_candidature}}'
]

function openModal(tpl?: EmailTemplate) {
  if (tpl) {
    editingTemplate.value = tpl
    form.id = tpl.id
    form.name = tpl.name
    form.subject = tpl.subject
    form.bodyHtml = tpl.bodyHtml
    form.scenarioStep = tpl.scenarioStep || 1
    form.isActive = tpl.isActive
  } else {
    editingTemplate.value = null
    form.id = ''
    form.name = 'Nouveau Modèle d\'Email'
    form.subject = 'Titre du sujet'
    form.bodyHtml = 'Bonjour {{prenom}},\n\nVotre dossier pour {{formation}} est disponible.\n\n👉 {{lien_paiement}}'
    form.scenarioStep = 1
    form.isActive = true
  }
  modalOpen.value = true
}

async function saveTemplate() {
  saving.value = true
  try {
    await $fetch('/api/admin/email-relances/modeles', {
      method: 'POST',
      body: {
        id: form.id || undefined,
        name: form.name,
        subject: form.subject,
        bodyHtml: form.bodyHtml,
        scenarioStep: form.scenarioStep,
        isActive: form.isActive,
      },
    })
    modalOpen.value = false
    await refresh()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  } finally {
    saving.value = false
  }
}

async function sendTestEmail(tpl: EmailTemplate) {
  if (!testEmailInput.value || !testEmailInput.value.includes('@')) {
    alert('Veuillez saisir une adresse email valide pour le test.')
    return
  }
  sendingTest.value = true
  try {
    await $fetch('/api/admin/email-relances/modeles', {
      method: 'POST',
      body: {
        id: tpl.id,
        name: tpl.name,
        subject: tpl.subject,
        bodyHtml: tpl.bodyHtml,
        testEmail: testEmailInput.value,
      },
    })
    alert(`Email de test envoyé avec succès à ${testEmailInput.value} !`)
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Erreur d\'envoi de test.'))
  } finally {
    sendingTest.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="admin-page-title flex items-center gap-2">
            <span>📝 Modèles d'Email & Bibliothèque</span>
          </h1>
          <p class="admin-page-desc">
            Gestion des modèles de relance, prévisualisation et test d'envoi.
          </p>
        </div>

        <button
          type="button"
          class="admin-btn-primary text-xs inline-flex items-center gap-1.5"
          @click="openModal()"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          Créer un Modèle
        </button>
      </div>

      <!-- Variables Disponibles -->
      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">📌 Variables Dynamiques Disponibles</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="v in availableVariables"
            :key="v"
            class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-primary cursor-pointer hover:bg-primary/10"
            :title="`Cliquer pour copier ${v}`"
          >
            {{ v }}
          </span>
        </div>
      </div>

      <!-- Liste des Modèles -->
      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div
          v-for="tpl in templates"
          :key="tpl.id"
          class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs transition hover:border-primary/40"
        >
          <div class="flex items-start justify-between">
            <div>
              <span v-if="tpl.scenarioStep" class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                Scénario {{ tpl.scenarioStep }}
              </span>
              <h3 class="font-bold text-slate-900 text-sm mt-1">{{ tpl.name }}</h3>
              <p class="text-xs font-semibold text-slate-600 mt-0.5">Objet: "{{ tpl.subject }}"</p>
            </div>
            <span class="rounded-full px-2 py-0.5 text-[10px] font-bold" :class="tpl.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'">
              {{ tpl.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </div>

          <div class="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 font-mono border border-slate-100 max-h-32 overflow-y-auto whitespace-pre-wrap">
            {{ tpl.bodyHtml }}
          </div>

          <!-- Section Envoi de Test -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              v-model="testEmailInput"
              type="email"
              placeholder="votre@email.com pour test"
              class="admin-input text-xs flex-1 py-1"
            />
            <button
              type="button"
              class="admin-btn-secondary text-xs py-1 px-3"
              :disabled="sendingTest"
              @click="sendTestEmail(tpl)"
            >
              🧪 Tester
            </button>
            <button
              type="button"
              class="admin-btn-primary text-xs py-1 px-3"
              @click="openModal(tpl)"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>

      <!-- Modal d'Édition -->
      <Teleport to="body">
        <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div class="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
              <h3 class="font-bold text-slate-900 text-sm">{{ editingTemplate ? 'Modifier le Modèle' : 'Nouveau Modèle' }}</h3>
              <button type="button" class="text-slate-400 hover:text-slate-600" @click="modalOpen = false">✕</button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block text-slate-500 font-medium mb-1">Nom du modèle</label>
                <input v-model="form.name" type="text" class="admin-input" />
              </div>

              <div>
                <label class="block text-slate-500 font-medium mb-1">Objet de l'email (Subject)</label>
                <input v-model="form.subject" type="text" class="admin-input" />
              </div>

              <div>
                <label class="block text-slate-500 font-medium mb-1">Étape du Scénario (1, 2, 3, 4)</label>
                <input v-model.number="form.scenarioStep" type="number" min="1" max="4" class="admin-input" />
              </div>

              <div>
                <label class="block text-slate-500 font-medium mb-1">Contenu de l'email (Supporte les variables {{prenom}}, {{lien_paiement}}, etc.)</label>
                <textarea v-model="form.bodyHtml" rows="6" class="admin-input font-mono text-xs"></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t">
              <button type="button" class="admin-btn-secondary text-xs" @click="modalOpen = false">Annuler</button>
              <button type="button" class="admin-btn-primary text-xs" :disabled="saving" @click="saveTemplate">
                {{ saving ? 'Enregistrement...' : 'Sauvegarder' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </main>
  </div>
</template>
