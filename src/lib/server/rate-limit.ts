import 'server-only'

/**
 * Basit, bellek içi kayan pencere hız sınırı. Vercel'de her sunucusuz örneğin
 * kendi belleği vardır; bu yüzden asıl kalıcı sınır Apps Script tarafındaki
 * CacheService sınırıdır. Buradaki ilk savunma hattıdır.
 */
const hits = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return { ok: false as const, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) }
  }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, list] of hits) if (!list.some((t) => now - t < windowMs)) hits.delete(k)
  }
  return { ok: true as const, retryAfter: 0 }
}
