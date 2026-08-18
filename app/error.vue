<script setup lang="ts">
const props = defineProps({
  error: Object
})

const is401 = computed(() => props.error?.statusCode === 401 || props.error?.status === 401 || props.error?.message?.includes('401'))

function handleClearError() {
  if (is401.value) {
    clearError({ redirect: '/auth/login' })
  } else {
    clearError({ redirect: '/' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
    <div class="max-w-md w-full text-center space-y-6 bg-slate-800/80 p-8 rounded-3xl border border-slate-700/60 shadow-2xl backdrop-blur">
      <div class="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
        <span class="material-symbols-outlined text-3xl">{{ is401 ? 'lock' : 'error' }}</span>
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl font-black font-headline">
          {{ is401 ? 'Session Expirée' : 'Une erreur est survenue' }}
        </h1>
        <p class="text-sm text-slate-300">
          {{ is401 ? 'Votre session d\'administration a expiré ou nécessite une ré-authentification.' : (error?.statusMessage || error?.message || 'Impossible d\'accéder à la ressource.') }}
        </p>
      </div>

      <div class="pt-4 space-y-3">
        <button
          type="button"
          @click="handleClearError"
          class="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-lg">{{ is401 ? 'login' : 'home' }}</span>
          {{ is401 ? 'Se re-connecter à l\'Espace Admin' : 'Retour à l\'accueil' }}
        </button>

        <a
          href="/auth/login"
          class="block text-xs text-slate-400 hover:text-white transition underline"
        >
          Aller directement à la page de connexion
        </a>
      </div>
    </div>
  </div>
</template>
