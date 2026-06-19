<script setup lang="ts">
const route = useRoute()

type PartnerDetail = {
  slug: string
  name: string
  logoUrl: string | null
  contactEmail: string | null
  description: string | null
  conditions: string | null
  boursesCount: number
  montantDistribue: number
  ecoles: Array<{ slug: string; nom: string; ville: string }>
  bourses: Array<{
    slug: string
    titre: string
    coveragePercent: number
    placesRestantes: number
    dateLimite: string
    etablissement: string
    programmeSlug: string
  }>
}

const { data: partner, error } = await useFetch<PartnerDetail>(
  () => `/api/partners/${route.params.slug}`,
)

useSiteSeo({
  title: () => (partner.value ? `${partner.value.name} — BourseFi` : 'Partenaire — BourseFi'),
  description: () =>
    partner.value?.description?.trim() ||
    (partner.value
      ? `${partner.value.name} — partenaire bourse d'études sur BourseFi Sénégal.`
      : undefined),
  canonical: () => (partner.value ? `/partenaires/${partner.value.slug}` : '/partenaires'),
})
</script>

<template>
  <main v-if="partner" class="mx-auto max-w-4xl px-6 py-12 md:py-16">
    <nav class="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">
      <NuxtLink to="/partenaires" class="hover:text-primary">Partenaires</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-primary">{{ partner.name }}</span>
    </nav>

    <div class="mb-10 flex items-start gap-6">
      <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
        <img v-if="partner.logoUrl" :src="partner.logoUrl" :alt="partner.name" class="max-h-full max-w-full object-contain" />
        <span v-else class="material-symbols-outlined text-4xl text-primary">account_balance</span>
      </div>
      <div>
        <h1 class="font-headline text-3xl font-extrabold text-primary">{{ partner.name }}</h1>
        <p v-if="partner.description" class="mt-3 text-slate-600">{{ partner.description }}</p>
      </div>
    </div>

    <div class="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-premium">
        <p class="text-2xl font-extrabold text-secondary-fixed">{{ partner.boursesCount }}</p>
        <p class="text-xs uppercase tracking-widest text-slate-400">Bourses</p>
      </div>
      <div class="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-premium">
        <p class="text-2xl font-extrabold text-secondary-fixed">{{ partner.ecoles.length }}</p>
        <p class="text-xs uppercase tracking-widest text-slate-400">Écoles couvertes</p>
      </div>
      <div class="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-premium col-span-2 md:col-span-1">
        <p class="text-2xl font-extrabold text-secondary-fixed">{{ partner.montantDistribue.toLocaleString('fr-FR') }}</p>
        <p class="text-xs uppercase tracking-widest text-slate-400">FCFA distribués</p>
      </div>
    </div>

    <section v-if="partner.conditions" class="mb-10 rounded-2xl bg-slate-50 p-6">
      <h2 class="font-headline text-lg font-bold text-primary">Conditions générales</h2>
      <p class="mt-3 whitespace-pre-line text-sm text-slate-600">{{ partner.conditions }}</p>
    </section>

    <section class="mb-10">
      <h2 class="mb-6 font-headline text-xl font-bold text-primary">Bourses du partenaire</h2>
      <div class="space-y-3">
        <NuxtLink
          v-for="b in partner.bourses"
          :key="b.slug"
          :to="`/bourses/${b.slug}`"
          class="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-premium transition hover:border-primary/25"
        >
          <div>
            <p class="font-semibold text-primary">{{ b.titre }}</p>
            <p class="text-sm text-slate-500">{{ b.etablissement }} · {{ b.coveragePercent }} %</p>
          </div>
          <span class="text-xs text-slate-400">{{ b.placesRestantes }} places</span>
        </NuxtLink>
      </div>
    </section>

    <p v-if="partner.contactEmail" class="text-sm text-slate-600">
      Contact : <a :href="`mailto:${partner.contactEmail}`" class="font-semibold text-primary">{{ partner.contactEmail }}</a>
    </p>
  </main>

  <main v-else-if="error" class="mx-auto max-w-lg px-6 py-20 text-center">
    <NuxtLink to="/partenaires" class="font-semibold text-primary">← Retour aux partenaires</NuxtLink>
  </main>
</template>
