<script setup lang="ts">
import { STUDENT_HOME } from '~/utils/routes'

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

async function submitRegister() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form
    })
    await navigateTo(STUDENT_HOME)
  } catch (error) {
    errorMessage.value = 'Inscription impossible. Verifiez les informations.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-md px-4 py-16">
    <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-premium">
      <div class="mb-6 flex justify-center">
        <AppBrandLogo to="/" img-class="h-16 w-auto max-h-[5.25rem] object-contain" />
      </div>
      <h1 class="mb-2 font-headline text-3xl font-extrabold text-primary">Inscription</h1>
      <p class="mb-6 text-sm text-slate-500">Créez votre compte étudiant BourseFi.</p>

      <form class="space-y-4" @submit.prevent="submitRegister">
        <input v-model="form.name" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Nom complet" />
        <input v-model="form.email" type="email" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Email" />
        <input v-model="form.password" type="password" minlength="8" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Mot de passe (8+ caracteres)" />
        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{{ errorMessage }}</p>
        <button :disabled="isLoading" type="submit" class="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
          {{ isLoading ? 'Inscription...' : "S'inscrire" }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-600">
        Deja inscrit ?
        <NuxtLink to="/auth/login" class="font-semibold text-primary">Connexion</NuxtLink>
      </p>
    </div>
  </main>
</template>
