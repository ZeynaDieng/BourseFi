import { useNuxtData, useFetch } from '#imports'

export interface FraisDossierConfig {
  referenceTarif: number
  activeTarif: number
  mode: 'standard' | 'promotion'
  isActive: boolean
}

export function useTarification(basePrice: number) {
  // Use useNuxtData and useFetch to ensure it's fetched once per SSR/Client load
  const { data } = useFetch<FraisDossierConfig>('/api/settings/frais-dossier', {
    key: 'frais-dossier-config',
    server: true,
    lazy: false,
    default: () => ({
      referenceTarif: basePrice,
      activeTarif: basePrice,
      mode: 'standard',
      isActive: false
    })
  })

  const hasConfig = computed(() => data.value && data.value.isActive)
  
  const activeTarif = computed(() => {
    return hasConfig.value ? data.value!.activeTarif : basePrice
  })

  const referenceTarif = computed(() => {
    return hasConfig.value ? data.value!.referenceTarif : basePrice
  })

  const mode = computed(() => {
    return hasConfig.value ? data.value!.mode : 'standard'
  })

  const isPromo = computed(() => {
    return mode.value === 'promotion'
  })

  const formatFcfa = (val: number) => val.toLocaleString('fr-FR')

  return {
    activeTarif,
    referenceTarif,
    mode,
    isPromo,
    formatFcfa
  }
}
