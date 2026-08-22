<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const isSubmitted = ref(false)

async function submitForgotPassword() {
  if (!email.value) return
  errorMessage.value = ''
  isLoading.value = true

  try {
    const { addCsrfToHeaders } = useCsrf()
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
      headers: addCsrfToHeaders(),
    })
    isSubmitted.value = true
  } catch (error: unknown) {
    const data =
      error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string; statusMessage?: string } }).data
        : undefined

    errorMessage.value =
      data?.message ??
      data?.statusMessage ??
      'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-md px-4 py-16">
    <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-premium space-y-6">
      <div class="flex justify-center">
        <AppBrandLogo to="/" img-class="h-14 w-auto object-contain" />
      </div>

      <div class="text-center space-y-1">
        <h1 class="font-headline text-2xl font-extrabold text-primary">Mot de passe oublié ?</h1>
        <p class="text-xs text-slate-500">
          Entrez votre adresse e-mail ci-dessous pour recevoir un lien de réinitialisation sécurisé.
        </p>
      </div>

      <div v-if="isSubmitted" class="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <span class="material-symbols-outlined text-[26px]">mark_email_read</span>
        </div>
        <h3 class="font-bold text-slate-900 text-sm">E-mail envoyé !</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Si l'adresse <strong>{{ email }}</strong> est associée à un compte BourseFi, vous recevrez un e-mail contenant le lien de réinitialisation dans quelques instants.
        </p>
        <p class="text-[11px] text-slate-400">Pensez à vérifier votre dossier spams ou courrier indésirable.</p>

        <div class="pt-2">
          <NuxtLink to="/auth/login" class="admin-btn-secondary text-xs w-full inline-flex items-center justify-center">
            Retour à la connexion
          </NuxtLink>
        </div>
      </div>

      <form v-else class="space-y-4" @submit.prevent="submitForgotPassword">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">Adresse E-mail</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full rounded-xl border-slate-200 px-4 py-3 text-sm focus:border-primary focus:ring-primary"
            placeholder="votre.email@exemple.com"
          />
        </div>

        <div v-if="errorMessage" class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <span class="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-60"
        >
          {{ isLoading ? 'Envoi du lien...' : 'Envoyer le lien de réinitialisation' }}
        </button>

        <div class="text-center pt-2">
          <NuxtLink to="/auth/login" class="text-xs font-semibold text-slate-500 hover:text-primary transition inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">arrow_back</span>
            Retour à la connexion
          </NuxtLink>
        </div>
      </form>
    </div>
  </main>
</template>
