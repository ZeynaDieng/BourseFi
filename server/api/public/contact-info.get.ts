import { prisma } from '../../utils/prisma'
import { loadDiskCmsSeed } from '../../utils/cms-public'

export default defineEventHandler(async () => {
  const seed = loadDiskCmsSeed()
  const seedContact = (seed.siteContent?.boursefi_contact as Record<string, string>) || {
    phone: '+221 77 113 39 26',
    whatsapp: '+221 77 113 39 26',
    email: 'contact@boursefi.sn',
    address: 'Ouakam, Dakar - Siège BourseFi',
  }

  const row = await prisma.siteContent.findUnique({
    where: { key: 'boursefi_contact' },
  })

  if (row && row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)) {
    const payload = row.payload as Record<string, string>
    return {
      phone: payload.phone || seedContact.phone,
      whatsapp: payload.whatsapp || seedContact.whatsapp,
      email: payload.email || seedContact.email,
      address: payload.address || seedContact.address,
    }
  }

  return seedContact
})
