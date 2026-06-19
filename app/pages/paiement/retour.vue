<script setup lang="ts">
/**
 * Page intermédiaire pour les retours PayTech (success / cancel).
 * En iframe : notifie la page parente puis reste minimale.
 * En pleine page : redirige vers /paiement avec les bons paramètres.
 */
definePageMeta({ layout: false })

const route = useRoute()

const status = computed(() => (typeof route.query.status === 'string' ? route.query.status : ''))
const candidatureId = computed(() =>
  typeof route.query.candidatureId === 'string' ? route.query.candidatureId : '',
)

function notifyParent() {
  if (typeof window === 'undefined') return false
  const inIframe = window.self !== window.top
  if (!inIframe) return false

  window.parent.postMessage(
    {
      source: 'paytech',
      status: status.value,
      candidatureId: candidatureId.value,
    },
    window.location.origin,
  )
  return true
}

onMounted(() => {
  if (notifyParent()) {
    const interval = window.setInterval(notifyParent, 250)
    window.setTimeout(() => window.clearInterval(interval), 4000)
    return
  }

  const q = new URLSearchParams()
  if (candidatureId.value) q.set('candidatureId', candidatureId.value)
  if (status.value) q.set('status', status.value)
  navigateTo(`/paiement?${q.toString()}`, { replace: true })
})

useSeoMeta({ title: 'Finalisation — BourseFi' })
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <span class="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
    </div>
    <p class="mt-4 font-headline text-lg font-bold text-primary">Finalisation…</p>
    <p class="mt-1 text-sm text-slate-500">Ne fermez pas cette fenêtre.</p>
  </div>
</template>
