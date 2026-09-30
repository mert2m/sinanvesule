import { invitation } from '@/content/invitation'
import { backendErrorBody, callBackend } from '@/lib/server/backend'
import { rateLimit } from '@/lib/server/rate-limit'
import { clientIp, hashIp, isSameOrigin, json, looksAutomated, readJson } from '@/lib/server/request-guard'
import { validateNote } from '@/lib/validation'

// Apps Script bazen "soğuk" başlar (1–4 sn); güvenli pay
export const maxDuration = 30

/**
 * GET /api/guestbook — herkese açık notlar.
 * Vercel CDN'inde 30 sn önbelleklenir: yüzlerce misafir sayfayı açsa da
 * Apps Script'e dakikada en fazla birkaç istek gider.
 */
export async function GET() {
  try {
    const { notes } = await callBackend('guestbook.list', { limit: 80 })
    return json({ ok: true, notes }, 200, {
      'cache-control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300',
    })
  } catch (error) {
    console.error('[guestbook] liste alınamadı', error)
    return json({ ok: false, notes: [] }, 200)
  }
}

/** POST /api/guestbook — yeni not. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403)

  const body = await readJson(req)
  if (!body) return json({ ok: false, error: 'bad_request' }, 400)
  if (looksAutomated(body)) return json({ ok: true, status: 'pending' })

  const result = validateNote(body, invitation.guestbook.maxLength)
  if (!result.ok) return json({ ok: false, error: 'invalid', fields: result.errors }, 422)

  const ip = clientIp(req)
  const limit = rateLimit(`note:${ip}`, 12, 10 * 60_000)
  if (!limit.ok) return json({ ok: false, error: 'rate_limited' }, 429, { 'retry-after': String(limit.retryAfter) })

  try {
    const response = await callBackend('guestbook.submit', result.data, { ipHash: hashIp(ip) })
    return json({ ok: true, status: response.status, note: response.note })
  } catch (error) {
    const { status, body: payload } = backendErrorBody(error)
    return json(payload, status)
  }
}
