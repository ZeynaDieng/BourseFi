import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const MAX_BYTES = 5 * 1024 * 1024

/**
 * Décoder une data URL (image JPEG / PNG / WebP ou PDF), vérifier la taille.
 * Les fichiers sont stockés sous `public/uploads/candidatures/{id}/` (persistant en Node local).
 */
export function parseDocumentDataUrl(dataUrl: string): { buffer: Buffer; ext: string } {
  const m = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp)|application\/pdf);base64,(.+)$/i)
  if (!m) {
    throw new Error('Format non supporte (JPEG, PNG, WebP ou PDF uniquement).')
  }
  const mime = m[1].toLowerCase()
  let ext: string
  if (mime === 'application/pdf') {
    ext = 'pdf'
  } else {
    const sub = mime.split('/')[1]
    ext = sub === 'jpeg' || sub === 'jpg' ? 'jpg' : sub
  }
  const buf = Buffer.from(m[2], 'base64')
  if (buf.length > MAX_BYTES) {
    throw new Error('Chaque fichier doit faire au plus 5 Mo.')
  }
  if (buf.length < 80) {
    throw new Error('Fichier invalide ou trop petit.')
  }
  return { buffer: buf, ext }
}

/**
 * Enregistre le fichier d'attestation envoyé par l'admin (data URL image ou PDF)
 * sous public/uploads/candidatures/{id}/attestation.{ext} et renvoie son URL publique.
 */
export async function saveCandidatureAttestation(
  candidatureId: string,
  dataUrl: string
): Promise<{ documentUrl: string }> {
  const f = parseDocumentDataUrl(dataUrl)
  const dir = join(process.cwd(), 'public', 'uploads', 'candidatures', candidatureId)
  await mkdir(dir, { recursive: true })
  const name = `attestation.${f.ext}`
  await writeFile(join(dir, name), f.buffer)
  return { documentUrl: `/uploads/candidatures/${candidatureId}/${name}` }
}

export async function saveCandidatureIdentityImages(
  candidatureId: string,
  rectoDataUrl: string,
  versoDataUrl: string
): Promise<{ identityCardRectoUrl: string; identityCardVersoUrl: string }> {
  const r = parseDocumentDataUrl(rectoDataUrl)
  const v = parseDocumentDataUrl(versoDataUrl)
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
