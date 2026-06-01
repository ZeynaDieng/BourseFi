<script setup lang="ts">
import { computed } from 'vue'
import type { PartnerSchoolCardEcole } from '~/types/partner-school-card'
import { partnerSchoolCoverFallback } from '~/utils/marketing-visuals'

const props = defineProps<{
  ecole: PartnerSchoolCardEcole
}>()

const coverSrc = computed(
  () => props.ecole.coverImageUrl?.trim() || partnerSchoolCoverFallback(props.ecole.slug)
)

const typeDisplay = computed(
  () =>
    props.ecole.typeLabel?.trim() ||
    props.ecole.accreditation?.trim() ||
    'Établissement partenaire'
)

const programmeCount = computed(() => props.ecole.programmes?.length ?? 0)

const initials = computed(() => {
  const words = props.ecole.nom.split(/\s+/).filter(Boolean)
  const letters = words.slice(0, 3).map((w) => w[0]?.toUpperCase() ?? '')
  const joined = letters.join('')
  return joined.slice(0, 3) || 'BF'
})
</script>

<template>
  <NuxtLink
    :to="`/etablissements/${ecole.slug}`"
    class="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium transition hover:border-primary/25 hover:shadow-lg"
  >
    <div class="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100">
      <img
        :src="coverSrc"
        :alt="`Campus ou vie étudiante — ${ecole.nom}`"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
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
    <div class="flex flex-1 flex-col p-4 md:p-5">
      <h3 class="font-headline text-base font-bold leading-snug text-primary md:text-lg">
        {{ ecole.nom }}
      </h3>
      <div class="mt-3 flex items-start gap-2 text-sm text-slate-600">
        <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-red-600">school</span>
        <span class="leading-snug">{{ typeDisplay }}</span>
      </div>
      <p v-if="ecole.resume" class="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
        {{ ecole.resume }}
      </p>
      <p class="mt-auto pt-4 text-xs font-semibold text-primary">
        {{ programmeCount }} formation{{ programmeCount !== 1 ? 's' : '' }} · {{ ecole.ville }}
      </p>
    </div>
  </NuxtLink>
</template>
