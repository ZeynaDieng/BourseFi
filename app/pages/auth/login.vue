<script setup lang="ts">
import { isSafeStudentRedirect, resolveStudentAuthRedirect, authRedirectHint } from '~/utils/routes'
import { PARTNER_PORTAL_ENABLED } from '~/utils/product-config'

const route = useRoute()
const redirectTo = computed(() =>
  typeof route.query.redirect === 'string' ? route.query.redirect : '',
)

const redirectHint = computed(() =>
  redirectTo.value ? authRedirectHint(redirectTo.value) : null,
)

const registerHref = computed(() => {
  if (redirectTo.value && isSafeStudentRedirect(redirectTo.value)) {
    return `/auth/register?redirect=${encodeURIComponent(redirectTo.value)}`
  }
  return '/auth/register'
})

const form = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)
const errorMessage = ref('')

function resolvePostLoginPath(role: string): string {
  const custom = redirectTo.value
  if (custom && isSafeStudentRedirect(custom) && role === 'STUDENT') {
    return custom
  }
  if (role === 'ADMIN') return '/admin/dashboard'
  if (role === 'PARTNER' && PARTNER_PORTAL_ENABLED) return '/partenaire/dashboard'
  if (role === 'PARTNER') return '/'
  return resolveStudentAuthRedirect('')
}

async function submitLogin() {
  errorMessage.value = ''
  isLoading.value = true

  const { addCsrfToHeaders } = useCsrf()

  try {
    const response = await $fetch<{ user: { role: string } }>('/api/auth/login', {
      method: 'POST',
      body: form,
      headers: addCsrfToHeaders(),
    })
    await navigateTo(resolvePostLoginPath(response.user.role))
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
      'Connexion impossible. Vérifiez vos identifiants.'
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
      <h1 class="mb-2 font-headline text-3xl font-extrabold text-primary">Connexion</h1>
      <p v-if="redirectHint" class="mb-4 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary">
        {{ redirectHint }}
      </p>
      <p class="mb-6 text-sm text-slate-500">Accedez a votre espace BourseFi.</p>

      <form class="space-y-4" @submit.prevent="submitLogin">
        <input v-model="form.email" type="email" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Email" />
        <input v-model="form.password" type="password" required class="w-full rounded-lg border-slate-200 px-4 py-3" placeholder="Mot de passe" />
        <div v-if="errorMessage" class="error-alert-container flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-sm text-red-800 shadow-sm backdrop-blur-sm transition duration-300">
          <span class="material-symbols-outlined shrink-0 text-red-600 select-none text-[18px]">gpp_bad</span>
          <span class="font-medium leading-normal">{{ errorMessage }}</span>
        </div>
        <button :disabled="isLoading" type="submit" class="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
          {{ isLoading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-600">
        Pas de compte ?
        <NuxtLink :to="registerHref" class="font-semibold text-primary">Inscription</NuxtLink>
      </p>
    </div>
  </main>
</template>
