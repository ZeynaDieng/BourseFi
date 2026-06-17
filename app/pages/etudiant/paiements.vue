<script setup lang="ts">
definePageMeta({ layout: 'student-app', middleware: 'student-auth' })

const { data: paiements } = await useFetch('/api/paiements')
const { data: candidatures } = await useFetch('/api/candidatures')

const pendingCandidatures = computed(() =>
  (candidatures.value ?? []).filter((c) => c.status === 'EN_ATTENTE_PAIEMENT' && c.fraisDossier > 0),
)

function statusTone(status: string) {
  if (status === 'VALIDE' || status === 'COMPLETED') return 'bg-emerald-50 text-emerald-800'
  if (status === 'EN_ATTENTE' || status === 'PENDING') return 'bg-amber-50 text-amber-900'
  return 'bg-slate-100 text-slate-700'
}

useSeoMeta({ title: 'Mes paiements — BourseFi' })
</script>

<template>
  <main class="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-primary/[0.04] to-background pb-8">
    <StudentPageShell title="Mes paiements" subtitle="Frais de dossier et reçus.">
      <section v-if="pendingCandidatures.length" class="mb-6">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-amber-700">À régler</h2>
        <ul class="space-y-3">
          <li
            v-for="c in pendingCandidatures"
            :key="c.id"
            class="rounded-2xl border border-amber-100 bg-amber-50/60 p-4"
          >
            <p class="font-semibold text-primary">{{ c.programmeTitre }}</p>
            <p class="text-sm text-slate-600">
              {{ c.fraisDossier.toLocaleString('fr-FR') }} {{ c.devise }}
            </p>
            <NuxtLink
              :to="`/paiement?candidatureId=${c.id}`"
              class="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-white active:scale-[0.98]"
            >
              Régler maintenant
            </NuxtLink>
          </li>
        </ul>
      </section>

      <ul class="space-y-3">
        <li
          v-for="p in paiements ?? []"
          :key="p.id"
          class="rounded-2xl border border-slate-100 bg-white p-4 shadow-premium"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-semibold text-primary">
                {{ p.amount.toLocaleString('fr-FR') }} {{ p.currency }}
              </p>
              <p class="text-sm text-slate-500">{{ p.method }}</p>
            </div>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="statusTone(p.status)"
            >
              {{ p.status }}
            </span>
          </div>
          <p class="mt-2 text-xs text-slate-400">
            {{ new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </p>
        </li>
      </ul>

      <div
        v-if="!(paiements?.length) && !pendingCandidatures.length"
        class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"
      >
        <span class="material-symbols-outlined text-[40px] text-slate-300">payments</span>
        <p class="mt-3 text-slate-500">Aucun paiement enregistré.</p>
      </div>
    </StudentPageShell>
  </main>
</template>
