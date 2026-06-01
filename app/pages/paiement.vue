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
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <section class="space-y-8 lg:col-span-7">
        <div>
          <h1 class="font-headline text-4xl font-extrabold text-primary">Frais de dossier bourse</h1>
          <p class="text-slate-600">
            Reglement securise avant envoi de votre dossier au bailleur partenaire. Simulation — integrer Wave / Orange Money en production.
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
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuArh8Nq6Qf00SCNYRier82SHz3KPkQ8ege80wYYiw51RNtlZ0UxpHJ7M4wLnR50eZ-KDe0Mmp_4Uj3mHP95J12f9SlVNxEskndVxoj61DMyPJbk40bOvHoLmF2gyZf-A3fmLdOxRxisXSKpTXi-kn4Ad1Zr-qKys8cCjnuH057RowN-6l8wPRTulaa7TJvisrbkf4ugx9zjtfXDNBg-Nc3W3XEMnD5-0JIGBE8pgVFp14awQ7UX979n3QMSZe4vTsVWsHdytA2UDc0" alt="Visa" class="h-6 opacity-60 grayscale" />
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgloLLvXnU2IxnmUsRF1hE_9j4v5KFZenG5Qqrk89xnnHB3nvugf9UgzNDypUvtWLRwCASz3_Om7evDaDLubyV9Zni7gZbDsOxL53Uj4C1CgNrdP2tmUjrJD3qGpvwpX0o_KLXIYJE2Fl87KzJ1oxRbTSiu5Y6b98upz5CfmTrwZ7fXDHtGCqg80sr3DbV5FBf8Kx6ElB_teode7nY7b0Xe94dH7VUta6YMYO3qAvp6IhTxrNDQZuoLboCJxLflYq3KUnSoZyfwk4" alt="Mastercard" class="h-6 opacity-60 grayscale" />
            </div>
          </div>
          <div class="space-y-3">
            <label class="flex items-center gap-3 rounded-xl border-2 border-secondary-container bg-secondary-container/10 p-4">
              <input v-model="payment.method" type="radio" name="paiement" value="Wave" />
              <div>
                <p class="font-semibold text-primary">Wave</p>
                <p class="text-xs text-slate-500">Paiement instantane</p>
              </div>
            </label>
            <label class="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <input v-model="payment.method" type="radio" name="paiement" value="Orange Money" />
              <div>
                <p class="font-semibold text-primary">Orange Money</p>
                <p class="text-xs text-slate-500">Code USSD</p>
              </div>
            </label>
          </div>
        </div>

        <div class="rounded-xl border border-slate-100 bg-white p-8 shadow-premium">
          <h2 class="mb-5 font-headline text-2xl font-bold text-primary">Coordonnees de facturation</h2>
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <input v-model="payment.fullName" class="rounded-lg border border-slate-200 px-4 py-3" placeholder="Nom complet" />
            <input v-model="payment.email" type="email" class="rounded-lg border border-slate-200 px-4 py-3" placeholder="Email" />
            <div class="md:col-span-2">
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">+221</span>
                <input v-model="payment.phone" class="w-full rounded-lg border border-slate-200 py-3 pl-16 pr-4" placeholder="77 000 00 00" />
              </div>
            </div>
          </div>
          <div class="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            Le montant réglé correspond aux frais de dossier associés à votre candidature au programme sélectionné.
          </div>
        </div>
      </section>

      <aside class="lg:col-span-5">
        <div class="overflow-hidden rounded-xl bg-primary text-white shadow-xl">
          <div class="p-8">
            <h3 class="mb-4 font-headline text-2xl font-bold">Resume</h3>
            <div v-if="dossier" class="mb-5 flex gap-4 border-b border-white/10 pb-5">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc4_T0NLE-4m-Ew1jQkD3KSweN7bxNB7BCJftIGqtGedvw7S5qdrlXq5OMmKGIIjPfV94RGN9_WuqQlDTsx6XoZui3yiP2rFRbLJvk_OBgbgwiHGFXMcxFwyApUuLNJTTaw2uVQcIQ0Ds4xA1s9vaPlftqArIWB3cUvJ2GAMfn4SsL711mLpM1XPgu5TuLPYbkVJ6JDkKnWcBuq_o9aT9eoSg80_Al3f4IZkDQIs5xz_0-2BO3V4fiIA_QbgaBe5NjMeU5qmCFN4g" alt="" class="h-16 w-16 rounded-lg object-cover" />
              <div class="text-sm">
                <p class="font-semibold text-secondary-fixed">{{ dossier.programmeTitre }}</p>
                <p class="text-slate-300">Bailleur : {{ dossier.partnerName }}</p>
                <p class="text-slate-400">Ref. dossier {{ dossier.id.slice(0, 8) }}...</p>
              </div>
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-slate-300">Frais de dossier</span><strong>{{ totalFcfa.toLocaleString('fr-FR') }} FCFA</strong></div>
            </div>
            <div class="mt-6 border-t border-white/10 pt-6">
              <p class="text-xs uppercase tracking-widest text-slate-300">Total a payer</p>
              <p class="text-4xl font-extrabold text-secondary-container">{{ totalFcfa.toLocaleString('fr-FR') }} FCFA</p>
            </div>
          </div>
          <div class="border-t border-white/10 bg-white/5 p-8">
            <p v-if="paymentMessage" class="mb-3 rounded-lg border border-emerald-300 bg-emerald-50/90 px-4 py-2 text-xs font-semibold text-emerald-800">{{ paymentMessage }}</p>
            <p v-if="paymentError" class="mb-3 rounded-lg border border-red-300 bg-red-50/90 px-4 py-2 text-xs font-semibold text-red-800">{{ paymentError }}</p>
            <button
              :disabled="isPaying || !dossier || dossier.status !== 'EN_ATTENTE_PAIEMENT'"
              class="w-full rounded-lg bg-secondary-container py-4 font-bold text-on-secondary-container disabled:opacity-60"
              @click="submitPayment"
            >
              {{ isPaying ? 'Traitement...' : 'Valider et enregistrer le paiement' }}
            </button>
          </div>
        </div>
      </aside>
    </div>
  </main>
</template>
