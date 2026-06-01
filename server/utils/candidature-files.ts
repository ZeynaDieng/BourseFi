import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const MAX_BYTES = 5 * 1024 * 1024

/**
 * Décoder une data URL image (JPEG / PNG / WebP), vérifier la taille.
 * Les fichiers sont stockés sous `public/uploads/candidatures/{id}/` (persistant en Node local).
 */
export function parseImageDataUrl(dataUrl: string): { buffer: Buffer; ext: string } {
  const m = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i)
  if (!m) {
    throw new Error('Format d image non supporte (JPEG, PNG ou WebP uniquement).')
  }
  const extRaw = m[1].toLowerCase()
  const ext = extRaw === 'jpeg' || extRaw === 'jpg' ? 'jpg' : extRaw
  const buf = Buffer.from(m[2], 'base64')
  if (buf.length > MAX_BYTES) {
    throw new Error('Chaque photo doit faire au plus 5 Mo.')
  }
  if (buf.length < 80) {
    throw new Error('Image invalide ou trop petite.')
  }
  return { buffer: buf, ext }
}

export async function saveCandidatureIdentityImages(
  candidatureId: string,
  rectoDataUrl: string,
  versoDataUrl: string
): Promise<{ identityCardRectoUrl: string; identityCardVersoUrl: string }> {
  const r = parseImageDataUrl(rectoDataUrl)
  const v = parseImageDataUrl(versoDataUrl)
  const dir = join(process.cwd(), 'public', 'uploads', 'candidatures', candidatureId)
  await mkdir(dir, { recursive: true })
  const rectoName = `recto.${r.ext}`
  const versoName = `verso.${v.ext}`
  await writeFile(join(dir, rectoName), r.buffer)
  await writeFile(join(dir, versoName), v.buffer)
  return {
    identityCardRectoUrl: `/uploads/candidatures/${candidatureId}/${rectoName}`,
    identityCardVersoUrl: `/uploads/candidatures/${candidatureId}/${versoName}`
  }
}
