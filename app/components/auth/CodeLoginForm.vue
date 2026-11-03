<script setup lang="ts">
/**
 * Connexion sans mot de passe : code à 6 chiffres reçu par email.
 * Utilisé sur la page de connexion et sur la page de candidature.
 */
const props = defineProps<{ initialEmail?: string; submitLabel?: string }>()
const emit = defineEmits<{ success: [role: string]; cancel: [] }>()

const email = ref(props.initialEmail ?? '')
const code = ref('')
const step = ref<'email' | 'code'>('email')
const loading = ref(false)
const errorMessage = ref('')
const cooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | undefined

function startCooldown() {
  cooldown.value = 30
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}
onUnmounted(() => clearInterval(cooldownTimer))

function apiError(e: unknown, fallback: string) {
  const data = e && typeof e === 'object' && 'data' in e ? (e as { data?: { statusMessage?: string } }).data : undefined
  return data?.statusMessage || fallback
}

async function sendCode() {
  errorMessage.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/connexion-code', { method: 'POST', body: { email: email.value.trim() } })
    code.value = ''
    step.value = 'code'
    startCooldown()
    await nextTick()
    document.querySelector<HTMLInputElement>('[data-login-code] input')?.focus()
  } catch (e) {
    errorMessage.value = apiError(e, 'Impossible d’envoyer le code pour le moment.')
  } finally {
    loading.value = false
  }
}

async function verifyCode() {
  errorMessage.value = ''
  loading.value = true
  const { addCsrfToHeaders } = useCsrf()
  try {
    const res = await $fetch<{ user: { role: string } }>('/api/auth/connexion-code-verifier', {
      method: 'POST',
      body: { email: email.value.trim(), code: code.value.replace(/\D/g, '') },
      headers: addCsrfToHeaders(),
    })
    emit('success', res.user.role)
  } catch (e) {
    errorMessage.value = apiError(e, 'Code invalide ou expiré. Vérifiez-le ou demandez-en un nouveau.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form v-if="step === 'email'" class="space-y-4" @submit.prevent="sendCode">
    <p class="text-sm text-slate-600">
      Pas besoin de mot de passe : recevez un code à 6 chiffres par e-mail.
    </p>
    <label class="block">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span>
      <input v-model="email" type="email" required autocomplete="email" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
    </label>
    <p v-if="errorMessage" class="text-sm font-medium text-red-700">{{ errorMessage }}</p>
    <button
      type="submit"
      class="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
      :disabled="loading"
    >
      {{ loading ? 'Envoi…' : 'Recevoir mon code' }}
    </button>
    <button type="button" class="w-full text-xs font-medium text-slate-500 hover:text-primary" @click="emit('cancel')">
      Me connecter avec mon mot de passe
    </button>
  </form>

  <form v-else data-login-code class="space-y-4" @submit.prevent="verifyCode">
    <div class="rounded-xl bg-primary/5 p-4 text-sm text-slate-600">
      <p class="font-bold text-primary">Vérifiez votre email</p>
      <p class="mt-1">
        Si un compte existe pour <strong class="break-all text-primary">{{ email }}</strong>, un code à 6 chiffres vient d’y être envoyé.
        Pensez à regarder dans vos spams.
      </p>
    </div>
    <label class="block">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code de connexion</span>
      <input
        v-model="code"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        pattern="[0-9]{6}"
        required
        placeholder="000000"
        class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-center font-mono text-2xl font-bold tracking-[0.5em] text-primary"
      />
    </label>
    <p v-if="errorMessage" class="text-sm font-medium text-red-700">{{ errorMessage }}</p>
    <button
      type="submit"
      class="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
      :disabled="loading || code.replace(/\D/g, '').length !== 6"
    >
      {{ loading ? 'Connexion…' : (submitLabel || 'Se connecter') }}
    </button>
    <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
      <button
        type="button"
        class="font-semibold text-primary underline-offset-2 hover:underline disabled:text-slate-400 disabled:no-underline"
        :disabled="cooldown > 0 || loading"
        @click="sendCode"
      >
        {{ cooldown > 0 ? `Renvoyer le code (${cooldown} s)` : 'Renvoyer le code' }}
      </button>
      <button type="button" class="text-slate-500 hover:text-primary" @click="step = 'email'">
        Modifier mon adresse
      </button>
    </div>
    <button type="button" class="w-full text-xs font-medium text-slate-500 hover:text-primary" @click="emit('cancel')">
      Me connecter avec mon mot de passe
    </button>
  </form>
</template>
