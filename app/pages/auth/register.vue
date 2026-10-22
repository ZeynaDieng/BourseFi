<script setup lang="ts">
import { authRedirectHint, isSafeStudentRedirect, resolveStudentAuthRedirect } from '~/utils/routes'
import { PASSWORD_MIN_LENGTH, PASSWORD_POLICY_HINT, checkPassword } from '#shared/password-policy'
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

  const policy = checkPassword(form.password, { email: form.email })
  if (!policy.ok) {
    errorMessage.value = policy.message
    isLoading.value = false
    return
  }

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

    const response = await $fetch<{ ok: boolean; message: string }>('/api/auth/register', {
      method: 'POST',
      body: payload,
    })

    form.password = ''
    successMessage.value = response.message
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
        <input v-model="form.password" type="password" :minlength="PASSWORD_MIN_LENGTH" maxlength="128" required autocomplete="new-password" class="w-full rounded-lg border-slate-200 px-4 py-3" :placeholder="`Mot de passe (${PASSWORD_MIN_LENGTH} caractères minimum)`" />
        <p class="text-xs text-slate-500">{{ PASSWORD_POLICY_HINT }}</p>

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

        <div v-if="errorMessage" class="error-alert-container flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-sm text-red-800 shadow-sm backdrop-blur-sm transition duration-300">
          <span class="material-symbols-outlined shrink-0 text-red-600 select-none text-[18px]">gpp_bad</span>
          <span class="font-medium leading-normal">{{ errorMessage }}</span>
        </div>
        <button :disabled="isLoading" type="submit" class="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
          {{ isLoading ? 'Inscription…' : "S'inscrire" }}
        </button>
      </form>

      <div v-else class="space-y-4 text-center">
        <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
        </div>
        <h2 class="text-xl font-bold text-slate-900">Vérifiez votre boîte email</h2>
        <p class="text-slate-600">{{ successMessage }}</p>
        <p class="text-sm text-slate-500">Pensez à consulter vos courriers indésirables. Le lien vous connectera automatiquement.</p>
        <NuxtLink :to="loginHref" class="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90">
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
