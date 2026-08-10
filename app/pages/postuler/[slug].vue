<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import { STUDENT_HOME } from '~/utils/routes'
import type { BourseDto } from '~/types/bourse'

const route = useRoute()
const router = useRouter()

const { data: bourse, error } = await useFetch<BourseDto>(
  () => `/api/bourses/${route.params.slug}`,
)

const { data: me, refresh: refreshMe } = await useFetch('/api/auth/me')

const isLoggedIn = computed(() => Boolean(me.value?.user))

const step = ref(0)
const isSubmitting = ref(false)
const errorMessage = ref('')
const authMode = ref<'register' | 'login'>('register')
const authLoading = ref(false)
const authJustCompleted = ref(false)

const registerForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  acceptTerms: false,
  acceptMarketing: false,
})

const loginForm = reactive({
  email: '',
  password: '',
})

const educationLevels = [
  'Troisième (3ème)',
  'Seconde',
  'Première',
  'Terminale',
  'Bac+1',
  'Bac+2 (BTS, DTS, DUT...)',
  'Bac+3 (Licence, Bachelor...)',
  'Bac+4 / Bac+5 (Master, Ingénieur...)',
  'Autre',
]

const diplomaOptions = [
  'BFEM',
  'BAC',
  'BTS',
  'DTS',
  'Licence',
  'Master',
  'Aucun diplôme',
  'Autre',
]

const hasIdentityDocs = computed(() =>
  Boolean(me.value?.user?.identityCardRectoUrl && me.value?.user?.identityCardVersoUrl),
)

const hasEducationDocs = computed(() =>
  Boolean(me.value?.user?.bfemAttestationUrl || me.value?.user?.bacTranscriptUrl),
)

const applicationSteps = computed(() =>
  hasIdentityDocs.value && hasEducationDocs.value ? ['Informations', 'Validation'] : ['Informations', 'Documents', 'Validation'],
)

const STEPS = computed(() =>
  isLoggedIn.value ? applicationSteps.value : ['Compte', ...applicationSteps.value],
)

const currentStepName = computed(() => STEPS.value[step.value] ?? '')

watch(STEPS, (steps) => {
  if (step.value >= steps.length) step.value = Math.max(0, steps.length - 1)
})

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
  bfemAttestation: '',
  bacTranscript: '',
})

const draftKey = computed(() => `boursefi:postuler:${String(route.params.slug)}`)

function saveDraft() {
  if (import.meta.server) return
  try {
    const { identityCardRecto, identityCardVerso, bfemAttestation, bacTranscript, ...rest } = form
    sessionStorage.setItem(
      draftKey.value,
      JSON.stringify({
        ...rest,
        hasRecto: Boolean(identityCardRecto),
        hasVerso: Boolean(identityCardVerso),
        hasBfem: Boolean(bfemAttestation),
        hasBac: Boolean(bacTranscript),
      }),
    )
  } catch {
    // quota ou mode privé
  }
}

function restoreDraft() {
  if (import.meta.server) return
  try {
    const raw = sessionStorage.getItem(draftKey.value)
    if (!raw) return
    const d = JSON.parse(raw) as Partial<typeof form>
    for (const key of Object.keys(form) as (keyof typeof form)[]) {
      if (key === 'identityCardRecto' || key === 'identityCardVerso' || key === 'bfemAttestation' || key === 'bacTranscript') continue
      const value = d[key]
      if (typeof value === 'string' && value && !form[key]) form[key] = value
    }
  } catch {
    // ignore
  }
}

function clearDraft() {
  if (import.meta.server) return
  try {
    sessionStorage.removeItem(draftKey.value)
  } catch {
    // ignore
  }
}

watch(
  () => ({ ...form }),
  () => saveDraft(),
  { deep: true },
)

onMounted(() => {
  restoreDraft()
  if (isLoggedIn.value) {
    step.value = 0
    if (sessionStorage.getItem(draftKey.value)) {
      authJustCompleted.value = true
    }
  }
})

async function afterAuthSuccess() {
  await refreshMe()
  await nextTick()
  step.value = 0
  authJustCompleted.value = true
  errorMessage.value = ''
  restoreDraft()
}

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
  const u = me.value?.user
  if (u) {
    if (!form.firstName) form.firstName = u.firstName || ''
    if (!form.lastName) form.lastName = u.lastName || ''
    if (!form.firstName && !form.lastName) splitNameFromUser(u.name ?? '')
    form.email ||= u.email ?? ''
    form.phone ||= u.phone ?? ''
    form.address ||= u.address ?? ''
  }
})

function validateStep(s: number): boolean {
  errorMessage.value = ''
  const name = STEPS.value[s]
  if (name === 'Compte') {
    errorMessage.value = 'Créez un compte ou connectez-vous pour continuer.'
    return false
  }
  if (name === 'Informations') {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      errorMessage.value = 'Votre identité est manquante. Complétez votre profil dans « Mon compte ».'
      return false
    }
    if (!form.phone.trim() || form.phone.replace(/\s/g, '').length < 8) {
      errorMessage.value = 'Indiquez un numéro de téléphone valide.'
      return false
    }
    if (form.address.trim().length < 3) {
      errorMessage.value = 'Indiquez votre adresse (ville, quartier...).'
      return false
    }
    if (!form.lastEducationLevel.trim()) {
      errorMessage.value = 'Sélectionnez votre dernier niveau d’études.'
      return false
    }
    if (!form.lastDiploma.trim()) {
      errorMessage.value = 'Sélectionnez votre dernier diplôme.'
      return false
    }
  }
  if (name === 'Documents') {
    if (!form.identityCardRecto) {
      errorMessage.value = 'Ajoutez la photo recto de votre carte d’identité.'
      return false
    }
    if (!form.identityCardVerso) {
      errorMessage.value = 'Ajoutez la photo verso de votre carte d’identité.'
      return false
    }
    if (form.lastDiploma === 'BFEM') {
      if (!form.bfemAttestation) {
        errorMessage.value = "Ajoutez l'attestation de diplôme BFEM."
        return false
      }
    } else {
      if (!form.bacTranscript && !form.bfemAttestation) {
        errorMessage.value = 'Ajoutez le relevé du Bac ou votre dernier diplôme.'
        return false
      }
    }
  }
  return true
}

function goNext() {
  if (currentStepName.value === 'Compte') return
  authJustCompleted.value = false
  if (!validateStep(step.value)) return
  if (step.value < STEPS.value.length - 1) step.value++
}

function goBack() {
  errorMessage.value = ''
  if (step.value > 0) {
    step.value--
    return
  }
  if (!isLoggedIn.value && currentStepName.value === 'Compte') {
    router.push(`/bourses/${route.params.slug}`)
  }
}

async function submitRegister() {
  errorMessage.value = ''
  authLoading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        email: registerForm.email.trim(),
        phone: registerForm.phone.trim(),
        password: registerForm.password,
        acceptTerms: registerForm.acceptTerms,
        acceptMarketing: registerForm.acceptMarketing,
      },
    })
    await afterAuthSuccess()
  } catch (e: unknown) {
    const msg =
      e && typeof e === 'object' && 'data' in e
        ? (e as { data?: { statusMessage?: string } }).data?.statusMessage
        : null
    errorMessage.value = msg || 'Inscription impossible. Vérifiez vos informations.'
  } finally {
    authLoading.value = false
  }
}

async function submitLogin() {
  errorMessage.value = ''
  authLoading.value = true

  const { addCsrfToHeaders } = useCsrf()

  try {
    const res = await $fetch<{ user: { role: string } }>('/api/auth/login', {
      method: 'POST',
      body: {
        email: loginForm.email.trim(),
        password: loginForm.password,
      },
      headers: addCsrfToHeaders(),
    })
    if (res.user.role !== 'STUDENT') {
      errorMessage.value = 'Ce compte ne peut pas déposer de candidature étudiante.'
      await $fetch('/api/auth/logout', { method: 'POST' })
      return
    }
    await afterAuthSuccess()
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
      'Email ou mot de passe incorrect.'
  } finally {
    authLoading.value = false
  }
}

async function submit() {
  if (!isLoggedIn.value) {
    errorMessage.value = 'Connectez-vous pour envoyer votre candidature.'
    step.value = 0
    return
  }
  const infoIdx = STEPS.value.indexOf('Informations')
  if (!validateStep(infoIdx)) {
    step.value = infoIdx
    return
  }
  if (!hasIdentityDocs.value && !hasEducationDocs.value) {
    const docIdx = STEPS.value.indexOf('Documents')
    if (docIdx !== -1 && !validateStep(docIdx)) {
      step.value = docIdx
      return
    }
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
        phone: form.phone.trim(),
        address: form.address.trim(),
        institution: form.institution.trim(),
        field: form.field.trim(),
        level: form.level,
        lastEducationLevel: form.lastEducationLevel.trim(),
        lastDiploma: form.lastDiploma.trim(),
        graduationDate: form.graduationDate.trim(),
        gpa: '',
        ...(hasIdentityDocs.value && hasEducationDocs.value
          ? {}
          : { identityCardRecto: form.identityCardRecto, identityCardVerso: form.identityCardVerso, bfemAttestation: form.bfemAttestation, bacTranscript: form.bacTranscript }),
      },
    })
    const requiresPayment =
      res.candidature.status === 'EN_ATTENTE_PAIEMENT' && res.candidature.fraisDossier > 0
    clearDraft()
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

    <div
      v-if="authJustCompleted && isLoggedIn"
      class="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
    >
      <span class="material-symbols-outlined mt-0.5 text-[20px] text-emerald-600">check_circle</span>
      <div>
        <p class="font-semibold">Compte prêt — vous pouvez continuer votre candidature.</p>
        <p class="mt-0.5 text-emerald-800/80">Vos informations sont conservées sur cette page.</p>
      </div>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-12">
      <!-- Colonne formulaire -->
      <section class="lg:col-span-7">
        <!-- Recap repliée mobile -->
        <details class="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-premium lg:hidden">
          <summary class="flex cursor-pointer items-center justify-between text-sm font-semibold text-primary">
            Résumé de la bourse
          </summary>
          <dl class="mt-3 space-y-2 text-sm">
            <div v-if="bourse.fraisDossier > 0" class="flex justify-between gap-3">
              <dt class="text-slate-500">Frais dossier</dt>
              <dd class="font-semibold">{{ formatFcfa(bourse.fraisDossier) }} {{ bourse.devise }}</dd>
            </div>
          </dl>
        </details>

        <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium sm:p-6">
          <!-- Étape 0 : Compte (visiteurs non connectés) -->
          <div v-if="currentStepName === 'Compte'" class="space-y-5">
            <div>
              <h2 class="font-headline text-lg font-bold text-primary">Votre espace candidat</h2>
              <p class="mt-1 text-sm text-slate-500">
                Créez votre espace pour enregistrer votre dossier et recevoir votre attestation par email.
                Environ 30 secondes — vos données sont sécurisées.
              </p>
            </div>

            <div class="flex gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                class="flex-1 rounded-lg py-2.5 text-sm font-semibold transition"
                :class="authMode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'"
                @click="authMode = 'register'"
              >
                Créer un compte
              </button>
              <button
                type="button"
                class="flex-1 rounded-lg py-2.5 text-sm font-semibold transition"
                :class="authMode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'"
                @click="authMode = 'login'"
              >
                J'ai déjà un compte
              </button>
            </div>

            <form v-if="authMode === 'register'" class="space-y-4" @submit.prevent="submitRegister">
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prénom</span>
                  <input v-model="registerForm.firstName" required class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
                </label>
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nom</span>
                  <input v-model="registerForm.lastName" required class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
                </label>
              </div>
              <label class="block">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span>
                <input v-model="registerForm.email" type="email" required class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
              </label>
              <label class="block">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Téléphone</span>
                <input v-model="registerForm.phone" type="tel" required class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Ex: 77 123 45 67" />
              </label>
              <label class="block">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mot de passe</span>
                <input v-model="registerForm.password" type="password" minlength="4" required class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" placeholder="4 caractères minimum" />
              </label>
              <div class="space-y-3">
                <label class="flex items-start gap-3">
                  <input
                    v-model="registerForm.acceptTerms"
                    type="checkbox"
                    required
                    class="mt-1 rounded border-slate-300"
                  />
                  <span class="text-sm text-slate-600">
                    J'accepte les
                    <NuxtLink to="/legal/terms" class="text-primary hover:underline">Conditions Générales d'Utilisation</NuxtLink>
                    et la
                    <NuxtLink to="/legal/privacy" class="text-primary hover:underline">Politique de confidentialité</NuxtLink>.
                  </span>
                </label>
                <label class="flex items-start gap-3">
                  <input
                    v-model="registerForm.acceptMarketing"
                    type="checkbox"
                    class="mt-1 rounded border-slate-300"
                  />
                  <span class="text-sm text-slate-600">
                    J'accepte de recevoir les actualités et offres de BourseFi.
                  </span>
                </label>
              </div>
              <button
                type="submit"
                class="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                :disabled="authLoading"
              >
                {{ authLoading ? 'Création…' : 'Créer mon espace et continuer' }}
              </button>
            </form>

            <form v-else class="space-y-4" @submit.prevent="submitLogin">
              <label class="block">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span>
                <input v-model="loginForm.email" type="email" required class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
              </label>
              <label class="block">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mot de passe</span>
                <input v-model="loginForm.password" type="password" required class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" />
              </label>
              <button
                type="submit"
                class="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                :disabled="authLoading"
              >
                {{ authLoading ? 'Connexion…' : 'Se connecter et continuer' }}
              </button>
            </form>
          </div>

          <!-- Étape Informations -->
          <div v-else-if="currentStepName === 'Informations'" class="space-y-5">
            <div>
              <div class="flex items-center justify-between gap-2">
                <h2 class="font-headline text-lg font-bold text-primary">Informations personnelles</h2>
                <NuxtLink to="/etudiant/compte" class="text-xs font-semibold text-primary underline-offset-2 hover:underline">
                  Modifier mon profil
                </NuxtLink>
              </div>
              <p class="mt-1 text-xs text-slate-400">
                Votre identité provient de votre compte : vous ne pouvez postuler que pour vous-même.
              </p>
              <div class="mt-3 grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prénom</span>
                  <input v-model="form.firstName" disabled class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm text-slate-500" />
                </label>
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nom</span>
                  <input v-model="form.lastName" disabled class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm text-slate-500" />
                </label>
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span>
                  <input v-model="form.email" type="email" disabled class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-100 px-3 py-2.5 text-sm text-slate-500" />
                </label>
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Téléphone</span>
                  <input v-model="form.phone" type="tel" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" placeholder="+221 ..." />
                </label>
                <label class="block sm:col-span-2">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adresse (ville, quartier)</span>
                  <input v-model="form.address" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Ex: Dakar, Sicap Liberté 4" />
                </label>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-5">
              <h2 class="font-headline text-lg font-bold text-primary">Parcours scolaire</h2>
              <div class="mt-3 grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernier niveau d’études</span>
                  <select v-model="form.lastEducationLevel" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none">
                    <option value="" disabled>Sélectionnez votre niveau</option>
                    <option v-for="lvl in educationLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
                  </select>
                </label>
                <label class="block">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernier diplôme</span>
                  <select v-model="form.lastDiploma" class="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none">
                    <option value="" disabled>Sélectionnez votre diplôme</option>
                    <option v-for="d in diplomaOptions" :key="d" :value="d">{{ d }}</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <!-- Étape 2 : Documents -->
          <div v-else-if="currentStepName === 'Documents'" class="space-y-5">
            <div>
              <h2 class="font-headline text-lg font-bold text-primary">Pièces d’identité</h2>
              <p class="mt-1 text-sm text-slate-500">
                Ajoutez des photos lisibles de votre carte d’identité (JPG, PNG, WebP ou PDF, max 5 Mo).
                Elle sera enregistrée sur votre compte et réutilisée pour vos prochaines candidatures.
              </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <CandidatureDocumentDropzone v-model="form.identityCardRecto" label="Carte d’identité — Recto" />
              <CandidatureDocumentDropzone v-model="form.identityCardVerso" label="Carte d’identité — Verso" />
            </div>

            <div class="border-t border-slate-100 pt-5">
              <h2 class="font-headline text-lg font-bold text-primary">Documents scolaires</h2>
              <p class="mt-1 text-sm text-slate-500">
                Ajoutez vos documents scolaires (JPG, PNG, WebP ou PDF, max 5 Mo).
              </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <CandidatureDocumentDropzone
                v-if="form.lastDiploma === 'BFEM'"
                v-model="form.bfemAttestation"
                label="Attestation de diplôme BFEM"
              />
              <CandidatureDocumentDropzone
                v-else
                v-model="form.bacTranscript"
                label="Relevé de notes du BAC / Dernier diplôme"
              />
            </div>
          </div>

          <!-- Étape 3 : Validation -->
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
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>Niveau d'études : {{ form.lastEducationLevel }}</li>
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>Dernier diplôme : {{ form.lastDiploma }}</li>
              </ul>
            </div>

            <div class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Carte d’identité & Documents</p>
              <ul v-if="hasIdentityDocs" class="mt-2 space-y-1.5 text-sm text-slate-700">
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>Réutilisés depuis votre compte</li>
              </ul>
              <ul v-else class="mt-2 space-y-1.5 text-sm text-slate-700">
                <li class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>Recto & Verso téléchargés</li>
                <li v-if="form.lastDiploma === 'BFEM'" class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>Attestation BFEM téléchargée</li>
                <li v-else class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>Relevé BAC / Diplôme téléchargé</li>
              </ul>
            </div>
          </div>

          <div v-if="errorMessage" class="error-alert-container mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-sm text-red-800 shadow-sm backdrop-blur-sm transition duration-300">
            <span class="material-symbols-outlined shrink-0 text-red-600 select-none text-[18px]">gpp_bad</span>
            <span class="font-medium leading-normal text-left">{{ errorMessage }}</span>
          </div>

          <!-- Navigation -->
          <div v-if="currentStepName !== 'Compte'" class="mt-6 flex flex-wrap gap-3">
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
          <div v-else class="mt-6">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-slate-50"
              @click="goBack"
            >
              Retour à la bourse
            </button>
          </div>
        </div>
      </section>

      <!-- Colonne récap sticky desktop -->
      <aside class="hidden lg:col-span-5 lg:block">
        <div class="sticky top-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium">
          <div class="bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
            <p class="text-xs font-bold uppercase tracking-widest text-secondary-container">Bourse sélectionnée</p>
            <h3 class="mt-2 font-headline text-xl font-extrabold leading-snug">{{ bourse.programmeTitre }}</h3>
            <p class="mt-1 text-sm text-white/70">{{ bourse.etablissement }}</p>
            <span class="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
              {{ bourse.coveragePercent }} % de prise en charge
            </span>
          </div>
          <dl class="space-y-4 p-6 text-sm">
            <div v-if="bourse.fraisDossier > 0" class="flex items-center justify-between gap-3">
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
