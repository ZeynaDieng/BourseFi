<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const isSuccess = ref(false)

async function submitResetPassword() {
  if (!password.value || !confirmPassword.value) return
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les deux mots de passe ne correspondent pas.'
    return
  }

  if (password.value.length < 4) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 4 caractères.'
    return
  }

  isLoading.value = true

  try {
    const { addCsrfToHeaders } = useCsrf()
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value,
      },
      headers: addCsrfToHeaders(),
    })
    isSuccess.value = true
  } catch (error: unknown) {
    const data =
      error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string; statusMessage?: string } }).data
        : undefined

    errorMessage.value =
      data?.message ??
      data?.statusMessage ??
      'Erreur lors de la réinitialisation du mot de passe. Le lien est peut-être expiré.'
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
        <h1 class="font-headline text-2xl font-extrabold text-primary">Nouveau mot de passe</h1>
        <p class="text-xs text-slate-500">
          Choisissez un nouveau mot de passe sécurisé pour votre compte BourseFi.
        </p>
      </div>

      <!-- Cas où aucun token n'est fourni -->
      <div v-if="!token" class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center space-y-3">
        <span class="material-symbols-outlined text-[32px] text-amber-600">warning</span>
        <h3 class="font-bold text-amber-900 text-sm">Lien invalide ou manquant</h3>
        <p class="text-xs text-amber-800">
          Aucun jeton de réinitialisation n'a été détecté dans le lien.
        </p>
        <NuxtLink to="/auth/forgot-password" class="admin-btn-primary text-xs w-full inline-flex items-center justify-center">
          Faire une nouvelle demande
        </NuxtLink>
      </div>

      <!-- Succès de réinitialisation -->
      <div v-else-if="isSuccess" class="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <span class="material-symbols-outlined text-[26px]">check_circle</span>
        </div>
        <h3 class="font-bold text-slate-900 text-sm">Mot de passe réinitialisé !</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Votre mot de passe a été modifié avec succès. Vous pouvez dès maintenant vous connecter à votre espace BourseFi.
        </p>

        <div class="pt-2">
          <NuxtLink to="/auth/login" class="w-full rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white shadow-md inline-flex items-center justify-center">
            Se connecter à mon compte
          </NuxtLink>
        </div>
      </div>

      <!-- Formulaire de saisie du mot de passe -->
      <form v-else class="space-y-4" @submit.prevent="submitResetPassword">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">Nouveau mot de passe</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="4"
              class="w-full rounded-xl border-slate-200 px-4 py-3 text-sm focus:border-primary focus:ring-primary pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              @click="showPassword = !showPassword"
            >
              <span class="material-symbols-outlined text-[20px]">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">Confirmer le nouveau mot de passe</label>
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="4"
            class="w-full rounded-xl border-slate-200 px-4 py-3 text-sm focus:border-primary focus:ring-primary"
            placeholder="••••••••"
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
          {{ isLoading ? 'Réinitialisation...' : 'Enregistrer le nouveau mot de passe' }}
        </button>
      </form>
    </div>
  </main>
</template>
