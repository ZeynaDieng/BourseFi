import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { createError, readFormData } from 'h3'
import { requireRole } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit'
import { getUploadRoot, uploadPublicUrl } from '../../utils/upload-path'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])

  const formData = await readFormData(event)
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string | null)?.trim() || 'ecoles'

  if (!file || typeof file === 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Aucun fichier fourni.' })
  }

  // Validation du type de fichier
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
  ]

  if (!allowedMimeTypes.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Format de fichier non pris en charge. Formats acceptés : PNG, JPG, WEBP, SVG, GIF.',
    })
  }

  // Dossier cible sécurisé
  const cleanFolder = folder.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'ecoles'
  const uploadDir = join(getUploadRoot(), cleanFolder)
  await mkdir(uploadDir, { recursive: true })

  // Génération d'un nom de fichier unique
  const originalExt = extname(file.name || '').toLowerCase() || '.png'
  const ext = originalExt.startsWith('.') ? originalExt : `.${originalExt}`
  const filename = `${cleanFolder}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const targetPath = join(uploadDir, filename)

  // Écriture du fichier sur disque
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await writeFile(targetPath, buffer)

  const publicUrl = uploadPublicUrl(`${cleanFolder}/${filename}`)

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'FILE_UPLOAD',
    entityType: 'AdminUpload',
    entityId: filename,
    metadata: { folder: cleanFolder, publicUrl, size: file.size },
  })

  return {
    success: true,
    url: publicUrl,
    filename,
  }
})
