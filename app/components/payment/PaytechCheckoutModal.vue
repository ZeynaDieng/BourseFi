<script setup lang="ts">
const props = defineProps<{
  open: boolean
  url: string
}>()

const emit = defineEmits<{
  close: []
  loaded: []
  return: [payload: { status: string; candidatureId: string }]
}>()

const iframeLoading = ref(true)
const loadTimedOut = ref(false)
const iframeKey = ref(0)
const openedAt = ref(0)
const iframeRef = ref<HTMLIFrameElement | null>(null)
let loadTimer: ReturnType<typeof setTimeout> | undefined

function clearLoadTimer() {
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = undefined
  }
}

function startLoadTimer() {
  clearLoadTimer()
  loadTimer = setTimeout(() => {
    iframeLoading.value = false
    loadTimedOut.value = true
  }, 8000)
}

watch(
  () => [props.open, props.url] as const,
  ([isOpen, url]) => {
    if (isOpen && url) {
      iframeLoading.value = true
      loadTimedOut.value = false
      openedAt.value = Date.now()
      iframeKey.value += 1
      if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
      startLoadTimer()
    } else {
      clearLoadTimer()
      loadTimedOut.value = false
      if (typeof document !== 'undefined') document.body.style.overflow = ''
    }
  },
)

function onBackdropClick() {
  if (Date.now() - openedAt.value < 400) return
  emit('close')
}

function detectReturnFromIframe() {
  const iframe = iframeRef.value
  if (!iframe?.contentWindow) return
  try {
    const href = iframe.contentWindow.location.href
    if (!href.includes('/paiement/retour')) return
    const url = new URL(href)
    emit('return', {
      status: url.searchParams.get('status') ?? '',
      candidatureId: url.searchParams.get('candidatureId') ?? '',
    })
  } catch {
    // PayTech = cross-origin tant que l'utilisateur n'a pas annulé / payé
  }
}

function onIframeLoad() {
  clearLoadTimer()
  iframeLoading.value = false
  loadTimedOut.value = false
  emit('loaded')
  detectReturnFromIframe()
}

function openInBrowser() {
  if (props.url) window.location.href = props.url
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearLoadTimer()
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && url"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Paiement PayTech"
      @click="onBackdropClick"
    >
      <div
        class="relative w-full max-w-[480px] overflow-hidden rounded-[1.75rem] bg-[#0d4f5c] shadow-2xl"
        style="height: min(700px, 88dvh)"
        @click.stop
      >
        <!-- Spinner léger : disparaît dès le 1er load ou après 8s -->
        <div
          v-if="iframeLoading"
          class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#0d4f5c]/90"
        >
          <span class="material-symbols-outlined animate-spin text-[40px] text-white/80">progress_activity</span>
        </div>

        <iframe
          ref="iframeRef"
          :key="iframeKey"
          :src="url"
          title="Paiement PayTech"
          class="block h-full w-full border-0"
          width="480"
          height="700"
          allow="payment *; clipboard-write"
          @load="onIframeLoad"
        />

        <div
          v-if="loadTimedOut"
          class="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0d4f5c]/95 p-4 text-center"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom))"
        >
          <p class="text-sm text-white/80">Le chargement prend du temps.</p>
          <button
            type="button"
            class="mt-3 w-full rounded-xl bg-white py-3 text-sm font-semibold text-[#0d4f5c] transition hover:bg-white/90"
            @click="openInBrowser"
          >
            Continuer sur PayTech
          </button>
          <button type="button" class="mt-2 text-xs text-white/60 underline" @click="emit('close')">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
