import { join } from 'node:path'

/** Racine persistante des fichiers uploadés (CNI, attestations), hors dossier public. */
export function getUploadRoot(): string {
  const fromEnv = process.env.UPLOAD_DIR?.trim()
  if (fromEnv) return fromEnv
  return join(process.cwd(), 'uploads')
}

export function uploadPublicUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, '')
  return `/uploads/${clean}`
}
