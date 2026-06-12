<template>
  <section class="py-20">
    <div class="mx-auto max-w-7xl px-8">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {{ header.kicker || "Retours d'expérience" }}
      </p>
      <h2 class="mx-auto mb-14 max-w-2xl text-center font-headline text-3xl font-extrabold text-primary md:text-4xl">
        {{ header.title || 'Ils utilisent BourseFi au quotidien' }}
      </h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <blockquote
          v-for="t in items"
          :key="t.id"
          class="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-premium transition duration-300 hover:border-primary/15 hover:shadow-lg"
        >
          <div class="mb-6 flex items-center gap-3">
            <img
              v-if="t.avatarUrl?.trim()"
              :src="t.avatarUrl.trim()"
              :alt="t.name"
              class="h-11 w-11 rounded-full object-cover"
              width="44"
              height="44"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-11 w-11 items-center justify-center rounded-full bg-primary/5 font-headline text-sm font-bold text-primary"
            >
              {{ t.initials }}
            </div>
            <div>
              <cite class="not-italic font-semibold text-primary">{{ t.name }}</cite>
              <p class="text-xs text-on-surface-variant">{{ t.role }}</p>
            </div>
          </div>
          <p class="flex-1 text-sm leading-relaxed text-on-surface-variant">{{ t.quote }} </p>
        </blockquote>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { data: site } = await usePublicSite()

const header = computed(() => (site.value?.content?.testimonials_section ?? {}) as Record<string, string>)
const items = computed(() => site.value?.testimonials ?? [])
</script>
