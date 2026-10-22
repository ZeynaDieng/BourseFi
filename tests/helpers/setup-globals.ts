/**
 * Reproduit les auto-imports Nitro/h3 utilisés par les handlers `server/api/**`
 * afin de pouvoir les exécuter dans Vitest sans démarrer Nuxt.
 */
import * as h3 from 'h3'

const g = globalThis as Record<string, unknown>
for (const name of [
  'defineEventHandler',
  'readBody',
  'getQuery',
  'getRouterParam',
  'createError',
  'getCookie',
  'setCookie',
  'deleteCookie',
  'getRequestIP',
  'setResponseStatus',
  'getHeader',
] as const) {
  g[name] = (h3 as Record<string, unknown>)[name]
}
