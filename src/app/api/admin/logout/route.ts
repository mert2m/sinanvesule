import { cookies } from 'next/headers'
import { ADMIN_COOKIE } from '@/lib/server/admin-session'
import { isSameOrigin, json } from '@/lib/server/request-guard'

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403)
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
  return json({ ok: true })
}
