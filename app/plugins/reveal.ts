export default defineNuxtPlugin((nuxtApp) => {
  // Côté serveur : on enregistre une directive no-op (avec getSSRProps) pour que
  // le SSR puisse résoudre `v-reveal` sans planter. L'animation se fait au client.
  if (import.meta.server) {
    nuxtApp.vueApp.directive('reveal', {
      getSSRProps: () => ({}),
    })
    return
  }

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const observer =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          (entries, obs) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible')
                obs.unobserve(entry.target)
              }
            }
          },
          { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
        )
      : null

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),
    mounted(el: HTMLElement) {
      if (prefersReduced || !observer) {
        el.classList.add('is-visible')
        return
      }
      el.classList.add('reveal')
      observer.observe(el)
    },
    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    },
  })
})
