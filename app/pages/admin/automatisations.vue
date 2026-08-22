<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type AutoRule = {
  id: string
  scenarioStep: number
  name: string
  triggerHours: number
  channel: 'WHATSAPP' | 'EMAIL' | 'BOTH'
  codePromo: string | null
  messageTemplate: string
  isActive: boolean
  updatedAt: string
}

type AutoLog = {
  id: string
  candidatureId: string
  scenarioStep: number
  channel: string
  status: 'SENT' | 'FAILED' | 'CONVERTED'
  sentAt: string
  convertedAt?: string | null
  recoveredAmount?: number | null
  candidature?: {
    id: string
    fullName: string
    email: string
    phone: string
    status: string
    programme: { titre: string; etablissement: { nom: string } }
  }
}

type StatsData = {
  today: {
    relancesSent: number
    whatsappSent: number
    emailsSent: number
    paiementsRecuperes: number
    revenusRecuperes: number
    conversionRate: number
    newCandidatures: number
    paiementsValidated: number
    montantEncaisse: number
  }
  month: {
    relancesSent: number
    paiementsRecuperes: number
    revenusRecuperes: number
    conversionRate: number
    hoursSaved: number
  }
}

const { data: rulesData, refresh: refreshRules } = await useFetch<{ ok: boolean; rules: AutoRule[] }>('/api/admin/automatisations/rules')
const { data: statsData, refresh: refreshStats } = await useFetch<{ ok: boolean } & StatsData>('/api/admin/automatisations/stats')
const { data: logsData, refresh: refreshLogs } = await useFetch<{ ok: boolean; logs: AutoLog[] }>('/api/admin/automatisations/logs')

const rules = computed(() => rulesData.value?.rules || [])
const stats = computed(() => statsData.value || {
  today: { relancesSent: 0, whatsappSent: 0, emailsSent: 0, paiementsRecuperes: 0, revenusRecuperes: 0, conversionRate: 0, newCandidatures: 0, paiementsValidated: 0, montantEncaisse: 0 },
  month: { relancesSent: 0, paiementsRecuperes: 0, revenusRecuperes: 0, conversionRate: 0, hoursSaved: 0 },
})
const logs = computed(() => logsData.value?.logs || [])

const runningEngine = ref(false)
const editingRule = ref<AutoRule | null>(null)
const ruleModalOpen = ref(false)
const savingRule = ref(false)

const editForm = reactive({
  scenarioStep: 1,
  name: '',
  triggerHours: 24,
  channel: 'BOTH' as 'WHATSAPP' | 'EMAIL' | 'BOTH',
  codePromo: '',
  messageTemplate: '',
  isActive: true,
})

function formatDate(iso?: string | null) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function triggerManualRun() {
  runningEngine.value = true
  try {
    const res = await $fetch<{ ok: boolean; processed: number }>('/api/admin/automatisations/run-engine', { method: 'POST' })
    await refreshStats()
    await refreshLogs()
    alert(`Moteur d'automatisation exécuté ! ${res.processed} relance(s) traitée(s).`)
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Erreur lors de l\'exécution.'))
  } finally {
    runningEngine.value = false
  }
}

async function toggleRuleActive(rule: AutoRule) {
  try {
    await $fetch('/api/admin/automatisations/rules', {
      method: 'POST',
      body: {
        ...rule,
        isActive: !rule.isActive,
      },
    })
    await refreshRules()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

function openEditModal(rule: AutoRule) {
  editingRule.value = rule
  editForm.scenarioStep = rule.scenarioStep
  editForm.name = rule.name
  editForm.triggerHours = rule.triggerHours
  editForm.channel = rule.channel
  editForm.codePromo = rule.codePromo || ''
  editForm.messageTemplate = rule.messageTemplate
  editForm.isActive = rule.isActive
  ruleModalOpen.value = true
}

async function saveRule() {
  savingRule.value = true
  try {
    await $fetch('/api/admin/automatisations/rules', {
      method: 'POST',
      body: {
        scenarioStep: editForm.scenarioStep,
        name: editForm.name,
        triggerHours: Number(editForm.triggerHours),
        channel: editForm.channel,
        codePromo: editForm.codePromo || null,
        messageTemplate: editForm.messageTemplate,
        isActive: editForm.isActive,
      },
    })
    ruleModalOpen.value = false
    await refreshRules()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Erreur de sauvegarde.'))
  } finally {
    savingRule.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 bg-slate-50 p-4 md:p-8">
      <!-- En-tête -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="admin-page-title flex items-center gap-2">
            <span>🤖 Relances Automatiques Intelligentes</span>
            <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              Système Actif (Nitro Server Engine)
            </span>
          </h1>
          <p class="admin-page-desc">
            Supervision du moteur de relances, scénarios d'automatisation, suivi des conversions et revenus récupérés.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
          :disabled="runningEngine"
          @click="triggerManualRun"
        >
          <span class="material-symbols-outlined text-[18px]">bolt</span>
          {{ runningEngine ? 'Exécution du moteur...' : '⚡ Exécuter le Moteur Maintenant' }}
        </button>
      </div>

      <!-- Section Statistiques du Jour & du Mois -->
      <div class="mt-6 space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500">📊 Statistiques du Jour (24h)</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-primary">{{ stats.today.relancesSent }}</p>
            <p class="text-xs text-slate-500">Relances envoyées</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-emerald-600">{{ stats.today.whatsappSent }}</p>
            <p class="text-xs text-slate-500">WhatsApp envoyés</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-sky-600">{{ stats.today.emailsSent }}</p>
            <p class="text-xs text-slate-500">Emails envoyés</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-amber-600">{{ stats.today.paiementsRecuperes }}</p>
            <p class="text-xs text-slate-500">Paiements récupérés</p>
          </div>
          <div class="admin-dash-card p-4 col-span-2 sm:col-span-2 lg:col-span-2">
            <p class="text-2xl font-extrabold text-emerald-700">{{ stats.today.revenusRecuperes.toLocaleString('fr-FR') }} FCFA</p>
            <p class="text-xs text-slate-500">Revenus récupérés aujourd'hui (Taux: {{ stats.today.conversionRate }}%)</p>
          </div>
        </div>

        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">📅 Statistiques du Mois</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-slate-800">{{ stats.month.relancesSent }}</p>
            <p class="text-xs text-slate-500">Total des relances</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-emerald-600">{{ stats.month.paiementsRecuperes }}</p>
            <p class="text-xs text-slate-500">Total conversions</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-emerald-700">{{ stats.month.revenusRecuperes.toLocaleString('fr-FR') }} FCFA</p>
            <p class="text-xs text-slate-500">Revenus générés par l'automation</p>
          </div>
          <div class="admin-dash-card p-4">
            <p class="text-2xl font-bold text-purple-700">~{{ stats.month.hoursSaved }}h</p>
            <p class="text-xs text-slate-500">Économie de temps estimée</p>
          </div>
        </div>
      </div>

      <!-- Moteur de Relances Automatiques (4 Scénarios) -->
      <div class="mt-8 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800">⚙️ Scénarios d'Automatisation Configurables</h2>
          <span class="text-xs text-slate-500">Modifiables, activables et personnalisables en direct</span>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="rule in rules"
            :key="rule.scenarioStep"
            class="rounded-2xl border p-5 bg-white shadow-2xs space-y-4 transition"
            :class="rule.isActive ? 'border-primary/20 bg-white ring-1 ring-primary/10' : 'border-slate-200 bg-slate-50/60 opacity-75'"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    {{ rule.scenarioStep }}
                  </span>
                  <h3 class="font-bold text-slate-900 text-sm">{{ rule.name }}</h3>
                </div>
                <p class="mt-1 text-xs text-slate-500">
                  Déclenchement : <strong>{{ rule.triggerHours }} heures</strong> après la création du dossier
                </p>
              </div>

              <!-- Switch Activer / Désactiver -->
              <button
                type="button"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                :class="rule.isActive ? 'bg-emerald-600' : 'bg-slate-300'"
                @click="toggleRuleActive(rule)"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                  :class="rule.isActive ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </div>

            <!-- Paramètres du Scénario -->
            <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
              <div>
                <span class="text-slate-400">Canaux :</span>
                <span class="font-semibold text-slate-700 ml-1">
                  {{ rule.channel === 'BOTH' ? '🟢 WhatsApp + ✉️ Email' : rule.channel === 'WHATSAPP' ? '🟢 WhatsApp' : '✉️ Email' }}
                </span>
              </div>
              <div>
                <span class="text-slate-400">Code Promo :</span>
                <span class="font-bold text-amber-700 ml-1">{{ rule.codePromo || 'Aucun' }}</span>
              </div>
            </div>

            <!-- Aperçu du Message -->
            <div class="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 whitespace-pre-wrap font-mono border border-slate-100 max-h-28 overflow-y-auto">
              {{ rule.messageTemplate }}
            </div>

            <!-- Actions de configuration -->
            <div class="flex items-center justify-between pt-2">
              <span class="text-[11px] text-slate-400">Mis à jour le {{ formatDate(rule.updatedAt) }}</span>
              <button
                type="button"
                class="admin-btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                @click="openEditModal(rule)"
              >
                <span class="material-symbols-outlined text-[16px]">edit</span>
                Configurer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Centre de Supervision (Journal des Exécutions en Direct) -->
      <div class="mt-8 space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800">📋 Centre de Supervision — Journal des Relances</h2>
        <div class="admin-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="admin-table min-w-[900px]">
              <thead>
                <tr>
                  <th class="admin-th">Date & Heure</th>
                  <th class="admin-th">Candidat</th>
                  <th class="admin-th">Formation & École</th>
                  <th class="admin-th">Étape Scénario</th>
                  <th class="admin-th">Canal</th>
                  <th class="admin-th">Statut Relance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!logs.length">
                  <td colspan="6" class="p-8 text-center text-xs text-slate-400">
                    Aucune relance automatique enregistrée pour le moment.
                  </td>
                </tr>
                <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/80">
                  <td class="admin-td text-xs font-mono text-slate-500">{{ formatDate(log.sentAt) }}</td>
                  <td class="admin-td">
                    <p class="font-bold text-slate-900">{{ log.candidature?.fullName || 'Candidat' }}</p>
                    <p class="text-[11px] text-slate-400">{{ log.candidature?.email }}</p>
                  </td>
                  <td class="admin-td">
                    <p class="text-xs font-medium">{{ log.candidature?.programme.titre || 'N/A' }}</p>
                    <p class="text-[10px] text-slate-400">{{ log.candidature?.programme.etablissement.nom }}</p>
                  </td>
                  <td class="admin-td">
                    <span class="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      Scénario {{ log.scenarioStep }}
                    </span>
                  </td>
                  <td class="admin-td">
                    <span class="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {{ log.channel }}
                    </span>
                  </td>
                  <td class="admin-td">
                    <span
                      v-if="log.status === 'CONVERTED'"
                      class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 inline-flex items-center gap-1"
                    >
                      <span>🎉 Converti</span>
                      <span v-if="log.recoveredAmount">({{ log.recoveredAmount.toLocaleString('fr-FR') }} FCFA)</span>
                    </span>
                    <span v-else class="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      ✉️ Envoyé
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Règles d'Arrêt Automatique -->
      <div class="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-2">
        <div class="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <span class="material-symbols-outlined text-[20px] text-amber-600">shield</span>
          Règles Strictes d'Arrêt Automatique des Relances
        </div>
        <p class="text-xs text-amber-800 leading-relaxed">
          Le moteur suspend automatiquement toute relance ultérieure dès l'un des événements suivants :
        </p>
        <div class="grid grid-cols-2 gap-2 text-xs pt-1 text-amber-900 font-semibold sm:grid-cols-4">
          <div>✅ Paiement validé</div>
          <div>🎓 Attestation émise</div>
          <div>❌ Candidature refusée</div>
          <div>🔒 Dossier marqué perdu</div>
        </div>
      </div>
    </main>

    <!-- Modal d'Édition d'un Scénario -->
    <Teleport to="body">
      <div v-if="ruleModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <h3 class="font-bold text-slate-900 text-sm">Configuration du {{ editForm.name }}</h3>
            <button type="button" class="text-slate-400 hover:text-slate-600" @click="ruleModalOpen = false">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-500 font-medium mb-1">Délai de déclenchement (en heures)</label>
              <input v-model.number="editForm.triggerHours" type="number" class="admin-input" min="1" />
            </div>

            <div>
              <label class="block text-slate-500 font-medium mb-1">Canal d'envoi</label>
              <select v-model="editForm.channel" class="admin-input bg-white">
                <option value="BOTH">🟢 WhatsApp + ✉️ Email (Recommandé)</option>
                <option value="WHATSAPP">🟢 WhatsApp Uniquement</option>
                <option value="EMAIL">✉️ Email Uniquement</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-500 font-medium mb-1">Code Promo associé (Optionnel)</label>
              <input v-model="editForm.codePromo" type="text" placeholder="Ex: RENTREE2026" class="admin-input" />
            </div>

            <div>
              <label class="block text-slate-500 font-medium mb-1">Modèle du message (Variables disponibles : {{prenom}}, {{nom}}, {{formation}}, {{lien_paiement}}, {{code_promo}})</label>
              <textarea v-model="editForm.messageTemplate" rows="5" class="admin-input font-mono text-xs"></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t">
            <button type="button" class="admin-btn-secondary text-xs" @click="ruleModalOpen = false">Annuler</button>
            <button type="button" class="admin-btn-primary text-xs" :disabled="savingRule" @click="saveRule">
              {{ savingRule ? 'Enregistrement...' : 'Sauvegarder les modifications' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
