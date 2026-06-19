<script setup lang="ts">
import { computed, ref } from 'vue'
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
  isEmbedded.value = window.self !== window.top
  // Si cette page s'affiche DANS l'iframe PayTech (retour success/cancel),
  // on prévient la fenêtre parente et on n'affiche qu'un écran minimal.
  if (isEmbedded.value && returnStatus.value) {
    window.parent.postMessage({ source: 'paytech', status: returnStatus.value }, window.location.origin)
    return
  }
  window.addEventListener('message', onPaytechMessage)
  await loadCandidatures()
  if (returnStatus.value === 'success') {
    pollStatus()
  } else if (returnStatus.value === 'cancel') {
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
const isEmbedded = ref(false)
const showPaytechModal = ref(false)
const paytechUrl = ref('')
const modalOpenedAt = ref(0)

// Écran de vérification affiché au retour de PayTech (success_url), le temps que l'IPN confirme.
const pendingSuccess = computed(() => returnStatus.value === 'success' && !isPaid.value)

const canPay = computed(
  () => !!dossier.value && dossier.value.status === 'EN_ATTENTE_PAIEMENT',
)

function openPaytechModal(url: string) {
  paytechUrl.value = url
  showPaytechModal.value = true
  modalOpenedAt.value = Date.now()
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
  pollStatus()
}

// Évite le "ghost click" mobile : un clic synthétique post-ouverture
// retombe sur le fond du modal et le fermerait immédiatement.
function onBackdropClick() {
  if (Date.now() - modalOpenedAt.value < 600) return
  cancelVerifying()
}

function closePaytechModal() {
  showPaytechModal.value = false
  paytechUrl.value = ''
  if (typeof document !== 'undefined') document.body.style.overflow = ''
}

async function submitPayment() {
  if (!canPay.value) return
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
      paymentError.value = 'Réponse inattendue de la passerelle de paiement.'
      return
    }
    if (res.redirectUrl.startsWith('http')) {
      // PayTech : ouverture dans une popup (iframe) intégrée à la page.
      openPaytechModal(res.redirectUrl)
    } else {
      // Repli dev (URL interne) : le paiement est déjà validé côté serveur.
      pollStatus()
    }
  } catch {
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
      const res = await $fetch<{ status: string | null }>('/api/paiements/statut', {
        query: { candidatureId: candidatureId.value },
      })
      if (res?.status === 'Valide') {
        isPaid.value = true
        verifying.value = false
        closePaytechModal()
        await loadCandidatures()
        return
      }
      if (res?.status === 'Annule' || res?.status === 'Echec') {
        verifying.value = false
        cancelled.value = true
        closePaytechModal()
        return
      }
    } catch {
      // on retente
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

function retryPayment() {
  closePaytechModal()
  cancelled.value = false
  verifyTimedOut.value = false
  navigateTo(`/paiement?candidatureId=${candidatureId.value}`)
}

// Reçoit le résultat depuis l'iframe PayTech (page de retour success/cancel).
function onPaytechMessage(e: MessageEvent) {
  if (e.origin !== window.location.origin) return
  if (e.data?.source !== 'paytech') return
  if (e.data.status === 'cancel') {
    closePaytechModal()
    verifying.value = false
    cancelled.value = true
  }
  // 'success' : la confirmation réelle vient du polling (IPN serveur).
}

onUnmounted(() => {
  closePaytechModal()
  if (typeof window !== 'undefined') window.removeEventListener('message', onPaytechMessage)
})

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

    <!-- Page affichée dans l'iframe PayTech au retour : écran minimal -->
    <div v-if="isEmbedded && returnStatus" class="mx-auto flex max-w-sm flex-col items-center px-4 py-16 text-center sm:px-6">
      <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <span class="material-symbols-outlined text-[36px]">check</span>
      </div>
      <h1 class="font-headline text-xl font-extrabold text-primary">Paiement traité</h1>
      <p class="mt-2 text-sm text-slate-600">Cette fenêtre va se fermer automatiquement…</p>
    </div>

    <!-- Succès -->
    <div v-else-if="isPaid" class="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
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

    <!-- Vérification du paiement (retour PayTech) -->
    <div v-else-if="pendingSuccess" class="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
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
        <p class="mt-3 text-slate-600">
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

    <!-- Paiement annulé / échoué -->
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
    <main v-else class="mx-auto max-w-xl px-4 py-6 pb-32 sm:px-6 lg:pb-12">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <CandidatureApplyStepper :current="2" :steps="PAYMENT_STEPS" />
      </div>

      <div class="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div class="bg-gradient-to-br from-primary to-primary/80 p-6 text-center text-white">
          <p class="text-xs font-semibold uppercase tracking-wider text-white/60">Montant à payer</p>
          <p class="mt-1 font-headline text-4xl font-extrabold">
            {{ totalFcfa.toLocaleString('fr-FR') }} <span class="text-xl">{{ devise }}</span>
          </p>
          <p class="mt-1 text-xs text-white/70">Frais de dossier</p>
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
        </dl>
        <div class="border-t border-slate-100 p-6">
          <p v-if="paymentError" class="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{{ paymentError }}</p>
          <button
            :disabled="isPaying || !canPay"
            class="hidden w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-4 font-bold text-on-secondary-container shadow-sm transition hover:opacity-95 active:scale-[0.99] disabled:opacity-50 lg:flex"
            @click="submitPayment"
          >
            <span v-if="isPaying" class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            <span>{{ isPaying ? 'Traitement…' : `Payer ${totalFcfa.toLocaleString('fr-FR')} ${devise}` }}</span>
          </button>
          <p class="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <span class="material-symbols-outlined text-[16px]">verified_user</span>
            Paiement sécurisé via PayTech
          </p>
        </div>
      </div>

      <p class="mt-4 flex items-start gap-2 px-1 text-xs text-slate-500">
        <span class="material-symbols-outlined text-[16px] text-slate-400">info</span>
        Vous choisirez votre moyen de paiement (Wave, Orange Money…) directement sur l’écran PayTech sécurisé.
      </p>
    </main>

    <!-- CTA sticky mobile -->
    <div
      v-if="!isPaid && !pendingSuccess && !cancelled && dossier && dossier.status === 'EN_ATTENTE_PAIEMENT'"
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

    <!-- Popup PayTech intégrée (iframe), sans quitter la page -->
    <div
      v-if="showPaytechModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm sm:p-4"
      @click.self="onBackdropClick"
    >
      <div class="relative h-full w-full max-w-md overflow-hidden bg-white shadow-2xl sm:h-[760px] sm:max-h-[92vh] sm:rounded-2xl">
        <button
          class="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          aria-label="Fermer"
          @click="cancelVerifying"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
        <iframe
          :src="paytechUrl"
          title="Paiement PayTech"
          class="h-full w-full border-0"
          allow="payment *; clipboard-write"
        ></iframe>
      </div>
    </div>

    <!-- Overlay : vérification (repli sans iframe / attente IPN) -->
    <div
      v-if="verifying && !showPaytechModal && !pendingSuccess && !isPaid"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <template v-if="!verifyTimedOut">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span class="material-symbols-outlined animate-spin text-[36px]">progress_activity</span>
          </div>
          <h2 class="font-headline text-xl font-extrabold text-primary">Paiement en cours…</h2>
          <p class="mt-2 text-sm text-slate-600">
            Finalisez le paiement dans la fenêtre PayTech. Cette page se met à jour automatiquement.
          </p>
          <button
            class="mt-5 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            @click="cancelVerifying"
          >
            Annuler
          </button>
        </template>
        <template v-else>
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <span class="material-symbols-outlined text-[36px]">schedule</span>
          </div>
          <h2 class="font-headline text-xl font-extrabold text-primary">En attente de confirmation</h2>
          <p class="mt-2 text-sm text-slate-600">
            Si vous avez réglé, la confirmation peut prendre un court instant.
          </p>
          <div class="mt-5 flex flex-col gap-2">
            <button
              class="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:opacity-95"
              @click="pollStatus"
            >
              Vérifier à nouveau
            </button>
            <button
              class="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              @click="cancelVerifying"
            >
              Fermer
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
