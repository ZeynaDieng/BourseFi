<template>
  <section class="border-b border-slate-100 bg-white py-12 md:py-16">
    <div class="mx-auto max-w-7xl px-6 md:px-8">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {{ block.kicker || 'Avantages' }}
      </p>
      <h2
        class="mx-auto mb-10 max-w-2xl text-center font-headline text-2xl font-extrabold text-primary md:text-3xl"
      >
        {{ block.title || 'Pourquoi BourseFi' }}
      </h2>
      <ul class="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="item in reasons"
          :key="item.title"
          class="flex items-start gap-3 rounded-xl border border-slate-100 bg-surface-container-lowest px-4 py-4"
        >
          <span
            class="material-symbols-outlined mt-0.5 shrink-0 text-[22px] text-secondary"
            aria-hidden="true"
          >check_circle</span>
          <span class="text-sm font-semibold leading-snug text-primary">{{ item.title }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Reason = { title: string }

const { data: site } = await usePublicSite()

const block = computed(() => (site.value?.content?.why_choose ?? {}) as Record<string, string>)

const defaultReasons: Reason[] = [
  { title: 'Trouvez une bourse rapidement' },
  { title: 'Candidatez en ligne' },
  { title: 'Suivez votre dossier' },
  { title: 'Téléchargez votre attestation' },
]

const reasons = computed(() => {
  const raw = (site.value?.content?.why_choose as { reasons?: Array<{ title: string }> } | undefined)
    ?.reasons
  if (raw?.length) {
    return raw.map((r) => ({ title: r.title }))
  }
  return defaultReasons
})
</script>
