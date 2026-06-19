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

  try {
    const response = await $fetch<{ user: { role: string } }>('/api/auth/login', {
      method: 'POST',
      body: form,
    })
    await navigateTo(resolvePostLoginPath(response.user.role))
  } catch {
    errorMessage.value = 'Connexion impossible. Verifiez vos identifiants.'
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
        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{{ errorMessage }}</p>
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
