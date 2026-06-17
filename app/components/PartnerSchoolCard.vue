<script setup lang="ts">
import { computed } from 'vue'
import type { PartnerSchoolCardEcole } from '~/types/partner-school-card'
import { partnerSchoolCoverFallback } from '~/utils/marketing-visuals'
import { btnSecondary, cardBase } from '~/utils/design-tokens'

const props = defineProps<{
  ecole: PartnerSchoolCardEcole
}>()

const coverSrc = computed(
  () => props.ecole.coverImageUrl?.trim() || partnerSchoolCoverFallback(props.ecole.slug),
)

const programmeCount = computed(
  () => props.ecole.formationsCount ?? props.ecole.programmes?.length ?? 0,
)
const boursesCount = computed(() => props.ecole.boursesCount ?? 0)

const initials = computed(() => {
  const words = props.ecole.nom.split(/\s+/).filter(Boolean)
  const letters = words.slice(0, 3).map((w) => w[0]?.toUpperCase() ?? '')
  return letters.join('').slice(0, 3) || 'BF'
})

function formatFormations(count: number) {
  return `${count} formation${count !== 1 ? 's' : ''}`
}

function formatBourses(count: number) {
  return `${count} bourse${count !== 1 ? 's' : ''} disponible${count !== 1 ? 's' : ''}`
}
</script>

<template>
  <article :class="[cardBase, 'flex flex-col']">
    <div class="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100">
      <img
        :src="coverSrc"
        :alt="`Campus — ${ecole.nom}`"
        class="h-full w-full object-cover"
        width="640"
        height="400"
        loading="lazy"
        decoding="async"
      />
      <div
        class="absolute left-3 top-3 flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-md ring-1 ring-black/5"
      >
        <img
          v-if="ecole.logoUrl?.trim()"
          :src="ecole.logoUrl.trim()"
          :alt="`Logo ${ecole.nom}`"
          class="max-h-full max-w-full object-contain"
          width="48"
          height="48"
          loading="lazy"
        />
        <span
          v-else
          class="flex h-full w-full items-center justify-center rounded-lg bg-primary/10 text-[11px] font-extrabold leading-none text-primary"
        >
          {{ initials }}
        </span>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <h3 class="line-clamp-2 font-headline text-base font-bold leading-snug text-primary md:text-lg">
        {{ ecole.nom }}
      </h3>

      <p class="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <span class="material-symbols-outlined text-[18px] text-red-600">location_on</span>
        {{ ecole.ville }}
      </p>

      <ul class="mt-4 space-y-1.5 text-sm font-medium text-primary">
        <li class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-primary">school</span>
          {{ formatFormations(programmeCount) }}
        </li>
        <li class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-secondary">payments</span>
          {{ formatBourses(boursesCount) }}
        </li>
      </ul>

      <NuxtLink
        :to="`/etablissements/${ecole.slug}`"
        :class="[btnSecondary, 'mt-5 block w-full text-center']"
      >
        Découvrir
      </NuxtLink>
    </div>
  </article>
</template>
