<template>
  <section class="border-t border-slate-100 bg-surface-container-low py-16">
    <div class="mx-auto max-w-7xl px-8">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {{ block.kicker || 'Réseau national' }}
      </p>
      <h2 class="mx-auto mb-4 max-w-2xl text-center font-headline text-2xl font-extrabold text-primary md:text-3xl">
        {{ block.title || 'Partenaires institutionnels' }}
      </h2>
      <p class="mx-auto mb-12 max-w-xl text-center text-sm text-on-surface-variant">
        {{
          block.subtitle ||
          "Le dispositif s'appuie sur un écosystème d'écoles, de collectivités, d'agences et de financeurs — même exigence qualité pour tous les territoires."
        }}
      </p>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div
          v-for="p in partners"
          :key="p.label"
          class="flex h-20 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm grayscale transition duration-300 hover:grayscale-0 hover:shadow-md"
        >
          <span class="text-center font-headline text-xs font-bold uppercase tracking-wider text-slate-600">
            {{ p.label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { data: site } = await usePublicSite()

const block = computed(() => (site.value?.content?.partners_strip ?? {}) as Record<string, string>)

type PItem = { label: string }

const partners = computed(() => {
  const raw = (site.value?.content?.partners_strip as { items?: PItem[] } | undefined)?.items
  if (raw?.length) return raw
  return [
    { label: 'Écoles · Dakar' },
    { label: 'Écoles · Thiès' },
    { label: 'Mairies' },
    { label: 'Agences' },
    { label: 'Bailleurs' },
    { label: 'Fintech & banques' }
  ]
})
</script>
