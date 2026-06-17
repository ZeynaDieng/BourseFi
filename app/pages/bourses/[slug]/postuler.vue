<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { STUDENT_HOME } from '~/utils/routes'
import type { BourseDto } from '~/types/bourse'

definePageMeta({ middleware: 'student-auth' })

const route = useRoute()
const router = useRouter()

const { data: bourse, error } = await useFetch<BourseDto>(
  () => `/api/bourses/${route.params.slug}`,
)

const { data: me } = await useFetch('/api/auth/me')

const STEPS = ['Informations', 'Documents', 'Validation'] as const
const step = ref(0)
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  institution: '',
  field: '',
  level: 'Licence',
  lastEducationLevel: '',
  lastDiploma: '',
  graduationDate: '',
  gpa: '',
  identityCardRecto: '',
  identityCardVerso: '',
})

function niveauToSelect(niveau?: string) {
  const n = (niveau || '').toLowerCase()
  if (n.includes('mba')) return 'MBA'
  if (n.includes('doctorat') || n.includes('phd')) return 'Doctorat'
  if (n.includes('bts')) return 'BTS'
  if (n.includes('master') || n.includes('msc')) return 'Master'
  if (n.includes('licence') || n.includes('bachelor') || n.includes('bsc')) return 'Licence'
  return 'Licence'
}

function splitNameFromUser(full: string) {
  const t = (full || '').trim()
  if (!t) return
  const parts = t.split(/\s+/)
  form.firstName = parts[0] ?? ''
  form.lastName = parts.slice(1).join(' ') || parts[0] || ''
}

watchEffect(() => {
  if (bourse.value) {
    form.institution ||= bourse.value.etablissement
    form.field ||= bourse.value.programmeTitre
    form.level = niveauToSelect(bourse.value.programmeNiveau)
  }
  if (me.value?.user) {
    if (!form.firstName) splitNameFromUser(me.value.user.name ?? '')
    form.email ||= me.value.user.email ?? ''
  }
})

function validateStep(s: number): boolean {
  errorMessage.value = ''
  if (s === 0) {
    if (!form.firstName.trim()) {
      errorMessage.value = 'Indiquez votre prénom.'
      return false
    }
    if (!form.lastName.trim()) {
      errorMessage.value = 'Indiquez votre nom.'
      return false
    }
    if (!form.email.trim()) {
      errorMessage.value = 'Indiquez votre adresse e-mail.'
      return false
    }
    if (!form.phone.trim() || form.phone.replace(/\s/g, '').length < 8) {
      errorMessage.value = 'Indiquez un numéro de téléphone valide.'
      return false
    }
    if (form.address.trim().length < 5) {
      errorMessage.value = 'Indiquez votre adresse complète (rue, ville…).'
      return false
    }
    if (!form.lastEducationLevel.trim()) {
      errorMessage.value = 'Indiquez votre dernier niveau d’études (ex. Terminale, Bac+2…).'
      return false
    }
    if (!form.lastDiploma.trim()) {
      errorMessage.value = 'Indiquez votre dernier diplôme obtenu ou en cours.'
      return false
    }
    if (!form.gpa.trim()) {
      errorMessage.value = 'Indiquez votre dernière moyenne ou note.'
      return false
    }
  }
  if (s === 1) {
    if (!form.identityCardRecto) {
      errorMessage.value = 'Ajoutez la photo recto de votre carte d’identité.'
      return false
    }
    if (!form.identityCardVerso) {
      errorMessage.value = 'Ajoutez la photo verso de votre carte d’identité.'
      return false
    }
  }
  return true
}

function goNext() {
  if (!validateStep(step.value)) return
  if (step.value < STEPS.length - 1) step.value++
}

function goBack() {
  errorMessage.value = ''
  if (step.value > 0) step.value--
}

async function submit() {
  if (!validateStep(0)) {
    step.value = 0
    return
  }
  if (!validateStep(1)) {
    step.value = 1
    return
  }
  if (!bourse.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    const res = await $fetch<{
      ok: boolean
      candidature: { id: string; status: string; fraisDossier: number }
    }>('/api/candidatures', {
      method: 'POST',
      body: {
        programmeId: bourse.value.programmeId,
        bourseId: bourse.value.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        institution: form.institution.trim(),
        field: form.field.trim(),
        level: form.level,
        lastEducationLevel: form.lastEducationLevel.trim(),
        lastDiploma: form.lastDiploma.trim(),
        graduationDate: form.graduationDate.trim(),
        gpa: form.gpa.trim(),
        identityCardRecto: form.identityCardRecto,
        identityCardVerso: form.identityCardVerso,
      },
    })
    const requiresPayment =
      res.candidature.status === 'EN_ATTENTE_PAIEMENT' && res.candidature.fraisDossier > 0
    if (requiresPayment) {
      router.push(`/paiement?candidatureId=${encodeURIComponent(res.candidature.id)}`)
    } else {
      router.push(STUDENT_HOME)
    }
  } catch {
    errorMessage.value =
      "Impossible d'enregistrer le dossier. Vérifiez les champs et les photos, puis réessayez."
  } finally {
    isSubmitting.value = false
  }
}

function formatFcfa(value: number) {
  return value.toLocaleString('fr-FR')
}

useSeoMeta({
  title: () => (bourse.value ? `Postuler — ${bourse.value.titre}` : 'Postuler — BourseFi'),
})
</script>

<template>
  <main v-if="bourse" class="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
    <NuxtLink
      :to="`/bourses/${bourse.slug}`"
      class="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-primary"
    >
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      Retour à la bourse
    </NuxtLink>

    <h1 class="font-headline text-2xl font-extrabold text-primary md:text-3xl">
      Demande de bourse
    </h1>
    <p class="mt-1 text-sm text-slate-500">
      Cela prend moins de 2 minutes. Vos informations sont enregistrées en toute sécurité.
    </p>

    <div class="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-premium sm:p-5">
      <CandidatureApplyStepper :current="step" :steps="[...STEPS]" />
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-12">
      <!-- Colonne formulaire -->
      <section class="lg:col-span-7">
        <!-- Recap repliee mobile -->
        <details class="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-premium lg:hidden">
          <summary class="flex cursor-pointer items-center justify-between text-sm font-semibold text-primary">
            Résumé de la bourse
            <span class="font-headline text-secondary">{{ bourse.coveragePercent }} %</span>
          </summary>
          <dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-slate-500">Montant couvert</dt>
              <dd class="font-bold text-secondary">{{ formatFcfa(bourse.montantBourse) }} {{ bourse.devise }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-slate-500">Reste à payer</dt>
              <dd class="font-semibold text-primary">{{ formatFcfa(bourse.resteACharge) }} {{ bourse.devise }}</dd>
            </div>
            <div v-if="bourse.fraisDossier > 0" class="flex justify-between gap-3">
              <dt class="text-slate-500">Frais dossier</dt>
              <dd class="font-semibold">{{ formatFcfa(bourse.fraisDossier) }} {{ bourse.devise }}</dd>
            </div>
          </dl>
        </details>

        <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium sm:p-6">
          <!-- Etape 1 : Informations -->
          <div v-if="step === 0" class="space-y-5">
            <div>
              <h2 class="font-headline text-lg font-bold text-primary">Informations personnelles</h2>
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
                  <input v-model="form.email" type="email" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
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
            </div>

            <div class="border-t border-slate-100 pt-5">
              <h2 class="font-headline text-lg font-bold text-primary">Parcours scolaire</h2>
              <div class="mt-3 grid gap-4 sm:grid-cols-2">
                <label class="block sm:col-span-2">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernier niveau d’études</span>
                  <input v-model="form.lastEducationLevel" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Ex. Terminale, Bac+2…" />
                </label>
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernier diplôme</span>
                  <input v-model="form.lastDiploma" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Ex. BAC" />
                </label>
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Moyenne</span>
                  <input v-model="form.gpa" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" placeholder="14/20" />
                </label>
              </div>
            </div>
          </div>

          <!-- Etape 2 : Documents -->
          <div v-else-if="step === 1" class="space-y-5">
            <div>
              <h2 class="font-headline text-lg font-bold text-primary">Pièce d’identité</h2>
              <p class="mt-1 text-sm text-slate-500">
                Ajoutez des photos lisibles de votre carte d’identité (JPG, PNG, WebP ou PDF, max 5 Mo).
              </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <CandidatureDocumentDropzone v-model="form.identityCardRecto" label="Carte d’identité — Recto" />
              <CandidatureDocumentDropzone v-model="form.identityCardVerso" label="Carte d’identité — Verso" />
            </div>
          </div>

          <!-- Etape 3 : Validation -->
          <div v-else class="space-y-4">
            <h2 class="font-headline text-lg font-bold text-primary">Validation</h2>
            <p class="text-sm text-slate-500">
              Vérifiez vos informations avant l’envoi. Vous pourrez suivre votre dossier dans votre espace.
            </p>

            <div class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Coordonnées</p>
              <ul class="mt-2 space-y-1.5 text-sm text-slate-700">
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>{{ form.firstName }} {{ form.lastName }}</li>
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>{{ form.email }}</li>
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>{{ form.phone }}</li>
              </ul>
            </div>

            <div class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Parcours</p>
              <ul class="mt-2 space-y-1.5 text-sm text-slate-700">
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>{{ form.lastEducationLevel }}</li>
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>{{ form.lastDiploma }}</li>
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>{{ form.gpa }}</li>
              </ul>
            </div>

            <div class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Documents</p>
              <ul class="mt-2 space-y-1.5 text-sm text-slate-700">
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>Recto téléchargé</li>
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>Verso téléchargé</li>
              </ul>
            </div>
          </div>

          <p v-if="errorMessage" class="mt-4 text-sm font-medium text-red-600">{{ errorMessage }}</p>

          <!-- Navigation -->
          <div class="mt-6 flex flex-wrap gap-3">
            <button
              v-if="step > 0"
              type="button"
              class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-slate-50"
              @click="goBack"
            >
              Retour
            </button>
            <button
              v-if="step < STEPS.length - 1"
              type="button"
              class="flex-1 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 sm:flex-none"
              @click="goNext"
            >
              Continuer
            </button>
            <button
              v-else
              type="button"
              class="flex-1 rounded-xl bg-secondary-container px-6 py-3 text-sm font-bold text-on-secondary-container shadow-sm transition hover:opacity-95 disabled:opacity-50 sm:flex-none"
              :disabled="isSubmitting"
              @click="submit"
            >
              {{ isSubmitting ? 'Envoi…' : 'Envoyer ma candidature' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Colonne recap sticky desktop -->
      <aside class="hidden lg:col-span-5 lg:block">
        <div class="sticky top-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium">
          <div class="bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
            <p class="text-xs font-bold uppercase tracking-widest text-secondary-container">Bourse sélectionnée</p>
            <h3 class="mt-2 font-headline text-xl font-extrabold leading-snug">{{ bourse.programmeTitre }}</h3>
            <p class="mt-1 text-sm text-white/70">{{ bourse.etablissement }}</p>
            <span class="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
              Bourse : {{ bourse.coveragePercent }} %
            </span>
          </div>
          <dl class="space-y-4 p-6 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-slate-500">Montant couvert</dt>
              <dd class="font-headline text-lg font-extrabold text-secondary">{{ formatFcfa(bourse.montantBourse) }} {{ bourse.devise }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <dt class="text-slate-500">Reste à payer</dt>
              <dd class="font-bold text-primary">{{ formatFcfa(bourse.resteACharge) }} {{ bourse.devise }}</dd>
            </div>
            <div v-if="bourse.fraisDossier > 0" class="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <dt class="text-slate-500">Frais dossier</dt>
              <dd class="font-semibold text-slate-700">{{ formatFcfa(bourse.fraisDossier) }} {{ bourse.devise }}</dd>
            </div>
          </dl>
          <div class="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            <p class="flex items-center gap-2 text-xs text-slate-500">
              <span class="material-symbols-outlined text-[18px] text-emerald-600">verified_user</span>
              Données sécurisées · candidature transmise au bailleur après paiement
            </p>
          </div>
        </div>
      </aside>
    </div>
  </main>

  <main v-else-if="error" class="mx-auto max-w-lg px-6 py-20 text-center">
    <p class="text-slate-600">Bourse introuvable.</p>
    <NuxtLink to="/bourses" class="mt-4 inline-block font-semibold text-primary">Retour au catalogue</NuxtLink>
  </main>
</template>
