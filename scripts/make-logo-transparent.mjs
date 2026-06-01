/**
 * Rend transparent les pixels proches de la couleur des coins (fond noir exporté).
 * Usage : node scripts/make-logo-transparent.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const file = path.join(root, 'public/boursefi-logo.png')

const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

const w = info.width
const h = info.height
const c = info.channels
if (c !== 4) {
  console.error('Attendu RGBA, obtenu channels=', c)
  process.exit(1)
}

function px(buf, x, y) {
  const i = (w * y + x) * c
  return { r: buf[i], g: buf[i + 1], b: buf[i + 2] }
}

const corners = [px(data, 0, 0), px(data, w - 1, 0), px(data, 0, h - 1), px(data, w - 1, h - 1)]

function minDistToCorners(r, g, b) {
  let dMin = Infinity
  for (const p of corners) {
    const d = Math.hypot(r - p.r, g - p.g, b - p.b)
    if (d < dMin) dMin = d
  }
  return dMin
}

const fuzz = 42
const out = Buffer.from(data)

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (w * y + x) * c
    const r = out[i]
    const gch = out[i + 1]
    const b = out[i + 2]
    if (minDistToCorners(r, gch, b) < fuzz) {
      out[i + 3] = 0
    }
  }
}

await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toFile(file)

console.log('OK — fond rendu transparent :', file)
