import { cookies } from 'next/headers'
import { ADMIN_COOKIE, SESSION_TTL_SECONDS, adminConfigured, checkPassword, createSessionToken } from '@/lib/server/admin-session'
import { rateLimit } from '@/lib/server/rate-limit'
import { clientIp, isSameOrigin, json, readJson } from '@/lib/server/request-guard'

/** POST /api/admin/login — şifre doğruysa imzalı, httpOnly oturum çerezi verir. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403)
  if (!adminConfigured()) return json({ ok: false, error: 'not_configured' }, 503)

  const limit = rateLimit(`login:${clientIp(req)}`, 6, 15 * 60_000)
  if (!limit.ok) return json({ ok: false, error: 'rate_limited' }, 429, { 'retry-after': String(limit.retryAfter) })

  const body = await readJson(req, 1024)
  const password = typeof body?.password === 'string' ? body.password : ''

  // Kaba kuvvet denemelerini yavaşlatmak için küçük, sabit bir gecikme
  await new Promise((r) => setTimeout(r, 400))
  if (!checkPassword(password)) return json({ ok: false, error: 'wrong_password' }, 401)

  const jar = await cookies()
  jar.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
  return json({ ok: true })
}
