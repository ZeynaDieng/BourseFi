import { toRaw } from 'vue'

/** Clone JSON-serializable data (safe for Vue reactive proxies). */
export function cloneJson<T>(value: T): T {
  const raw = toRaw(value)
  return JSON.parse(JSON.stringify(raw ?? null)) as T
}
