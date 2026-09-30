'use client'

import { useEffect, useRef, useState } from 'react'
import { invitation } from '@/content/invitation'

/**
 * Müzik kapalı başlar (tarayıcıların otomatik oynatma kuralları gereği).
 * Dosya ancak düğmeye basılınca indirilir; sayfa açılışını yavaşlatmaz.
 */
export function MusicToggle() {
  const { music, copy } = invitation
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  function ensure() {
    if (!audio.current) {
      const a = new Audio(music.src)
      a.loop = true
      a.preload = 'auto'
      a.volume = music.volume
      a.addEventListener('pause', () => setPlaying(false))
      a.addEventListener('play', () => setPlaying(true))
      audio.current = a
    }
    return audio.current
  }

  function toggle() {
    const a = ensure()
    if (a.paused) a.play().catch(() => setPlaying(false))
    else a.pause()
  }

  useEffect(() => {
    const onEnter = () => {
      if (music.startOnEnter) ensure().play().catch(() => {})
    }
    const onHide = () => {
      if (document.hidden) audio.current?.pause()
    }
    document.addEventListener('svs:enter', onEnter)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      document.removeEventListener('svs:enter', onEnter)
      document.removeEventListener('visibilitychange', onHide)
      audio.current?.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <button
      type="button"
      className="sound"
      aria-pressed={playing}
      aria-label={playing ? copy.music.off : copy.music.on}
      title={playing ? copy.music.off : copy.music.on}
      onClick={toggle}
    >
      <span className="sound__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    </button>
  )
}
