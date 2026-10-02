import { prisma } from './prisma'

export interface FraisDossierConfig {
  referenceTarif: number
  activeTarif: number
  mode: 'standard' | 'promotion'
  isActive: boolean
}

const DEFAULT_CONFIG: FraisDossierConfig = {
  referenceTarif: 15000,
  activeTarif: 10000,
  mode: 'standard',
  isActive: false,
}

export async function getGlobalFraisDossierConfig(): Promise<FraisDossierConfig> {
  try {
    const record = await prisma.siteContent.findUnique({
      where: { key: 'frais_dossier_config' },
    })

    if (record && record.payload) {
      return {
        ...DEFAULT_CONFIG,
        ...(record.payload as Partial<FraisDossierConfig>),
      }
    }
  } catch (error) {
    console.error('Erreur lors de la lecture de frais_dossier_config:', error)
  }
  return DEFAULT_CONFIG
}

export async function setGlobalFraisDossierConfig(config: Partial<FraisDossierConfig>): Promise<FraisDossierConfig> {
  const current = await getGlobalFraisDossierConfig()
  const updated = { ...current, ...config }

  await prisma.siteContent.upsert({
    where: { key: 'frais_dossier_config' },
    update: { payload: updated as any },
    create: {
      key: 'frais_dossier_config',
      payload: updated as any,
    },
  })

  return updated
}
