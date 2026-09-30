'use client'

import { useEffect } from 'react'

/**
 * Hidrasyondan sonra ekranın altında kalan [data-reveal] öğelerini "out"
 * işaretler ve görüş alanına girince "in" yapar. JS yoksa ya da hareket
 * azaltılmışsa hiçbir şey gizlenmez.
 */
export function RevealObserver() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.state = 'in'
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    )

    const fold = window.innerHeight * 0.92
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.dataset.state === 'in') return
      // Efekt yeniden çalışırsa (ör. geliştirme modu) önceden "out" işaretlenenleri de yeniden gözle
      if (el.dataset.state === 'out' || el.getBoundingClientRect().top > fold) {
        el.dataset.state = 'out'
        io.observe(el)
      }
    })
    return () => io.disconnect()
  }, [])

  return null
}
