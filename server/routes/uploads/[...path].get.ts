import { createReadStream, existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { sendStream, setHeader } from 'h3'
import { getSessionUser } from '../../utils/auth'
import { assertUploadAccess } from '../../utils/upload-access'
import { getUploadRoot } from '../../utils/upload-path'

function mimeForFile(filePath: string): string {
  const ext = extname(filePath).slice(1).toLowerCase()
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    gif: 'image/gif',
  }
  return map[ext] ?? 'application/octet-stream'
}

export default defineEventHandler(async (event) => {
  const rel = getRouterParam(event, 'path') ?? ''
  const segments = rel.split('/').filter(Boolean)

  if (!segments.length || segments.some((s) => s === '..' || s.includes('\0'))) {
    throw createError({ statusCode: 400, statusMessage: 'Chemin invalide.' })
  }

  const user = await getSessionUser(event)
  await assertUploadAccess(user, segments)

  const root = normalize(getUploadRoot())
  const filePath = normalize(join(root, ...segments))

  if (!filePath.startsWith(root)) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé.' })
  }

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable.' })
  }

  const [kind] = segments
  const isPublicKind = ['ecoles', 'public', 'testimonials', 'metiers'].includes(kind)
  setHeader(event, 'Cache-Control', isPublicKind ? 'public, max-age=86400' : 'private, max-age=3600')
  return sendStream(event, createReadStream(filePath))
})
