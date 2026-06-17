<script setup lang="ts">
import { computed } from 'vue'

type Step = { step?: string; title: string; body: string }

const { data: site } = await usePublicSite()

const block = computed(() => (site.value?.content?.home_process ?? {}) as Record<string, string>)

const defaultSteps: Step[] = [
  {
    step: '01',
    title: 'Choisissez une formation',
    body: 'Parcourez les bourses et sélectionnez la formation couverte par un partenaire financeur.',
  },
  {
    step: '02',
    title: 'Soumettez votre demande',
    body: 'Complétez votre dossier en ligne en quelques minutes depuis votre espace candidat.',
  },
  {
    step: '03',
    title: 'Payez les frais de dossier',
    body: 'Réglez les frais de dossier par Wave ou Orange Money pour transmettre votre candidature.',
  },
  {
    step: '04',
    title: 'Recevez votre attestation',
    body: 'Suivez votre dossier et téléchargez l’attestation dès validation par le partenaire.',
  },
]

const steps = computed(() => {
  const raw = (site.value?.content?.home_process as { cards?: Step[] } | undefined)?.cards
  return raw?.length ? raw : defaultSteps
})

const sectionTitle = computed(
  () => block.value.sectionTitle || 'Comment obtenir une bourse',
)

const sectionSubtitle = computed(
  () =>
    block.value.sectionSubtitle ||
    'Quatre étapes simples, de la bourse à l’attestation téléchargeable.',
)
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
    <div class="mx-auto max-w-2xl text-center">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        Parcours candidat
      </p>
      <h2 class="font-headline text-3xl font-extrabold text-primary md:text-4xl">
        {{ sectionTitle }}
      </h2>
      <p class="mt-3 text-on-surface-variant">
        {{ sectionSubtitle }}
      </p>
    </div>

    <ol class="mx-auto mt-10 max-w-xl space-y-4">
      <li
        v-for="(step, index) in steps"
        :key="step.title + index"
        class="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5"
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-headline text-sm font-extrabold text-primary"
        >
          {{ step.step ?? String(index + 1).padStart(2, '0') }}
        </span>
        <div class="min-w-0 pt-0.5">
          <h3 class="font-headline text-base font-bold text-primary md:text-lg">
            {{ step.title }}
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-on-surface-variant">
            {{ step.body }}
          </p>
        </div>
      </li>
    </ol>

    <div class="mt-8 text-center">
      <NuxtLink
        to="/candidature"
        class="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary px-6 text-sm font-semibold text-primary transition active:scale-[0.98] hover:bg-primary/5"
      >
        En savoir plus →
      </NuxtLink>
    </div>
  </section>
</template>
