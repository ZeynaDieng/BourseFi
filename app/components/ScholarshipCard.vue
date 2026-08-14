<script setup lang="ts">
import { computed } from 'vue'
import type { BourseDto } from '~/types/bourse'
import {
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
  <article :class="[cardBase, cardInteractive, 'group flex flex-col justify-between p-6 transition-all duration-300 animate-fade-in-up hover:border-amber-300 hover:shadow-xl']">
    <div>
      <!-- Badges haut -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
          {{ bourse.programmeNiveau }}
        </span>
        <span v-if="bourse.isBestEconomy" class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black text-amber-950 ring-1 ring-amber-300">
          🏆 Top Économie
        </span>
      </div>

      <!-- Titre de la bourse -->
      <h3 class="font-headline text-lg font-extrabold leading-snug text-primary group-hover:text-secondary transition-colors line-clamp-2">
        {{ bourse.titre }}
      </h3>

      <!-- Établissement -->
      <p class="mt-1.5 flex items-center gap-1 text-xs font-semibold text-slate-500 truncate">
        <span class="material-symbols-outlined text-sm text-slate-400 select-none">school</span>
        {{ bourse.etablissement }}
      </p>

      <!-- Encadré Économie Jaune BourseFi -->
      <div v-if="hasRealSavings" class="mt-4 rounded-xl bg-amber-50 border border-amber-200/90 p-3.5 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase tracking-wider text-amber-900">Économie BourseFi</span>
          <span v-if="showCoveragePercent && bourse.economiePercent" class="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-black text-amber-950">
            - {{ bourse.economiePercent }} %
          </span>
        </div>
        <p class="font-headline text-xl font-black text-amber-950 mt-1">
          Economisez {{ bourse.economie?.toLocaleString('fr-FR') }} {{ bourse.devise }}
        </p>
      </div>

      <!-- Tarif direct si pas d'économie -->
      <div v-else-if="isDirectRate" class="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
        <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">Tarif officiel direct</span>
        <p class="font-headline text-lg font-black text-primary mt-1">
          {{ (bourse.tuitionFee || bourse.montantBourse || 0).toLocaleString('fr-FR') }} {{ bourse.devise }}
        </p>
      </div>

      <!-- Comparatif de prix -->
      <div v-if="hasRealSavings" class="mt-3.5 flex items-baseline justify-between text-xs border-t border-slate-100 pt-2.5">
        <span class="text-slate-600">Votre tarif : <strong class="font-extrabold text-primary text-sm">{{ bourse.montantBourse?.toLocaleString('fr-FR') }} {{ bourse.devise }}</strong></span>
        <span class="text-slate-400 line-through">{{ bourse.tuitionFee?.toLocaleString('fr-FR') }} {{ bourse.devise }}</span>
      </div>
    </div>

    <!-- Pied de carte -->
    <div class="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between gap-2">
      <span class="text-[11px] font-semibold text-slate-500">
        Frais dossier : {{ bourse.fraisDossier.toLocaleString('fr-FR') }} {{ bourse.devise }}
      </span>

      <NuxtLink
        :to="`/bourses/${bourse.slug}`"
        :class="[btnPrimary, 'px-4 py-2 text-xs font-bold transition group-hover:opacity-95']"
      >
        Postuler
      </NuxtLink>
    </div>
  </article>
</template>
