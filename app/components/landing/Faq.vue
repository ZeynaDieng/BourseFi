<script setup lang="ts">
import { computed, ref } from 'vue'

const { data: site } = await usePublicSite()

const header = computed(() => (site.value?.content?.faq_section ?? {}) as Record<string, string>)

const items = computed(() => site.value?.faq ?? [])

const showAll = ref(false)

const visibleItems = computed(() => {
  const all = items.value
  if (showAll.value) return all
  return all.slice(0, 4)
})

const hasMore = computed(() => items.value.length > 4)
</script>

<template>
  <section class="border-t border-slate-100 bg-surface-container-low py-12 md:py-20">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 md:px-8">
      <h2 class="mb-8 text-center font-headline text-2xl font-extrabold text-primary md:mb-12 md:text-4xl">
        {{ header.title || 'Questions fréquentes' }}
      </h2>
      <div class="space-y-2 md:space-y-3">
        <details
          v-for="item in visibleItems"
          :key="item.id"
          class="group rounded-xl border border-slate-100 bg-white shadow-premium transition duration-200 open:border-primary/20 open:shadow-md md:rounded-2xl"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-primary md:gap-4 md:px-6 md:py-5 md:text-base"
          >
            <span class="min-w-0">{{ item.q }}</span>
            <span
              class="material-symbols-outlined shrink-0 text-slate-400 transition duration-200 group-open:rotate-180"
            >
              expand_more
            </span>
          </summary>
          <div class="border-t border-slate-50 px-4 pb-4 pt-0 md:px-6 md:pb-5">
            <p class="pt-3 text-sm leading-relaxed text-on-surface-variant md:pt-4">{{ item.a }}</p>
          </div>
        </details>
      </div>
      <div v-if="hasMore && !showAll" class="mt-4 text-center md:hidden">
        <button
          type="button"
          class="text-sm font-semibold text-primary"
          @click="showAll = true"
        >
          Voir plus de questions
        </button>
      </div>
    </div>
  </section>
</template>
