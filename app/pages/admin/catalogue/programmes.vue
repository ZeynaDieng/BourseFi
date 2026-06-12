<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type PartnerOpt = { id: string; slug: string; name: string }
type EcoleOpt = { id: string; slug: string; nom: string }

type ProgrammeRow = {
  id: string
  slug: string
  titre: string
  ville: string
  duree: string
  fraisDossier: number
  fraisScolarite: number
  devise: string
  niveau: string
  placement: string | null
  description: string
  eligibilite: string | null
  brochureUrl: string | null
  perspectives: string | null
  etablissementId: string
  partnerId: string
  etablissement: { id: string; slug: string; nom: string }
  partner: { id: string; slug: string; name: string }
  candidaturesCount: number
}

const programmes = ref<ProgrammeRow[]>([])
const partners = ref<PartnerOpt[]>([])
const ecoles = ref<EcoleOpt[]>([])
const drawerOpen = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = () => ({
  slug: '',
  etablissementId: '',
  partnerId: '',
  titre: '',
  ville: '',
  duree: '',
  fraisDossier: 0,
  fraisScolarite: 0,
  devise: 'FCFA',
  niveau: '',
  placement: '',
  description: '',
  eligibilite: '',
  brochureUrl: '',
  perspectives: ''
})

const form = ref(emptyForm())

type EtabAdminRow = { id: string; slug: string; nom: string; ville: string; _count: { programmes: number } }

async function loadAll() {
  const [p, partRows, etabRows] = await Promise.all([
    $fetch<ProgrammeRow[]>('/api/admin/programmes'),
    $fetch<Array<{ id: string; slug: string; name: string }>>('/api/admin/partners'),
    $fetch<EtabAdminRow[]>('/api/admin/etablissements')
  ])
  const etab = etabRows.map((r) => ({ id: r.id, slug: r.slug, nom: r.nom }))
  programmes.value = p
  partners.value = partRows.map((x) => ({ id: x.id, slug: x.slug, name: x.name }))
  ecoles.value = etab
}

await loadAll()

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  if (ecoles.value.length) form.value.etablissementId = ecoles.value[0].id
  if (partners.value.length) form.value.partnerId = partners.value[0].id
  drawerOpen.value = true
}

function openEdit(row: ProgrammeRow) {
  editingId.value = row.id
  form.value = {
    slug: row.slug,
    etablissementId: row.etablissementId,
    partnerId: row.partnerId,
    titre: row.titre,
    ville: row.ville,
    duree: row.duree,
    fraisDossier: row.fraisDossier,
    fraisScolarite: row.fraisScolarite,
    devise: row.devise,
    niveau: row.niveau,
    placement: row.placement ?? '',
    description: row.description,
    eligibilite: row.eligibilite ?? '',
    brochureUrl: row.brochureUrl ?? '',
    perspectives: row.perspectives ?? ''
  }
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

async function submitDrawer() {
  const body = {
    slug: form.value.slug,
    etablissementId: form.value.etablissementId,
    partnerId: form.value.partnerId,
    titre: form.value.titre,
    ville: form.value.ville,
    duree: form.value.duree,
    fraisDossier: Number(form.value.fraisDossier),
    fraisScolarite: Number(form.value.fraisScolarite),
    devise: form.value.devise,
    niveau: form.value.niveau,
    placement: form.value.placement || null,
    description: form.value.description,
    eligibilite: form.value.eligibilite || null,
    brochureUrl: form.value.brochureUrl || null,
    perspectives: form.value.perspectives || null
  }
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/programmes/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/programmes', { method: 'POST', body })
    }
    closeDrawer()
    await loadAll()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function remove(row: ProgrammeRow) {
  if (!confirm(`Supprimer le programme ${row.titre}  ?`)) return
  try {
    await $fetch(`/api/admin/programmes/${row.id}`, { method: 'DELETE' })
    await loadAll()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Suppression impossible.'))
  }
}

const drawerTitle = computed(() => (editingId.value ? 'Modifier le programme' : 'Nouveau programme'))
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="admin-page-title">Programmes</h2>
          <p class="admin-page-desc !mb-0">
            Formations du marketplace. Suppression impossible si des candidatures sont encore liées.
          </p>
        </div>
        <button type="button" class="admin-btn-primary" @click="openCreate">+ Ajouter</button>
      </div>

      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Slug</th>
              <th class="admin-th">Titre</th>
              <th class="admin-th">École</th>
              <th class="admin-th text-center">Candidatures</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in programmes" :key="p.id" class="hover:bg-slate-50/80">
              <td class="admin-td admin-td-mono">{{ p.slug }}</td>
              <td class="admin-td font-semibold text-primary">{{ p.titre }}</td>
              <td class="admin-td">{{ p.etablissement?.nom }}</td>
              <td class="admin-td text-center">{{ p.candidaturesCount }}</td>
              <td class="admin-td text-right whitespace-nowrap">
                <button type="button" class="admin-btn-ghost mr-3" @click="openEdit(p)">Modifier</button>
                <button type="button" class="text-xs font-semibold text-red-600 hover:underline" @click="remove(p)">
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
            Ville affichée
            <input v-model="form.ville" class="admin-input" />
          </label>
          <label class="admin-label sm:col-span-2">
            Titre du programme
            <input v-model="form.titre" class="admin-input" />
          </label>
          <label class="admin-label">
            Établissement
            <select v-model="form.etablissementId" class="admin-input bg-white">
              <option v-for="e in ecoles" :key="e.id" :value="e.id">{{ e.nom }}</option>
            </select>
          </label>
          <label class="admin-label">
            Partenaire bailleur
            <select v-model="form.partnerId" class="admin-input bg-white">
              <option v-for="pr in partners" :key="pr.id" :value="pr.id">{{ pr.name }}</option>
            </select>
          </label>
          <label class="admin-label">
            Durée
            <input v-model="form.duree" class="admin-input" />
          </label>
          <label class="admin-label">
            Niveau
            <input v-model="form.niveau" class="admin-input" />
          </label>
          <label class="admin-label">
            Frais dossier
            <input v-model.number="form.fraisDossier" type="number" min="0" class="admin-input" />
          </label>
          <label class="admin-label">
            Frais scolarité
            <input v-model.number="form.fraisScolarite" type="number" min="0" class="admin-input" />
          </label>
          <label class="admin-label">
            Devise
            <input v-model="form.devise" class="admin-input" />
          </label>
          <label class="admin-label">
            Placement / emploi
            <input v-model="form.placement" class="admin-input" />
          </label>
          <label class="admin-label sm:col-span-2">
            Description
            <textarea v-model="form.description" rows="5" class="admin-input min-h-[120px]" />
          </label>
          <label class="admin-label sm:col-span-2">
            Éligibilité
            <textarea v-model="form.eligibilite" rows="3" class="admin-input min-h-[72px]" />
          </label>
          <label class="admin-label">
            URL brochure
            <input v-model="form.brochureUrl" type="url" class="admin-input" />
          </label>
          <label class="admin-label">
            Perspectives
            <input v-model="form.perspectives" class="admin-input" />
          </label>
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
