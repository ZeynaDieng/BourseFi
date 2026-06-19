<script setup lang="ts">
import { authRedirectHint, isSafeStudentRedirect, resolveStudentAuthRedirect } from '~/utils/routes'

const route = useRoute()

const redirectTo = computed(() =>
  typeof route.query.redirect === 'string' ? route.query.redirect : '',
)

const redirectHint = computed(() =>
  redirectTo.value ? authRedirectHint(redirectTo.value) : null,
)

const loginHref = computed(() => {
  if (redirectTo.value && isSafeStudentRedirect(redirectTo.value)) {
    return `/auth/login?redirect=${encodeURIComponent(redirectTo.value)}`
  }
  return '/auth/login'
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
})

const isLoading = ref(false)
const errorMessage = ref('')

function resolvePostRegisterPath() {
  return resolveStudentAuthRedirect(redirectTo.value)
}

async function submitRegister() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      },
    })
    await navigateTo(resolvePostRegisterPath())
  } catch (error: unknown) {
    const msg =
      error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { statusMessage?: string } }).data?.statusMessage
        : null
    errorMessage.value = msg || 'Inscription impossible. Vérifiez les informations.'
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
      <p v-if="redirectHint" class="mb-4 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary">
        {{ redirectHint }}
      </p>
      <p class="mb-6 text-sm text-slate-500">Créez votre compte étudiant BourseFi.</p>

      <form class="space-y-4" @submit.prevent="submitRegister">
        <div class="grid gap-4 sm:grid-cols-2">
          <input v-model="form.firstName" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Prénom" />
          <input v-model="form.lastName" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Nom" />
        </div>
        <input v-model="form.email" type="email" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Email" />
        <input v-model="form.password" type="password" minlength="8" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Mot de passe (8+ caractères)" />
        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{{ errorMessage }}</p>
        <button :disabled="isLoading" type="submit" class="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
          {{ isLoading ? 'Inscription…' : "S'inscrire" }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-600">
        Déjà inscrit ?
        <NuxtLink :to="loginHref" class="font-semibold text-primary">Connexion</NuxtLink>
      </p>
    </div>
  </main>
</template>
