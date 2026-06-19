<script setup lang="ts">
const form = reactive({
  senderName: '',
  email: '',
  subject: 'Étudiant',
  message: ''
})

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function submitForm() {
  isSubmitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await $fetch<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: form
    })
    
    if (response.success) {
      successMessage.value = response.message
      form.senderName = ''
      form.email = ''
      form.message = ''
    }
  } catch (e: any) {
    errorMessage.value = e.statusMessage || "Une erreur est survenue lors de l'envoi."
  } finally {
    isSubmitting.value = false
  }
}

useSiteSeo({
  title: 'Contactez-nous — BourseFi',
  description:
    "Une question ? Un besoin d'accompagnement ? Notre équipe est à votre écoute pour vous aider dans vos démarches de bourses.",
})
</script>

<template>
  <main class="relative overflow-hidden bg-white py-20 px-8">
    <!-- Background Decor -->
    <div class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
    <div class="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary-container/10 blur-3xl"></div>

    <div class="mx-auto max-w-7xl">
      <!-- Hero Section -->
      <div class="mb-20 text-center">
        <h1 class="font-headline text-4xl font-extrabold text-primary">Contactez-nous</h1>
        <p class="mt-6 mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
          Notre équipe est là pour répondre à toutes vos questions concernant les bourses d'études, les partenariats ou le fonctionnement de la plateforme.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-16 lg:grid-cols-2">
        <!-- Contact Info -->
        <div class="space-y-8">
          <div class="group rounded-3xl border border-slate-100 bg-white p-8 shadow-premium transition-all hover:border-primary/20 hover:shadow-2xl">
            <div class="flex items-center gap-6">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <span class="material-symbols-outlined text-4xl">mail</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-primary">Email</h3>
                <p class="mt-1 text-slate-500">Réponse sous 24h ouvrées</p>
                <a href="mailto:contact@boursefi.sn" class="mt-2 block font-semibold text-primary hover:underline">contact@boursefi.sn</a>
              </div>
            </div>
          </div>

          <div class="group rounded-3xl border border-slate-100 bg-white p-8 shadow-premium transition-all hover:border-primary/20 hover:shadow-2xl">
            <div class="flex items-center gap-6">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                <span class="material-symbols-outlined text-4xl">call</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-primary">Téléphone</h3>
                <p class="mt-1 text-slate-500">Disponible 24h/24, 7j/7</p>
                <p class="mt-2 font-semibold text-primary">+221 77 778 04 56</p>
              </div>
            </div>
          </div>

          <div class="group rounded-3xl border border-slate-100 bg-white p-8 shadow-premium transition-all hover:border-primary/20 hover:shadow-2xl">
            <div class="flex items-center gap-6">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                <span class="material-symbols-outlined text-4xl">location_on</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-primary">Siège Social</h3>
                <p class="mt-1 text-slate-500">Ouakam, Dakar</p>
                <p class="mt-2 font-semibold text-primary italic">Dakar, Ouakam - Siège BourseFi</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="rounded-3xl border border-slate-100 bg-white p-10 shadow-2xl">
          <h2 class="mb-8 font-headline text-3xl font-bold text-primary">Envoyez un message</h2>
          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="space-y-2">
              <label class="text-sm font-bold uppercase tracking-wider text-slate-400">Nom complet</label>
              <input v-model="form.senderName" required class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10" placeholder="Ex: Seynabou Diop" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold uppercase tracking-wider text-slate-400">Email</label>
              <input v-model="form.email" type="email" required class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10" placeholder="votre@email.com" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold uppercase tracking-wider text-slate-400">Je suis un...</label>
              <select v-model="form.subject" class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10">
                <option value="Étudiant">Étudiant</option>
                <option value="Établissement">Établissement</option>
                <option value="Partenaire">Partenaire (Bailleur)</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold uppercase tracking-wider text-slate-400">Message</label>
              <textarea v-model="form.message" required rows="5" class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10" placeholder="Comment pouvons-nous vous aider ?"></textarea>
            </div>

            <div v-if="successMessage" class="rounded-xl border border-emerald-500/30 bg-emerald-50 p-4 text-emerald-700 font-medium">
              {{ successMessage }}
            </div>
             <div v-if="errorMessage" class="rounded-xl border border-red-500/30 bg-red-50 p-4 text-red-700 font-medium">
              {{ errorMessage }}
            </div>

            <button :disabled="isSubmitting" type="submit" class="group relative w-full overflow-hidden rounded-2xl bg-primary py-5 font-bold text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
              <span v-if="isSubmitting" class="flex items-center justify-center gap-3">
                <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </span>
              <span v-else>Envoyer le message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.shadow-premium {
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
}
</style>
