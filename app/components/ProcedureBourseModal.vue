<script setup lang="ts">
type ProgrammeForProcedure = {
  id: string
  titre: string
  etablissement: string
  partnerName: string
  ville: string
  fraisDossier: number
  devise: string
}

defineProps<{
  open: boolean
  programme: ProgrammeForProcedure | null
}>()

const emit = defineEmits<{
  close: []
  apply: []
}>()

function close() {
  emit('close')
}

function goApply() {
  emit('apply')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && programme"
      class="fixed inset-0 z-[100] flex items-end justify-center bg-primary/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="procedure-modal-title"
      @click.self="close"
    >
      <div
        class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <header class="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-secondary">Procédure bourse</p>
            <h2 id="procedure-modal-title" class="font-headline text-xl font-extrabold text-primary md:text-2xl">
              {{ programme.titre }}
            </h2>
            <p class="mt-1 text-sm text-slate-500">{{ programme.etablissement }} · {{ programme.ville }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
            @click="close"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <div class="space-y-6 px-6 py-6">
          <p class="text-sm text-slate-600">
            La prise en charge est assurée par
            <strong class="text-primary">{{ programme.partnerName }}</strong>
            (bailleur). Voici les étapes pour obtenir la bourse via BourseFi.
          </p>

          <ol class="grid gap-4 sm:grid-cols-1">
            <li class="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <span
                class="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
              >
                1
              </span>
              <h3 class="font-headline font-semibold text-primary">Déposer votre candidature</h3>
              <p class="mt-1 text-sm text-slate-600">
                Renseignez vos informations pour cette formation. Les pièces demandées figurent dans le formulaire
                de candidature.
              </p>
            </li>
            <li class="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <span
                class="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
              >
                2
              </span>
              <h3 class="font-headline font-semibold text-primary">Frais de dossier le cas échéant</h3>
              <p v-if="programme.fraisDossier > 0" class="mt-1 text-sm text-slate-600">
                Montant :
                <strong>{{ programme.fraisDossier.toLocaleString('fr-FR') }} {{ programme.devise }}</strong>
                — paiement sécurisé après l’envoi du formulaire, si applicable.
              </p>
              <p v-else class="mt-1 text-sm text-slate-600">Aucun frais de dossier n’est indiqué pour ce programme.</p>
            </li>
            <li class="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <span
                class="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
              >
                3
              </span>
              <h3 class="font-headline font-semibold text-primary">Validation et attestation</h3>
              <p class="mt-1 text-sm text-slate-600">
                {{ programme.partnerName }} examine le dossier. Après décision favorable, l’attestation du bailleur est
                disponible dans votre espace pour la présenter à l’établissement.
              </p>
            </li>
          </ol>
        </div>

        <footer class="sticky bottom-0 flex flex-col gap-2 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-primary hover:bg-slate-50"
            @click="close"
          >
            Fermer
          </button>
          <button
            type="button"
            class="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
            @click="goApply"
          >
            Remplir mon dossier de bourse
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
