<script setup lang="ts">
defineProps<{
  programme: {
    id: string
    slug: string
    titre: string
    etablissement: string
    ville: string
    niveau: string
    frais: number
    devise: string
    partnerName?: string
    coveragePercent?: number | null
  }
}>()
</script>

<template>
  <article class="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-premium transition hover:border-primary/25">
    <div class="flex flex-wrap items-center gap-2">
      <span class="rounded-lg bg-primary/5 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">{{ programme.niveau }}</span>
      <span v-if="programme.coveragePercent" class="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-semibold text-on-secondary-container">
        {{ programme.coveragePercent }} %
      </span>
    </div>
    <h3 class="mt-3 font-headline text-base font-extrabold text-primary group-hover:underline">
      <NuxtLink :to="`/programmes/${programme.slug}`">{{ programme.titre }}</NuxtLink>
    </h3>
    <p class="mt-2 text-xs text-slate-500">{{ programme.etablissement }} · {{ programme.ville }}</p>
    <p v-if="programme.partnerName" class="mt-1 text-xs text-secondary">{{ programme.partnerName }}</p>
    <p class="mt-auto pt-4 text-sm font-extrabold text-primary">
      {{ programme.frais.toLocaleString('fr-FR') }} {{ programme.devise }}
    </p>
  </article>
</template>
