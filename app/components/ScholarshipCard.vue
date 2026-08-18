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

const hasFeeBreakdown = computed(() => {
  return props.bourse.fraisInscription !== undefined && props.bourse.fraisInscription !== null &&
         props.bourse.mensualite !== undefined && props.bourse.mensualite !== null
})

const totalPreferentielCalculated = computed(() => {
  if (props.bourse.montantBourse && props.bourse.montantBourse > 0) {
    return props.bourse.montantBourse
  }
  if (hasFeeBreakdown.value) {
    return (props.bourse.fraisInscription || 0) + ((props.bourse.mensualite || 0) * (props.bourse.nombreMois || 10))
  }
  return props.bourse.tuitionFee || 0
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
        <span v-if="bourse.etablissementSlug === 'ifaa-dakar'" class="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
          Bourse IFAA 2025-2026
        </span>
      </div>

      <h3 class="line-clamp-2 font-headline text-lg font-extrabold leading-snug text-primary">
        {{ bourse.titre }}
      </h3>

      <p class="mt-1 truncate text-sm font-medium text-slate-500">
        {{ bourse.etablissement }}
      </p>

      <!-- Bulle Tarif Préférentiel BourseFi -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span v-if="hasRealSavings" :class="[badgeCoverage, 'w-fit font-bold']">
          Économisez {{ bourse.economie?.toLocaleString('fr-FR') }} {{ bourse.devise }}
          <template v-if="showCoveragePercent && bourse.economiePercent">
            ({{ bourse.economiePercent }} %)
          </template>
        </span>
        <span v-else-if="isDirectRate || bourse.montantBourse || hasFeeBreakdown" class="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
          Tarif préférentiel BourseFi
        </span>
        <span v-else-if="showCoveragePercent && bourse.coveragePercent > 0" :class="[badgeCoverage, 'w-fit']">
          {{ bourse.coveragePercent }} % de réduction
        </span>
      </div>

      <!-- Détail de la tarification préférentielle (Inscription + Mensualités + Total) -->
      <div v-if="hasFeeBreakdown" class="mt-4 space-y-1.5 rounded-2xl bg-slate-50 p-3.5 text-xs border border-slate-100">
        <div class="flex justify-between text-slate-600">
          <span>Inscription préférentielle :</span>
          <span class="font-bold text-primary">{{ (bourse.fraisInscription || 0).toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>Mensualité :</span>
          <span class="font-bold text-primary">{{ (bourse.mensualite || 0).toLocaleString('fr-FR') }} {{ bourse.devise }} × {{ bourse.nombreMois || 10 }} mois</span>
        </div>
        <div class="flex justify-between border-t border-slate-200/60 pt-2 font-extrabold text-emerald-800 text-sm">
          <span>Total après bourse :</span>
          <span>{{ totalPreferentielCalculated.toLocaleString('fr-FR') }} {{ bourse.devise }} au total</span>
        </div>
      </div>

      <!-- Tarifs de formation standard -->
      <div v-else-if="hasRealSavings" class="mt-3 flex items-baseline gap-2 text-sm">
        <span class="font-extrabold text-primary">
          {{ bourse.montantBourse?.toLocaleString('fr-FR') }} {{ bourse.devise }}
        </span>
        <span class="text-xs text-slate-400 line-through">
          {{ bourse.tuitionFee?.toLocaleString('fr-FR') }} {{ bourse.devise }}
        </span>
      </div>
      <div v-else-if="bourse.tuitionFee || bourse.montantBourse" class="mt-3 flex items-baseline gap-2 text-sm">
        <span class="font-extrabold text-primary">
          Total après bourse : {{ (bourse.montantBourse || bourse.tuitionFee)?.toLocaleString('fr-FR') }} {{ bourse.devise }} au total
        </span>
      </div>
    </div>

    <!-- Pied de carte avec Frais Annexes / CIAE -->
    <div class="mt-5 border-t border-slate-100 pt-3">
      <div v-if="bourse.etablissementSlug === 'ifaa-dakar'" class="text-xs font-bold text-slate-600 space-y-0.5">
        <p>Carte CIAE obligatoire : 5 000 FCFA</p>
        <p v-if="bourse.autresFrais" class="text-amber-700">Frais d'examen Santé L3 : {{ bourse.autresFrais.toLocaleString('fr-FR') }} FCFA</p>
      </div>
      <p v-else class="font-headline text-xs font-bold text-slate-500">
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
