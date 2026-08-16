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

const hasRealSavings = computed(() => {
  return props.bourse.economie !== undefined && props.bourse.economie !== null && props.bourse.economie > 0
})

const isDirectRate = computed(() => {
  return props.bourse.isTarifDirect || props.bourse.pricingStatus === 'TARIF_DIRECT'
})
</script>

<template>
  <article :class="[cardBase, cardInteractive, 'group flex flex-col justify-between p-6 animate-fade-in-up']">
    <div>
      <!-- Badges haut -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
          {{ bourse.programmeNiveau }}
        </span>
      </div>

      <h3 class="line-clamp-2 font-headline text-lg font-extrabold leading-snug text-primary">
        {{ bourse.titre }}
      </h3>

      <p class="mt-1 truncate text-sm font-medium text-slate-500">
        {{ bourse.etablissement }}
      </p>

      <!-- Bulle Jaune BourseFi (Pill Badge) -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span v-if="hasRealSavings" :class="[badgeCoverage, 'w-fit font-bold']">
          Économisez {{ bourse.economie?.toLocaleString('fr-FR') }} {{ bourse.devise }}/an
          <template v-if="showCoveragePercent && bourse.economiePercent">
            ({{ bourse.economiePercent }} %)
          </template>
        </span>
        <span v-else-if="isDirectRate || bourse.tuitionFee || bourse.montantBourse" class="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
          Tarif officiel garanti : {{ (bourse.montantBourse || bourse.tuitionFee || 0).toLocaleString('fr-FR') }} {{ bourse.devise }}
        </span>
        <span v-else-if="showCoveragePercent && bourse.coveragePercent > 0" :class="[badgeCoverage, 'w-fit']">
          {{ bourse.coveragePercent }} % de réduction
        </span>
      </div>

      <!-- Tarifs de formation -->
      <div v-if="hasRealSavings" class="mt-3 flex items-baseline gap-2 text-sm">
        <span class="font-extrabold text-primary">
          {{ bourse.montantBourse?.toLocaleString('fr-FR') }} {{ bourse.devise }}
        </span>
        <span class="text-xs text-slate-400 line-through">
          {{ bourse.tuitionFee?.toLocaleString('fr-FR') }} {{ bourse.devise }}
        </span>
      </div>
      <div v-else-if="bourse.tuitionFee || bourse.montantBourse" class="mt-3 flex items-baseline gap-2 text-sm">
        <span class="font-extrabold text-primary">
          {{ (bourse.montantBourse || bourse.tuitionFee)?.toLocaleString('fr-FR') }} {{ bourse.devise }} / an
        </span>
      </div>
    </div>

    <!-- Pied de carte -->
    <div class="mt-5 border-t border-slate-100 pt-3">
      <p class="font-headline text-xs font-bold text-slate-500">
        Frais de dossier : {{ (bourse.fraisDossier || 0).toLocaleString('fr-FR') }} {{ bourse.devise }}
      </p>

      <NuxtLink
        :to="`/bourses/${bourse.slug}`"
        :class="[btnPrimary, 'mt-3 block w-full text-center transition group-hover:opacity-95']"
      >
        Voir la bourse
      </NuxtLink>
    </div>
  </article>
</template>
