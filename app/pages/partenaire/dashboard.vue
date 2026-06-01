<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'partner-auth' })

const { data: me } = await useFetch('/api/auth/me')
const { data: dossiers, refresh } = await useFetch('/api/candidatures', { server: false, default: () => [] })

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
  'DOCUMENT_EMIS'
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
    body: {
      status: d.status,
      documentUrl: d.documentUrl || undefined
    }
  })
  await refresh()
}

const total = computed(() => (Array.isArray(dossiers.value) ? dossiers.value.length : 0))
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-64 shrink-0 border-r border-slate-200 bg-white p-4">
      <div class="mb-4">
        <AppBrandLogo to="/" img-class="h-12 w-auto max-h-14 object-contain object-left" />
        <p class="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Portail partenaire</p>
      </div>
      <p class="mb-8 text-xs uppercase tracking-widest text-slate-500">Acces partenaire bailleur</p>
      <nav class="space-y-1">
        <NuxtLink to="/partenaire/dashboard" class="block rounded-lg bg-slate-50 px-4 py-3 font-semibold text-primary">
          Tableau de bord
        </NuxtLink>
        <NuxtLink to="/partenaire/audit" class="block rounded-lg px-4 py-3 text-slate-500">Audit partenaire</NuxtLink>
      </nav>
    </aside>

    <main class="flex-1 bg-slate-50 p-8">
      <header class="mb-8 rounded-xl border border-slate-100 bg-white p-5 shadow-premium">
        <h2 class="font-headline text-3xl font-extrabold text-primary">Validation des dossiers bourses</h2>
        <p class="text-sm font-semibold text-slate-500">
          Structure : {{ me?.user?.partnerName || '—' }} — le document officiel est emis sous votre autorite.
        </p>
      </header>

      <section class="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <article class="rounded-xl border border-slate-100 bg-primary-container p-6 text-white shadow-premium">
          <p class="text-xs uppercase tracking-widest text-slate-200">Dossiers recus</p>
          <p class="mt-2 text-4xl font-extrabold">{{ total }}</p>
        </article>
      </section>

      <section class="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-premium">
        <div class="border-b border-slate-100 p-6">
          <h3 class="font-headline text-2xl font-bold text-primary">Candidats</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-[1000px] w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th class="p-4">Candidat</th>
                <th class="p-4">Programme</th>
                <th class="p-4">Statut suite</th>
                <th class="p-4">CNI</th>
                <th class="p-4">URL document (PDF officiel)</th>
                <th class="p-4"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="d in dossiers || []" :key="d.id">
                  <td class="p-4">
                    <p class="font-semibold text-primary">{{ d.fullName }}</p>
                    <p class="text-xs text-slate-500">{{ d.email }}</p>
                    <p v-if="d.phone" class="text-xs text-slate-500">{{ d.phone }}</p>
                    <p class="text-xs text-slate-400">{{ d.statusLabel }}</p>
                  </td>
                  <td class="p-4">
                    <p class="font-medium">{{ d.programmeTitre }}</p>
                    <p class="text-xs text-slate-500">{{ d.partnerName }}</p>
                  </td>
                  <td class="p-4">
                    <select v-model="draftFor(d).status" class="w-full rounded-lg border px-2 py-1.5 text-xs">
                      <option v-for="s in statusChoices" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </td>
                  <td class="p-4">
                    <div v-if="d.identityCardRectoUrl || d.identityCardVersoUrl" class="flex flex-col gap-1 text-xs">
                      <a
                        v-if="d.identityCardRectoUrl"
                        :href="d.identityCardRectoUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-semibold text-primary underline-offset-2 hover:underline"
                      >Recto</a>
                      <a
                        v-if="d.identityCardVersoUrl"
                        :href="d.identityCardVersoUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-semibold text-primary underline-offset-2 hover:underline"
                      >Verso</a>
                    </div>
                    <span v-else class="text-xs text-slate-400">—</span>
                  </td>
                  <td class="p-4">
                    <input
                      v-model="draftFor(d).documentUrl"
                      type="url"
                      placeholder="https://.../attestation-bourse.pdf"
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
          <p v-if="!dossiers?.length" class="p-6 text-sm text-slate-500">Aucun dossier pour le moment.</p>
        </div>
      </section>

      <section class="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <article class="rounded-xl border border-slate-100 bg-white p-5 shadow-premium">
          <h4 class="font-bold text-primary">Journal d'audit</h4>
          <p class="mt-2 text-sm text-slate-600">Tracabilite des changements de statut et depots de documents.</p>
          <NuxtLink to="/partenaire/audit" class="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
            Ouvrir le journal
          </NuxtLink>
        </article>
      </section>
    </main>
  </div>
</template>
