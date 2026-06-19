<script setup lang="ts">
import { reactive, ref, watchEffect, computed } from 'vue'

definePageMeta({ layout: 'student-app', middleware: 'student-auth' })

const { data: me, refresh } = await useFetch('/api/auth/me')

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  identityCardRecto: '',
  identityCardVerso: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function splitName(full: string) {
  const parts = (full || '').trim().split(/\s+/).filter(Boolean)
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') || parts[0] || '' }
}

watchEffect(() => {
  const u = me.value?.user
  if (!u) return
  if (!form.firstName) form.firstName = u.firstName || splitName(u.name ?? '').first
  if (!form.lastName) form.lastName = u.lastName || splitName(u.name ?? '').last
  if (!form.phone) form.phone = u.phone || ''
  if (!form.address) form.address = u.address || ''
})

const currentRecto = computed(() => me.value?.user?.identityCardRectoUrl || '')
const currentVerso = computed(() => me.value?.user?.identityCardVersoUrl || '')
const profileComplete = computed(() => Boolean(me.value?.user?.profileComplete))

async function submit() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!form.firstName.trim() || !form.lastName.trim()) {
    errorMessage.value = 'Indiquez votre prénom et votre nom.'
    return
  }
  if (form.phone.replace(/\s/g, '').length < 8) {
    errorMessage.value = 'Indiquez un numéro de téléphone valide.'
    return
  }
  if (form.address.trim().length < 5) {
    errorMessage.value = 'Indiquez votre adresse complète.'
    return
  }
  if (!currentRecto.value && !form.identityCardRecto) {
    errorMessage.value = 'Ajoutez le recto de votre carte d’identité.'
    return
  }
  if (!currentVerso.value && !form.identityCardVerso) {
    errorMessage.value = 'Ajoutez le verso de votre carte d’identité.'
    return
  }

  isSubmitting.value = true
  try {
    await $fetch('/api/profile', {
      method: 'PUT',
      body: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        identityCardRecto: form.identityCardRecto || undefined,
        identityCardVerso: form.identityCardVerso || undefined,
      },
    })
    form.identityCardRecto = ''
    form.identityCardVerso = ''
    successMessage.value = 'Profil enregistré. Ces informations seront réutilisées pour vos candidatures.'
    await refresh()
  } catch {
    errorMessage.value = "Impossible d'enregistrer le profil. Vérifiez les champs et réessayez."
  } finally {
    isSubmitting.value = false
  }
}

useSeoMeta({ title: 'Mon compte — BourseFi' })
</script>

<template>
  <main class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8">
    <h1 class="font-headline text-2xl font-extrabold text-primary md:text-3xl">Mon compte</h1>
    <p class="mt-1 text-sm text-slate-500">
      Renseignez votre identité une seule fois : elle sera réutilisée automatiquement pour chaque candidature.
    </p>

    <div
      v-if="!profileComplete"
      class="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
    >
      <span class="material-symbols-outlined text-[20px]">info</span>
      <p>Complétez votre profil (coordonnées + carte d’identité) pour pouvoir déposer une candidature.</p>
    </div>

    <div class="mt-6 space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-premium sm:p-6">
      <section>
        <h2 class="font-headline text-lg font-bold text-primary">Identité</h2>
        <div class="mt-3 grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prénom</span>
            <input v-model="form.firstName" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
          </label>
          <label class="block">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nom</span>
            <input v-model="form.lastName" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
          </label>
          <label class="block">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span>
            <input :value="me?.user?.email" disabled class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm text-slate-500" />
          </label>
          <label class="block">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Téléphone</span>
            <input v-model="form.phone" type="tel" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" placeholder="+221 ..." />
          </label>
          <label class="block sm:col-span-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adresse</span>
            <input v-model="form.address" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
          </label>
        </div>
      </section>

      <section class="border-t border-slate-100 pt-5">
        <h2 class="font-headline text-lg font-bold text-primary">Carte d’identité</h2>
        <p class="mt-1 text-sm text-slate-500">JPG, PNG, WebP ou PDF (max 5 Mo). Déposée une fois, conservée sur votre compte.</p>
        <div class="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <div v-if="currentRecto" class="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
              Recto enregistré
              <a :href="currentRecto" target="_blank" class="text-primary underline">voir</a>
            </div>
            <CandidatureDocumentDropzone v-model="form.identityCardRecto" :label="currentRecto ? 'Remplacer le recto' : 'Carte d’identité — Recto'" />
          </div>
          <div>
            <div v-if="currentVerso" class="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
              Verso enregistré
              <a :href="currentVerso" target="_blank" class="text-primary underline">voir</a>
            </div>
            <CandidatureDocumentDropzone v-model="form.identityCardVerso" :label="currentVerso ? 'Remplacer le verso' : 'Carte d’identité — Verso'" />
          </div>
        </div>
      </section>

      <p v-if="errorMessage" class="text-sm font-medium text-red-600">{{ errorMessage }}</p>
      <p v-if="successMessage" class="text-sm font-medium text-emerald-600">{{ successMessage }}</p>

      <button
        type="button"
        class="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50 sm:w-auto"
        :disabled="isSubmitting"
        @click="submit"
      >
        {{ isSubmitting ? 'Enregistrement…' : 'Enregistrer mon profil' }}
      </button>
    </div>
  </main>
</template>
