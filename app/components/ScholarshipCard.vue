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

const showPopular = computed(() => {
  const { quota } = props.bourse
  return quota > 0
})

const fillPercent = computed(() => {
  const { quota } = props.bourse
  if (quota <= 0) return 0
  return 100
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

</script>

<template>
  <article :class="[cardBase, cardInteractive, 'group flex flex-col p-6']">
    <div v-if="showPopular" class="mb-3 flex flex-wrap gap-1.5">
      <span :class="badgePopular">Bourse disponible</span>
    </div>

    <h3 class="line-clamp-2 font-headline text-lg font-extrabold leading-snug text-primary">
      {{ bourse.titre }}
    </h3>

    <p class="mt-1 truncate text-sm font-medium text-slate-500">
      {{ bourse.etablissement }}
    </p>

    <span :class="[badgeCoverage, 'mt-4 w-fit']">
      {{ bourse.coveragePercent }} % {{ bourse.coveragePercent === 100 ? 'Bourse complète' : 'Demi-bourse' }}
    </span>

    <p class="mt-3 font-headline text-lg font-bold text-primary">
      Frais de dossier : {{ bourse.fraisDossier.toLocaleString('fr-FR') }} {{ bourse.devise }}
    </p>

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
