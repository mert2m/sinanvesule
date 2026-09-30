import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Admin oturumu: şifre ADMIN_PASSWORD ortam değişkeninde durur (kodda değil).
 * Girişte imzalı bir çerez (httpOnly) verilir. Şifre değişirse eski
 * oturumların hepsi otomatik geçersiz olur, çünkü imza anahtarı şifreden türetilir.
 */

export const ADMIN_COOKIE = 'svs_admin'
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

const sha256 = (s: string) => createHash('sha256').update(s).digest()

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 6)
}

function signingKey(): Buffer {
  const password = process.env.ADMIN_PASSWORD ?? ''
  const extra = process.env.SESSION_SECRET || process.env.APPS_SCRIPT_SECRET || ''
  return sha256(`svs-admin-session:${password}:${extra}`)
}

const sign = (value: string) => createHmac('sha256', signingKey()).update(value).digest('base64url')

export function checkPassword(input: string): boolean {
  if (!adminConfigured()) return false
  return timingSafeEqual(sha256(input), sha256(process.env.ADMIN_PASSWORD!))
}

export function createSessionToken(): string {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  return `${expires}.${sign(String(expires))}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !adminConfigured()) return false
  const [expires, signature] = token.split('.')
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false
  const expected = Buffer.from(sign(expires))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
