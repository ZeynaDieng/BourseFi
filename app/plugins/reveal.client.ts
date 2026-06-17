export default defineNuxtPlugin((nuxtApp) => {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

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
