<script setup lang="ts">
import { computed } from 'vue'
import {
  BOURSE_PROCESS_HEADING,
  BOURSE_PROCESS_STEPS,
  resolveBourseProcessSteps,
} from '~/utils/bourse-process-steps'
import { btnPrimary } from '~/utils/design-tokens'

const { data: site } = await usePublicSite()

const block = computed(
  () => (site.value?.content?.home_process ?? {}) as Record<string, string>,
)

const steps = computed(() => {
  const raw = (site.value?.content?.home_process as { cards?: Array<{ step?: string; title: string; body: string }> } | undefined)?.cards
  return resolveBourseProcessSteps(raw)
})

const sectionTitle = computed(
  () => block.value.sectionTitle?.trim() || BOURSE_PROCESS_HEADING.title,
)

const sectionSubtitle = computed(
  () => block.value.sectionSubtitle?.trim() || BOURSE_PROCESS_HEADING.subtitle,
)
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 md:py-20">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="font-headline text-2xl font-extrabold text-primary md:text-4xl">
        {{ sectionTitle }}
      </h2>
      <p class="mt-2 text-sm text-on-surface-variant md:text-base">
        {{ sectionSubtitle }}
      </p>
      <p class="mt-3 text-sm font-semibold tracking-wide text-primary">
        {{ BOURSE_PROCESS_HEADING.flow }}
      </p>
    </div>

    <ol class="mx-auto mt-8 grid max-w-4xl gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
      <li
        v-for="(step, index) in steps"
        :key="step.title + index"
        class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-headline text-sm font-extrabold text-primary"
        >
          {{ step.step ?? index + 1 }}
        </span>
        <h3 class="mt-4 font-headline text-base font-bold text-primary md:text-lg">
          {{ step.title }}
        </h3>
        <p class="mt-2 text-sm leading-snug text-on-surface-variant">
          {{ step.body }}
        </p>
      </li>
    </ol>

    <div class="mt-8 text-center md:mt-10">
      <NuxtLink
        to="/bourses"
        :class="[btnPrimary, 'inline-flex min-h-11 items-center justify-center px-8']"
      >
        Trouver une bourse
      </NuxtLink>
    </div>
  </section>
</template>
