<script setup lang="ts">
import { btnSecondary, cardBase } from '~/utils/design-tokens'

defineProps<{
  programme: {
    id: string
    slug: string
    titre: string
    etablissement: string
    ville: string
    niveau: string
    frais: number
    devise: string
    partnerName?: string
    coveragePercent?: number | null
  }
}>()
</script>

<template>
  <article :class="[cardBase, 'flex flex-col p-6']">
    <h3 class="line-clamp-2 font-headline text-base font-extrabold leading-snug text-primary md:text-lg">
      {{ programme.titre }}
    </h3>

    <p class="mt-1 truncate text-sm font-medium text-slate-500">
      {{ programme.etablissement }}
    </p>

    <p class="mt-4 font-headline text-xl font-extrabold text-primary">
      {{ programme.frais.toLocaleString('fr-FR') }}
      <span class="text-sm font-semibold">{{ programme.devise }}</span>
    </p>

    <NuxtLink
      :to="`/programmes/${programme.slug}`"
      :class="[btnSecondary, 'mt-6 block w-full text-center']"
    >
      Découvrir
    </NuxtLink>
  </article>
</template>
