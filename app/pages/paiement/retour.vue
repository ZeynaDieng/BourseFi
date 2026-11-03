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

/**
 * Retour dans un navigateur sans session (Facebook / Instagram puis Safari, ou email de confirmation) :
 * le lien à usage unique reconnecte l'étudiant. Le paiement peut être validé quelques secondes après
 * le retour : on réessaie tant que le serveur répond « en attente ».
 */
async function reconnectWithLink(token: string) {
  const { addCsrfToHeaders } = useCsrf()
  // Dépose le cookie CSRF si ce navigateur n'est jamais venu sur le site
  await $fetch('/api/auth/csrf').catch(() => null)
  const deadline = Date.now() + 45_000
  while (Date.now() < deadline) {
    const res = await $fetch<{ ok?: boolean; pending?: boolean; redirect?: string }>('/api/auth/lien-connexion', {
      method: 'POST',
      body: { token },
      headers: addCsrfToHeaders(),
    }).catch(() => null)
    if (!res?.pending) return res?.redirect ?? null
    await new Promise((r) => window.setTimeout(r, 2500))
  }
  return null
}

onMounted(async () => {
  if (notifyParent()) {
    const interval = window.setInterval(notifyParent, 250)
    window.setTimeout(() => window.clearInterval(interval), 4000)
    return
  }

  const q = new URLSearchParams()
  if (candidatureId.value) q.set('candidatureId', candidatureId.value)
  if (status.value) q.set('status', status.value)
  const fallback = `/paiement?${q.toString()}`

  const token = typeof route.query.k === 'string' ? route.query.k : ''
  if (token && status.value === 'success') {
    // Le lien ne reste pas dans l'historique du navigateur
    window.history.replaceState(window.history.state, '', fallback.replace('/paiement?', '/paiement/retour?'))
    const me = await $fetch<{ user: unknown }>('/api/auth/me').catch(() => null)
    if (!me?.user) {
      const redirect = await reconnectWithLink(token)
      // Navigation complète : la nouvelle session est prise en compte partout
      window.location.replace(redirect ?? fallback)
      return
    }
  }

  navigateTo(fallback, { replace: true })
})

useSeoMeta({ title: 'Finalisation  BourseFi' })
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] })
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
