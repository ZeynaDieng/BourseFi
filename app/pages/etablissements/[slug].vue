<script setup lang="ts">
import type { BourseDto } from '~/types/bourse'

const route = useRoute()
const { data: ecoles } = await useFetch('/api/etablissements')
const { data: allBourses } = await useFetch<BourseDto[]>('/api/bourses')

const ecole = computed(() => ecoles.value?.find((item: { slug: string }) => item.slug === route.params.slug))

const ecoleBourses = computed(() =>
  (allBourses.value ?? []).filter((b) => b.etablissementSlug === ecole.value?.slug),
)

const initials = computed(() => {
  const nom = ecole.value?.nom ?? ''
  const words = nom.split(/\s+/).filter(Boolean)
  return words
    .slice(0, 3)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3) || 'BF'
})
</script>

<template>
  <main v-if="ecole" class="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20">
    <header class="mb-12 flex flex-col items-center text-center">
      <div class="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-100 md:h-32 md:w-32">
        <img
          v-if="ecole.logoUrl?.trim()"
          :src="ecole.logoUrl.trim()"
          :alt="`Logo ${ecole.nom}`"
          class="max-h-full max-w-full object-contain"
        />
        <span v-else class="text-3xl font-extrabold text-primary md:text-4xl">{{ initials }}</span>
      </div>
      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Établissement partenaire</p>
      <h1 class="font-headline text-3xl font-extrabold uppercase tracking-tight text-primary md:text-5xl">
        {{ ecole.nom }}
      </h1>
      <p class="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-slate-500">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-base">location_on</span>
          {{ ecole.ville }}
        </span>
        <span v-if="ecole.typeLabel" class="h-1 w-1 rounded-full bg-slate-300" />
        <span v-if="ecole.typeLabel">{{ ecole.typeLabel }}</span>
      </p>
    </header>

    <div class="space-y-12">
      <section v-if="ecole.resume" class="text-center">
        <h2 class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">À propos</h2>
        <p class="mx-auto max-w-2xl text-lg leading-relaxed italic text-slate-600">
          « {{ ecole.resume }} »
        </p>
      </section>

      <section>
        <div class="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="font-headline text-xl font-bold text-primary">Bourses disponibles</h2>
          <span class="rounded-full bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            {{ ecoleBourses.length }} bourse{{ ecoleBourses.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div v-if="ecoleBourses.length" class="grid gap-4 sm:grid-cols-2">
          <ScholarshipCard v-for="b in ecoleBourses" :key="b.id" :bourse="b" />
        </div>
        <div v-else class="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <p class="text-sm font-medium text-slate-400">Aucune bourse active pour cet établissement.</p>
          <NuxtLink to="/bourses" class="mt-4 inline-block text-sm font-semibold text-primary">
            Voir toutes les bourses
          </NuxtLink>
        </div>
      </section>
    </div>

    <footer class="mt-16 border-t border-slate-100 pt-12 text-center">
      <NuxtLink
        to="/bourses"
        class="inline-flex items-center gap-2 font-bold text-primary underline-offset-8 hover:underline"
      >
        <span class="material-symbols-outlined text-lg">school</span>
        Voir toutes les bourses
      </NuxtLink>
    </footer>
  </main>

  <main v-else class="mx-auto max-w-4xl px-8 py-24 text-center">
    <p class="text-lg text-slate-600">Établissement introuvable.</p>
    <NuxtLink to="/ecoles" class="mt-4 inline-block font-bold text-primary">Retour à la liste</NuxtLink>
  </main>
</template>
