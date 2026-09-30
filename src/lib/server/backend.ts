import 'server-only'
import type { AdminSummary, PublicNote } from '@/lib/types'
import type { NoteInput, RsvpInput } from '@/lib/validation'
import { mockBackend } from './mock-backend'

/**
 * Google Apps Script web uygulamasına giden tek kapı.
 * Tarayıcı bu adresi hiç görmez: Tarayıcı → /api/* (Vercel) → Apps Script → Google Sheets.
 */

type Actions = {
  'rsvp.submit': { payload: RsvpInput; result: { status: 'created' | 'updated' } }
  'guestbook.submit': { payload: NoteInput; result: { status: 'published' | 'pending' | 'private' | 'duplicate'; note?: PublicNote } }
  'guestbook.list': { payload: { limit: number }; result: { notes: PublicNote[] } }
  'admin.summary': { payload: Record<string, never>; result: AdminSummary }
}

export type Action = keyof Actions

export class BackendError extends Error {
  constructor(
    public code: string,
    public status = 502,
  ) {
    super(code)
  }
}

const TIMEOUT_MS = 15_000

export function backendMode(): 'apps-script' | 'mock' | 'missing' {
  if (process.env.APPS_SCRIPT_URL && process.env.APPS_SCRIPT_SECRET) return 'apps-script'
  if (process.env.NODE_ENV !== 'production' || process.env.MOCK_BACKEND === '1') return 'mock'
  return 'missing'
}

export async function callBackend<A extends Action>(
  action: A,
  payload: Actions[A]['payload'],
  client?: { ipHash: string },
): Promise<Actions[A]['result']> {
  const mode = backendMode()
  if (mode === 'mock') return mockBackend(action, payload) as Promise<Actions[A]['result']>
  if (mode === 'missing') throw new BackendError('not_configured', 503)

  let res: Response
  try {
    res = await fetch(process.env.APPS_SCRIPT_URL!, {
      method: 'POST',
      // text/plain: Apps Script için en sorunsuz içerik türü (gövdeyi e.postData.contents'ten okur)
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: process.env.APPS_SCRIPT_SECRET, action, payload, client }),
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    console.error('[backend] Apps Script erişilemedi:', action, error)
    throw new BackendError('upstream_unreachable', 504)
  }

  const text = await res.text()
  let data: { ok?: boolean; error?: string } & Record<string, unknown>
  try {
    data = JSON.parse(text)
  } catch {
    // Genelde web uygulaması "Herkes" erişimiyle dağıtılmadığında Google bir HTML giriş sayfası döner.
    console.error('[backend] Apps Script JSON dönmedi. Dağıtım erişimi "Herkes" mi?', res.status, text.slice(0, 200))
    throw new BackendError('upstream_invalid', 502)
  }
  if (!data.ok) {
    const code = String(data.error || 'upstream_error')
    const status = code === 'rate_limited' ? 429 : code === 'invalid' ? 422 : code === 'unauthorized' ? 500 : 502
    if (code === 'unauthorized') console.error('[backend] APPS_SCRIPT_SECRET ile Apps Script API_SECRET eşleşmiyor.')
    throw new BackendError(code, status)
  }
  return data as unknown as Actions[A]['result']
}

/** API route'larında hata → kullanıcıya gösterilecek güvenli yanıt. */
export function backendErrorBody(error: unknown): { status: number; body: { ok: false; error: string } } {
  if (error instanceof BackendError) {
    const publicCode = ['rate_limited', 'not_configured', 'invalid'].includes(error.code) ? error.code : 'unavailable'
    return { status: error.status, body: { ok: false, error: publicCode } }
  }
  console.error('[backend] beklenmeyen hata', error)
  return { status: 500, body: { ok: false, error: 'unavailable' } }
}
