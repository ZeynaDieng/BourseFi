import type { BourseCard } from './bourse-serialize'

/**
 * La liste publique des bourses est la même pour tous les visiteurs : calculer les ~600 bourses prend
 * plusieurs secondes sur le serveur. Elle est donc gardée en mémoire ; au-delà de 60 s, l'ancienne liste
 * est servie tout de suite et recalculée en arrière-plan (aucun visiteur n'attend ce calcul, sauf le
 * tout premier après un redémarrage). Une modification dans l'admin apparaît en une à deux minutes.
 */
const FRESH_MS = 60 * 1000
const cache = new Map<string, { at: number; data: BourseCard[] }>()
const inFlight = new Map<string, Promise<BourseCard[]>>()

function refresh(key: string, load: () => Promise<BourseCard[]>) {
  let pending = inFlight.get(key)
  if (!pending) {
    pending = load()
      .then((data) => {
        cache.set(key, { at: Date.now(), data })
        return data
      })
      .finally(() => inFlight.delete(key))
    inFlight.set(key, pending)
  }
  return pending
}

export async function getPublicBourses(key: string, load: () => Promise<BourseCard[]>): Promise<BourseCard[]> {
  const hit = cache.get(key)
  if (!hit) return refresh(key, load)
  if (Date.now() - hit.at >= FRESH_MS) {
    // Recalcul en arrière-plan ; une erreur garde simplement l'ancienne liste
    refresh(key, load).catch((err) => console.warn('[bourses] recalcul de la liste publique échoué', err))
  }
  return hit.data
}

export function clearPublicBourses() {
  cache.clear()
  inFlight.clear()
}
