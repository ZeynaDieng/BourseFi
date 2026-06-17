<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { STUDENT_HOME } from '~/utils/routes'

definePageMeta({ layout: false, middleware: 'student-auth' })

const route = useRoute()

const candidatureId = computed(() => {
  const raw = route.query.candidatureId
  return typeof raw === 'string' ? raw : ''
})

const { data: authState } = await useFetch('/api/auth/me')

type Dossier = {
  id: string
  programmeTitre: string
  partnerName: string
  etablissementNom: string
  status: string
  statusLabel: string
  fraisDossier: number
  devise: string
  fullName: string
  email: string
  phone: string
}

const candidatures = ref<Dossier[]>([])

async function loadCandidatures() {
  if (!authState.value?.user) {
    candidatures.value = []
    return
  }
  try {
    candidatures.value = await $fetch('/api/candidatures')
  } catch {
    candidatures.value = []
  }
}

onMounted(loadCandidatures)
watch(
  () => authState.value?.user?.id,
  () => loadCandidatures(),
)

const dossier = computed(() => candidatures.value.find((c) => c.id === candidatureId.value))
const totalFcfa = computed(() => dossier.value?.fraisDossier ?? 0)
const devise = computed(() => dossier.value?.devise || 'FCFA')

const PAYMENT_STEPS = ['Formulaire', 'Documents', 'Paiement', 'Analyse', 'Attestation']

const METHODS = [
  {
    id: 'Wave',
    label: 'Wave',
    hint: 'Validation instantanée via l’application',
    accent: '#1db6ec',
    logo: 'https://www.wave.com/favicon-32x32.png',
    icon: 'account_balance_wallet',
  },
  {
    id: 'Orange Money',
    label: 'Orange Money',
    hint: 'Paiement par code USSD (#144#)',
    accent: '#ff7900',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg',
    icon: 'smartphone',
  },
]

const payment = reactive({
  method: 'Wave',
  fullName: '',
  email: '',
  phone: '',
})

const editContact = ref(false)

watchEffect(() => {
  const d = dossier.value
  if (d) {
    payment.fullName ||= d.fullName || ''
    payment.email ||= d.email || ''
    payment.phone ||= d.phone || ''
  }
  if (authState.value?.user) {
    payment.fullName ||= authState.value.user.name
    payment.email ||= authState.value.user.email
  }
})

const isPaying = ref(false)
const isPaid = ref(false)
const paymentError = ref('')

const canPay = computed(
  () =>
    !!dossier.value &&
    dossier.value.status === 'EN_ATTENTE_PAIEMENT' &&
    payment.phone.replace(/\s/g, '').length >= 8,
)

async function submitPayment() {
  if (!canPay.value) {
    if (!payment.phone.trim()) paymentError.value = 'Indiquez le numéro à débiter.'
    return
  }
  paymentError.value = ''
  isPaying.value = true
  try {
    await $fetch('/api/paiements', {
      method: 'POST',
      body: {
        candidatureId: candidatureId.value,
        fullName: payment.fullName,
        email: payment.email,
        phone: payment.phone,
        method: payment.method,
      },
    })
    isPaid.value = true
    await loadCandidatures()
  } catch {
    paymentError.value =
      'Impossible de traiter le paiement pour ce dossier (statut ou dossier déjà réglé).'
  } finally {
    isPaying.value = false
  }
}

function onLogoError(e: Event) {
  ;(e.target as HTMLImageElement).style.display = 'none'
}

useSeoMeta({ title: 'Paiement — BourseFi' })
</script>

<template>
  <div class="min-h-dvh bg-slate-50 font-body">
    <!-- En-tête minimal -->
    <header class="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/boursefi-logo.png" alt="BourseFi" class="h-7 w-7 rounded-lg object-contain" @error="onLogoError" />
          <span class="font-headline text-lg font-extrabold text-primary">BourseFi</span>
        </NuxtLink>
        <span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span class="material-symbols-outlined text-[18px] text-emerald-600">lock</span>
          Paiement sécurisé
        </span>
      </div>
    </header>

    <!-- Succès -->
    <div v-if="isPaid" class="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
      <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg">
        <span class="material-symbols-outlined text-[44px]">check</span>
      </div>
      <h1 class="font-headline text-3xl font-extrabold text-primary">Paiement réussi !</h1>
      <p class="mt-3 text-slate-600">
        Votre dossier <span class="font-semibold text-primary">{{ dossier?.programmeTitre }}</span>
        est transmis au bailleur pour analyse. Vous serez notifié dès la décision.
      </p>
      <CandidatureApplyStepper class="mt-8 w-full" :current="3" :steps="PAYMENT_STEPS" />
      <div class="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <NuxtLink :to="STUDENT_HOME" class="rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-sm transition hover:opacity-95">
          Accéder à mon espace
        </NuxtLink>
        <NuxtLink to="/bourses" class="rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-600 transition hover:bg-slate-50">
          Voir d’autres bourses
        </NuxtLink>
      </div>
    </div>

    <!-- Dossier indisponible -->
    <div
      v-else-if="!dossier || dossier.status !== 'EN_ATTENTE_PAIEMENT'"
      class="mx-auto max-w-lg px-4 py-16 text-center sm:px-6"
    >
      <div class="mb-5 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <span class="material-symbols-outlined text-[32px]">receipt_long</span>
      </div>
      <h1 class="font-headline text-2xl font-extrabold text-primary">Aucun paiement en attente</h1>
      <p class="mt-2 text-sm text-slate-600">
        <template v-if="dossier"> Ce dossier n’attend plus de paiement (statut : {{ dossier.statusLabel }}). </template>
        <template v-else> Sélectionnez une candidature à régler depuis votre espace étudiant. </template>
      </p>
      <NuxtLink :to="STUDENT_HOME" class="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">
        Mon espace
      </NuxtLink>
    </div>

    <!-- Checkout -->
    <main v-else class="mx-auto max-w-5xl px-4 py-6 pb-32 sm:px-6 lg:pb-12">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <CandidatureApplyStepper :current="2" :steps="PAYMENT_STEPS" />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-12">
        <!-- Colonne principale -->
        <section class="space-y-5 lg:col-span-7">
          <!-- Montant en avant (mobile) -->
          <div class="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm lg:hidden">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Montant à payer</p>
            <p class="mt-1 font-headline text-4xl font-extrabold text-primary">
              {{ totalFcfa.toLocaleString('fr-FR') }} <span class="text-xl">{{ devise }}</span>
            </p>
            <p class="mt-1 text-xs text-slate-500">Frais de dossier · {{ dossier.programmeTitre }}</p>
          </div>

          <!-- Choix du moyen de paiement -->
          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 class="font-headline text-lg font-bold text-primary">Moyen de paiement</h2>
            <div class="mt-4 space-y-3">
              <label
                v-for="m in METHODS"
                :key="m.id"
                class="flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition"
                :class="payment.method === m.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'"
              >
                <input v-model="payment.method" type="radio" name="method" :value="m.id" class="sr-only" />
                <span
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  :style="{ backgroundColor: `${m.accent}1a` }"
                >
                  <img :src="m.logo" :alt="m.label" class="h-7 w-7 object-contain" @error="onLogoError" />
                </span>
                <span class="flex-1">
                  <span class="block font-bold text-primary">{{ m.label }}</span>
                  <span class="block text-xs text-slate-500">{{ m.hint }}</span>
                </span>
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full border-2 transition"
                  :class="payment.method === m.id ? 'border-primary bg-primary text-white' : 'border-slate-300 text-transparent'"
                >
                  <span class="material-symbols-outlined text-[16px]">check</span>
                </span>
              </label>
            </div>

            <!-- Numéro à débiter -->
            <label class="mt-4 block">
              <span class="text-xs font-semibold text-slate-500">Numéro {{ payment.method }} à débiter</span>
              <div class="relative mt-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">+221</span>
                <input
                  v-model="payment.phone"
                  type="tel"
                  inputmode="numeric"
                  placeholder="77 000 00 00"
                  class="w-full rounded-xl border border-slate-200 py-3 pl-14 pr-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>
          </div>

          <!-- Contact (minimal, déjà collecté) -->
          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div class="flex items-center justify-between">
              <h2 class="font-headline text-lg font-bold text-primary">Coordonnées</h2>
              <button type="button" class="text-xs font-semibold text-primary hover:underline" @click="editContact = !editContact">
                {{ editContact ? 'Terminer' : 'Modifier' }}
              </button>
            </div>

            <div v-if="!editContact" class="mt-3 flex items-center gap-3 text-sm text-slate-600">
              <span class="material-symbols-outlined text-[20px] text-slate-400">account_circle</span>
              <span>
                <span class="font-semibold text-primary">{{ payment.fullName || 'Vous' }}</span>
                <span v-if="payment.email"> · {{ payment.email }}</span>
              </span>
            </div>

            <div v-else class="mt-3 grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="text-xs font-semibold text-slate-500">Nom complet</span>
                <input v-model="payment.fullName" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label class="block">
                <span class="text-xs font-semibold text-slate-500">Email</span>
                <input v-model="payment.email" type="email" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
            </div>
          </div>

          <p class="flex items-start gap-2 px-1 text-xs text-slate-500">
            <span class="material-symbols-outlined text-[16px] text-slate-400">info</span>
            Ces frais couvrent l’étude de votre éligibilité par le bailleur. Aucun débit supplémentaire.
          </p>
        </section>

        <!-- Récap + CTA (desktop) -->
        <aside class="hidden lg:col-span-5 lg:block">
          <div class="sticky top-20 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div class="bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
              <p class="text-xs font-semibold uppercase tracking-wider text-white/60">Montant à payer</p>
              <p class="mt-1 font-headline text-4xl font-extrabold">
                {{ totalFcfa.toLocaleString('fr-FR') }} <span class="text-xl">{{ devise }}</span>
              </p>
            </div>
            <dl class="space-y-3 p-6 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-slate-500">Programme</dt>
                <dd class="text-right font-semibold text-primary">{{ dossier.programmeTitre }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-500">Bailleur</dt>
                <dd class="text-right font-semibold text-slate-700">{{ dossier.partnerName }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-500">Référence</dt>
                <dd class="text-right font-mono text-xs text-slate-500">{{ dossier.id.slice(0, 8).toUpperCase() }}</dd>
              </div>
              <div class="flex justify-between gap-3 border-t border-slate-100 pt-3">
                <dt class="font-semibold text-primary">Total</dt>
                <dd class="font-headline text-lg font-extrabold text-secondary">{{ totalFcfa.toLocaleString('fr-FR') }} {{ devise }}</dd>
              </div>
            </dl>
            <div class="border-t border-slate-100 p-6">
              <p v-if="paymentError" class="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{{ paymentError }}</p>
              <button
                :disabled="isPaying || !canPay"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-4 font-bold text-on-secondary-container shadow-sm transition hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
                @click="submitPayment"
              >
                <span v-if="isPaying" class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>{{ isPaying ? 'Traitement…' : `Payer ${totalFcfa.toLocaleString('fr-FR')} ${devise}` }}</span>
              </button>
              <p class="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <span class="material-symbols-outlined text-[16px]">verified_user</span>
                Transaction 100% sécurisée
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- CTA sticky mobile -->
    <div
      v-if="!isPaid && dossier && dossier.status === 'EN_ATTENTE_PAIEMENT'"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
    >
      <p v-if="paymentError" class="mb-2 text-center text-xs font-semibold text-red-600">{{ paymentError }}</p>
      <button
        :disabled="isPaying || !canPay"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-4 font-bold text-on-secondary-container shadow-lg transition active:scale-[0.99] disabled:opacity-50"
        @click="submitPayment"
      >
        <span v-if="isPaying" class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
        <span>{{ isPaying ? 'Traitement…' : `Payer ${totalFcfa.toLocaleString('fr-FR')} ${devise}` }}</span>
      </button>
    </div>
  </div>
</template>
