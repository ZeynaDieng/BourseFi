import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getUploadRoot, uploadPublicUrl } from './upload-path'

const MAX_BYTES = 5 * 1024 * 1024

/**
 * Décoder une data URL (image JPEG / PNG / WebP ou PDF), vérifier la taille.
 * Les fichiers sont stockés sous `{UPLOAD_DIR}/candidatures/{id}/` (persistant, hors public).
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
  const dir = join(getUploadRoot(), 'candidatures', candidatureId)
  await mkdir(dir, { recursive: true })
  const name = `attestation.${f.ext}`
  await writeFile(join(dir, name), f.buffer)
  return { documentUrl: uploadPublicUrl(`candidatures/${candidatureId}/${name}`) }
}

/**
 * Enregistre une face de la CNI au niveau du COMPTE candidat
 * sous public/uploads/users/{userId}/cni-{side}.{ext} et renvoie son URL publique.
 * Réutilisable pour toutes les candidatures du même utilisateur.
 */
export async function saveUserIdentityImage(
  userId: string,
  side: 'recto' | 'verso',
  dataUrl: string
): Promise<string> {
  const f = parseDocumentDataUrl(dataUrl)
  const dir = join(getUploadRoot(), 'users', userId)
  await mkdir(dir, { recursive: true })
  const name = `cni-${side}.${f.ext}`
  await writeFile(join(dir, name), f.buffer)
  return uploadPublicUrl(`users/${userId}/${name}`)
}

export async function saveCandidatureIdentityImages(
  candidatureId: string,
  rectoDataUrl: string,
  versoDataUrl: string
): Promise<{ identityCardRectoUrl: string; identityCardVersoUrl: string }> {
  const r = parseDocumentDataUrl(rectoDataUrl)
  const v = parseDocumentDataUrl(versoDataUrl)
  const dir = join(getUploadRoot(), 'candidatures', candidatureId)
  await mkdir(dir, { recursive: true })
  const rectoName = `recto.${r.ext}`
  const versoName = `verso.${v.ext}`
  await writeFile(join(dir, rectoName), r.buffer)
  await writeFile(join(dir, versoName), v.buffer)
  return {
    identityCardRectoUrl: uploadPublicUrl(`candidatures/${candidatureId}/${rectoName}`),
    identityCardVersoUrl: uploadPublicUrl(`candidatures/${candidatureId}/${versoName}`),
  }
}
