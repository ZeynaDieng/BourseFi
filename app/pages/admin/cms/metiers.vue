<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type MetierRow = {
  id: string
  slug: string
  sortOrder: number
  published: boolean
  label: string
  shortDescription: string
  salary: string
  employability: string
  salaryNote: string
  missions: unknown
  skills: unknown
  career: unknown
  coverImageUrl: string | null
}

type CareerStep = { level: string; text: string }

const items = ref<MetierRow[]>([])
const drawerOpen = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  slug: '',
  label: '',
  shortDescription: '',
  salary: '',
  employability: 'Élevée',
  salaryNote: '',
  missionsText: '',
  skillsText: '',
  coverImageUrl: '',
  published: true,
  sortOrder: 0
})

const careerSteps = ref<CareerStep[]>([{ level: '', text: '' }])

function linesToStrings(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((s) => s.replace(/^[-•\s]+/, '').trim())
    .filter(Boolean)
}

function stringifyListFromUnknown(field: unknown): string {
  if (Array.isArray(field)) return field.map((x) => String(x)).join('\n')
  return ''
}

function loadCareerFromRow(row: MetierRow) {
  const c = row.career
  if (!Array.isArray(c) || c.length === 0) {
    careerSteps.value = [{ level: '', text: '' }]
    return
  }
  careerSteps.value = c.map((item: unknown) => {
    if (item && typeof item === 'object') {
      const o = item as { level?: unknown; text?: unknown }
      return {
        level: String(o.level ?? '').trim(),
        text: String(o.text ?? '').trim()
      }
    }
    return { level: '', text: '' }
  })
}

async function load() {
  items.value = await $fetch<MetierRow[]>('/api/admin/metier-pages')
}

await load()

function openCreate() {
  editingId.value = null
  const max = items.value.reduce((m, x) => Math.max(m, x.sortOrder), -1)
  form.value = {
    slug: '',
    label: '',
    shortDescription: '',
    salary: '',
    employability: 'Élevée',
    salaryNote: '',
    missionsText: '- Première mission\n- Deuxième mission',
    skillsText: 'Compétence 1\nCompétence 2',
    coverImageUrl: '',
    published: true,
    sortOrder: max + 1
  }
  careerSteps.value = [
    { level: 'Junior', text: 'Première étape du parcours.' },
    { level: 'Confirmé', text: 'Responsabilités élargies.' }
  ]
  drawerOpen.value = true
}

function openEdit(row: MetierRow) {
  editingId.value = row.id
  form.value = {
    slug: row.slug,
    label: row.label,
    shortDescription: row.shortDescription,
    salary: row.salary,
    employability: row.employability,
    salaryNote: row.salaryNote,
    missionsText: stringifyListFromUnknown(row.missions),
    skillsText: stringifyListFromUnknown(row.skills),
    coverImageUrl: row.coverImageUrl ?? '',
    published: row.published,
    sortOrder: row.sortOrder
  }
  loadCareerFromRow(row)
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

function buildBody() {
  const missions = linesToStrings(form.value.missionsText)
  const skills = linesToStrings(form.value.skillsText)
  const career = careerSteps.value
    .map((s) => ({
      level: s.level.trim(),
      text: s.text.trim()
    }))
    .filter((s) => s.level && s.text)

  if (!missions.length) throw new Error('Ajoutez au moins une mission (une ligne = une mission).')
  if (!skills.length) throw new Error('Ajoutez au moins une compétence.')
  if (!career.length) throw new Error('Ajoutez au moins une étape de parcours (niveau + texte).')

  return {
    slug: form.value.slug.trim(),
    label: form.value.label.trim(),
    shortDescription: form.value.shortDescription.trim(),
    salary: form.value.salary.trim(),
    employability: form.value.employability.trim(),
    salaryNote: form.value.salaryNote.trim(),
    missions,
    skills,
    career,
    coverImageUrl: form.value.coverImageUrl.trim() || null,
    published: form.value.published,
    sortOrder: Number(form.value.sortOrder) || 0
  }
}

async function submitDrawer() {
  try {
    const body = buildBody()
    if (editingId.value) {
      await $fetch(`/api/admin/metier-pages/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/metier-pages', { method: 'POST', body })
    }
    closeDrawer()
    await load()
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : getAdminErrorMessage(e))
  }
}

async function remove(row: MetierRow) {
  if (!confirm(`Supprimer la fiche « ${row.label} » ?`)) return
  try {
    await $fetch(`/api/admin/metier-pages/${row.id}`, { method: 'DELETE' })
    await load()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

const drawerTitle = computed(() => (editingId.value ? 'Modifier la fiche métier' : 'Nouvelle fiche métier'))
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="admin-page-title">Fiches métiers</h2>
          <p class="admin-page-desc !mb-0">
            Contenus « guide métier » du site. Pour le filtre formations, gardez les slugs alignés avec le fichier technique
            <span class="font-mono text-xs">metier-tracks.ts</span>.
          </p>
        </div>
        <button type="button" class="admin-btn-primary" @click="openCreate">+ Ajouter</button>
      </div>

      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Slug</th>
              <th class="admin-th">Libellé</th>
              <th class="admin-th text-center">Publié</th>
              <th class="admin-th text-center">Ordre</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id" class="hover:bg-slate-50/80">
              <td class="admin-td admin-td-mono">{{ row.slug }}</td>
              <td class="admin-td font-semibold text-primary">{{ row.label }}</td>
              <td class="admin-td text-center">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="row.published ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'"
                >
                  {{ row.published ? 'oui' : 'non' }}
                </span>
              </td>
              <td class="admin-td text-center font-mono text-xs">{{ row.sortOrder }}</td>
              <td class="admin-td text-right whitespace-nowrap">
                <button type="button" class="admin-btn-ghost mr-3" @click="openEdit(row)">Modifier</button>
                <button type="button" class="text-xs font-semibold text-red-600 hover:underline" @click="remove(row)">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminDrawer v-model:open="drawerOpen" :title="drawerTitle" size="2xl" @close="closeDrawer">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="admin-label">
            Slug
            <input v-model="form.slug" class="admin-input font-mono text-xs" />
          </label>
          <label class="admin-label">
            Ordre
            <input v-model.number="form.sortOrder" type="number" class="admin-input" />
          </label>
          <label class="admin-label flex items-center gap-2 sm:col-span-2 !normal-case">
            <input v-model="form.published" type="checkbox" class="mt-0 h-4 w-4 rounded border-slate-300" />
            <span class="text-sm font-normal text-slate-800">Publié sur le site</span>
          </label>
          <label class="admin-label sm:col-span-2">
            Libellé affiché
            <input v-model="form.label" class="admin-input" />
          </label>
          <label class="admin-label sm:col-span-2">
            Description courte
            <textarea v-model="form.shortDescription" rows="3" class="admin-input min-h-[72px]" />
          </label>
          <label class="admin-label">
            Rémunération (texte libre)
            <input v-model="form.salary" class="admin-input" />
          </label>
          <label class="admin-label">
            Employabilité
            <input v-model="form.employability" class="admin-input" />
          </label>
          <label class="admin-label sm:col-span-2">
            Note complémentaire salaire
            <input v-model="form.salaryNote" class="admin-input" />
          </label>
          <label class="admin-label sm:col-span-2">
            URL image de couverture
            <input v-model="form.coverImageUrl" type="url" class="admin-input" placeholder="https://…" />
          </label>
          <label class="admin-label sm:col-span-2">
            Missions (une par ligne)
            <textarea v-model="form.missionsText" rows="5" class="admin-input min-h-[100px]" />
          </label>
          <label class="admin-label sm:col-span-2">
            Compétences (une par ligne)
            <textarea v-model="form.skillsText" rows="4" class="admin-input min-h-[88px]" />
          </label>
        </div>

        <p class="mt-4 text-sm font-semibold text-primary">Parcours professionnel</p>
        <p class="mb-2 text-xs text-slate-500">Ajoutez des étapes du plus junior au plus senior.</p>
        <div class="space-y-3">
          <div
            v-for="(step, i) in careerSteps"
            :key="i"
            class="rounded-lg border border-slate-100 bg-slate-50/90 p-3"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-bold uppercase text-slate-400">Étape {{ i + 1 }}</span>
              <button
                type="button"
                class="text-xs font-semibold text-red-600 hover:underline"
                @click="careerSteps.splice(i, 1)"
              >
                Retirer
              </button>
            </div>
            <label class="admin-label">Nom du niveau</label>
            <input v-model="step.level" class="admin-input mb-2" placeholder="Ex. Junior" />
            <label class="admin-label">Description</label>
            <textarea v-model="step.text" rows="2" class="admin-input min-h-[52px]" placeholder="Rôle et missions…" />
          </div>
          <button type="button" class="admin-btn-secondary text-xs" @click="careerSteps.push({ level: '', text: '' })">
            + Ajouter une étape
          </button>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-btn-secondary" @click="closeDrawer">Annuler</button>
            <button type="button" class="admin-btn-primary" @click="submitDrawer">Enregistrer</button>
          </div>
        </template>
      </AdminDrawer>
    </main>
  </div>
</template>
