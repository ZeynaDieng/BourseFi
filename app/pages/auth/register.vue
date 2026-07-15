<script setup lang="ts">
import { authRedirectHint, isSafeStudentRedirect, resolveStudentAuthRedirect } from '~/utils/routes'
const emailSent = ref(false)
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
  phone: '',
  password: '',
  acceptTerms: false,
  acceptMarketing: false,
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function resolvePostRegisterPath() {
  return resolveStudentAuthRedirect(redirectTo.value)
}

async function submitRegister() {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      acceptTerms: form.acceptTerms,
      acceptMarketing: form.acceptMarketing,
    }

    const response = await $fetch<{
      ok: boolean
      message: string
      emailSent: boolean
      email: string
    }>('/api/auth/register', {
      method: 'POST',
      body: payload,
    })

    emailSent.value = response.emailSent
 await navigateTo(loginHref.value)
    if (response.emailSent) {
      successMessage.value =
        "Compte créé avec succès. Un email de vérification vous a été envoyé."
    } else {
      successMessage.value =
        "Compte créé avec succès. Vous pouvez poursuivre votre candidature. Vous pourrez vérifier votre adresse email plus tard."
    }
  } catch (error: unknown) {
    const data =
      error && typeof error === 'object' && 'data' in error
        ? (error as {
            data?: {
              message?: string
              statusMessage?: string
            }
          }).data
        : undefined

    errorMessage.value =
      data?.message ??
      data?.statusMessage ??
      "Inscription impossible. Vérifiez les informations."
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

      <form v-if="!successMessage" class="space-y-4" @submit.prevent="submitRegister">
        <div class="grid gap-4 sm:grid-cols-2">
          <input v-model="form.firstName" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Prénom" />
          <input v-model="form.lastName" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Nom" />
        </div>
        <input v-model="form.email" type="email" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Email" />
        <input v-model="form.phone" type="tel" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Numéro de téléphone (ex: 77 123 45 67)" />
        <input v-model="form.password" type="password" minlength="4" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Mot de passe (4 caractères minimum)" />
        <p class="text-xs text-slate-500">Le mot de passe doit contenir au moins 4 caractères</p>

        <div class="space-y-3">
          <label class="flex items-start gap-3">
            <input v-model="form.acceptTerms" type="checkbox" required class="mt-1 rounded border-slate-300 text-primary focus:ring-primary" />
            <span class="text-sm text-slate-600">
              J'accepte les <NuxtLink to="/legal/terms" class="text-primary hover:underline">conditions d'utilisation</NuxtLink> et la <NuxtLink to="/legal/privacy" class="text-primary hover:underline">politique de confidentialité</NuxtLink> de BourseFi *
            </span>
          </label>
          <label class="flex items-start gap-3">
            <input v-model="form.acceptMarketing" type="checkbox" class="mt-1 rounded border-slate-300 text-primary focus:ring-primary" />
            <span class="text-sm text-slate-600">
              J'accepte de recevoir des communications marketing et des offres de bourses personnalisées
            </span>
          </label>
        </div>

        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{{ errorMessage }}</p>
        <button :disabled="isLoading" type="submit" class="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
          {{ isLoading ? 'Inscription…' : "S'inscrire" }}
        </button>
      </form>

      <div v-else class="space-y-4 text-center">
        <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
        </div>
        <h2 class="text-xl font-bold text-slate-900">Compte créé avec succès !</h2>
        <p class="text-slate-600">{{ successMessage }}</p>
<p
  v-if="emailSent"
  class="text-sm text-slate-500"
>
  Vérifiez votre boîte de réception pour confirmer votre adresse email.
</p>

<p
  v-else
  class="text-sm text-amber-600"
>
  L'email de confirmation n'a pas pu être envoyé pour le moment.
  Vous pouvez néanmoins continuer à utiliser votre compte.
</p>        <NuxtLink :to="loginHref" class="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90">
          Se connecter
        </NuxtLink>
      </div>

      <p class="mt-5 text-center text-sm text-slate-600">
        Déjà inscrit ?
        <NuxtLink :to="loginHref" class="font-semibold text-primary">Connexion</NuxtLink>
      </p>
    </div>
  </main>
</template>
