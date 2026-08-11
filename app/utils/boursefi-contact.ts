export type BoursefiContactInfo = {
  phone: string
  whatsapp: string
  email: string
  address: string
}

export const DEFAULT_BOURSEFI_CONTACT: BoursefiContactInfo = {
  phone: '+221 77 113 39 26',
  whatsapp: '+221 77 113 39 26',
  email: 'contact@boursefi.sn',
  address: 'Ouakam, Dakar - Siège BourseFi',
}

export function useBoursefiContact() {
  const { data } = useAsyncData<BoursefiContactInfo>('boursefi-public-contact-info', () =>
    $fetch<BoursefiContactInfo>('/api/public/contact-info').catch(() => DEFAULT_BOURSEFI_CONTACT)
  )

  const contact = computed<BoursefiContactInfo>(() => {
    return {
      phone: data.value?.phone || DEFAULT_BOURSEFI_CONTACT.phone,
      whatsapp: data.value?.whatsapp || DEFAULT_BOURSEFI_CONTACT.whatsapp,
      email: data.value?.email || DEFAULT_BOURSEFI_CONTACT.email,
      address: data.value?.address || DEFAULT_BOURSEFI_CONTACT.address,
    }
  })

  const cleanWhatsappNumber = computed(() => {
    const raw = contact.value.whatsapp || contact.value.phone || ''
    return raw.replace(/[^0-9]/g, '')
  })

  const whatsappUrl = computed(() => {
    const num = cleanWhatsappNumber.value
    if (!num) return 'https://wa.me/221771133926'
    return `https://wa.me/${num}?text=${encodeURIComponent("Bonjour BourseFi, j'ai une question concernant une bourse.")}`
  })

  const phoneTelUrl = computed(() => {
    const raw = contact.value.phone || contact.value.whatsapp || ''
    return raw ? `tel:${raw.replace(/\s+/g, '')}` : 'tel:+221771133926'
  })

  const emailMailtoUrl = computed(() => {
    return `mailto:${contact.value.email || 'contact@boursefi.sn'}`
  })

  return {
    contact,
    cleanWhatsappNumber,
    whatsappUrl,
    phoneTelUrl,
    emailMailtoUrl,
  }
}
