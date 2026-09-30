/**
 * Formlar için ortak doğrulama. Tarayıcıda anlık geri bildirim, sunucuda
 * (API route) ve Apps Script'te ise asıl güvenlik kontrolü olarak kullanılır.
 */

export const LIMITS = {
  name: 80,
  phone: 24,
  note: 500,
  noteName: 60,
} as const

/** yes: katılıyor · no: katılamıyor · maybe: belirsiz */
export type Attendance = 'yes' | 'no' | 'maybe'
export type Visibility = 'public' | 'anonymous' | 'private'

export type RsvpInput = {
  attendance: Attendance
  name: string
  phone: string
  guestCount: number
  note: string
}

export type NoteInput = {
  message: string
  name: string
  visibility: Visibility
}

export type FieldErrors<K extends string> = Partial<Record<K, string>>
export type Result<T, K extends string> = { ok: true; data: T } | { ok: false; errors: FieldErrors<K> }

// Kontrol karakterleri, sıfır genişlikli ve yön değiştiren karakterler.
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g

/** Tek satırlık metin: görünmez karakterler atılır, boşluklar sadeleşir. */
export function cleanLine(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.normalize('NFC').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim().slice(0, max)
}

/** Çok satırlı metin: en fazla iki ardışık satır sonu korunur. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(INVISIBLE, '')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max)
}

const hasLetter = (s: string) => /\p{L}/u.test(s)
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|info|biz|top|click|link|shop)\b)/i

/**
 * Telefonu E.164 biçimine çevirir: "0532 123 45 67" → "+905321234567".
 * Yurt dışı numaralar "+49…" gibi başında + ile yazılabilir.
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return null
  let e164: string
  if (trimmed.startsWith('+')) e164 = `+${digits}`
  else if (digits.startsWith('00')) e164 = `+${digits.slice(2)}`
  else if (digits.length === 11 && digits.startsWith('0')) e164 = `+90${digits.slice(1)}`
  else if (digits.length === 10 && digits.startsWith('5')) e164 = `+90${digits}`
  else if (digits.length === 12 && digits.startsWith('90')) e164 = `+${digits}`
  else e164 = `+${digits}`
  const count = e164.length - 1
  if (count < 10 || count > 15) return null
  if (e164.startsWith('+90') && count !== 12) return null
  return e164
}

/** "+905321234567" → "+90 532 123 45 67" */
export function prettyPhone(e164: string): string {
  const m = /^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(e164)
  return m ? `+90 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164
}

export type RsvpRules = { maxGuests: number; requirePhone: boolean }

export function validateRsvp(raw: unknown, rules: RsvpRules): Result<RsvpInput, keyof RsvpInput> {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const errors: FieldErrors<keyof RsvpInput> = {}

  const attendance: Attendance | null =
    input.attendance === 'yes' || input.attendance === 'no' || input.attendance === 'maybe' ? input.attendance : null
  // Belirsiz diyenler de gelebilir: telefon ve (olası) kişi sayısı onlardan da alınır
  const coming = attendance === 'yes' || attendance === 'maybe'
  if (!attendance) errors.attendance = 'Lütfen katılım durumunuzu seçin.'

  const name = cleanLine(input.name, LIMITS.name)
  if (name.length < 2 || !hasLetter(name)) errors.name = 'Lütfen adınızı ve soyadınızı yazın.'
  else if (LINK.test(name)) errors.name = 'Lütfen yalnızca adınızı yazın.'

  const phoneRaw = cleanLine(input.phone, LIMITS.phone)
  let phone = ''
  if (phoneRaw) {
    const normalized = normalizePhone(phoneRaw)
    if (!normalized) errors.phone = 'Telefon numarası geçerli görünmüyor.'
    else phone = normalized
  } else if (coming && rules.requirePhone) {
    errors.phone = 'Size ulaşabilmemiz için telefon numaranızı yazın.'
  }

  let guestCount = 0
  if (coming) {
    const n = Number(input.guestCount)
    if (!Number.isInteger(n) || n < 1 || n > rules.maxGuests) {
      errors.guestCount = `Kişi sayısı 1 ile ${rules.maxGuests} arasında olmalı.`
    } else guestCount = n
  }

  const note = cleanText(input.note, LIMITS.note)
  if (LINK.test(note)) errors.note = 'Notlara bağlantı eklenemiyor.'

  if (Object.keys(errors).length || !attendance) return { ok: false, errors }
  return { ok: true, data: { attendance, name, phone, guestCount, note } }
}

export function validateNote(raw: unknown, maxLength: number): Result<NoteInput, keyof NoteInput> {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const errors: FieldErrors<keyof NoteInput> = {}

  const message = cleanText(input.message, maxLength)
  if (message.length < 2 || !hasLetter(message)) errors.message = 'Birkaç kelime yazın, yeter.'
  else if (LINK.test(message)) errors.message = 'Notlara bağlantı eklenemiyor.'

  const visibility: Visibility | null =
    input.visibility === 'public' || input.visibility === 'anonymous' || input.visibility === 'private'
      ? input.visibility
      : null
  if (!visibility) errors.visibility = 'Notunuzun nasıl görüneceğini seçin.'

  const name = cleanLine(input.name, LIMITS.noteName)
  if (name && (LINK.test(name) || !hasLetter(name))) errors.name = 'Lütfen yalnızca adınızı yazın.'
  if (visibility === 'public' && !name) errors.name = 'Adınızı yazın ya da isimsiz paylaşın.'

  if (Object.keys(errors).length || !visibility) return { ok: false, errors }
  return { ok: true, data: { message, name, visibility } }
}
