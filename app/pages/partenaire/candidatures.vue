<script setup lang="ts">
import { usePartnerPortalNav } from '~/composables/usePartnerPortalNav'

definePageMeta({ layout: 'portal', middleware: 'partner-auth' })

const { navItems, partnerDrawerLinks } = usePartnerPortalNav()
const route = useRoute()
const { data: dossiers, refresh } = await useFetch('/api/candidatures', { default: () => [] })

type Dossier = {
  id: string
  fullName: string
  email: string
  phone?: string
  status: string
  statusLabel: string
  programmeTitre: string
  partnerName: string
  documentUrl: string | null
  identityCardRectoUrl?: string | null
  identityCardVersoUrl?: string | null
}

const statusChoices = [
  'EN_REVUE_PARTENAIRE',
  'COMPLEMENT_DEMANDE',
  'ACCEPTE',
  'REFUSE',
  'DOCUMENT_EMIS',
  'TERMINE',
]

const filterStatus = computed(() => (route.query.status as string) || '')

const filtered = computed(() => {
  const list = (Array.isArray(dossiers.value) ? dossiers.value : []) as Dossier[]
  if (!filterStatus.value) return list
  return list.filter((d) => d.status === filterStatus.value)
})

const statusFilters = [
  { value: '', label: 'Tous' },
  { value: 'EN_REVUE_PARTENAIRE', label: 'En revue' },
  { value: 'COMPLEMENT_DEMANDE', label: 'Complément' },
  { value: 'ACCEPTE', label: 'Acceptés' },
  { value: 'DOCUMENT_EMIS', label: 'Document émis' },
]

const drafts = reactive<Record<string, { status: string; documentUrl: string }>>({})

function draftFor(d: Dossier) {
  if (!drafts[d.id]) {
    drafts[d.id] = { status: d.status, documentUrl: d.documentUrl || '' }
  }
  return drafts[d.id]
}

async function savePatch(id: string) {
  const d = drafts[id]
  if (!d) return
  await $fetch(`/api/candidatures/${id}`, {
    method: 'PATCH',
    body: { status: d.status, documentUrl: d.documentUrl || undefined },
  })
  await refresh()
}
</script>

<template>
  <PortalShell
    :nav-items="navItems"
    :drawer-links="partnerDrawerLinks"
    drawer-title="Portail partenaire"
    logo-to="/partenaire/dashboard"
    aria-label="Navigation partenaire"
  >
    <template #sidebar>
      <PartnerSidebar />
    </template>

    <div class="space-y-6 p-4 md:space-y-8 md:p-8">
      <PortalPageHeader
        title="Candidatures"
        subtitle="Validation et suivi des dossiers de bourse."
      />

      <!-- Filtres scrollables mobile -->
      <div class="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        <NuxtLink
          v-for="f in statusFilters"
          :key="f.value"
          :to="f.value ? `/partenaire/candidatures?status=${f.value}` : '/partenaire/candidatures'"
          class="shrink-0 snap-start rounded-full px-4 py-2 text-xs font-semibold transition active:scale-[0.98]"
          :class="
            filterStatus === f.value
              ? 'bg-primary text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-200'
          "
        >
          {{ f.label }}
        </NuxtLink>
      </div>

      <!-- Cartes mobile -->
      <div class="flex flex-col gap-4 md:hidden">
        <article
          v-for="d in filtered"
          :key="d.id"
          class="portal-dash-card space-y-4 p-4"
        >
          <div>
            <p class="font-semibold text-primary">{{ d.fullName }}</p>
            <p class="text-xs text-slate-500">{{ d.email }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ d.programmeTitre }}</p>
            <ApplicationStatusBadge :status="d.status" class="mt-2" />
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <a
              v-if="d.identityCardRectoUrl"
              :href="d.identityCardRectoUrl"
              target="_blank"
              class="rounded-lg border border-primary px-3 py-2 font-semibold text-primary"
            >
              CNI recto
            </a>
            <a
              v-if="d.identityCardVersoUrl"
              :href="d.identityCardVersoUrl"
              target="_blank"
              class="rounded-lg border border-primary px-3 py-2 font-semibold text-primary"
            >
              CNI verso
            </a>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-500">Statut</label>
            <select
              v-model="draftFor(d).status"
              class="w-full min-h-11 rounded-xl border border-slate-200 px-3 text-sm"
            >
              <option v-for="s in statusChoices" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-500">URL attestation</label>
            <input
              v-model="draftFor(d).documentUrl"
              type="url"
              placeholder="https://.../attestation.pdf"
              class="w-full min-h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
          </div>
          <button
            type="button"
            class="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-white active:scale-[0.98]"
            @click="savePatch(d.id)"
          >
            Enregistrer
          </button>
        </article>
        <PortalEmptyState
          v-if="!filtered.length"
          icon="inbox"
          title="Aucun dossier"
          description="Aucune candidature ne correspond à ce filtre."
        />
      </div>

      <!-- Table desktop -->
      <section class="portal-dash-card hidden overflow-hidden md:block">
        <div class="overflow-x-auto">
          <table class="min-w-[1000px] w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th class="p-4">Candidat</th>
                <th class="p-4">Programme</th>
                <th class="p-4">Statut</th>
                <th class="p-4">CNI</th>
                <th class="p-4">URL attestation</th>
                <th class="p-4" />
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="d in filtered" :key="d.id">
                <td class="p-4">
                  <p class="font-semibold text-primary">{{ d.fullName }}</p>
                  <p class="text-xs text-slate-500">{{ d.email }}</p>
                  <ApplicationStatusBadge :status="d.status" class="mt-2" />
                </td>
                <td class="p-4">{{ d.programmeTitre }}</td>
                <td class="p-4">
                  <select v-model="draftFor(d).status" class="w-full rounded-lg border px-2 py-1.5 text-xs">
                    <option v-for="s in statusChoices" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>
                <td class="p-4">
                  <div class="flex flex-col gap-1 text-xs">
                    <a v-if="d.identityCardRectoUrl" :href="d.identityCardRectoUrl" target="_blank" class="text-primary underline">Recto</a>
                    <a v-if="d.identityCardVersoUrl" :href="d.identityCardVersoUrl" target="_blank" class="text-primary underline">Verso</a>
                    <span v-if="!d.identityCardRectoUrl && !d.identityCardVersoUrl">—</span>
                  </div>
                </td>
                <td class="p-4">
                  <input
                    v-model="draftFor(d).documentUrl"
                    type="url"
                    placeholder="https://.../attestation.pdf"
                    class="w-full min-w-[200px] rounded-lg border px-2 py-1.5 text-xs"
                  />
                </td>
                <td class="p-4">
                  <button type="button" class="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white" @click="savePatch(d.id)">
                    Enregistrer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!filtered.length" class="p-6 text-sm text-slate-500">Aucun dossier.</p>
      </section>
    </div>
  </PortalShell>
</template>
