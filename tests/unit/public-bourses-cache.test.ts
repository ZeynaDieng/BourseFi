/** Mémoire de la liste publique des bourses : personne n'attend le recalcul, sauf au tout premier appel. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getPublicBourses, clearPublicBourses } from '../../server/utils/public-bourses-cache'
import type { BourseCard } from '../../server/utils/bourse-serialize'

const list = (titre: string) => [{ titre } as unknown as BourseCard]

describe('liste publique des bourses en mémoire', () => {
  beforeEach(() => {
    clearPublicBourses()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('premier appel : calcul attendu, puis servi depuis la mémoire', async () => {
    const load = vi.fn(async () => list('v1'))
    expect(await getPublicBourses('k', load)).toEqual(list('v1'))
    expect(await getPublicBourses('k', load)).toEqual(list('v1'))
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('appels simultanés au démarrage : un seul calcul', async () => {
    const load = vi.fn(async () => list('v1'))
    await Promise.all([getPublicBourses('k', load), getPublicBourses('k', load), getPublicBourses('k', load)])
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('après 60 s : l’ancienne liste est servie tout de suite et recalculée en arrière-plan', async () => {
    await getPublicBourses('k', async () => list('v1'))
    vi.advanceTimersByTime(61_000)

    let release!: () => void
    const slow = vi.fn(() => new Promise<BourseCard[]>((r) => { release = () => r(list('v2')) }))
    expect(await getPublicBourses('k', slow)).toEqual(list('v1')) // pas d'attente
    expect(await getPublicBourses('k', slow)).toEqual(list('v1'))
    expect(slow).toHaveBeenCalledTimes(1) // un seul recalcul en cours

    release()
    await vi.waitFor(async () => expect(await getPublicBourses('k', slow)).toEqual(list('v2')))
  })

  it('un recalcul en échec garde l’ancienne liste', async () => {
    await getPublicBourses('k', async () => list('v1'))
    vi.advanceTimersByTime(61_000)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await getPublicBourses('k', async () => { throw new Error('base indisponible') })).toEqual(list('v1'))
    await vi.waitFor(() => expect(warn).toHaveBeenCalled())
    expect(await getPublicBourses('k', async () => list('v3'))).toEqual(list('v1'))
    warn.mockRestore()
  })
})
