<script setup lang="ts">
import { computed } from 'vue'
import type { BourseDto } from '~/types/bourse'
import {
  badgeCoverage,
  badgeLimited,
  badgePopular,
  cardBase,
  btnPrimary,
  cardInteractive,
} from '~/utils/design-tokens'

const props = defineProps<{
  bourse: BourseDto
}>()

const showLimited = computed(
  () => props.bourse.placesRestantes > 0 && props.bourse.placesRestantes <= 5,
)

const showPopular = computed(() => {
  const { quota, placesRestantes } = props.bourse
  if (quota <= 0) return false
  const filled = quota - placesRestantes
  return filled / quota >= 0.65
})

const fillPercent = computed(() => {
  const { quota, placesRestantes } = props.bourse
  if (quota <= 0) return 0
  return Math.min(100, Math.round(((quota - placesRestantes) / quota) * 100))
})

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
  <article :class="[cardBase, cardInteractive, 'group flex flex-col p-6']">
    <div v-if="showLimited || showPopular" class="mb-3 flex flex-wrap gap-1.5">
      <span v-if="showLimited" :class="badgeLimited">Places limitées</span>
      <span v-if="showPopular" :class="badgePopular">Très demandée</span>
    </div>

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

    <div
      v-if="bourse.quota > 0"
      class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      :aria-valuenow="fillPercent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${fillPercent} % des places pourvues`"
    >
      <div
        class="h-full rounded-full bg-secondary transition-all duration-700 ease-out"
        :style="{ width: `${fillPercent}%` }"
      />
    </div>

    <p class="mt-2 text-xs text-slate-400">
      {{ formatDeadline(bourse.dateLimite) }}
    </p>

    <NuxtLink
      :to="`/bourses/${bourse.slug}`"
      :class="[btnPrimary, 'mt-5 block w-full text-center transition group-hover:opacity-95']"
    >
      Postuler
    </NuxtLink>
  </article>
</template>
