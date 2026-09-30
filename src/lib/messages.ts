import { invitation } from '@/content/invitation'

/** API hata kodunu misafire gösterilecek cümleye çevirir. */
export function errorMessage(code: string | undefined, status: number) {
  const e = invitation.copy.errors
  if (status === 429 || code === 'rate_limited') return e.rateLimited
  if (code === 'not_configured') return e.notConfigured
  return e.generic
}
