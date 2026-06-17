<script setup lang="ts">
import { computed } from 'vue'
import type { PartnerSchoolCardEcole } from '~/types/partner-school-card'

const { data: ecoles } = await useFetch('/api/etablissements')

const listeEcoles = computed(() => (ecoles.value ?? []) as unknown as PartnerSchoolCardEcole[])
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-12 md:px-8">
    <header class="mb-12 text-center md:text-left">
      <p class="text-xs font-bold uppercase tracking-widest text-secondary">BourseFi au Senegal</p>
      <h1 class="mt-3 font-headline text-4xl font-extrabold text-primary">Écoles partenaires</h1>
      <p class="mx-auto mt-4 max-w-2xl text-slate-600 md:mx-0">
        Découvrez les établissements partenaires et accédez directement aux bourses disponibles pour chaque école.
      </p>
    </header>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <PartnerSchoolCard v-for="e in listeEcoles" :key="e.slug" :ecole="e" />
    </div>
  </main>
</template>
