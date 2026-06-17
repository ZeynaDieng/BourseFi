<script setup lang="ts">
import { STUDENT_HOME } from '~/utils/routes'

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
    router.push(STUDENT_HOME)
  }
}
</script>

<template>
  <main v-if="programme" class="mx-auto max-w-4xl px-6 py-10 md:py-16">
    <!-- Breadcrumb -->
    <nav class="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
      <NuxtLink to="/programmes" class="hover:text-primary">Catalogue</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-primary">Détails</span>
    </nav>

    <!-- Essential Info Header -->
    <div class="mb-10">
      <h1 class="font-headline text-3xl font-extrabold text-primary md:text-5xl lg:text-5xl">
        {{ programme.titre }}
      </h1>
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <span class="flex items-center gap-1.5 rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary">
          <span class="material-symbols-outlined text-base">school</span>
          {{ programme.etablissement }}
        </span>
        <span class="flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600">
          <span class="material-symbols-outlined text-base">location_on</span>
          {{ programme.ville }}
        </span>
        <span class="flex items-center gap-1.5 rounded-full bg-secondary-container/10 px-4 py-1.5 text-xs font-bold text-primary">
          <span class="material-symbols-outlined text-base">verified</span>
          {{ programme.partnerName }}
        </span>
      </div>
    </div>

    <!-- Quick Action Card (Sticky on mobile or prominent) -->
    <div class="mb-12 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-premium">
      <div class="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Frais de scolarité</p>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-3xl font-extrabold text-primary">{{ programme.frais.toLocaleString('fr-FR') }}</span>
            <span class="text-sm font-bold text-slate-500 uppercase">{{ programme.devise }}</span>
          </div>
          <p v-if="programme.fraisDossier > 0" class="mt-2 text-xs font-medium text-slate-400">
            Frais de dossier : {{ programme.fraisDossier.toLocaleString('fr-FR') }} {{ programme.devise }}
          </p>
        </div>
        <button
          type="button"
          class="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-primary/20 hover:opacity-95 md:w-auto"
          @click="openApply"
        >
          <span class="material-symbols-outlined">send</span>
          Postuler à cette bourse
        </button>
      </div>
    </div>

    <!-- Details Section -->
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <section class="mb-12">
          <h2 class="mb-6 font-headline text-xl font-bold text-primary md:text-2xl uppercase tracking-wider">A propos de la formation</h2>
          <p class="text-lg leading-relaxed text-slate-600">{{ programme.description }}</p>
        </section>

        <section v-if="programme.eligibilite" class="mb-12 rounded-2xl bg-slate-50 p-6 md:p-8">
          <h3 class="mb-4 font-headline text-lg font-bold text-primary italic">Éligibilité & Pièces</h3>
          <p class="whitespace-pre-line text-sm leading-relaxed text-slate-600">{{ programme.eligibilite }}</p>
        </section>
      </div>

      <aside class="lg:col-span-4">
        <div class="sticky top-24 space-y-6">
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h4 class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">En résumé</h4>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-primary">
                  <span class="material-symbols-outlined text-xl">calendar_today</span>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase text-slate-400">Durée</p>
                  <p class="text-sm font-bold text-primary">{{ programme.duree }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-secondary">
                  <span class="material-symbols-outlined text-xl">translate</span>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase text-slate-400">Langue</p>
                  <p class="text-sm font-bold text-primary">Français</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="rounded-2xl bg-secondary-container/10 p-6 border border-secondary-container/30">
            <p class="text-xs font-medium text-on-secondary-container">
              La prise en charge est assurée par <strong>{{ programme.partnerName }}</strong>. BourseFi gère uniquement l'homologation de votre dossier.
            </p>
          </div>
        </div>
      </aside>
    </div>

    <CandidatureModal :open="modalOpen" :programme="programme" @close="modalOpen = false" @submitted="onCandidatureSubmitted" />
  </main>

  <main v-else class="mx-auto max-w-4xl px-6 py-20 text-center">
    <div class="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
      <span class="material-symbols-outlined text-4xl">error</span>
    </div>
    <h1 class="mt-6 text-2xl font-bold text-primary">Formation introuvable</h1>
    <p class="mt-2 text-slate-500 text-sm">Le programme que vous cherchez n'existe pas ou a été retiré.</p>
    <NuxtLink to="/programmes" class="mt-8 inline-block font-bold text-primary underline underline-offset-8">Retour au catalogue</NuxtLink>
  </main>
</template>
