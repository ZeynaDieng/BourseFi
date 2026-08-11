<script setup lang="ts">
import type { BourseDto } from '~/types/bourse'

const route = useRoute()
const { data: ecoles } = await useFetch<any[]>('/api/etablissements')
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

const { whatsappUrl } = useBoursefiContact()
</script>

<template>
  <main v-if="ecole" class="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20">
    <!-- Image de couverture -->
    <div v-if="ecole.coverImageUrl?.trim()" class="mb-8 overflow-hidden rounded-3xl shadow-premium">
      <img
        :src="ecole.coverImageUrl.trim()"
        :alt="`Image de couverture ${ecole.nom}`"
        class="h-64 w-full object-cover md:h-80"
      />
    </div>

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

      <div class="mb-2 flex items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Établissement partenaire</span>
        <span
          v-if="ecole.contactStatus === 'VERIFIED'"
          class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200"
        >
          <span class="material-symbols-outlined text-xs">verified</span>
          Vérifié
        </span>
      </div>

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
      <!-- Section À propos -->
      <section v-if="ecole.resume" class="text-center">
        <h2 class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">À propos</h2>
        <p class="mx-auto max-w-2xl text-lg leading-relaxed italic text-slate-600">
          {{ ecole.resume }}
        </p>
      </section>

      <!-- Section Aide & Support BourseFi -->
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="font-headline text-xl font-bold text-primary mb-2">Besoin d'aide ?</h2>
          <p class="text-xs leading-relaxed text-slate-600 mb-3">
            Une question sur cet établissement, les bourses disponibles ou les démarches à suivre ? Notre équipe BourseFi est là pour vous accompagner.
          </p>

          <p class="text-xs font-medium text-slate-500 mb-5 flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-primary">info</span>
            Les candidatures aux bourses de cet établissement se font directement sur BourseFi.
          </p>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-white transition hover:opacity-90 shadow-sm"
            >
              <span class="material-symbols-outlined text-base">support_agent</span>
              Contacter BourseFi
            </a>

            <a
              v-if="ecole.site"
              :href="ecole.site"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              <span class="material-symbols-outlined text-base">language</span>
              Site officiel de l'établissement
            </a>
          </div>

          <p class="mt-4 text-[11px] leading-normal text-slate-400 italic">
            Les frais de scolarité, les conditions d'inscription et certaines modalités peuvent évoluer. Consultez le site officiel de l'établissement pour obtenir les informations les plus récentes.
          </p>
        </div>
      </section>

      <!-- Section Bourses disponibles -->
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
