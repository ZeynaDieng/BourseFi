<script setup lang="ts">
const steps = [
  { icon: 'edit_document', title: 'Déposer un dossier', text: 'Remplissez le formulaire en moins de 2 minutes.' },
  { icon: 'payments', title: 'Payer les frais', text: 'Réglez les frais de dossier par Mobile Money.' },
  { icon: 'fact_check', title: 'Analyse du bailleur', text: 'Le bailleur étudie votre éligibilité.' },
  { icon: 'workspace_premium', title: 'Réception attestation', text: 'Vous recevez votre attestation officielle.' },
  { icon: 'school', title: 'Inscription école', text: 'Finalisez votre inscription auprès de l’école.' },
]
</script>

<template>
  <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium md:p-8">
    <h2 class="font-headline text-lg font-bold text-primary">Comment ça marche ?</h2>

    <!-- Desktop : horizontal -->
    <ol class="mt-6 hidden md:flex md:items-start">
      <li
        v-for="(s, i) in steps"
        :key="s.title"
        class="relative flex flex-1 flex-col items-center text-center last:flex-none"
      >
        <div class="flex items-center">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span class="material-symbols-outlined">{{ s.icon }}</span>
          </span>
        </div>
        <span class="mt-3 text-xs font-bold text-secondary">Étape {{ i + 1 }}</span>
        <p class="mt-1 max-w-[10rem] font-semibold text-primary">{{ s.title }}</p>
        <p class="mt-1 max-w-[11rem] text-xs leading-snug text-slate-500">{{ s.text }}</p>
        <span
          v-if="i < steps.length - 1"
          class="absolute right-0 top-6 h-0.5 w-1/2 translate-x-1/2 bg-slate-200"
          aria-hidden="true"
        />
      </li>
    </ol>

    <!-- Mobile : vertical -->
    <ol class="mt-6 space-y-0 md:hidden">
      <li v-for="(s, i) in steps" :key="s.title" class="flex gap-4">
        <div class="flex flex-col items-center">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span class="material-symbols-outlined text-[20px]">{{ s.icon }}</span>
          </span>
          <span v-if="i < steps.length - 1" class="my-1 w-0.5 flex-1 bg-slate-200" aria-hidden="true" />
        </div>
        <div class="pb-6">
          <span class="text-[11px] font-bold text-secondary">Étape {{ i + 1 }}</span>
          <p class="font-semibold text-primary">{{ s.title }}</p>
          <p class="mt-0.5 text-xs leading-snug text-slate-500">{{ s.text }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>
