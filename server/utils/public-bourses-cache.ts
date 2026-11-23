import type { BourseCard } from './bourse-serialize'

/**
 * La liste publique des bourses est la même pour tous les visiteurs : gardée 60 s en mémoire au lieu de
 * recalculer les ~600 bourses à chaque page vue. Une modification dans l'admin apparaît sous une minute.
 */
const TTL_MS = 60 * 1000
const cache = new Map<string, { at: number; data: BourseCard[] }>()

export function getPublicBourses(key: string): BourseCard[] | null {
  const hit = cache.get(key)
  return hit && Date.now() - hit.at < TTL_MS ? hit.data : null
}

export function setPublicBourses(key: string, data: BourseCard[]) {
  cache.set(key, { at: Date.now(), data })
}

export function clearPublicBourses() {
  cache.clear()
}
