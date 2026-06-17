<script setup lang="ts">
import type { BourseDto } from '~/types/bourse'
import { badgeCoverage, cardBase, btnPrimary } from '~/utils/design-tokens'

defineProps<{
  bourse: BourseDto
}>()

function formatDeadline(iso: string) {
  const date = formatDate(iso)
  return date ? `Jusqu'au ${date}` : ''
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatPlaces(count: number) {
  return `${count} place${count !== 1 ? 's' : ''} restante${count !== 1 ? 's' : ''}`
}
</script>

<template>
  <article :class="[cardBase, 'flex flex-col p-6']">
    <h3 class="line-clamp-2 font-headline text-lg font-extrabold leading-snug text-primary">
      {{ bourse.titre }}
    </h3>

    <p class="mt-1 truncate text-sm font-medium text-slate-500">
      {{ bourse.etablissement }}
    </p>

    <span :class="[badgeCoverage, 'mt-4 w-fit']">
      {{ bourse.coveragePercent }} % financé
    </span>

    <p class="mt-3 font-headline text-2xl font-extrabold text-secondary">
      {{ bourse.montantBourse.toLocaleString('fr-FR') }}
      <span class="text-base font-semibold">{{ bourse.devise }}</span>
    </p>

    <p class="mt-2 text-sm font-medium text-primary">
      {{ formatPlaces(bourse.placesRestantes) }}
    </p>

    <p class="mt-1 text-xs text-slate-400">
      {{ formatDeadline(bourse.dateLimite) }}
    </p>

    <NuxtLink
      :to="`/bourses/${bourse.slug}`"
      :class="[btnPrimary, 'mt-6 block w-full text-center']"
    >
      Postuler
    </NuxtLink>
  </article>
</template>
