<script setup lang="ts">
/**
 * Props `programme` alignés sur GET /api/programmes (sérialisé serveur).
 */
type ProgrammeDto = {
  id: string
  slug: string
  titre: string
  etablissement: string
  partnerName: string
  ville: string
  fraisDossier: number
  devise: string
  niveau?: string
  eligibilite?: string | null
}

const props = defineProps<{
  programme: ProgrammeDto | null
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted', payload: { candidatureId: string; requiresPayment: boolean }): void
}>()

const { data: me } = await useFetch('/api/auth/me')

const LEVEL_OPTIONS = ['Licence', 'Master', 'MBA', 'BTS', 'Doctorat', 'Autre'] as const

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
  identityCardVerso: ''
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

function applyDefaultsFromProgramme() {
  const p = props.programme
  if (!p) return
  form.institution = p.etablissement
  form.field = p.titre
  form.level = niveauToSelect(p.niveau)
}

function splitNameFromUser(full: string) {
  const t = full.trim()
  if (!t) {
    form.firstName = ''
    form.lastName = ''
    return
  }
  const parts = t.split(/\s+/)
  form.firstName = parts[0] ?? ''
  form.lastName = parts.slice(1).join(' ') || parts[0] || ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      step.value = 0
      errorMessage.value = ''
      splitNameFromUser(me.value?.user?.name ?? '')
      form.email = me.value?.user?.email ?? ''
      form.phone = ''
      form.address = ''
      form.lastEducationLevel = ''
      form.lastDiploma = ''
      form.graduationDate = ''
      form.gpa = ''
      form.identityCardRecto = ''
      form.identityCardVerso = ''
      applyDefaultsFromProgramme()
    }
  }
)

watch(
  () => props.programme?.id,
  () => {
    if (props.open) applyDefaultsFromProgramme()
  }
)

function closeModal() {
  emit('close')
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      if (typeof r.result === 'string') resolve(r.result)
      else reject(new Error('Lecture fichier'))
    }
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

async function onIdCard(e: Event, side: 'identityCardRecto' | 'identityCardVerso') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
    errorMessage.value = 'Utilisez une photo JPG, PNG ou WebP pour la CNI.'
    input.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Chaque photo doit faire au plus 5 Mo.'
    input.value = ''
    return
  }
  try {
    form[side] = await readFileAsDataUrl(file)
    errorMessage.value = ''
  } catch {
    errorMessage.value = 'Lecture du fichier impossible.'
  }
}

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
  }
  if (s === 1) {
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
  if (s === 2) {
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
  step.value++
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
  if (!validateStep(2)) {
    step.value = 2
    return
  }
  if (!me.value?.user) {
    errorMessage.value = 'Connectez-vous pour postuler.'
    return
  }
  if (!props.programme?.id) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    const res = await $fetch<{ ok: boolean; candidature: { id: string; status: string; fraisDossier: number } }>(
      '/api/candidatures',
      {
        method: 'POST',
        body: {
          programmeId: props.programme.id,
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
          identityCardVerso: form.identityCardVerso
        }
      }
    )
    const requiresPayment =
      res.candidature.status === 'EN_ATTENTE_PAIEMENT' && res.candidature.fraisDossier > 0
    emit('submitted', { candidatureId: res.candidature.id, requiresPayment })
    closeModal()
  } catch {
    errorMessage.value = "Impossible d'enregistrer le dossier. Vérifiez les champs et les photos, puis réessayez."
  } finally {
    isSubmitting.value = false
  }
}

const stepTitles = ['Coordonnées', 'Parcours scolaire', 'Pièce d’identité', 'Récapitulatif']
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && programme"
      class="fixed inset-0 z-[100] flex items-end justify-center bg-primary/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidature-modal-title"
      @click.self="closeModal"
    >
      <div
        class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <header class="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-secondary">Demande de bourse</p>
            <h2 id="candidature-modal-title" class="font-headline text-xl font-extrabold text-primary">
              Formulaire de candidature
            </h2>
            <p class="text-sm text-slate-500">{{ programme.titre }}</p>
            <p class="mt-2 text-xs font-medium text-primary">
              Étape {{ step + 1 }}/4 — {{ stepTitles[step] }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
            @click="closeModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <div class="space-y-4 px-6 py-4 text-sm text-slate-600">
          <p>
            Bailleur :
            <strong class="text-primary">{{ programme.partnerName }}</strong>
            — après validation, le document officiel est émis par cette structure.
          </p>
          <div v-if="programme.eligibilite" class="rounded-lg bg-slate-50 p-3 text-xs">
            {{ programme.eligibilite }}
          </div>
          <p v-if="programme.fraisDossier > 0" class="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
            Frais de dossier :
            <strong>{{ programme.fraisDossier.toLocaleString('fr-FR') }} {{ programme.devise }}</strong>
            (paiement après envoi du dossier, si requis).
          </p>

          <!-- Étape 0 : identité & contact -->
          <div v-if="step === 0" class="space-y-3">
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block sm:col-span-1">
                <span class="text-xs font-semibold text-primary">Prénom</span>
                <input
                  v-model="form.firstName"
                  autocomplete="given-name"
                  class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                />
              </label>
              <label class="block sm:col-span-1">
                <span class="text-xs font-semibold text-primary">Nom</span>
                <input
                  v-model="form.lastName"
                  autocomplete="family-name"
                  class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                />
              </label>
            </div>
            <label class="block">
              <span class="text-xs font-semibold text-primary">Adresse e-mail</span>
              <input
                v-model="form.email"
                type="email"
                autocomplete="email"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
              />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-primary">Numéro de téléphone</span>
              <input
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                placeholder="Ex. +221 77 …"
              />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-primary">Adresse postale complète</span>
              <textarea
                v-model="form.address"
                rows="3"
                autocomplete="street-address"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                placeholder="Rue, quartier, ville, pays…"
              />
            </label>
          </div>

          <!-- Étape 1 : formation visée + parcours -->
          <div v-if="step === 1" class="space-y-3">
            <div class="rounded-xl border border-secondary-container/30 bg-secondary-container/10 p-4 text-xs text-slate-800">
              <p class="font-bold text-primary">Formation demandée (catalogue)</p>
              <p class="mt-1"><strong>{{ programme.etablissement }}</strong> · {{ programme.ville }}</p>
              <p class="mt-0.5 font-medium text-primary">{{ programme.titre }}</p>
              <p v-if="programme.niveau" class="mt-1 text-slate-600">
                Niveau indicatif du programme : {{ programme.niveau }}
              </p>
            </div>
            <p class="text-xs text-slate-500">
              Les champs ci-dessous décrivent <strong>votre parcours</strong>. L’établissement et la filière sont
              pré-remplis à partir de la formation choisie ; modifiez si votre situation est différente.
            </p>
            <label class="block">
              <span class="text-xs font-semibold text-primary">École / établissement de référence</span>
              <input
                v-model="form.institution"
                class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-slate-800"
              />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-primary">Formation / filière suivie ou visée</span>
              <input
                v-model="form.field"
                class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-slate-800"
              />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-primary">Niveau poursuivi</span>
              <select v-model="form.level" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
                <option v-for="opt in LEVEL_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-primary">Dernier niveau d’études atteint</span>
              <input
                v-model="form.lastEducationLevel"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                placeholder="Ex. Terminale, Bac+2, Licence 3…"
              />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-primary">Dernier diplôme (ou en cours)</span>
              <input
                v-model="form.lastDiploma"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                placeholder="Ex. Baccalauréat série S, BTS Commerce…"
              />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-primary">Année d’obtention ou prévue (optionnel)</span>
              <input
                v-model="form.graduationDate"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                placeholder="Ex. 2025"
              />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-primary">Dernière moyenne ou note</span>
              <input
                v-model="form.gpa"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                placeholder="Ex. 14,5/20 ou B"
              />
            </label>
          </div>

          <!-- Étape 2 : CNI -->
          <div v-if="step === 2" class="space-y-4">
            <p class="text-xs text-slate-600">
              Téléchargez des photos <strong>lisibles</strong> de votre carte d’identité (JPEG, PNG ou WebP, max 5 Mo chacune).
            </p>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-slate-200 p-3">
                <label class="block text-xs font-semibold text-primary">Recto</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="mt-2 block w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  @change="onIdCard($event, 'identityCardRecto')"
                />
                <img
                  v-if="form.identityCardRecto"
                  :src="form.identityCardRecto"
                  alt="Aperçu recto CNI"
                  class="mt-2 h-28 w-full rounded-lg border object-contain"
                />
              </div>
              <div class="rounded-xl border border-slate-200 p-3">
                <label class="block text-xs font-semibold text-primary">Verso</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="mt-2 block w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  @change="onIdCard($event, 'identityCardVerso')"
                />
                <img
                  v-if="form.identityCardVerso"
                  :src="form.identityCardVerso"
                  alt="Aperçu verso CNI"
                  class="mt-2 h-28 w-full rounded-lg border object-contain"
                />
              </div>
            </div>
          </div>

          <!-- Étape 3 : récap -->
          <div v-if="step === 3" class="space-y-3 text-slate-700">
            <p class="text-sm">Vérifiez vos informations avant envoi. Vous pourrez suivre le dossier dans votre espace.</p>
            <ul class="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
              <li>
                <strong>{{ form.firstName }} {{ form.lastName }}</strong>
                · {{ form.email }} · {{ form.phone }}
              </li>
              <li class="text-slate-600">{{ form.address }}</li>
              <li class="font-semibold text-primary">
                {{ programme.etablissement }} — {{ programme.titre }}
              </li>
              <li>
                Parcours : {{ form.institution }} — {{ form.field }} — niveau {{ form.level }}
              </li>
              <li>
                Dernier niveau : {{ form.lastEducationLevel }} · Diplôme : {{ form.lastDiploma }} · Moyenne :
                {{ form.gpa }}
                <template v-if="form.graduationDate"> · Année : {{ form.graduationDate }}</template>
              </li>
              <li v-if="form.identityCardRecto && form.identityCardVerso" class="text-emerald-800">
                Pièce d’identité : recto et verso joints.
              </li>
            </ul>
          </div>

          <p v-if="errorMessage" class="text-sm font-medium text-red-600">{{ errorMessage }}</p>
        </div>

        <footer class="sticky bottom-0 flex flex-wrap gap-2 border-t border-slate-100 bg-white px-6 py-4">
          <button
            v-if="step > 0"
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 font-semibold"
            @click="goBack"
          >
            Retour
          </button>
          <button
            v-if="step < 3"
            type="button"
            class="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
            @click="goNext"
          >
            Continuer
          </button>
          <button
            v-if="step === 3"
            type="button"
            class="rounded-lg bg-secondary-container px-4 py-2 font-semibold text-on-secondary-container disabled:opacity-50"
            :disabled="isSubmitting"
            @click="submit"
          >
            {{ isSubmitting ? 'Envoi…' : 'Envoyer ma candidature' }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
