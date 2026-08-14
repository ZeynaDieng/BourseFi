<script setup lang="ts">
import { computed } from 'vue'
import type { BourseDto } from '~/types/bourse'
import {
  badgeCoverage,
  cardBase,
  btnPrimary,
  cardInteractive,
} from '~/utils/design-tokens'

const props = defineProps<{
  bourse: BourseDto
}>()

const showCoveragePercent = useShowCoveragePercent()
</script>

<template>
  <article :class="[cardBase, cardInteractive, 'group flex flex-col p-6 animate-fade-in-up']">
    <h3 class="line-clamp-2 font-headline text-lg font-extrabold leading-snug text-primary">
      {{ bourse.titre }}
    </h3>

    <p class="mt-1 truncate text-sm font-medium text-slate-500">
      {{ bourse.etablissement }}
    </p>

    <span v-if="showCoveragePercent && bourse.coveragePercent > 0" :class="[badgeCoverage, 'mt-4 w-fit']">
      {{ bourse.coveragePercent }} % de prise en charge
    </span>

    <p class="mt-3 font-headline text-sm font-bold text-primary">
      Frais de dossier : {{ bourse.fraisDossier.toLocaleString('fr-FR') }} {{ bourse.devise }}
    </p>

    <NuxtLink
      :to="`/bourses/${bourse.slug}`"
      :class="[btnPrimary, 'mt-5 block w-full text-center transition group-hover:opacity-95']"
    >
      Postuler
    </NuxtLink>
  </article>
</template>
