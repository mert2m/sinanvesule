'use client'

import { useEffect, useState } from 'react'
import { invitation } from '@/content/invitation'
import { RSVP_STORAGE_KEY } from './storage'

/**
 * Kapaktan sonra beliren küçük "Katılımınızı bildirin" kısayolu.
 * Katılım bölümüne gelince, geçince ya da yanıt verildikten sonra kaybolur.
 */
export function FloatingRsvp() {
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const hero = document.getElementById('kapak')
    const rsvp = document.getElementById('katilim')
    if (!hero || !rsvp || !invitation.rsvp.enabled) return

    let pastHero = false
    let reachedRsvp = false
    let answered = false
    try {
      answered = Boolean(localStorage.getItem(RSVP_STORAGE_KEY))
    } catch {}

    const update = () => setHidden(!pastHero || reachedRsvp || answered)
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0
        if (entry.target === rsvp) reachedRsvp = entry.isIntersecting || entry.boundingClientRect.top < 0
      }
      update()
    })
    io.observe(hero)
    io.observe(rsvp)

    const onAnswered = () => {
      answered = true
      update()
    }
    document.addEventListener('svs:rsvp', onAnswered)
    return () => {
      io.disconnect()
      document.removeEventListener('svs:rsvp', onAnswered)
    }
  }, [])

  return (
    <a href="#katilim" className="float-pill t-label" data-hidden={hidden} aria-hidden={hidden} tabIndex={hidden ? -1 : 0}>
      {invitation.copy.rsvp.floating}
      <span aria-hidden="true">↓</span>
    </a>
  )
}
