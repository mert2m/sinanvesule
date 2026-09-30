/**
 * Türkçe tarih/saat biçimleri. Intl'e bağımlı olmadan, config'deki yerel
 * saatten (+03:00) doğrudan okunur; sunucu ve tarayıcıda aynı sonucu verir.
 */

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const WEEKDAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

export type LocalParts = { year: number; month: number; day: number; hour: number; minute: number; weekday: number }

export function localParts(iso: string): LocalParts {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso)
  if (!m) throw new Error(`Geçersiz tarih: ${iso}`)
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])]
  return {
    year,
    month,
    day,
    hour: m[4] ? Number(m[4]) : 0,
    minute: m[5] ? Number(m[5]) : 0,
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 17 Ekim 2026 */
export const longDate = (iso: string) => {
  const p = localParts(iso)
  return `${p.day} ${MONTHS[p.month - 1]} ${p.year}`
}
/** 10 Ekim */
export const dayMonth = (iso: string) => {
  const p = localParts(iso)
  return `${p.day} ${MONTHS[p.month - 1]}`
}
/** Ekim */
export const monthName = (iso: string) => MONTHS[localParts(iso).month - 1]
/** Cumartesi */
export const weekday = (iso: string) => WEEKDAYS[localParts(iso).weekday]
/** 14.00 */
export const clock = (iso: string) => {
  const p = localParts(iso)
  return `${pad(p.hour)}.${pad(p.minute)}`
}
/** 17.10.2026 */
export const dotted = (iso: string) => {
  const p = localParts(iso)
  return `${pad(p.day)}.${pad(p.month)}.${p.year}`
}

/** 20261017T110000Z — takvim dosyaları için UTC damgası */
export const icsStamp = (isoOrDate: string | Date) =>
  new Date(isoOrDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** 41°03′50″K · 29°09′37″D */
export function coordinates(lat: number, lng: number) {
  const dms = (v: number, pos: string, neg: string, degPad: number) => {
    const a = Math.abs(v)
    const d = Math.floor(a)
    const mFloat = (a - d) * 60
    const m = Math.floor(mFloat)
    const s = Math.round((mFloat - m) * 60)
    return `${String(d).padStart(degPad, '0')}°${pad(m)}′${pad(s)}″${v >= 0 ? pos : neg}`
  }
  return `${dms(lat, 'K', 'G', 2)} · ${dms(lng, 'D', 'B', 2)}`
}

/** Türkçe büyük harf: "Sinan" → "SİNAN" */
export const upperTr = (s: string) => s.toLocaleUpperCase('tr-TR')

/** Türkçe küçük harf: "ŞULE" → "şule" */
export const lowerTr = (s: string) => s.toLocaleLowerCase('tr-TR')

/** İlk ad: "Ayşe Yılmaz" → "Ayşe" */
export const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? full

/** "{name} geldi" gibi şablonları doldurur. */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''))
