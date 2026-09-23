import { defineNitroPlugin } from 'nitropack/runtime'
import { runAutoRelanceEngine } from '../utils/auto-relance-engine'

export default defineNitroPlugin(() => {
  console.log('🤖 [BourseFi Auto-Relance Engine] Nitro Plugin démarré en arrière-plan.')

  async function runEngineBackground() {
    try {
      const res = await runAutoRelanceEngine({ force: false, actorRole: 'CRON_SYSTEM' })
      if (res.processed > 0) {
        console.log(`🤖 [BourseFi Auto-Relance Engine] Relance effectuée pour ${res.processed} destinataire(s).`)
      }
    } catch (err) {
      console.error('❌ Erreur Moteur Auto-Relance en arrière-plan:', err)
    }
  }

  // Démarrage immédiat après 15 secondes
  setTimeout(() => {
    runEngineBackground()
  }, 15000)

  // Exécution automatique toutes les 15 minutes en tâche de fond (100% autonome)
  const INTERVAL_MS = 15 * 60 * 1000
  setInterval(() => {
    runEngineBackground()
  }, INTERVAL_MS)

  console.log('⏱️ [BourseFi Auto-Relance Engine] Cron planifié toutes les 15 minutes (Totalement autonome).')
})
