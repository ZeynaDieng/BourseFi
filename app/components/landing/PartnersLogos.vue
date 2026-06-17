<template>
  <section class="border-t border-slate-100 bg-surface-container-low py-12 md:py-16">
    <div class="mx-auto max-w-7xl px-6 md:px-8">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {{ block.kicker || 'Partenaires financeurs' }}
      </p>
      <h2 class="mx-auto mb-4 max-w-2xl text-center font-headline text-2xl font-extrabold text-primary md:text-3xl">
        {{ block.title || 'Logos des partenaires' }}
      </h2>
      <p v-if="block.subtitle" class="mx-auto mb-8 max-w-xl text-center text-sm text-on-surface-variant">
        {{ block.subtitle }}
      </p>
      <div class="mb-6 text-center">
        <NuxtLink to="/partenaires" class="text-sm font-semibold text-primary hover:underline">
          Voir tous les partenaires →
        </NuxtLink>
      </div>
      <div
        v-if="partners.length"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        <NuxtLink
          v-for="p in partners"
          :key="p.slug"
          :to="`/partenaires/${p.slug}`"
          class="flex h-16 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-3 shadow-sm grayscale transition duration-300 hover:grayscale-0 hover:shadow-md"
        >
          <img
            v-if="p.logoUrl?.trim()"
            :src="p.logoUrl.trim()"
            :alt="p.name"
            class="max-h-10 max-w-full object-contain"
            loading="lazy"
          />
          <span
            v-else
            class="text-center font-headline text-[10px] font-bold uppercase leading-tight tracking-wide text-slate-600 sm:text-xs"
          >
            {{ p.name }}
          </span>
        </NuxtLink>
      </div>
      <p v-else class="text-center text-sm text-slate-500">Partenaires à venir.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { data: site } = await usePublicSite()
const { data: apiPartners } = await useFetch('/api/partners')

const block = computed(() => (site.value?.content?.partners_strip ?? {}) as Record<string, string>)

const partners = computed(() => {
  if (apiPartners.value?.length) {
    return apiPartners.value as Array<{ slug: string; name: string; logoUrl?: string | null }>
  }
  return []
})
</script>
