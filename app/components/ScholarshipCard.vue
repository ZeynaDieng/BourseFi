<script setup lang="ts">
import type { BourseDto } from '~/types/bourse'
import { badgeCoverage, cardBase, btnPrimary } from '~/utils/design-tokens'

defineProps<{
  bourse: BourseDto
  compact?: boolean
}>()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <article :class="[cardBase, 'flex flex-col p-6']">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <span :class="badgeCoverage">Couverture {{ bourse.coveragePercent }} %</span>
        <h3 class="mt-2 font-headline text-lg font-extrabold text-primary">
          {{ bourse.titre }}
        </h3>
      </div>
      <img
        v-if="bourse.partnerLogoUrl"
        :src="bourse.partnerLogoUrl"
        :alt="bourse.partnerName"
        class="h-10 w-10 shrink-0 rounded-lg object-contain"
      />
    </div>

    <dl class="space-y-2 text-sm text-slate-600">
      <div class="flex justify-between gap-2">
        <dt class="text-slate-400">Formation</dt>
        <dd class="font-medium text-primary">{{ bourse.programmeTitre }}</dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt class="text-slate-400">École</dt>
        <dd class="font-semibold text-primary">{{ bourse.etablissement }}</dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt class="text-slate-400">Partenaire</dt>
        <dd class="font-medium">{{ bourse.partnerName }}</dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt class="text-slate-400">Montant couvert</dt>
        <dd class="font-semibold text-secondary">
          {{ bourse.montantBourse.toLocaleString('fr-FR') }} {{ bourse.devise }}
        </dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt class="text-slate-400">Places restantes</dt>
        <dd class="font-medium">{{ bourse.placesRestantes }}</dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt class="text-slate-400">Date limite</dt>
        <dd class="font-medium">{{ formatDate(bourse.dateLimite) }}</dd>
      </div>
    </dl>

    <div class="mt-6 flex gap-2">
      <NuxtLink
        :to="`/bourses/${bourse.slug}`"
        :class="[btnPrimary, 'flex-1 text-center']"
      >
        Postuler
      </NuxtLink>
      <NuxtLink
        :to="{ path: '/comparaison', query: { compare: bourse.programmeSlug } }"
        class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Comparer
      </NuxtLink>
    </div>
  </article>
</template>
