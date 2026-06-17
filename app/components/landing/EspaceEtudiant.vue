<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { btnPrimary } from '~/utils/design-tokens'

type Feat = { icon: string; title: string; text: string }

const { data: site } = await usePublicSite()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const progressReady = ref(false)

const block = computed(() => (site.value?.content?.espace_etudiant ?? {}) as Record<string, string>)

const defaultFeatures: Feat[] = [
  {
    icon: 'dashboard',
    title: 'Tableau de bord unifié',
    text: 'Vos candidatures, échéances et prochaines actions en un coup d’œil.',
  },
  {
    icon: 'timeline',
    title: 'Suivi en temps réel',
    text: 'Dépôt, analyse, compléments et décision — chaque étape est visible.',
  },
  {
    icon: 'folder_open',
    title: 'Documents centralisés',
    text: 'Attestations et reçus disponibles dès validation, prêts à télécharger.',
  },
  {
    icon: 'notifications_active',
    title: 'Alertes utiles',
    text: 'Soyez prévenu dès qu’une action est requise sur votre dossier.',
  },
]

const features = computed(() => {
  const raw = (site.value?.content?.espace_etudiant as { features?: Feat[] } | undefined)?.features
  return raw?.length ? raw : defaultFeatures
})

const ctaLabel = computed(
  () =>
    (site.value?.content?.espace_etudiant as { ctaLabel?: string } | undefined)?.ctaLabel ||
    'Créer un compte gratuitement',
)

const ctaHref = computed(
  () =>
    (site.value?.content?.espace_etudiant as { ctaHref?: string } | undefined)?.ctaHref ||
    '/auth/register',
)

let observer: IntersectionObserver | undefined

onMounted(() => {
  if (typeof window === 'undefined' || !sectionRef.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      isVisible.value = true
      window.setTimeout(() => {
        progressReady.value = true
      }, 350)
      observer?.disconnect()
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
  )
  observer.observe(sectionRef.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <section
    ref="sectionRef"
    class="relative overflow-hidden border-t border-slate-100 bg-gradient-to-b from-white via-surface-container-low/40 to-white py-16 md:py-24 lg:py-28"
    aria-labelledby="espace-etudiant-title"
  >
    <div
      class="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-secondary/5 blur-3xl"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <!-- Texte — toujours en premier (mobile + desktop) -->
        <div
          class="max-w-xl transition duration-700 ease-out"
          :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {{ block.kicker || 'Espace étudiant' }}
          </p>
          <h2
            id="espace-etudiant-title"
            class="font-headline text-3xl font-extrabold leading-tight text-primary md:text-4xl lg:text-[2.75rem]"
          >
            {{ block.title || 'Votre dossier, clair et à jour' }}
          </h2>
          <p class="mt-4 text-base leading-relaxed text-on-surface-variant md:text-lg">
            {{
              block.subtitle ||
              "Visualisez votre parcours candidat : statuts, documents et notifications, sur ordinateur ou mobile."
            }}
          </p>

          <ul class="mt-8 space-y-5 md:mt-10">
            <li
              v-for="(feat, i) in features"
              :key="feat.title"
              class="flex gap-4 transition duration-500 ease-out"
              :class="isVisible ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'"
              :style="{ transitionDelay: isVisible ? `${120 + i * 80}ms` : '0ms' }"
            >
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary"
              >
                <span class="material-symbols-outlined text-[22px]">{{ feat.icon }}</span>
              </div>
              <div>
                <p class="font-semibold text-primary">{{ feat.title }}</p>
                <p class="mt-0.5 text-sm leading-snug text-on-surface-variant">{{ feat.text }}</p>
              </div>
            </li>
          </ul>

          <NuxtLink
            :to="ctaHref"
            :class="[
              btnPrimary,
              'mt-8 inline-flex min-h-11 items-center px-8 transition md:mt-10',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            ]"
            :style="{ transitionDelay: isVisible ? '520ms' : '0ms' }"
          >
            {{ ctaLabel }}
          </NuxtLink>
        </div>

        <!-- Maquette tableau de bord — sous le texte sur mobile -->
        <div
          class="transition duration-700 ease-out lg:justify-self-end"
          :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
          :style="{ transitionDelay: isVisible ? '200ms' : '0ms' }"
        >
          <div
            class="relative mx-auto w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-3 shadow-premium sm:p-4 lg:max-w-none"
            aria-hidden="true"
          >
            <div class="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 shadow-lg">
              <!-- Barre navigateur -->
              <div class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
                <div class="flex items-center gap-3">
                  <span class="flex gap-1.5">
                    <span class="h-2.5 w-2.5 rounded-full bg-red-300/90" />
                    <span class="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
                    <span class="h-2.5 w-2.5 rounded-full bg-emerald-300/90" />
                  </span>
                  <span class="hidden rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500 sm:inline">
                    boursefi.sn / etudiant
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <span class="material-symbols-outlined text-[18px] text-slate-500">notifications</span>
                    <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-secondary ring-2 ring-white" />
                  </span>
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span class="material-symbols-outlined text-[18px] text-primary">account_circle</span>
                  </span>
                </div>
              </div>

              <div class="grid gap-3 p-3 sm:grid-cols-5 sm:gap-4 sm:p-4">
                <!-- Colonne gauche -->
                <div class="space-y-3 sm:col-span-2">
                  <div class="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <div class="flex items-center justify-between">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Progression dossier
                      </p>
                      <span class="text-xs font-bold text-secondary">72 %</span>
                    </div>
                    <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        class="dashboard-progress-fill h-full rounded-full bg-gradient-to-r from-secondary to-secondary-fixed"
                        :class="{ 'is-visible': progressReady }"
                      />
                    </div>
                    <p class="mt-2 text-xs text-slate-600">1 pièce manquante · CNI recto</p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <p class="text-xs font-bold text-primary">Mes candidatures</p>
                    <ul class="mt-2.5 space-y-2">
                      <li
                        class="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-2 text-xs"
                      >
                        <span class="truncate font-medium text-emerald-900">IA · ESMT</span>
                        <span class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Validée
                        </span>
                      </li>
                      <li
                        class="flex items-center justify-between rounded-lg bg-amber-50 px-2.5 py-2 text-xs"
                      >
                        <span class="truncate font-medium text-amber-950">Data · UCAD</span>
                        <span class="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          En cours
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Colonne droite -->
                <div class="space-y-3 sm:col-span-3">
                  <div class="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <div class="mb-2.5 flex items-center justify-between">
                      <p class="text-xs font-bold text-primary">Mes documents</p>
                      <span class="text-[10px] font-semibold text-secondary">Télécharger</span>
                    </div>
                    <div class="space-y-2">
                      <div
                        v-for="doc in ['Attestation de bourse.pdf', 'Reçu de paiement.pdf']"
                        :key="doc"
                        class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2"
                      >
                        <span class="flex min-w-0 items-center gap-2 text-xs text-slate-700">
                          <span class="material-symbols-outlined shrink-0 text-[16px] text-red-500/80">picture_as_pdf</span>
                          <span class="truncate">{{ doc }}</span>
                        </span>
                        <span class="material-symbols-outlined shrink-0 text-[16px] text-primary">download</span>
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex items-start gap-2.5 rounded-xl border border-primary/10 bg-primary/[0.04] px-3 py-3"
                  >
                    <span class="material-symbols-outlined shrink-0 text-[18px] text-primary">info</span>
                    <p class="text-xs leading-relaxed text-slate-600">
                      Votre dossier est en cours d'examen. Vous serez notifié dès qu'une décision est disponible.
                    </p>
                  </div>

                  <!-- Mini nav mobile dans la maquette -->
                  <div class="flex justify-around rounded-xl border border-slate-100 bg-white py-2 sm:hidden">
                    <span class="flex flex-col items-center gap-0.5 text-[9px] font-semibold text-primary">
                      <span class="material-symbols-outlined text-[18px]">home</span>
                      Accueil
                    </span>
                    <span class="flex flex-col items-center gap-0.5 text-[9px] font-semibold text-slate-400">
                      <span class="material-symbols-outlined text-[18px]">description</span>
                      Dossiers
                    </span>
                    <span class="flex flex-col items-center gap-0.5 text-[9px] font-semibold text-slate-400">
                      <span class="material-symbols-outlined text-[18px]">folder</span>
                      Docs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
