<script setup lang="ts">
import { STUDENT_HOME } from '~/utils/routes'

const { data: me } = await useFetch('/api/auth/me')

const loginHref = { path: '/auth/login', query: { redirect: STUDENT_HOME } }
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-16">
    <span class="material-symbols-outlined mb-4 block text-5xl text-secondary">school</span>
    <h1 class="font-headline text-3xl font-extrabold text-primary">
      Demander une bourse en ligne
    </h1>
    <p class="mt-4 text-slate-600">
      Le plus simple : ouvrez le
      <NuxtLink to="/programmes" class="font-semibold text-primary underline-offset-2 hover:underline">
        catalogue des formations
      </NuxtLink>
      ; choisissez un programme ; cliquez sur
      <strong>Demander une bourse</strong> pour lire la procédure puis remplir le formulaire .
      Les frais de dossier et le bailleur sont indiqués avant validation.
    </p>
    <ol class="mt-8 list-decimal space-y-3 pl-5 text-sm text-slate-700">
      <li>Choisir une formation sous bourse dans le catalogue.</li>
      <li>Ouvrir la procédure et compléter la candidature.</li>
      <li>Payer les frais de dossier si le programme en prévoit.</li>
      <li>Suivre le dossier depuis votre espace étudiant.</li>
    </ol>
    <div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
      <NuxtLink
        :to="{ path: '/programmes', hash: '#programmes-catalog' }"
        class="rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
      >
        Demander une bourse — catalogue
      </NuxtLink>
      <NuxtLink
        v-if="!me?.user"
        to="/auth/register"
        class="rounded-xl border border-primary px-6 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/5"
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
      <NuxtLink
        to="/ecoles"
        class="rounded-xl border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Parcourir les écoles
      </NuxtLink>
    </div>
  </main>
</template>
