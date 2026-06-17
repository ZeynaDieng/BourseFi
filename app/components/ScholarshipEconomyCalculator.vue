<script setup lang="ts">
import { computeScholarshipEconomy, formatFcfa } from '~/utils/scholarship-math'
import { badgeCoverage } from '~/utils/design-tokens'

const props = defineProps<{
  fraisScolarite: number
  coveragePercent: number
  montantMax?: number | null
  devise?: string
  fraisDossier?: number
}>()

const economy = computed(() =>
  computeScholarshipEconomy(
    props.fraisScolarite,
    props.coveragePercent,
    props.montantMax,
    props.devise ?? 'FCFA',
  ),
)
</script>

<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h3 class="font-headline text-lg font-bold text-primary">Calculateur d'économie</h3>
      <span :class="badgeCoverage">Couverture {{ economy.coveragePercent }} %</span>
    </div>
    <dl class="space-y-3 text-sm">
      <div class="flex justify-between gap-4 border-b border-slate-50 pb-3">
        <dt class="text-slate-500">Coût formation (référentiel)</dt>
        <dd class="font-bold text-primary">{{ formatFcfa(economy.referentiel, economy.devise) }}</dd>
      </div>
      <div class="flex justify-between gap-4 border-b border-slate-50 pb-3">
        <dt class="text-slate-500">Bourse</dt>
        <dd class="font-bold text-secondary">{{ formatFcfa(economy.montantBourse, economy.devise) }}</dd>
      </div>
      <div class="flex justify-between gap-4 border-b border-slate-50 pb-3">
        <dt class="text-slate-500">Reste à payer</dt>
        <dd class="font-bold text-primary">{{ formatFcfa(economy.resteACharge, economy.devise) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500">Économie réalisée</dt>
        <dd class="font-extrabold text-secondary-fixed">{{ economy.economiePercent }} %</dd>
      </div>
    </dl>
    <p v-if="fraisDossier && fraisDossier > 0" class="mt-4 text-xs text-slate-400">
      Frais de dossier : {{ fraisDossier.toLocaleString('fr-FR') }} {{ devise ?? 'FCFA' }} (hors couverture scolarité)
    </p>
  </div>
</template>
