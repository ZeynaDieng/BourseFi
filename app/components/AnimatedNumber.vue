<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    duration?: number
    locale?: string
  }>(),
  {
    duration: 1100,
    locale: 'fr-FR',
  },
)

const display = ref(0)
const rootRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | undefined
let frame: number | undefined

function animate() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    display.value = props.value
    return
  }
  const start = performance.now()
  const from = 0
  const to = props.value
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / props.duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    display.value = Math.round(from + (to - from) * eased)
    if (progress < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

onMounted(() => {
  if (typeof window === 'undefined' || !rootRef.value) {
    display.value = props.value
    return
  }
  if (typeof IntersectionObserver === 'undefined') {
    animate()
    return
  }
  observer = new IntersectionObserver(
    ([entry], obs) => {
      if (entry?.isIntersecting) {
        animate()
        obs.disconnect()
      }
    },
    { threshold: 0.4 },
  )
  observer.observe(rootRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <span ref="rootRef">{{ display.toLocaleString(locale) }}</span>
</template>
