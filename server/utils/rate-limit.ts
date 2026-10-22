import type { H3Event } from 'h3'
import { createError, getRequestIP } from 'h3'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function pruneExpired(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key)
  }
}

export function rateLimit(event: H3Event, scope: string, limit: number, windowMs: number) {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  hit(`${scope}:${ip}`, limit, windowMs)
}

/**
 * Limite indépendante de l'IP (ex. par adresse email ciblée) : l'en-tête
 * X-Forwarded-For étant falsifiable, la limite par IP seule est contournable.
 */
export function rateLimitKey(scope: string, key: string, limit: number, windowMs: number) {
  hit(`${scope}:key:${key.trim().toLowerCase()}`, limit, windowMs)
}

function hit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  pruneExpired(now)

  let bucket = buckets.get(key)
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }

  bucket.count += 1
  if (bucket.count > limit) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Trop de tentatives. Réessayez dans quelques minutes.',
    })
  }
}

