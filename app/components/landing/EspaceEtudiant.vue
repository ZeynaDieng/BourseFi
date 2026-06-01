<template>
  <section class="border-t border-slate-100 bg-white py-20">
    <div class="mx-auto max-w-7xl px-8">
      <div class="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {{ block.kicker || 'Espace étudiant' }}
          </p>
          <h2 class="mb-4 font-headline text-3xl font-extrabold text-primary md:text-4xl">
            {{ block.title || 'Votre dossier, clair et à jour' }}
          </h2>
          <p class="mb-10 text-on-surface-variant">
            {{
              block.subtitle ||
              "Tableau de bord, alertes et documents : tout ce qu'il faut pour avancer sereinement, sur ordinateur ou téléphone."
            }}
          </p>
          <ul class="space-y-5">
            <li v-for="feat in features" :key="feat.title" class="flex gap-4">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary"
              >
                <span class="material-symbols-outlined text-[22px]">{{ feat.icon }}</span>
              </div>
              <div>
                <p class="font-semibold text-primary">{{ feat.title }}</p>
                <p class="text-sm text-on-surface-variant">{{ feat.text }}</p>
              </div>
            </li>
          </ul>
          <NuxtLink
            :to="ctaHref"
            class="mt-10 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:opacity-90"
          >
            {{ ctaLabel }}
          </NuxtLink>
        </div>

        <div
          class="relative rounded-2xl border border-slate-100 bg-surface-container-low p-4 shadow-premium sm:p-6"
          aria-hidden="true"
        >
          <div
            class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition duration-500 hover:shadow-xl"
          >
            <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="flex gap-1.5">
                  <span class="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span class="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span class="h-2.5 w-2.5 rounded-full bg-slate-300" />
                </span>
                <span class="text-xs font-medium text-slate-500">boursefi.sn / tableau de bord</span>
              </div>
              <span class="material-symbols-outlined text-[20px] text-slate-400">notifications</span>
            </div>
            <div class="grid gap-4 p-4 sm:grid-cols-5 sm:p-5">
              <div class="space-y-3 sm:col-span-2">
                <div class="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Progression</p>
                  <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div class="h-full w-[72%] rounded-full bg-secondary transition-all duration-700" />
                  </div>
                  <p class="mt-2 text-xs text-slate-600">Dossier à 72 % — pièces manquantes : 1</p>
                </div>
                <div class="rounded-lg border border-slate-100 p-3">
                  <p class="text-xs font-semibold text-primary">Candidatures</p>
                  <ul class="mt-2 space-y-2 text-xs">
                    <li class="flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1.5 text-emerald-800">
                      <span>IA · ESMT</span>
                      <span class="font-medium">Validée</span>
                    </li>
                    <li class="flex items-center justify-between rounded-md bg-amber-50 px-2 py-1.5 text-amber-900">
                      <span>Data · UCAD</span>
                      <span class="font-medium">En cours</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="space-y-3 sm:col-span-3">
                <div class="rounded-lg border border-slate-100 p-3">
                  <div class="mb-2 flex items-center justify-between">
                    <p class="text-xs font-semibold text-primary">Documents</p>
                    <span class="text-xs text-secondary">Télécharger</span>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="doc in ['Attestation bailleur.pdf', 'Reçu dossier.pdf']"
                      :key="doc"
                      class="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/30 px-2 py-2 text-xs text-slate-700"
                    >
                      <span class="flex items-center gap-2 truncate">
                        <span class="material-symbols-outlined text-[16px] text-slate-400">description</span>
                        {{ doc }}
                      </span>
                      <span class="material-symbols-outlined text-[16px] text-slate-400">download</span>
                    </div>
                  </div>
                </div>
                <div
                  class="rounded-lg border border-dashed border-slate-200 bg-slate-50/30 p-3 text-center text-xs text-slate-500"
                >
                  Notification : votre dossier a été transmis au bailleur — réponse sous 5 jours ouvrés.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Feat = { icon: string; title: string; text: string }

const { data: site } = await usePublicSite()

const block = computed(() => (site.value?.content?.espace_etudiant ?? {}) as Record<string, string>)

const defaultFeatures: Feat[] = [
  {
    icon: 'dashboard',
    title: 'Tableau de bord unifié',
    text: 'Vue d’ensemble des candidatures, des échéances et des prochaines actions.'
  },
  {
    icon: 'timeline',
    title: 'Suivi des candidatures',
    text: 'Historique des statuts : dépôt, analyse, compléments et décision du partenaire.'
  },
  {
    icon: 'folder_open',
    title: 'Documents centralisés',
    text: 'Téléversement sécurisé et téléchargement des attestations et reçus quand ils sont prêts.'
  },
  {
    icon: 'notifications_active',
    title: 'Notifications utiles',
    text: 'Alertes lorsqu’une pièce est demandée ou lorsque votre dossier change de statut.'
  }
]

const features = computed(() => {
  const raw = (site.value?.content?.espace_etudiant as { features?: Feat[] } | undefined)?.features
  return raw?.length ? raw : defaultFeatures
})

const ctaLabel = computed(
  () =>
    (site.value?.content?.espace_etudiant as { ctaLabel?: string } | undefined)?.ctaLabel ||
    'Créer un compte gratuitement'
)

const ctaHref = computed(
  () =>
    (site.value?.content?.espace_etudiant as { ctaHref?: string } | undefined)?.ctaHref || '/auth/register'
)
</script>
