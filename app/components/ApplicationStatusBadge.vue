<script setup lang="ts">
import { badgeStatusBase } from '~/utils/design-tokens'

const props = defineProps<{ status: string }>()

const config = computed(() => {
  const map: Record<string, { label: string; className: string }> = {
    BROUILLON: { label: 'Brouillon', className: 'bg-slate-100 text-slate-700' },
    SOUMIS: { label: 'Déposé', className: 'bg-sky-50 text-sky-800' },
    EN_ATTENTE_PAIEMENT: { label: 'Paiement en attente', className: 'bg-amber-50 text-amber-900' },
    EN_REVUE_PARTENAIRE: { label: 'En analyse', className: 'bg-violet-50 text-violet-800' },
    COMPLEMENT_DEMANDE: { label: 'Pièces demandées', className: 'bg-orange-50 text-orange-900' },
    ACCEPTE: { label: 'Accepté', className: 'bg-emerald-50 text-emerald-800' },
    REFUSE: { label: 'Refusé', className: 'bg-red-50 text-red-800' },
    DOCUMENT_EMIS: { label: 'Attestation disponible', className: 'bg-emerald-50 text-emerald-800' },
    TERMINE: { label: 'Terminé', className: 'bg-slate-100 text-slate-700' },
  }
  return map[props.status] ?? { label: props.status, className: 'bg-slate-100 text-slate-700' }
})
</script>

<template>
  <span :class="[badgeStatusBase, config.className]">{{ config.label }}</span>
</template>
