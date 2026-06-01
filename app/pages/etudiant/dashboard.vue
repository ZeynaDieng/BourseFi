<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'student-auth' })
const { data: me } = await useFetch('/api/auth/me')
const { data: candidatures } = await useFetch('/api/candidatures')
const { data: paiements } = await useFetch('/api/paiements')
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-64 shrink-0 border-r border-slate-200 bg-white p-4">
      <div class="mb-8">
        <AppBrandLogo to="/" img-class="h-12 w-auto max-h-14 object-contain object-left" />
        <p class="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Portail étudiant</p>
      </div>
      <nav class="space-y-1">
        <NuxtLink to="/etudiant/dashboard" class="block rounded-lg bg-slate-50 px-4 py-3 font-semibold text-primary">Tableau de bord</NuxtLink>
        <NuxtLink to="/programmes" class="block rounded-lg px-4 py-3 text-slate-500">Nouvelle candidature</NuxtLink>
        <NuxtLink to="/paiement" class="block rounded-lg px-4 py-3 text-slate-500">Paiements</NuxtLink>
      </nav>
    </aside>
    <main class="flex-1 p-8">
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-premium">
        <div>
          <h2 class="mb-2 font-headline text-3xl font-extrabold text-primary">
            Bienvenue, {{ me?.user?.name?.split(' ')[0] || 'Etudiant' }}
          </h2>
          <p class="text-sm text-slate-500">
            Historique et documents des bourses (attestations emises par le bailleur).
          </p>
        </div>
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUZ7PjbQa9eYeWcU2owUSnqrLhyTSeLeI63ZOMKu3QOi4luNwoRdozC2L7NsTwwWjcBltinb9tnU4nS8fjz3_GSW8b3GcJtQeGfWVYeMSYNC2li_gpv0irp2jW4R4bWDxSUHAYKgsIBYwc-iS0Lwdm3g1XsZS3qZ28bIbjJeX6Rsd1scHKYShjW5LJc3pH-Ad3pxoe8-5n0AcQxVrSpe7fmOPi3_7SBMV23sCqjCmknTYk4g6ASJFfJ_50JtqrHDcbJs2c9nqyHcY"
          alt="Profil etudiant"
          class="h-12 w-12 rounded-full object-cover"
        />
      </div>

      <section class="mb-8 rounded-xl border border-slate-100 bg-white p-8 shadow-premium">
        <h3 class="mb-4 text-xl font-bold text-primary">Mes dossiers</h3>
        <ul class="divide-y divide-slate-100">
          <li v-for="c in candidatures || []" :key="c.id" class="py-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-primary">{{ c.programmeTitre }}</p>
                <p class="text-sm text-slate-600">{{ c.etablissementNom }} · Bailleur : {{ c.partnerName }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ c.statusLabel }}</p>
                <div v-if="c.identityCardRectoUrl || c.identityCardVersoUrl" class="mt-2 flex flex-wrap gap-2 text-xs">
                  <a
                    v-if="c.identityCardRectoUrl"
                    :href="c.identityCardRectoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded border border-slate-200 px-2 py-1 text-primary hover:bg-slate-50"
                  >CNI recto</a>
                  <a
                    v-if="c.identityCardVersoUrl"
                    :href="c.identityCardVersoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded border border-slate-200 px-2 py-1 text-primary hover:bg-slate-50"
                  >CNI verso</a>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-if="c.status === 'EN_ATTENTE_PAIEMENT' && c.fraisDossier > 0"
                  :to="`/paiement?candidatureId=${c.id}`"
                  class="rounded-lg bg-secondary-container px-3 py-2 text-xs font-bold text-on-secondary-container"
                >
                  Payer {{ c.fraisDossier.toLocaleString('fr-FR') }} {{ c.devise }}
                </NuxtLink>
                <a
                  v-if="c.documentUrl"
                  :href="c.documentUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary"
                >
                  Telecharger attest. bailleur
                </a>
                <NuxtLink :to="`/programmes/${c.programmeSlug}`" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                  Voir formation
                </NuxtLink>
              </div>
            </div>
          </li>
        </ul>
        <p v-if="!(candidatures && candidatures.length)" class="text-sm text-slate-500">Pas encore de candidature. Explorez les programmes finances.</p>
      </section>

      <section class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <article class="rounded-xl border border-slate-100 bg-white p-6 shadow-premium">
          <h4 class="mb-3 font-bold text-primary">Paiements enregistres</h4>
          <template v-if="paiements?.length">
            <p v-for="paiement in paiements.slice(0, 6)" :key="paiement.id" class="text-sm text-slate-600">
              {{ paiement.method }} — montant réglé
              {{ paiement.amount.toLocaleString('fr-FR') }}
              {{ paiement.currency }}
            </p>
          </template>
          <p v-else class="text-sm text-slate-500">Aucun paiement encore.</p>
        </article>
      </section>
    </main>
  </div>
</template>
