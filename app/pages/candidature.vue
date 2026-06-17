<script setup lang="ts">
import { computed } from 'vue'
import { STUDENT_HOME } from '~/utils/routes'
import {
  BOURSE_PROCESS_HEADING,
  resolveBourseProcessSteps,
} from '~/utils/bourse-process-steps'

const { data: me } = await useFetch('/api/auth/me')
const { data: site } = await usePublicSite()

const loginHref = { path: '/auth/login', query: { redirect: STUDENT_HOME } }

const processCards = computed(() => {
  const cards = (site.value?.content?.home_process as { cards?: Array<{ step?: string; title: string; body: string }> })?.cards
  return resolveBourseProcessSteps(cards)
})

useSeoMeta({
  title: 'Comment obtenir une bourse — BourseFi',
  description: 'Obtenez votre bourse en 3 étapes : choisissez une formation, déposez votre demande, recevez votre attestation.',
})
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
    <h1 class="font-headline text-3xl font-extrabold text-primary md:text-4xl">
      {{ BOURSE_PROCESS_HEADING.title }}
    </h1>
    <p class="mt-3 text-slate-600">
      {{ BOURSE_PROCESS_HEADING.subtitle }}
    </p>
    <p class="mt-2 text-sm font-semibold text-primary">
      {{ BOURSE_PROCESS_HEADING.flow }}
    </p>

    <ol class="mt-10 space-y-4">
      <li
        v-for="(card, i) in processCards"
        :key="i"
        class="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-premium md:p-6"
      >
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-headline text-sm font-extrabold text-primary">
          {{ card.step ?? i + 1 }}
        </span>
        <div>
          <h2 class="font-headline text-lg font-bold text-primary">{{ card.title }}</h2>
          <p class="mt-1 text-sm leading-snug text-slate-600">{{ card.body }}</p>
        </div>
      </li>
    </ol>

    <div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
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
        Voir les formations
      </NuxtLink>
      <NuxtLink
        v-if="!me?.user"
        to="/auth/register"
        class="rounded-xl border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Créer un compte
      </NuxtLink>
      <NuxtLink
        v-if="!me?.user"
        :to="loginHref"
        class="rounded-xl border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Se connecter
      </NuxtLink>
    </div>
  </main>
</template>
