import { createReadStream, existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { sendStream, setHeader } from 'h3'
import { requireAuth } from '../../utils/auth'
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
  }
  return map[ext] ?? 'application/octet-stream'
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const rel = getRouterParam(event, 'path') ?? ''
  const segments = rel.split('/').filter(Boolean)

  if (!segments.length || segments.some((s) => s === '..' || s.includes('\0'))) {
    throw createError({ statusCode: 400, statusMessage: 'Chemin invalide.' })
  }

  await assertUploadAccess(user, segments)

  const root = normalize(getUploadRoot())
  const filePath = normalize(join(root, ...segments))

  if (!filePath.startsWith(root)) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé.' })
  }

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable.' })
  }

  setHeader(event, 'Content-Type', mimeForFile(filePath))
  setHeader(event, 'Cache-Control', 'private, max-age=3600')
  return sendStream(event, createReadStream(filePath))
})
