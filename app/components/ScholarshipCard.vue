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

const isInvalidPricing = computed(() => {
  return props.bourse.pricingStatus === 'INVALID_PRICING'
})
</script>

<template>
  <article :class="[cardBase, cardInteractive, 'group relative flex flex-col justify-between p-6 transition-all duration-300 animate-fade-in-up hover:shadow-premium']">
    <div>
      <!-- Top Badge Best Economy -->
      <div v-if="bourse.isBestEconomy" class="mb-3">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700 ring-1 ring-amber-200 shadow-sm">
          <span>🏆</span> MEILLEURE ÉCONOMIE
        </span>
      </div>

      <!-- En-tête Carte -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1">
          <span class="inline-flex rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {{ bourse.programmeNiveau }}
          </span>
          <h3 class="mt-2 line-clamp-2 font-headline text-lg font-extrabold leading-snug text-primary group-hover:text-secondary transition-colors">
            {{ bourse.titre }}
          </h3>
        </div>
      </div>

      <p class="mt-1 truncate text-sm font-semibold text-slate-500">
        {{ bourse.etablissement }}
      </p>

      <!-- Bloc Tarif & Économie Dominant -->
      <div class="mt-5 space-y-3">
        <!-- Cas 1 : Économie Réelle Réussie -->
        <template v-if="hasRealSavings">
          <div class="flex items-baseline justify-between text-xs">
            <span class="font-medium text-slate-400">Tarif public normal :</span>
            <span class="font-bold text-slate-400 line-through">
              {{ bourse.tuitionFee?.toLocaleString('fr-FR') }} {{ bourse.devise }}
            </span>
          </div>

          <div class="flex items-baseline justify-between border-t border-slate-100 pt-2">
            <span class="text-xs font-bold text-slate-700">Avec BourseFi :</span>
            <span class="font-headline text-lg font-black text-primary">
              {{ bourse.montantBourse?.toLocaleString('fr-FR') }} {{ bourse.devise }}
            </span>
          </div>

          <!-- BLOC VOUS ÉCONOMISEZ -->
          <div class="rounded-2xl bg-emerald-50/90 p-3.5 text-center ring-1 ring-emerald-200/80 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-wider text-emerald-800">VOUS ÉCONOMISEZ</p>
            <p class="font-headline text-xl font-black text-emerald-700 md:text-2xl mt-0.5">
              {{ bourse.economie?.toLocaleString('fr-FR') }} {{ bourse.devise }}
            </p>
            <p v-if="showCoveragePercent && bourse.economiePercent" class="mt-1 text-[11px] font-bold text-emerald-600">
              soit {{ bourse.economiePercent }} % de réduction
            </p>
          </div>
        </template>

        <!-- Cas 2 : Tarif Direct sans réduction -->
        <template v-else-if="isDirectRate">
          <div class="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-200/80">
            <p class="text-[10px] font-black uppercase tracking-wider text-slate-500">TARIF OFFICIEL DIRECT</p>
            <p class="font-headline text-xl font-black text-primary mt-1">
              {{ (bourse.tuitionFee || bourse.montantBourse || 0).toLocaleString('fr-FR') }} {{ bourse.devise }}
            </p>
            <p class="mt-1 text-[11px] font-medium text-slate-500">Prix officiel de l'établissement</p>
          </div>
        </template>

        <!-- Cas 3 : Tarification à confirmer -->
        <template v-else-if="isInvalidPricing">
          <div class="rounded-2xl bg-amber-50/70 p-3.5 text-center ring-1 ring-amber-200/80">
            <p class="text-[10px] font-bold uppercase text-amber-800">Tarification à confirmer</p>
            <p class="mt-1 text-xs text-amber-700">Consulter l'établissement</p>
          </div>
        </template>

        <template v-else>
          <div class="flex items-baseline justify-between border-t border-slate-100 pt-2">
            <span class="text-xs font-bold text-slate-700">Tarif formation :</span>
            <span class="font-headline text-lg font-black text-primary">
              {{ (bourse.montantBourse || bourse.tuitionFee || 0).toLocaleString('fr-FR') }} {{ bourse.devise }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- Pied de carte -->
    <div class="mt-6 border-t border-slate-100 pt-4">
      <p class="text-center text-xs font-semibold text-slate-400">
        Frais de dossier BourseFi : {{ bourse.fraisDossier.toLocaleString('fr-FR') }} {{ bourse.devise }}
      </p>

      <NuxtLink
        :to="`/bourses/${bourse.slug}`"
        :class="[btnPrimary, 'mt-3 block w-full text-center py-3 text-sm font-bold shadow-md transition group-hover:shadow-lg group-hover:opacity-95']"
      >
        Voir la bourse
      </NuxtLink>
    </div>
  </article>
</template>
