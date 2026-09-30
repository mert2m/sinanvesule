'use client'

import { useEffect, useRef, useState } from 'react'
import { invitation } from '@/content/invitation'

type Parts = { days: number; hours: number; minutes: number; seconds: number }

const pad = (n: number) => String(n).padStart(2, '0')
/** Türkiye saatine göre YYYY-AA-GG */
const istanbulDay = (ms: number) => new Date(ms + 3 * 3600_000).toISOString().slice(0, 10)

function split(ms: number): Parts {
  const s = Math.floor(ms / 1000)
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 }
}

/** "Kurdeleye kalan" — yalnızca ekrandayken saniyede bir güncellenir. */
export function Countdown() {
  const { event, copy } = invitation
  const target = Date.parse(event.start)
  const [now, setNow] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined
    const tick = () => setNow(Date.now())
    const start = () => {
      if (timer) return
      tick()
      timer = setInterval(tick, 1000)
    }
    const stop = () => {
      if (timer) clearInterval(timer)
      timer = undefined
    }
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    if (ref.current) io.observe(ref.current)
    const first = setTimeout(tick, 0)
    return () => {
      clearTimeout(first)
      io.disconnect()
      stop()
    }
  }, [])

  const units = copy.date.units
  const remaining = now === null ? null : target - now

  if (remaining !== null && remaining <= 0) {
    const sameDay = istanbulDay(now!) === event.start.slice(0, 10)
    return (
      <div ref={ref} className="count-done border-y border-[var(--rule)] py-6">
        <p className="t-lead">
          <em>{sameDay ? copy.date.today : copy.date.after}</em>
        </p>
      </div>
    )
  }

  const parts = remaining === null ? null : split(remaining)
  const cells: [keyof Parts, string][] = [
    ['days', units.days],
    ['hours', units.hours],
    ['minutes', units.minutes],
    ['seconds', units.seconds],
  ]

  return (
    <div ref={ref} className="count" role="timer" aria-live="off">
      {cells.map(([key, label]) => (
        <div key={key} className="count__cell">
          <span className="count__num">
            {parts ? <span key={parts[key]}>{key === 'days' ? parts[key] : pad(parts[key])}</span> : <span>––</span>}
          </span>
          <span className="t-label muted">{label}</span>
        </div>
      ))}
    </div>
  )
}
