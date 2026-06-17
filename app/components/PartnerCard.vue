<script setup lang="ts">
defineProps<{
  partner: {
    slug: string
    name: string
    logoUrl: string | null
    boursesCount: number
    ecolesCount?: number
  }
}>()
</script>

<template>
  <NuxtLink
    :to="`/partenaires/${partner.slug}`"
    class="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 shadow-premium transition hover:border-primary/25 hover:shadow-lg"
  >
    <div class="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
      <img
        v-if="partner.logoUrl"
        :src="partner.logoUrl"
        :alt="partner.name"
        class="max-h-full max-w-full object-contain"
      />
      <span v-else class="material-symbols-outlined text-3xl text-primary">account_balance</span>
    </div>
    <h3 class="text-center font-headline text-sm font-bold text-primary">{{ partner.name }}</h3>
    <p class="mt-2 text-xs text-slate-500">{{ partner.boursesCount }} bourse(s)</p>
  </NuxtLink>
</template>
