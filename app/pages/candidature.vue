<script setup lang="ts">
import { STUDENT_HOME } from '~/utils/routes'

const { data: me } = await useFetch('/api/auth/me')
const { data: site } = await usePublicSite()

const loginHref = { path: '/auth/login', query: { redirect: STUDENT_HOME } }

const processCards = computed(() => {
  const cards = (site.value?.content?.home_process as { cards?: Array<{ step?: string; title: string; body: string }> })?.cards ?? []
  return cards.length
    ? cards
    : [
        { step: '01', title: 'Choisissez une formation', body: 'Parcourez les bourses et sélectionnez la formation couverte par un partenaire financeur.' },
        { step: '02', title: 'Soumettez votre demande', body: 'Complétez votre dossier en ligne en quelques minutes depuis votre espace candidat.' },
        { step: '03', title: 'Payez les frais de dossier', body: 'Réglez les frais de dossier par Wave ou Orange Money pour transmettre votre candidature.' },
        { step: '04', title: 'Recevez votre attestation', body: 'Suivez votre dossier et téléchargez l’attestation dès validation par le partenaire.' },
      ]
})

useSeoMeta({
  title: 'Comment ça marche — BourseFi',
  description: 'Découvrez comment obtenir une bourse d\'études en ligne avec BourseFi.',
})
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-16">
    <span class="material-symbols-outlined mb-4 block text-5xl text-secondary">verified</span>
    <h1 class="font-headline text-3xl font-extrabold text-primary md:text-4xl">
      Comment obtenir une bourse
    </h1>
    <p class="mt-4 text-slate-600">
      BourseFi centralise l’accès aux bourses d’études au Sénégal. Commencez par une
      <NuxtLink to="/bourses" class="font-semibold text-primary underline-offset-2 hover:underline">bourse disponible</NuxtLink>,
      puis déposez votre dossier en quelques minutes.
    </p>

    <ol class="mt-12 space-y-6">
      <li
        v-for="(card, i) in processCards"
        :key="i"
        class="flex gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium"
      >
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {{ card.step ?? String(i + 1).padStart(2, '0') }}
        </span>
        <div>
          <h2 class="font-headline text-lg font-bold text-primary">{{ card.title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ card.body }}</p>
        </div>
      </li>
    </ol>

    <div class="mt-12 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
      <NuxtLink
        to="/bourses"
        class="rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
      >
        Trouver une bourse
      </NuxtLink>
      <NuxtLink
        to="/programmes"
        class="rounded-xl border border-primary px-6 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/5"
      >
        Explorer les formations
      </NuxtLink>
      <NuxtLink
        v-if="!me?.user"
        to="/auth/register"
        class="rounded-xl border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Créer un compte étudiant
      </NuxtLink>
      <NuxtLink
        v-if="!me?.user"
        :to="loginHref"
        class="rounded-xl border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        J’ai déjà un compte
      </NuxtLink>
    </div>
  </main>
</template>
