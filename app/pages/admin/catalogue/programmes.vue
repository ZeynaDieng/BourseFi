<script setup lang="ts">
import { getAdminErrorMessage } from '~/utils/admin-error'

definePageMeta({ layout: 'portal', middleware: 'admin-auth' })

type PartnerOpt = { id: string; slug: string; name: string }
type EcoleOpt = { id: string; slug: string; nom: string }

type TarifItem = {
  id: string
  programmeId: string
  anneeAcademique: string
  montant: number
  frequence: string
  devise: string
  label: string | null
  isDefault: boolean
  isVerified: boolean
  verifiedAt: string | null
  status: string
}

type ProgrammeRow = {
  id: string
  slug: string
  titre: string
  ville: string
  duree: string
  fraisDossier: number
  fraisDossierEtranger: number
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
const searchQ = ref('')
const drawerOpen = ref(false)
const editingId = ref<string | null>(null)

// Tarifs modal state
const tarifsModalOpen = ref(false)
const selectedProgramme = ref<ProgrammeRow | null>(null)
const programmeTarifs = ref<TarifItem[]>([])

const newTarif = ref({
  anneeAcademique: '2026-2027',
  montant: 600000,
  frequence: 'ANNUEL',
  label: 'Tarif Général',
  isDefault: true,
  isVerified: true,
  source: 'ESTABLISHMENT' as const,
})

const emptyForm = () => ({
  slug: '',
  etablissementId: '',
  partnerId: '',
  titre: '',
  ville: '',
  duree: '',
  fraisDossier: 20000,
  fraisDossierEtranger: 30000,
  devise: 'FCFA',
  niveau: '',
  placement: '',
  description: '',
  eligibilite: '',
  brochureUrl: '',
  perspectives: '',
})

const form = ref(emptyForm())

type EtabAdminRow = { id: string; slug: string; nom: string; ville: string; _count: { programmes: number } }

async function loadAll() {
  try {
    const [p, partRows, etabRows] = await Promise.all([
      $fetch<ProgrammeRow[]>('/api/admin/programmes'),
      $fetch<Array<{ id: string; slug: string; name: string }>>('/api/admin/partners'),
      $fetch<EtabAdminRow[]>('/api/admin/etablissements'),
    ])
    const etab = etabRows.map((r) => ({ id: r.id, slug: r.slug, nom: r.nom }))
    programmes.value = p
    partners.value = partRows.map((x) => ({ id: x.id, slug: x.slug, name: x.name }))
    ecoles.value = etab
  } catch (err) {
    getAdminErrorMessage(err, 'Erreur lors du chargement des programmes.')
  }
}

await loadAll()

const filteredProgrammes = computed(() => {
  if (!searchQ.value.trim()) return programmes.value
  const q = searchQ.value.toLowerCase()
  return programmes.value.filter(
    (p) =>
      p.titre.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.etablissement?.nom.toLowerCase().includes(q) ||
      p.niveau.toLowerCase().includes(q)
  )
})

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
    fraisDossierEtranger: row.fraisDossierEtranger,
    devise: row.devise,
    niveau: row.niveau,
    placement: row.placement ?? '',
    description: row.description,
    eligibilite: row.eligibilite ?? '',
    brochureUrl: row.brochureUrl ?? '',
    perspectives: row.perspectives ?? '',
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
    fraisDossierEtranger: Number(form.value.fraisDossierEtranger),
    devise: form.value.devise,
    niveau: form.value.niveau,
    placement: form.value.placement || null,
    description: form.value.description,
    eligibilite: form.value.eligibilite || null,
    brochureUrl: form.value.brochureUrl || null,
    perspectives: form.value.perspectives || null,
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
  if (!confirm(`Supprimer le programme ${row.titre} ?`)) return
  try {
    await $fetch(`/api/admin/programmes/${row.id}`, { method: 'DELETE' })
    await loadAll()
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e, 'Suppression impossible.'))
  }
}

// Gestion des Tarifs
async function openTarifs(row: ProgrammeRow) {
  selectedProgramme.value = row
  tarifsModalOpen.value = true
  await loadTarifs(row.id)
}

async function loadTarifs(programmeId: string) {
  programmeTarifs.value = await $fetch<TarifItem[]>(`/api/admin/programmes/${programmeId}/tarifs`)
}

async function addTarif() {
  if (!selectedProgramme.value) return
  if (!newTarif.value.anneeAcademique || newTarif.value.montant <= 0) {
    alert('Année académique et montant positif requis.')
    return
  }

  try {
    await $fetch(`/api/admin/programmes/${selectedProgramme.value.id}/tarifs`, {
      method: 'POST',
      body: newTarif.value,
    })
    await loadTarifs(selectedProgramme.value.id)
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

async function toggleTarifVerified(t: TarifItem) {
  try {
    await $fetch(`/api/admin/tarifs/${t.id}`, {
      method: 'PATCH',
      body: { isVerified: !t.isVerified },
    })
    if (selectedProgramme.value) {
      await loadTarifs(selectedProgramme.value.id)
    }
  } catch (e: unknown) {
    alert(getAdminErrorMessage(e))
  }
}

const drawerTitle = computed(() => (editingId.value ? 'Modifier le programme' : 'Nouveau programme'))
</script>

<template>
  <div class="flex min-h-screen bg-slate-50/50">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="admin-page-title">Gestion des Programmes</h2>
          <p class="admin-page-desc !mb-0">
            Formations et gestion des frais de scolarité par année académique.
          </p>
        </div>
        <button type="button" class="admin-btn-primary" @click="openCreate">+ Ajouter un programme</button>
      </div>

      <!-- Filtres -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div class="relative flex-1 max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
          <input
            v-model="searchQ"
            type="text"
            placeholder="Rechercher un programme, école, niveau..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none"
          />
        </div>
        <div class="text-xs font-semibold text-slate-500">
          {{ filteredProgrammes.length }} programme{{ filteredProgrammes.length > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Tableau -->
      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="admin-th">Titre du programme</th>
              <th class="admin-th">École</th>
              <th class="admin-th">Niveau / Durée</th>
              <th class="admin-th">Frais dossier</th>
              <th class="admin-th text-center">Candidatures</th>
              <th class="admin-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredProgrammes" :key="p.id" class="hover:bg-slate-50/80">
              <td class="admin-td font-semibold text-primary">
                {{ p.titre }}
                <div class="text-xs text-slate-400 font-mono">{{ p.slug }}</div>
              </td>
              <td class="admin-td text-slate-700 font-medium">{{ p.etablissement?.nom }}</td>
              <td class="admin-td text-xs text-slate-600">
                <span class="font-semibold">{{ p.niveau }}</span> · {{ p.duree }}
              </td>
              <td class="admin-td text-xs">
                <div class="font-semibold text-slate-800">{{ p.fraisDossier.toLocaleString('fr-FR') }} FCFA</div>
                <div v-if="p.fraisDossierEtranger" class="text-slate-400">Étranger: {{ p.fraisDossierEtranger.toLocaleString('fr-FR') }} FCFA</div>
              </td>
              <td class="admin-td text-center">
                <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {{ p.candidaturesCount }}
                </span>
              </td>
              <td class="admin-td text-right whitespace-nowrap">
                <button
                  type="button"
                  class="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 mr-2"
                  @click="openTarifs(p)"
                >
                  💳 Tarifs & Scolarité
                </button>
                <button type="button" class="admin-btn-ghost mr-2 text-xs" @click="openEdit(p)">Modifier</button>
                <button type="button" class="text-xs font-semibold text-red-600 hover:underline" @click="remove(p)">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Drawer édition programme -->
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
            Frais dossier local (FCFA)
            <input v-model.number="form.fraisDossier" type="number" min="0" class="admin-input" />
          </label>
          <label class="admin-label">
            Frais dossier étranger (FCFA)
            <input v-model.number="form.fraisDossierEtranger" type="number" min="0" class="admin-input" />
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
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-btn-secondary" @click="closeDrawer">Annuler</button>
            <button type="button" class="admin-btn-primary" @click="submitDrawer">Enregistrer</button>
          </div>
        </template>
      </AdminDrawer>

      <!-- Modal Modalités / Tarifs par année académique -->
      <div v-if="tarifsModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
          <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-headline text-lg font-bold text-primary">Gestion des Tarifs de Scolarité</h3>
              <p class="text-xs text-slate-500" v-if="selectedProgramme">{{ selectedProgramme.titre }} ({{ selectedProgramme.etablissement?.nom }})</p>
            </div>
            <button type="button" class="text-slate-400 hover:text-slate-600" @click="tarifsModalOpen = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Formulaire d'ajout de Tarif pour une Année -->
          <div class="mb-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">+ Ajouter / Mettre à jour un tarif par année</div>
            <div class="grid gap-3 sm:grid-cols-3">
              <label class="admin-label">
                Année académique
                <input v-model="newTarif.anneeAcademique" placeholder="2026-2027" class="admin-input" />
              </label>
              <label class="admin-label">
                Montant frais (FCFA)
                <input v-model.number="newTarif.montant" type="number" min="0" class="admin-input" />
              </label>
              <label class="admin-label">
                Intitulé / Profil
                <input v-model="newTarif.label" placeholder="ex: Général" class="admin-input" />
              </label>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <label class="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input v-model="newTarif.isVerified" type="checkbox" class="rounded border-slate-300" />
                Marquer comme Tarif Vérifié 🟢
              </label>
              <button type="button" class="admin-btn-primary text-xs py-2 px-4" @click="addTarif">
                Enregistrer le tarif
              </button>
            </div>
          </div>

          <!-- Liste de l'historique des tarifs -->
          <div class="space-y-3">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Historique des tarifs enregistrés</div>
            <div v-if="programmeTarifs.length" class="space-y-2">
              <div
                v-for="t in programmeTarifs"
                :key="t.id"
                class="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-white"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-primary text-sm">{{ t.anneeAcademique }}</span>
                    <span class="text-xs font-bold text-slate-700">{{ t.montant.toLocaleString('fr-FR') }} {{ t.devise }} / {{ t.frequence.toLowerCase() }}</span>
                    <span v-if="t.label" class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-semibold">{{ t.label }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="rounded-full px-2.5 py-0.5 text-xs font-bold transition"
                    :class="t.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                    @click="toggleTarifVerified(t)"
                  >
                    {{ t.isVerified ? '🟢 Vérifié' : '🟠 À vérifier' }}
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
              Aucun tarif enregistré pour ce programme. Saisissez les frais de scolarité ci-dessus.
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button type="button" class="admin-btn-secondary" @click="tarifsModalOpen = false">Fermer</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
