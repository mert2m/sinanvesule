import type { Attendance } from '@/lib/validation'

/** Bu cihazdan verilen son RSVP yanıtı (yalnızca misafirin kendi tarayıcısında durur). */
export const RSVP_STORAGE_KEY = 'svs-rsvp'

export type StoredRsvp = {
  attendance: Attendance
  name: string
  phone: string
  guestCount: number
  at: string
}

export function readStoredRsvp(): StoredRsvp | null {
  try {
    const raw = localStorage.getItem(RSVP_STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as StoredRsvp
    return value && (value.attendance === 'yes' || value.attendance === 'no') ? value : null
  } catch {
    return null
  }
}

export function writeStoredRsvp(value: StoredRsvp) {
  try {
    localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(value))
  } catch {}
}
