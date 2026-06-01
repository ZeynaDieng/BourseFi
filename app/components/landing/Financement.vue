<template>
  <section class="bg-surface-container-low py-20">
    <div class="mx-auto max-w-7xl px-8">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {{ block.kicker || 'Financement' }}
      </p>
      <h2 class="mx-auto mb-4 max-w-3xl text-center font-headline text-3xl font-extrabold text-primary md:text-4xl">
        {{ block.title || 'Comment fonctionne le financement' }}
      </h2>
      <p class="mx-auto mb-14 max-w-2xl text-center text-on-surface-variant">
        {{
          block.subtitle ||
          "Un modèle clair qui relie territoires, partenaires et bailleurs, jusqu'à l'attestation officielle."
        }}
      </p>

      <div class="mx-auto max-w-2xl">
        <ol class="relative space-y-0 border-l border-slate-200 pl-8 md:pl-10">
          <li
            v-for="(step, index) in steps"
            :key="step.title + index"
            class="relative pb-12 last:pb-0"
          >
            <span
              class="absolute -left-[39px] top-0 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-surface-container-low bg-primary text-[10px] font-bold text-white shadow-sm md:-left-[42px] md:h-6 md:w-6 md:text-xs"
            >
              {{ index + 1 }}
            </span>
            <div
              class="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium transition duration-300 hover:border-primary/15 hover:shadow-lg"
            >
              <div class="mb-3 flex flex-wrap items-center gap-2 text-secondary">
                <span class="material-symbols-outlined text-[22px]">{{ step.icon }}</span>
                <span class="text-xs font-bold uppercase tracking-wider">{{ step.actor }}</span>
              </div>
              <h3 class="mb-2 font-headline text-lg font-bold text-primary">{{ step.title }}</h3>
              <p class="text-sm leading-relaxed text-on-surface-variant">{{ step.body }}</p>
            </div>
          </li>
        </ol>
      </div>

      <div
        class="mx-auto mt-14 max-w-3xl rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-premium"
      >
        <span class="material-symbols-outlined mb-3 text-3xl text-secondary">badge</span>
        <h3 class="mb-2 font-headline text-lg font-bold text-primary">{{ closureTitle }}</h3>
        <p class="text-sm text-on-surface-variant">{{ closureBody }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Step = { actor: string; icon: string; title: string; body: string }

const { data: site } = await usePublicSite()

const block = computed(() => (site.value?.content?.financement ?? {}) as Record<string, string>)

const defaultSteps: Step[] = [
  {
    actor: 'Mairies',
    icon: 'location_city',
    title: 'Rôle des mairies',
    body: "Elles orientent les jeunes du territoire, vérifient l'éligibilité locale et peuvent recommander des dossiers aux partenaires financiers du dispositif."
  },
  {
    actor: 'Agences',
    icon: 'handshake',
    title: 'Agences partenaires',
    body: 'Les agences accompagnent les familles : information sur les formations, pré-contrôle des pièces et mise en relation avec les bailleurs.'
  },
  {
    actor: 'Bailleurs',
    icon: 'account_balance',
    title: 'Bailleurs & validation',
    body: 'Les bailleurs valident le financement selon des critères publiés (niveau, filière, budget). Chaque décision est historisée pour plus de transparence.'
  },
  {
    actor: 'Processus',
    icon: 'fact_check',
    title: 'Validation & suivi',
    body: 'Le traitement suit des étapes standardisées : dépôt, analyse, éventuel complément de dossier, puis décision. Vous suivez tout depuis votre tableau de bord.'
  }
]

const steps = computed(() => {
  const raw = (site.value?.content?.financement as { steps?: Step[] } | undefined)?.steps
  return raw?.length ? raw : defaultSteps
})

const closureTitle = computed(
  () =>
    (site.value?.content?.financement as { closureTitle?: string } | undefined)?.closureTitle ||
    'Attestation finale du bailleur'
)

const closureBody = computed(
  () =>
    (site.value?.content?.financement as { closureBody?: string } | undefined)?.closureBody ||
    "Une fois votre dossier validé par le partenaire financier (mairie, agence ou bailleur institutionnel), l'attestation est émise sur la plateforme. Vous la téléchargez depuis votre espace pour la présenter à l'établissement — preuve claire et traçable de votre financement."
)
</script>
