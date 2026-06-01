<script setup lang="ts">
import { partnerSchoolCoverFallback } from '~/utils/marketing-visuals'

const route = useRoute()
const { data: ecoles } = await useFetch('/api/etablissements')

const ecole = computed(() => ecoles.value?.find((item: { slug: string }) => item.slug === route.params.slug))

const heroCover = computed(
  () => ecole.value?.coverImageUrl?.trim() || partnerSchoolCoverFallback(String(route.params.slug ?? ''))
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
  <main v-if="ecole" class="mx-auto max-w-7xl px-8 py-12">
    <section class="relative mb-12 min-h-[380px] overflow-hidden rounded-3xl md:h-[420px]">
      <img
        :src="heroCover"
        :alt="`Photo — ${ecole.nom}`"
        class="h-full min-h-[380px] w-full object-cover md:min-h-0"
        width="1600"
        height="900"
        loading="eager"
        fetchpriority="high"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/55 to-primary/35" />
      <div class="absolute left-8 top-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/10 md:h-[72px] md:w-[72px]">
        <img
          v-if="ecole.logoUrl?.trim()"
          :src="ecole.logoUrl.trim()"
          :alt="`Logo ${ecole.nom}`"
          class="max-h-full max-w-full object-contain"
          width="64"
          height="64"
        />
        <span v-else class="text-lg font-extrabold text-primary md:text-xl">{{ initials }}</span>
      </div>
      <div class="absolute bottom-0 w-full p-8 text-white md:p-10">
        <p class="mb-3 text-xs uppercase tracking-widest text-slate-200">Ecole partenaire BourseFi</p>
        <h1 class="font-headline text-3xl font-extrabold md:text-5xl">{{ ecole.nom }}</h1>
        <p class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-200 md:text-base">
          <span v-if="ecole.typeLabel">{{ ecole.typeLabel }}</span>
          <span v-if="ecole.typeLabel && ecole.ville" aria-hidden="true">·</span>
          <span>{{ ecole.ville }}</span>
          <span v-if="ecole.site"> — {{ ecole.site }}</span>
          <span v-if="ecole.accreditation"> — {{ ecole.accreditation }}</span>
        </p>
      </div>
    </section>
    <section class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <article class="lg:col-span-2 rounded-xl border border-slate-100 bg-white p-8 shadow-premium">
        <h2 class="mb-4 font-headline text-2xl font-bold text-primary">A propos de l ecole</h2>
        <p class="mb-10 text-slate-700">{{ ecole.resume }}</p>
        <h3 class="mb-4 font-headline text-xl font-bold text-primary">Formations et bourses affichees</h3>
        <p class="mb-6 text-sm text-slate-500">
          Chaque programme est lie a un bailleur (mairie, agence…) qui valide les dossiers eligibles aux bourses.
        </p>
        <div class="space-y-4">
          <NuxtLink
            v-for="p in ecole.programmes"
            :key="p.slug"
            :to="`/programmes/${p.slug}`"
            class="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primary hover:bg-white"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-bold text-primary">{{ p.titre }}</p>
              <span class="text-xs font-semibold text-secondary">{{ p.partnerName }}</span>
            </div>
            <p class="mt-1 text-xs text-slate-500">
              {{ p.duree }} · {{ p.frais.toLocaleString('fr-FR') }} {{ p.devise }} · Frais dossier
              {{ p.fraisDossier.toLocaleString('fr-FR') }} {{ p.devise }}
            </p>
          </NuxtLink>
          <p v-if="!ecole.programmes?.length" class="text-sm text-slate-500">Aucun programme publie pour le moment.</p>
        </div>
      </article>
      <aside class="space-y-6 rounded-xl border border-slate-100 bg-white p-8 shadow-premium">
        <h3 class="mb-4 font-headline text-xl font-bold text-primary">Actions</h3>
        <NuxtLink to="/programmes" class="mb-3 block rounded-lg bg-primary px-4 py-3 text-center font-semibold text-white">
          Catalogue national
        </NuxtLink>
        <div class="rounded-xl bg-primary p-5 text-white">
          <p class="text-xs uppercase tracking-widest text-slate-300">Paiements securises</p>
          <p class="mt-2 text-sm text-slate-200">Orange Money · Wave · PayTech (simulation).</p>
        </div>
      </aside>
    </section>
  </main>
  <main v-else class="mx-auto max-w-4xl px-8 py-24">
    <p class="text-lg text-slate-600">Etablissement introuvable.</p>
  </main>
</template>
