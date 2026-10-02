import { getGlobalFraisDossierConfig } from '../../utils/frais-dossier'

export default defineEventHandler(async () => {
  return await getGlobalFraisDossierConfig()
})
