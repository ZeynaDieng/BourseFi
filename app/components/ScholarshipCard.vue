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
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
          {{ bourse.programmeNiveau }}
        </span>
        <span v-if="bourse.isBestEconomy" class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900">
          🏆 Top Économie
        </span>
      </div>

      <h3 class="mt-3 line-clamp-2 font-headline text-lg font-extrabold leading-snug text-primary">
        {{ bourse.titre }}
      </h3>

      <p class="mt-1 truncate text-sm font-medium text-slate-500">
        {{ bourse.etablissement }}
      </p>

      <!-- Badges Économie / Tarif en Jaune BourseFi -->
      <div class="mt-4">
        <!-- Cas 1 : Économie en FCFA (Jaune BourseFi) -->
        <div v-if="hasRealSavings" class="inline-flex flex-wrap items-center gap-2">
          <span :class="[badgeCoverage, 'w-fit font-bold']">
            Économisez {{ bourse.economie?.toLocaleString('fr-FR') }} {{ bourse.devise }}
          </span>
          <span v-if="showCoveragePercent && bourse.economiePercent" class="text-xs font-bold text-slate-500">
            ({{ bourse.economiePercent }} %)
          </span>
        </div>

        <!-- Cas 2 : Tarif Direct -->
        <span v-else-if="isDirectRate" class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
          Tarif officiel : {{ (bourse.tuitionFee || bourse.montantBourse || 0).toLocaleString('fr-FR') }} {{ bourse.devise }}
        </span>

        <!-- Cas 3 : Couverture % générique si pas d'économie calculée -->
        <span v-else-if="showCoveragePercent && bourse.coveragePercent > 0" :class="[badgeCoverage, 'w-fit']">
          {{ bourse.coveragePercent }} % de prise en charge
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
    </div>

    <div class="mt-5 border-t border-slate-100 pt-3">
      <p class="font-headline text-xs font-bold text-slate-500">
        Frais de dossier : {{ bourse.fraisDossier.toLocaleString('fr-FR') }} {{ bourse.devise }}
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
