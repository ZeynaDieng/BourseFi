<script setup lang="ts">
import { buildStudentDocuments, groupStudentDocuments } from '~/composables/useStudentDossier'

definePageMeta({ layout: 'student-app', middleware: 'student-auth' })

const { data: me } = await useFetch('/api/auth/me')
const { data: candidatures } = await useFetch('/api/candidatures')
const { data: paiements } = await useFetch('/api/paiements')

const documents = computed(() =>
  buildStudentDocuments(candidatures.value, paiements.value, me.value?.user),
)
const groups = computed(() => groupStudentDocuments(documents.value))

const sections = computed(() => [
  { key: 'attestation', title: 'Attestations de bourse', icon: 'verified', items: groups.value.attestation },
  { key: 'identity', title: "Pièces d'identité", icon: 'badge', items: groups.value.identity },
  { key: 'receipt', title: 'Reçus de paiement', icon: 'receipt', items: groups.value.receipt },
].filter((s) => s.items.length > 0))

const openSections = reactive<Record<string, boolean>>({
  attestation: true,
  identity: true,
  receipt: true,
})

useSeoMeta({ title: 'Mes documents — BourseFi' })
</script>

<template>
  <main class="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-primary/[0.04] to-background pb-8">
    <StudentPageShell title="Mes documents" subtitle="Attestations, pièces d'identité et reçus.">
      <div v-if="sections.length" class="space-y-4">
        <section
          v-for="section in sections"
          :key="section.key"
          class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-premium"
        >
          <button
            type="button"
            class="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left active:scale-[0.99]"
            @click="openSections[section.key] = !openSections[section.key]"
          >
            <span class="flex items-center gap-2 font-semibold text-primary">
              <span class="material-symbols-outlined text-[20px] text-secondary">{{ section.icon }}</span>
              {{ section.title }}
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                {{ section.items.length }}
              </span>
            </span>
            <span class="material-symbols-outlined text-slate-400">
              {{ openSections[section.key] ? 'expand_less' : 'expand_more' }}
            </span>
          </button>
          <ul v-show="openSections[section.key]" class="divide-y divide-slate-50 border-t border-slate-50">
            <li v-for="d in section.items" :key="d.id">
              <a
                v-if="d.url"
                :href="d.url"
                target="_blank"
                rel="noopener"
                class="flex min-h-12 items-center gap-3 px-4 py-3 transition active:bg-slate-50"
              >
                <span class="material-symbols-outlined text-primary">download</span>
                <span class="flex-1 text-sm font-medium text-primary">{{ d.label }}</span>
                <span class="material-symbols-outlined text-slate-400">open_in_new</span>
              </a>
              <div v-else class="flex min-h-12 items-center gap-3 px-4 py-3 text-sm text-slate-500">
                <span class="material-symbols-outlined">description</span>
                {{ d.label }}
              </div>
            </li>
          </ul>
        </section>
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"
      >
        <span class="material-symbols-outlined text-[40px] text-slate-300">folder_off</span>
        <p class="mt-3 text-slate-500">Aucun document disponible pour le moment.</p>
        <NuxtLink
          to="/etudiant/candidatures"
          class="mt-4 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-primary"
        >
          Voir mes candidatures →
        </NuxtLink>
      </div>
    </StudentPageShell>
  </main>
</template>
