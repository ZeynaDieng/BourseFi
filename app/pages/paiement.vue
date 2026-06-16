<script setup lang="ts">
const route = useRoute()
const candidatureId = computed(() => {
  const raw = route.query.candidatureId
  return typeof raw === 'string' ? raw : ''
})

const { data: authState } = await useFetch('/api/auth/me')

const candidatures = ref<
  Array<{
    id: string
    programmeSlug: string
    programmeTitre: string
    partnerName: string
    status: string
    statusLabel: string
    fraisDossier: number
  }>
>([])

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
  () => loadCandidatures()
)

const dossier = computed(() => candidatures.value.find((c) => c.id === candidatureId.value))
const totalFcfa = computed(() => dossier.value?.fraisDossier ?? 0)

const payment = reactive({
  method: 'Wave',
  fullName: '',
  email: '',
  phone: ''
})

watchEffect(() => {
  if (authState.value?.user) {
    payment.fullName ||= authState.value.user.name
    payment.email ||= authState.value.user.email
  }
})

const isPaying = ref(false)
const isPaid = ref(false)
const paymentMessage = ref('')
const paymentError = ref('')

async function submitPayment() {
  if (!authState.value?.user) {
    paymentError.value = 'Connectez-vous d abord pour effectuer le paiement.'
    return
  }
  if (!candidatureId.value) {
    paymentError.value = 'Dossier inconnu. Selectionnez une candidature depuis votre espace.'
    return
  }

  paymentMessage.value = ''
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
        method: payment.method
      }
    })
    isPaid.value = true
    paymentMessage.value = 'Merci, votre paiement a bien été enregistré.'
    await loadCandidatures()
  } catch {
    paymentError.value = 'Impossible de traiter le paiement pour ce dossier (statut ou dossier deja regle).'
  } finally {
    isPaying.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-7xl px-8 py-12">
    <div v-if="isPaid" class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="font-headline text-4xl font-extrabold text-primary">Paiement Réussi !</h1>
      <p class="mt-4 max-w-md text-lg text-slate-600">
        Votre paiement pour le programme <span class="font-semibold text-primary">{{ dossier?.programmeTitre }}</span> a été validé avec succès.
      </p>
      <div class="mt-10 flex flex-col gap-4 sm:flex-row">
        <NuxtLink to="/etudiant/dashboard" class="rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-xl transition hover:scale-105">
          Accéder à mon espace
        </NuxtLink>
        <NuxtLink to="/" class="rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-600 transition hover:bg-slate-50">
          Retour à l'accueil
        </NuxtLink>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <section class="space-y-8 lg:col-span-7">
        <div>
          <h1 class="font-headline text-4xl font-extrabold text-primary">Frais de dossier bourse</h1>
          <p class="text-slate-600">
            Reglement securise avant envoi de votre dossier au bailleur partenaire.
          </p>
          <p v-if="!authState?.user" class="mt-2 text-sm text-slate-600">
            Connexion requise.
            <NuxtLink to="/auth/login" class="font-semibold text-primary">Se connecter</NuxtLink>
          </p>
          <p v-else-if="!candidatureId" class="mt-2 text-sm text-amber-800">
            Ajoutez <code class="rounded bg-slate-100 px-1">?candidatureId=...</code> ou repassez depuis la fiche programme.
          </p>
          <p v-else-if="!dossier" class="mt-2 text-sm text-red-700">Ce dossier n appartient pas a votre session ou est introuvable.</p>
          <p v-else-if="dossier.status !== 'EN_ATTENTE_PAIEMENT'" class="mt-2 text-sm text-emerald-800">
            Ce dossier n attend plus de paiement (statut : {{ dossier.statusLabel }}).
            <NuxtLink to="/etudiant/dashboard" class="font-semibold text-primary">Espace candidat</NuxtLink>
          </p>
        </div>

        <div class="rounded-xl border border-slate-100 bg-white p-8 shadow-premium">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="font-headline text-2xl font-bold text-primary">Mode de paiement</h2>
            <div class="flex gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" class="h-4 opacity-60 grayscale" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" class="h-6 opacity-60 grayscale" />
            </div>
          </div>
          <div class="space-y-4">
            <label 
              class="relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all"
              :class="payment.method === 'Wave' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 hover:border-slate-200'"
            >
              <input v-model="payment.method" type="radio" name="paiement" value="Wave" class="h-5 w-5 text-primary focus:ring-primary" />
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1db9ec]/10">
                <img src="https://lh3.googleusercontent.com/pw/AP1GczPL_6j8bW_T7L_vU_xX8y4X0zL0X7v" alt="Wave" class="h-8 w-8 object-contain" @error="(e: any) => e.target.src = 'https://www.wave.com/favicon-32x32.png'" />
              </div>
              <div class="flex-1">
                <p class="font-bold text-primary">Wave</p>
                <p class="text-xs text-slate-500">Validation instantanée via l'application</p>
              </div>
              <div v-if="payment.method === 'Wave'" class="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </label>

            <label 
              class="relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all"
              :class="payment.method === 'Orange Money' ? 'border-[#ff7900] bg-[#ff7900]/5 ring-1 ring-[#ff7900]' : 'border-slate-100 hover:border-slate-200'"
            >
              <input v-model="payment.method" type="radio" name="paiement" value="Orange Money" class="h-5 w-5 text-[#ff7900] focus:ring-[#ff7900]" />
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff7900]/10">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" alt="OM" class="h-8 w-8" />
              </div>
              <div class="flex-1">
                <p class="font-bold text-primary">Orange Money</p>
                <p class="text-xs text-slate-500">Paiement par code USSD (#144#)</p>
              </div>
              <div v-if="payment.method === 'Orange Money'" class="text-[#ff7900]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </label>
          </div>
        </div>

        <div class="rounded-xl border border-slate-100 bg-white p-8 shadow-premium">
          <h2 class="mb-5 font-headline text-2xl font-bold text-primary">Coordonnees de facturation</h2>
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Nom complet</label>
              <input v-model="payment.fullName" class="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Ex: Seyna Dieng" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
              <input v-model="payment.email" type="email" class="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="contact@exemple.com" />
            </div>
            <div class="md:col-span-2 space-y-1.5">
              <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Numéro de téléphone</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">+221</span>
                <input v-model="payment.phone" class="w-full rounded-lg border border-slate-200 py-3 pl-16 pr-4 focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="77 000 00 00" />
              </div>
            </div>
          </div>
          <div class="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <div class="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Le montant réglé correspond aux frais de dossier associés à votre candidature au programme sélectionné. Ces frais permettent l'étude de votre éligibilité.</p>
            </div>
          </div>
        </div>
      </section>

      <aside class="lg:col-span-5">
        <div class="sticky top-8 overflow-hidden rounded-2xl bg-primary text-white shadow-2xl">
          <div class="p-8">
            <h3 class="mb-6 font-headline text-2xl font-bold">Résumé</h3>
            <div v-if="dossier" class="mb-6 flex gap-4 rounded-xl bg-white/5 p-4 border border-white/10">
              <div class="h-16 w-16 overflow-hidden rounded-lg bg-white/10">
                <img src="/boursefi-logo.png" alt="" class="h-full w-full object-cover" @error="(e: any) => e.target.style.display='none'" />
              </div>
              <div class="flex-1 text-sm min-w-0">
                <p class="truncate font-bold text-secondary-fixed">{{ dossier.programmeTitre }}</p>
                <p class="text-slate-300">Bailleur : {{ dossier.partnerName }}</p>
                <div class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Ref. {{ dossier.id.slice(0, 8).toUpperCase() }}
                </div>
              </div>
            </div>
            <div class="space-y-4 text-sm">
              <div class="flex justify-between border-b border-white/10 pb-4">
                <span class="text-slate-300">Frais de dossier</span>
                <span class="font-bold">{{ totalFcfa.toLocaleString('fr-FR') }} {{ dossier?.devise || 'FCFA' }}</span>
              </div>
              <div class="flex justify-between font-headline">
                <span class="text-lg font-semibold text-slate-300">Total à payer</span>
                <span class="text-3xl font-extrabold text-secondary-container">{{ totalFcfa.toLocaleString('fr-FR') }} FCFA</span>
              </div>
            </div>
          </div>
          <div class="border-t border-white/10 bg-white/5 p-8">
            <p v-if="paymentMessage" class="mb-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">{{ paymentMessage }}</p>
            <p v-if="paymentError" class="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">{{ paymentError }}</p>
            <button
              :disabled="isPaying || !dossier || dossier.status !== 'EN_ATTENTE_PAIEMENT'"
              class="group relative w-full overflow-hidden rounded-xl bg-secondary-container py-5 font-bold text-on-secondary-container shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              @click="submitPayment"
            >
              <div v-if="isPaying" class="flex items-center justify-center gap-3">
                <svg class="h-5 w-5 animate-spin text-on-secondary-container" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement en cours...
              </div>
              <span v-else>Valider et enregistrer le paiement</span>
            </button>
            <div class="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Transaction 100% sécurisée
            </div>
          </div>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.shadow-premium {
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
}
</style>
