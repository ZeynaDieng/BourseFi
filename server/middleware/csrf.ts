import { getCsrfToken } from '../utils/csrf'

export default defineEventHandler((event) => {
  // On génère/récupère le token CSRF sur les requêtes GET pour que le cookie soit toujours disponible pour le client.
  const path = event.path || ''

  // Éviter de s'exécuter sur les fichiers statiques et les assets internes Nuxt
  if (
    path.startsWith('/_nuxt/') ||
    path.startsWith('/__nuxt_error') ||
    path.includes('.')
  ) {
    return
  }

  const method = event.node.req.method
  if (method === 'GET') {
    getCsrfToken(event)
  }
})
