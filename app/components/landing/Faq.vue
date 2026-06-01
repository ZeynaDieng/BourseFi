<template>
  <section class="border-t border-slate-100 bg-surface-container-low py-20">
    <div class="mx-auto max-w-3xl px-8">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {{ header.kicker || 'FAQ' }}
      </p>
      <h2 class="mb-12 text-center font-headline text-3xl font-extrabold text-primary md:text-4xl">
        {{ header.title || 'Questions fréquentes' }}
      </h2>
      <div class="space-y-3">
        <details
          v-for="item in items"
          :key="item.id"
          class="group rounded-2xl border border-slate-100 bg-white shadow-premium transition duration-200 open:border-primary/20 open:shadow-md"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-primary"
          >
            {{ item.q }}
            <span
              class="material-symbols-outlined shrink-0 text-slate-400 transition duration-200 group-open:rotate-180"
            >
              expand_more
            </span>
          </summary>
          <div class="border-t border-slate-50 px-6 pb-5 pt-0">
            <p class="pt-4 text-sm leading-relaxed text-on-surface-variant">{{ item.a }}</p>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { data: site } = await usePublicSite()

const header = computed(() => (site.value?.content?.faq_section ?? {}) as Record<string, string>)

const items = computed(() => site.value?.faq ?? [])
</script>
