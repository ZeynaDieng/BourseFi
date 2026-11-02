<script setup lang="ts">
import { computed, ref } from 'vue'
import AttestationPreview from '~/components/payment/AttestationPreview.vue'
import PaytechCheckoutModal from '~/components/payment/PaytechCheckoutModal.vue'
import { STUDENT_HOME } from '~/utils/routes'

definePageMeta({ layout: false, middleware: 'student-auth' })

const route = useRoute()

const candidatureId = computed(() => {
  const raw = route.query.candidatureId
  return typeof raw === 'string' ? raw : ''
})

const returnStatus = computed(() => {
  const raw = route.query.status
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
  montantInitial?: number | null
  montantReduction?: number | null
  montantFinal?: number | null
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

onMounted(async () => {
  window.addEventListener('message', onPaytechMessage)

  await loadCandidatures()

  if (returnStatus.value === 'success') {
    confirmingPayment.value = true
    pollStatus()
    return
  }

  if (returnStatus.value === 'cancel') {
    cancelled.value = true
  }
})

watch(
  () => authState.value?.user?.id,
  () => loadCandidatures(),
)

const dossier = computed(() => candidatures.value.find((c) => c.id === candidatureId.value))
const totalFcfa = computed(() => dossier.value?.fraisDossier ?? 0)
const devise = computed(() => dossier.value?.devise || 'FCFA')

const PAYMENT_STEPS = ['Formulaire', 'Documents', 'Paiement', 'Analyse', 'Attestation']

const isPaying = ref(false)
const isPaid = ref(false)
const paymentError = ref('')
const verifying = ref(false)
const verifyTimedOut = ref(false)
const cancelled = ref(false)
const confirmingPayment = ref(false)
const showPaytechModal = ref(false)
const paytechUrl = ref('')
const paymentStarted = ref(false)

const canPay = computed(
  () => !!dossier.value && dossier.value.status === 'EN_ATTENTE_PAIEMENT',
)

const showCheckout = computed(
  () => canPay.value && !isPaid.value && !confirmingPayment.value && !cancelled.value,
)

function openPaytechModal(url: string) {
  paytechUrl.value = url
  showPaytechModal.value = true
  confirmingPayment.value = false
}

function closePaytechModal() {
  showPaytechModal.value = false
  paytechUrl.value = ''
}

async function submitPayment() {
  if (!canPay.value || paymentStarted.value) return

  paymentStarted.value = true
  paymentError.value = ''
  isPaying.value = true
  try {
    const res = await $fetch<{ redirectUrl?: string; provider?: string }>('/api/paiements/initier', {
      method: 'POST',
      body: {
        candidatureId: candidatureId.value,
      },
    })
    isPaying.value = false
    if (!res?.redirectUrl) {
  paymentStarted.value = false
  paymentError.value = 'Réponse inattendue de la passerelle de paiement.'
  return
}
    if (res.redirectUrl.startsWith('http')) {
      openPaytechModal(res.redirectUrl)
      pollStatus()
    } else {
      confirmingPayment.value = true
      pollStatus()
    }
  } catch {
    paymentStarted.value = false
    paymentError.value = 'Impossible d’initier le paiement. Réessayez dans un instant.'
    isPaying.value = false
  }
}

async function pollStatus() {
  verifying.value = true
  verifyTimedOut.value = false
  const startedAt = Date.now()
  const maxMs = 300000
  while (verifying.value && Date.now() - startedAt < maxMs) {
    try {
      const res = await $fetch<{ status: string | null; candidatureStatus: string | null }>(
        '/api/paiements/statut',
        {
          query: { candidatureId: candidatureId.value, sync: '1' },
        },
      )
      if (
        res?.status === 'Valide' ||
        res?.candidatureStatus === 'EN_REVUE_PARTENAIRE' ||
        res?.candidatureStatus === 'ACCEPTE' ||
        res?.candidatureStatus === 'DOCUMENT_EMIS'
      ) {
        await onPaymentValidated()
        return
      }
      if (res?.status === 'Annule' || res?.status === 'Echec') {
        verifying.value = false
        confirmingPayment.value = false
        cancelled.value = true
        closePaytechModal()
        return
      }
    } catch (error: unknown) {
      const status = (error as { statusCode?: number })?.statusCode
      if (status === 401 || status === 403) {
        verifying.value = false
        paymentError.value = 'Session expirée. Reconnectez-vous pour finaliser votre dossier.'
        return
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 2500))
  }
  if (verifying.value) {
    verifying.value = false
    verifyTimedOut.value = true
  }
}

function cancelVerifying() {
  closePaytechModal()
  verifying.value = false
  verifyTimedOut.value = false
}

async function onPaymentValidated() {
  paymentStarted.value = false
  isPaying.value = false
  isPaid.value = true
  verifying.value = false
  confirmingPayment.value = false
  closePaytechModal()
  await loadCandidatures()

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('boursefi:payment-success', '1')
  }

  // Téléchargement automatique direct de l'attestation PDF officielle
  if (typeof window !== 'undefined' && candidatureId.value) {
    window.open(`/api/attestations/${candidatureId.value}`, '_blank')
  }
}

function retryPayment() {
  closePaytechModal()
  cancelled.value = false
  confirmingPayment.value = false
  verifyTimedOut.value = false
  paymentError.value = ''
  paymentStarted.value = false
  navigateTo(`/paiement?candidatureId=${candidatureId.value}`, { replace: true })
}

function onPaytechReturn(status: string, returnedCandidatureId: string) {
  if (returnedCandidatureId && returnedCandidatureId !== candidatureId.value) return

  const normalized = status.toLowerCase()
  const isCancel = normalized === 'cancel' || normalized === 'cancelled' || normalized === 'canceled'
  const isSuccess = normalized === 'success'

  closePaytechModal()

  if (isCancel) {
    verifying.value = false
    confirmingPayment.value = false
    cancelled.value = true
    return
  }

  if (isSuccess) {
    confirmingPayment.value = true
    if (!verifying.value) pollStatus()
  }
}

function onPaytechMessage(e: MessageEvent) {
  if (e.origin !== window.location.origin) return
  if (e.data?.source !== 'paytech') return
  onPaytechReturn(String(e.data.status ?? ''), String(e.data.candidatureId ?? ''))
}

onUnmounted(() => {
  closePaytechModal()
  if (typeof window !== 'undefined') window.removeEventListener('message', onPaytechMessage)
})

function onLogoError(e: Event) {
  const el = e.target as HTMLImageElement
  if (el) el.style.display = 'none'
}

useSeoMeta({ title: 'Paiement  BourseFi' })
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <!-- Header simple -->
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/boursefi-logo.png" alt="BourseFi" class="h-8 w-auto" @error="onLogoError" />
          <span class="font-headline text-xl font-extrabold text-primary">BourseFi</span>
        </NuxtLink>

        <NuxtLink
          :to="STUDENT_HOME"
          class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <span class="material-symbols-outlined text-base">close</span>
          Quitter
        </NuxtLink>
      </div>
    </header>

    <!-- Succès -->
    <div v-if="isPaid" class="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
      <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg">
        <span class="material-symbols-outlined text-[44px]">check</span>
      </div>
      <h1 class="font-headline text-3xl font-extrabold text-primary">Paiement confirmé !</h1>
      <p class="mt-3 text-slate-600">
        PayTech a validé votre paiement pour <span class="font-semibold text-primary">{{ dossier?.programmeTitre }}</span>.
        Votre attestation complète est désormais débloquée.
      </p>
      <CandidatureApplyStepper class="mt-8 w-full" :current="4" :steps="PAYMENT_STEPS" />
      <div class="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <a :href="`/api/attestations/${candidatureId}`" target="_blank" class="rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-emerald-700 flex items-center justify-center gap-2">
          <span class="material-symbols-outlined">download</span>
          Télécharger mon attestation (PDF)
        </a>
        <NuxtLink :to="STUDENT_HOME" class="rounded-xl bg-primary px-6 py-3.5 font-bold text-white shadow-sm transition hover:opacity-95 flex items-center justify-center">
          Mon espace
        </NuxtLink>
      </div>
      <p class="mt-6 flex items-start gap-2 text-left text-xs text-slate-500">
        <span class="material-symbols-outlined text-[16px] text-emerald-600">mail</span>
        Un e-mail contenant le lien vers votre attestation vous a également été envoyé.
      </p>
    </div>

    <!-- Vérification (retour PayTech  page parente, pas dans l'iframe) -->
    <div v-else-if="confirmingPayment" class="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
      <template v-if="!verifyTimedOut">
        <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span class="material-symbols-outlined animate-spin text-[44px]">progress_activity</span>
        </div>
        <h1 class="font-headline text-2xl font-extrabold text-primary">Vérification du paiement…</h1>
        <p class="mt-3 text-slate-600">
          Nous confirmons votre transaction auprès de la passerelle. Cela prend quelques secondes, ne fermez pas cette page.
        </p>
      </template>
      <template v-else>
        <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <span class="material-symbols-outlined text-[44px]">schedule</span>
        </div>
        <h1 class="font-headline text-2xl font-extrabold text-primary">Confirmation en cours</h1>
        <p v-if="paymentError" class="mt-3 text-sm font-semibold text-red-600">{{ paymentError }}</p>
        <p v-else class="mt-3 text-slate-600">
          Si vous avez bien réglé, la confirmation peut prendre un court instant. Vous pouvez actualiser ou consulter votre espace.
        </p>
        <div class="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button class="rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-sm transition hover:opacity-95" @click="pollStatus">
            Actualiser
          </button>
          <NuxtLink :to="STUDENT_HOME" class="rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-600 transition hover:bg-slate-50">
            Mon espace
          </NuxtLink>
        </div>
      </template>
    </div>

    <!-- Paiement annulé -->
    <div v-else-if="cancelled" class="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
      <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
        <span class="material-symbols-outlined text-[44px]">close</span>
      </div>
      <h1 class="font-headline text-2xl font-extrabold text-primary">Paiement non finalisé</h1>
      <p class="mt-3 text-slate-600">
        Votre paiement a été annulé ou n’a pas abouti. Aucun montant n’a été débité. Vous pouvez réessayer.
      </p>
      <div class="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <button class="rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-sm transition hover:opacity-95" @click="retryPayment">
          Réessayer le paiement
        </button>
        <NuxtLink :to="STUDENT_HOME" class="rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-600 transition hover:bg-slate-50">
          Mon espace
        </NuxtLink>
      </div>
    </div>

    <!-- Dossier indisponible -->
    <div
      v-else-if="!dossier || dossier.status !== 'EN_ATTENTE_PAIEMENT'"
      class="mx-auto max-w-lg px-4 py-16 text-center sm:px-6"
    >
      <div class="mb-5 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
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
    <div v-else-if="showCheckout" class="mx-auto max-w-2xl px-4 py-6 pb-40 sm:px-6 lg:pb-12">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <CandidatureApplyStepper :current="2" :steps="PAYMENT_STEPS" />
      </div>

      <div class="mt-6 text-center">
        <h1 class="font-headline text-2xl font-extrabold text-primary sm:text-3xl">Dernière étape avant votre attestation</h1>
        <p class="mt-1 text-sm text-slate-500">Vérifiez votre nom, votre e-mail et votre téléphone sur l’aperçu ci-dessous.</p>
      </div>

      <!-- Aperçu verrouillé de l'attestation -->
      <section
        aria-label="Aperçu de votre attestation"
        class="relative mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-[#eef2f6] px-3.5 pb-3.5 pt-11 sm:px-8 sm:pb-8 sm:pt-14"
      >
        <span class="absolute left-3 top-2.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-md sm:left-4 sm:top-3.5 sm:text-xs">
          <span class="material-symbols-outlined text-[15px]">visibility</span>
          Aperçu de votre attestation
        </span>
        <div class="relative mx-auto w-full max-w-[540px] shadow-[0_16px_35px_rgba(15,23,42,0.14)]">
          <AttestationPreview :full-name="dossier.fullName" :email="dossier.email" :phone="dossier.phone" />
          <div class="absolute inset-x-0 bottom-0 z-10 flex h-[37%] items-end justify-center bg-gradient-to-b from-white/0 via-white/90 to-white pb-4 sm:pb-7">
            <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-lg sm:py-2 sm:pl-2 sm:pr-4">
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container text-primary sm:h-8 sm:w-8">
                <span class="material-symbols-outlined text-[16px] sm:text-[18px]">lock</span>
              </span>
              <span class="text-xs font-bold text-primary sm:text-[13px]">Document complet débloqué après paiement</span>
            </span>
          </div>
        </div>
      </section>

      <div class="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium">
        <div class="flex items-start gap-3 p-5 sm:gap-4 sm:p-6">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
            <span class="material-symbols-outlined text-[24px]">task_alt</span>
          </span>
          <div>
            <h2 class="font-headline text-lg font-extrabold text-primary sm:text-xl">Votre attestation est prête !</h2>
            <p class="mt-1 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Pour obtenir et télécharger votre attestation complète, veuillez procéder au paiement des frais de dossier.
            </p>
          </div>
        </div>
        <div class="border-t border-slate-100 p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Frais de dossier</p>
              <p class="mt-0.5 font-mono text-xs text-slate-500">Réf. {{ dossier.id.slice(0, 8).toUpperCase() }}</p>
            </div>
            <div class="text-right">
              <p v-if="dossier.montantReduction && dossier.montantReduction > 0" class="text-sm text-slate-400 line-through">
                {{ (dossier.montantInitial || 0).toLocaleString('fr-FR') }} {{ devise }}
              </p>
              <p class="font-headline text-2xl font-extrabold text-primary sm:text-3xl">
                {{ totalFcfa.toLocaleString('fr-FR') }} <span class="text-sm sm:text-base">{{ devise }}</span>
              </p>
              <span
                v-if="dossier.montantReduction && dossier.montantReduction > 0"
                class="rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
              >
                Promo appliquée
              </span>
            </div>
          </div>
          <p v-if="paymentError" class="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{{ paymentError }}</p>
          <button
            :disabled="isPaying || !canPay"
            class="mt-5 hidden min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-4 font-extrabold text-primary shadow-sm transition hover:opacity-95 active:scale-[0.99] disabled:opacity-50 lg:flex"
            @click="submitPayment"
          >
            <span class="material-symbols-outlined text-[20px]" :class="{ 'animate-spin': isPaying }">{{ isPaying ? 'progress_activity' : 'lock_open' }}</span>
            <span>{{ isPaying ? 'Traitement…' : 'Payer et télécharger mon attestation' }}</span>
          </button>
          <p class="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <span class="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
            Paiement sécurisé via PayTech
          </p>
        </div>
      </div>

      <p class="mt-4 flex items-start gap-2 px-1 text-xs text-slate-500">
        <span class="material-symbols-outlined text-[16px] text-slate-400">info</span>
        Vous choisirez votre moyen de paiement (Wave, Orange Money…) directement sur l’écran PayTech sécurisé.
      </p>
    </div>

    <!-- CTA sticky mobile -->
    <div
      v-if="showCheckout"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
    >
      <p v-if="paymentError" class="mb-2 text-center text-xs font-semibold text-red-600">{{ paymentError }}</p>
      <button
        :disabled="isPaying || !canPay"
        class="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-4 font-extrabold text-primary shadow-lg transition active:scale-[0.99] disabled:opacity-50"
        @click="submitPayment"
      >
        <span class="material-symbols-outlined text-[20px]" :class="{ 'animate-spin': isPaying }">{{ isPaying ? 'progress_activity' : 'lock_open' }}</span>
        <span>{{ isPaying ? 'Traitement…' : 'Payer et télécharger mon attestation' }}</span>
      </button>
      <p class="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-500">
        <span class="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
        Paiement sécurisé via PayTech · {{ totalFcfa.toLocaleString('fr-FR') }} {{ devise }}
      </p>
    </div>

    <PaytechCheckoutModal
      :open="showPaytechModal"
      :url="paytechUrl"
      @close="cancelVerifying"
      @return="(p) => onPaytechReturn(p.status, p.candidatureId)"
    />
  </main>
</template>
