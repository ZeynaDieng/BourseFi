<script setup lang="ts">
const route = useRoute()
const token = route.query.token as string
const verifying = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  if (!token) {
    error.value = 'Token de vérification manquant.'
    verifying.value = false
    return
  }

  try {
    const response = await $fetch<{ ok: boolean }>('/api/auth/verify-email', {
      method: 'GET',
      query: { token }
    })

    if (response?.ok) {
      success.value = true
      setTimeout(() => {
        navigateTo('/etudiant/dashboard')
      }, 3000)
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erreur lors de la vérification'
  } finally {
    verifying.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div v-if="verifying" class="py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p class="text-slate-600">Vérification de votre email en cours...</p>
        </div>

        <div v-else-if="success" class="py-8">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">Email vérifié !</h1>
          <p class="text-slate-600 mb-6">Votre compte est maintenant activé. Vous allez être redirigé vers votre tableau de bord.</p>
          <NuxtLink to="/etudiant/dashboard" class="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90">
            Accéder à mon espace
          </NuxtLink>
        </div>

        <div v-else class="py-8">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-red-600 text-3xl">error</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">Erreur de vérification</h1>
          <p class="text-slate-600 mb-6">{{ error }}</p>
          <div class="space-y-3">
            <NuxtLink to="/auth/login" class="block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90">
              Se connecter
            </NuxtLink>
            <NuxtLink to="/auth/register" class="block text-slate-600 hover:text-primary">
              Créer un nouveau compte
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>