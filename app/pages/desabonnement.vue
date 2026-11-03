<script setup lang="ts">
// Confirmation par un clic : les antivirus de messagerie ouvrent les liens, ils ne doivent pas désabonner à la place de l'étudiant
const route = useRoute()
const e = computed(() => (typeof route.query.e === 'string' ? route.query.e : ''))
const t = computed(() => (typeof route.query.t === 'string' ? route.query.t : ''))
const state = ref<'idle' | 'sending' | 'done' | 'error'>(e.value && t.value ? 'idle' : 'error')

async function confirm() {
  state.value = 'sending'
  try {
    await $fetch('/api/relances/desabonnement', { method: 'POST', body: { e: e.value, t: t.value } })
    state.value = 'done'
  } catch {
    state.value = 'error'
  }
}

useSeoMeta({ title: 'Désabonnement — BourseFi', robots: 'noindex' })
</script>

<template>
  <main class="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
      <template v-if="state === 'done'">
        <span class="material-symbols-outlined text-[40px] text-emerald-600">check_circle</span>
        <h1 class="mt-3 font-headline text-xl font-extrabold text-primary">C’est noté</h1>
        <p class="mt-2 text-sm text-slate-600">Vous ne recevrez plus nos rappels automatiques. Votre compte et votre dossier restent accessibles.</p>
      </template>
      <template v-else-if="state === 'error'">
        <span class="material-symbols-outlined text-[40px] text-red-500">error</span>
        <h1 class="mt-3 font-headline text-xl font-extrabold text-primary">Lien invalide</h1>
        <p class="mt-2 text-sm text-slate-600">Ce lien de désabonnement n’est pas valide. Utilisez celui figurant en bas de l’email reçu.</p>
      </template>
      <template v-else>
        <span class="material-symbols-outlined text-[40px] text-primary">mail</span>
        <h1 class="mt-3 font-headline text-xl font-extrabold text-primary">Ne plus recevoir nos rappels ?</h1>
        <p class="mt-2 text-sm text-slate-600">Vous ne recevrez plus de rappels au sujet de votre candidature. Les emails liés à votre paiement et à votre attestation continueront d’arriver.</p>
        <button
          type="button"
          class="mt-6 w-full rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:opacity-95 disabled:opacity-50"
          :disabled="state === 'sending'"
          @click="confirm"
        >
          {{ state === 'sending' ? 'Enregistrement…' : 'Me désabonner des rappels' }}
        </button>
      </template>
    </div>
  </main>
</template>
