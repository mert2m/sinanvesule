'use client'

import { useSyncExternalStore } from 'react'
import { RSVP_STORAGE_KEY } from './storage'

const never = () => () => {}

/** Sunucuda false; tarayıcıda verilen andan sonra mıyız? */
export function useIsAfter(ms: number): boolean {
  return useSyncExternalStore(
    never,
    () => Date.now() > ms,
    () => false,
  )
}

function subscribeStored(callback: () => void) {
  window.addEventListener('storage', callback)
  document.addEventListener('svs:rsvp', callback)
  return () => {
    window.removeEventListener('storage', callback)
    document.removeEventListener('svs:rsvp', callback)
  }
}

/** Bu cihazda kayıtlı RSVP'nin ham JSON'u (hidrasyon uyumlu). */
export function useStoredRsvpRaw(): string | null {
  return useSyncExternalStore(
    subscribeStored,
    () => {
      try {
        return localStorage.getItem(RSVP_STORAGE_KEY)
      } catch {
        return null
      }
    },
    () => null,
  )
}
