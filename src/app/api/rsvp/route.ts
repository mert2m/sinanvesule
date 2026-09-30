import { invitation } from '@/content/invitation'
import { backendErrorBody, callBackend } from '@/lib/server/backend'
import { rateLimit } from '@/lib/server/rate-limit'
import { clientIp, hashIp, isSameOrigin, json, looksAutomated, readJson } from '@/lib/server/request-guard'
import { validateRsvp } from '@/lib/validation'

// Apps Script bazen "soğuk" başlar (1–4 sn); güvenli pay
export const maxDuration = 30

/** POST /api/rsvp — katılım yanıtı (aynı kişi tekrar gönderirse kaydı güncellenir). */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403)

  const body = await readJson(req)
  if (!body) return json({ ok: false, error: 'bad_request' }, 400)

  // Botlara başarılıymış gibi davran, ama hiçbir şey yazma.
  if (looksAutomated(body)) return json({ ok: true, status: 'created' })

  const { rsvp } = invitation
  if (rsvp.closeAfterDeadline && Date.now() > Date.parse(`${rsvp.deadline}T23:59:59+03:00`)) {
    return json({ ok: false, error: 'closed' }, 403)
  }

  const result = validateRsvp(body, rsvp)
  if (!result.ok) return json({ ok: false, error: 'invalid', fields: result.errors }, 422)

  // Mobil operatörler birçok kullanıcıyı aynı IP'nin arkasında toplar (CGNAT); sınır cömert tutuldu.
  const ip = clientIp(req)
  const limit = rateLimit(`rsvp:${ip}`, 20, 10 * 60_000)
  if (!limit.ok) return json({ ok: false, error: 'rate_limited' }, 429, { 'retry-after': String(limit.retryAfter) })

  try {
    const { status } = await callBackend('rsvp.submit', result.data, { ipHash: hashIp(ip) })
    return json({ ok: true, status })
  } catch (error) {
    const { status, body: payload } = backendErrorBody(error)
    return json(payload, status)
  }
}
