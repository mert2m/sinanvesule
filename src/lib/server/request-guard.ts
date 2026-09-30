import 'server-only'
import { createHash } from 'node:crypto'

/** İstemci IP'si (Vercel x-real-ip / x-forwarded-for başlıklarını doldurur). */
export function clientIp(req: Request): string {
  const h = req.headers
  return h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

/** IP'yi tuzlanmış özet hâlinde saklarız; ham IP hiçbir yere yazılmaz. */
export function hashIp(ip: string): string {
  const salt = process.env.APPS_SCRIPT_SECRET || process.env.ADMIN_PASSWORD || 'local-dev'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16)
}

/**
 * Yalnızca kendi sayfamızdan gelen POST isteklerini kabul et.
 * Tarayıcılar POST'ta Origin başlığını her zaman gönderir.
 */
export function isSameOrigin(req: Request): boolean {
  const fetchSite = req.headers.get('sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin') return false
  const origin = req.headers.get('origin')
  if (!origin) return false
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/** Gövdeyi boyut sınırıyla okuyup JSON'a çevirir. */
export async function readJson(req: Request, maxBytes = 4096): Promise<Record<string, unknown> | null> {
  const declared = Number(req.headers.get('content-length') || 0)
  if (declared > maxBytes) return null
  const text = await req.text()
  if (text.length > maxBytes) return null
  try {
    const value: unknown = JSON.parse(text)
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/**
 * Bot sezgisi: gizli "website" alanı doluysa ya da form insanüstü bir hızla
 * (2.5 sn'den kısa) gönderildiyse. `dt` formun açık kaldığı süre (ms);
 * tarayıcıda performance.now() ile ölçülür, saat farkından etkilenmez.
 */
export function looksAutomated(body: Record<string, unknown>): boolean {
  if (typeof body.website === 'string' && body.website.trim() !== '') return true
  const dt = Number(body.dt)
  return !Number.isFinite(dt) || dt < 2500
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store', ...headers },
  })
}
