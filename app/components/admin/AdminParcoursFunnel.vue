<script setup lang="ts">
type Etape = { key: string; label: string; count: number }
type Parcours = { ok: boolean; jours: number; etapes: Etape[]; blocages: { reason: string; count: number }[] }

const jours = ref(30)
const { data } = await useFetch<Parcours>('/api/admin/parcours', { query: { jours } })

const etapes = computed(() => data.value?.etapes ?? [])
const total = computed(() => etapes.value[0]?.count ?? 0)
const pct = (n: number, of: number) => (of > 0 ? Math.round((n / of) * 100) : 0)

// Étape où l'on perd le plus d'étudiants (en nombre)
const pirePerte = computed(() => {
  let worst: { index: number; lost: number } | null = null
  etapes.value.forEach((e, i) => {
    if (i === 0) return
    const lost = etapes.value[i - 1]!.count - e.count
    if (lost > 0 && (!worst || lost > worst.lost)) worst = { index: i, lost }
  })
  return worst as { index: number; lost: number } | null
})

const BLOCAGE_LABELS: Record<string, string> = {
  FINANCIAL_DIFFICULTY: 'Pas l’argent pour le moment',
  PARENT_APPROVAL: 'Doit en parler aux parents',
  TECHNICAL_ISSUE: 'Problème Wave / Orange Money',
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[22px] text-primary">filter_alt</span>
        <h3 class="font-headline text-sm font-extrabold text-slate-900">Parcours des étudiants</h3>
      </div>
      <div class="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold">
        <button
          v-for="j in [7, 30, 90]"
          :key="j"
          type="button"
          class="rounded-md px-2.5 py-1 transition"
          :class="jours === j ? 'bg-white text-primary shadow-sm' : 'text-slate-500'"
          @click="jours = j"
        >
          {{ j }} j
        </button>
      </div>
    </div>
    <p class="mt-1 text-xs text-slate-500">
      Étudiants inscrits sur les {{ jours }} derniers jours, et l’étape la plus loin qu’ils ont atteinte.
    </p>

    <p v-if="!total" class="mt-6 text-center text-xs text-slate-400">Aucun compte étudiant créé sur la période.</p>

    <ol v-else class="mt-4 space-y-2">
      <li v-for="(e, i) in etapes" :key="e.key">
        <div
          v-if="i > 0 && etapes[i - 1]!.count > e.count"
          class="mb-1 ml-1 text-[11px]"
          :class="pirePerte?.index === i ? 'font-bold text-red-600' : 'text-slate-400'"
        >
          ↓ {{ etapes[i - 1]!.count - e.count }} perdu(s)
          <span v-if="pirePerte?.index === i">— plus grosse perte</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-28 shrink-0 text-[11px] font-semibold leading-tight text-slate-700 sm:w-48 sm:text-xs">{{ e.label }}</span>
          <div class="h-7 flex-1 overflow-hidden rounded-lg bg-slate-100">
            <div
              v-if="e.count"
              class="flex h-full items-center rounded-lg px-2 text-[11px] font-bold text-white transition-all"
              :class="i === etapes.length - 1 ? 'bg-emerald-600' : 'bg-primary'"
              :style="{ width: `${Math.max(pct(e.count, total), 8)}%` }"
            >
              {{ e.count }}
            </div>
          </div>
          <span class="w-10 shrink-0 text-right text-xs font-bold text-slate-500">{{ pct(e.count, total) }} %</span>
        </div>
      </li>
    </ol>

    <div v-if="data?.blocages?.length" class="mt-5 border-t border-slate-100 pt-4">
      <p class="text-xs font-bold text-slate-700">« Je ne peux pas payer maintenant » — motifs donnés</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="b in data.blocages"
          :key="b.reason"
          class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
        >
          {{ BLOCAGE_LABELS[b.reason] || b.reason }} : {{ b.count }}
        </span>
      </div>
    </div>

    <p class="mt-4 text-[11px] text-slate-400">
      « Candidature commencée » n’est mesurée que pour les comptes créés depuis la mise en ligne de la sauvegarde du formulaire.
    </p>
  </section>
</template>
