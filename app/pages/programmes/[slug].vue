<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { data: programmes } = await useFetch('/api/programmes')

const programme = computed(() => programmes.value?.find((item: { slug: string }) => item.slug === route.params.slug))

const modalOpen = ref(false)

function openApply() {
  modalOpen.value = true
}

function onCandidatureSubmitted(payload: { candidatureId: string; requiresPayment: boolean }) {
  if (payload.requiresPayment) {
    router.push(`/paiement?candidatureId=${encodeURIComponent(payload.candidatureId)}`)
  } else {
    router.push('/etudiant/dashboard')
  }
}

function scrollToProcedure() {
  if (typeof document === 'undefined') return
  document.getElementById('procedure-bourse')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(
  () => route.hash,
  () => {
    if (route.hash === '#procedure-bourse') {
      nextTick(() => scrollToProcedure())
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (route.hash === '#procedure-bourse') {
    nextTick(() => scrollToProcedure())
  }
})
</script>

<template>
  <main v-if="programme" class="mx-auto max-w-7xl px-4 py-10 md:px-8">
    <header class="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <nav class="mb-4 flex items-center gap-2 text-xs text-slate-500">
          <NuxtLink to="/programmes" class="hover:text-primary">Programmes finances</NuxtLink>
        </nav>
        <h1 class="font-headline text-4xl font-extrabold text-primary md:text-5xl">{{ programme.titre }}</h1>
        <p class="mt-4 max-w-2xl text-sm text-slate-600">{{ programme.description }}</p>
        <div class="mt-6 flex flex-wrap gap-4">
          <span class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary">
            {{ programme.etablissement }}
          </span>
          <span class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary">
            {{ programme.ville }}
          </span>
          <span class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary">
            {{ programme.niveau }}
          </span>
          <span class="rounded-lg border border-secondary-container/40 bg-secondary-container/10 px-4 py-2 text-sm font-semibold text-primary">
            Bailleur : {{ programme.partnerName }}
          </span>
        </div>
        <div v-if="programme.brochureUrl" class="mt-4">
          <a
            :href="programme.brochureUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
          >
            <span class="material-symbols-outlined text-lg">menu_book</span>
            Telecharger la brochure partenaire
          </a>
        </div>
      </div>
      <div class="rounded-xl border border-primary-container bg-primary p-8 text-white shadow-xl">
        <h3 class="mb-4 text-xl font-bold">Demander la bourse</h3>
        <p class="mb-4 text-sm text-slate-300">
          Postulez en quelques etapes. Le document officiel est emis par le bailleur apres validation.
        </p>
        <div class="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div class="h-full w-3/4 bg-secondary-container" />
        </div>
        <button
          type="button"
          class="block w-full rounded-lg bg-secondary-container px-5 py-3 text-center font-bold text-on-secondary-container"
          @click="openApply"
        >
          Postuler à cette bourse
        </button>
        <p v-if="programme.fraisDossier > 0" class="mt-3 text-xs text-slate-400">
          Frais dossier : {{ programme.fraisDossier.toLocaleString('fr-FR') }} {{ programme.devise }}
        </p>
      </div>
    </header>

    <CandidatureModal :open="modalOpen" :programme="programme" @close="modalOpen = false" @submitted="onCandidatureSubmitted" />

    <section
      id="procedure-bourse"
      class="scroll-mt-24 mb-12 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8"
      aria-labelledby="procedure-bourse-title"
    >
      <h2
        id="procedure-bourse-title"
        class="mb-2 font-headline text-2xl font-bold text-primary md:text-3xl"
      >
        Comment obtenir la bourse pour cette formation
      </h2>
      <p class="mb-8 max-w-3xl text-sm text-slate-600">
        La prise en charge est assurée par
        <strong class="text-primary">{{ programme.partnerName }}</strong>
        (bailleur). BourseFi enregistre votre dossier et vous permet de suivre chaque étape jusqu’à l’attestation.
      </p>
      <ol class="grid gap-6 md:grid-cols-3">
        <li class="relative rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <span
            class="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
          >
            1
          </span>
          <h3 class="mb-2 font-headline font-semibold text-primary">Déposer votre candidature</h3>
          <p class="text-sm text-slate-600">
            Renseignez vos informations pour <strong>{{ programme.titre }}</strong> à
            {{ programme.etablissement }}. Les pièces demandées apparaissent dans le formulaire.
          </p>
        </li>
        <li class="relative rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <span
            class="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
          >
            2
          </span>
          <h3 class="mb-2 font-headline font-semibold text-primary">Payer les frais de dossier si requis</h3>
          <p v-if="programme.fraisDossier > 0" class="text-sm text-slate-600">
            Montant :
            <strong>{{ programme.fraisDossier.toLocaleString('fr-FR') }} {{ programme.devise }}</strong>
            (paiement sécurisé après envoi du formulaire, le cas échéant).
          </p>
          <p v-else class="text-sm text-slate-600">
            Aucun frais de dossier n’est indiqué pour ce programme sur la plateforme.
          </p>
        </li>
        <li class="relative rounded-xl border border-slate-100 bg-slate-50/80 p-5">
          <span
            class="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
          >
            3
          </span>
          <h3 class="mb-2 font-headline font-semibold text-primary">Validation et attestation</h3>
          <p class="text-sm text-slate-600">
            {{ programme.partnerName }} examine le dossier. Après décision favorable, l’attestation du bailleur est
            disponible dans votre espace pour la présenter à l’établissement.
          </p>
        </li>
      </ol>
      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          class="rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95"
          @click="openApply"
        >
          Demander cette bourse
        </button>
        <NuxtLink
          to="/programmes"
          class="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-primary transition hover:border-primary/30"
        >
          Retour aux formations
        </NuxtLink>
      </div>
    </section>

    <section class="mb-12 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium">
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxgQiA_dFF5CXd5qsPupQR9Px4ntfxLcHCvCxU20e2CtEMlNZPQ9ddTCoGzcB-Octn-4FUZrsnM-sYLprslFQesARgko9SqViPtjWoVKSPcJXtJugfQad4po9ZtBSASy0nzo9Q02FY6w04d0Knldj_a9kaJazSYZOc17NiHtu2HV8eEGbDNalRAPBDZKswXtdcsRHZNIFwvGV5qlaDBa-LYD5XnlThXB-RZIJgoNNiYH_Eg3A6hOSXHF7yrk1YKSP7rS48uNi-Pzk"
        alt="Localisation programme"
        class="h-60 w-full object-cover"
      />
    </section>

    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <section class="space-y-10 lg:col-span-8">
        <div>
          <h2 class="mb-6 border-l-4 border-secondary-container pl-4 font-headline text-2xl font-bold text-primary md:text-3xl">
            Informations cles
          </h2>
          <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs uppercase text-slate-500">Duree</p>
              <p class="font-bold text-primary">{{ programme.duree }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs uppercase text-slate-500">Langue</p>
              <p class="font-bold text-primary">Francais / Anglais</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs uppercase text-slate-500">Scolarite ref.</p>
              <p class="font-bold text-primary">{{ programme.frais.toLocaleString('fr-FR') }} {{ programme.devise }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs uppercase text-slate-500">Insertion</p>
              <p class="font-bold text-primary">{{ programme.placement || '—' }}</p>
            </div>
          </div>
        </div>

        <div v-if="programme.eligibilite" class="rounded-2xl border border-slate-200 bg-white p-8">
          <h2 class="mb-4 font-headline text-2xl font-bold text-primary">Eligibilite et pieces</h2>
          <p class="whitespace-pre-line text-slate-700">{{ programme.eligibilite }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-100 p-8 md:p-10">
          <h2 class="mb-4 font-headline text-2xl font-bold text-primary md:text-3xl">Projections et debouches</h2>
          <p class="whitespace-pre-line text-slate-700">
            {{
              programme.perspectives ||
                'Trajectoire locale : banques digitales operateurs mobiles et PMI en forte croissance a Dakar et en region.'
            }}
          </p>
        </div>
      </section>

      <aside class="space-y-6 lg:col-span-4">
        <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-premium">
          <h3 class="mb-4 font-headline text-2xl font-bold text-primary">Calendrier admission</h3>
          <div class="space-y-3 text-sm text-slate-600">
            <p><strong class="text-primary">Priorite :</strong> 15 juin 2026</p>
            <p><strong class="text-primary">Regulier :</strong> 30 juillet 2026</p>
            <p><strong class="text-primary">Dernier appel :</strong> 20 septembre 2026</p>
          </div>
          <button
            type="button"
            class="mt-6 block w-full rounded-lg bg-secondary-container px-4 py-3 text-center font-semibold text-on-secondary-container"
            @click="openApply"
          >
            Postuler à cette bourse
          </button>
        </div>
        <div class="rounded-2xl bg-primary p-8 text-white">
          <h4 class="mb-3 text-2xl font-bold">Bourse partenaire</h4>
          <p class="text-sm text-slate-300">
            La prise en charge est portee par <strong>{{ programme.partnerName }}</strong>. BourseFi facilite le depot et le suivi.
          </p>
        </div>
      </aside>
    </div>
  </main>
  <main v-else class="mx-auto max-w-4xl px-4 py-20 md:px-8">
    <p class="text-lg text-slate-600">Programme introuvable.</p>
  </main>
</template>
