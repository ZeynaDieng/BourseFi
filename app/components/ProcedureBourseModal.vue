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

type BourseInfo = {
  titre: string
  coveragePercent: number
  montantBourse: number
  placesRestantes: number
} | null

defineProps<{
  open: boolean
  programme: ProgrammeForProcedure | null
  bourse?: BourseInfo
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
            <p v-if="bourse" class="mt-2 text-sm font-semibold text-secondary">
              Bourse : {{ bourse.titre }} — couverture {{ bourse.coveragePercent }} %
              ({{ bourse.montantBourse.toLocaleString('fr-FR') }} {{ programme.devise }})
            </p>
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

        <div class="px-6 py-8">
          <div class="grid gap-6">
            <div class="flex items-start gap-4">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">1</span>
              <div>
                <h3 class="font-bold text-primary">Candidature</h3>
                <p class="text-sm text-slate-500">Remplissez vos informations en 2 minutes.</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">2</span>
              <div>
                <h3 class="font-bold text-primary">Frais de dossier</h3>
                <p class="text-sm text-slate-600">
                  <span v-if="programme.fraisDossier > 0">
                    Réglez <strong>{{ programme.fraisDossier.toLocaleString('fr-FR') }} {{ programme.devise }}</strong> par Mobile Money.
                  </span>
                  <span v-else>Gratuit pour cette formation.</span>
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">3</span>
              <div>
                <h3 class="font-bold text-primary">Attestation</h3>
                <p class="text-sm text-slate-500">Recevez votre document officiel après validation.</p>
              </div>
            </div>
          </div>
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
