import type { CSSProperties, ReactNode } from 'react'
import { Rich } from './marks'

type Props = {
  id: string
  index: number
  kicker: string
  tone?: 'paper' | 'night'
  grain?: boolean
  children: ReactNode
}

/** Her bölüm aynı yapıyı paylaşır: numara + kurdele çizgisi + etiket, ardından içerik. */
export function Section({ id, index, kicker, tone = 'paper', grain = false, children }: Props) {
  return (
    <section
      id={id}
      className={`section tone-${tone}${grain ? ' grain' : ''}`}
      aria-labelledby={`${id}-baslik`}
    >
      <div className="section__inner">
        <div className="section__head">
          <p className="kicker t-label" data-reveal>
            <span>{String(index).padStart(2, '0')}</span>
            <span className="kicker__line" aria-hidden="true" />
            <span>{kicker}</span>
          </p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

/** Bölüm başlığı: maskeden yükselerek belirir. */
export function Title({ id, text, className = '' }: { id: string; text: string; className?: string }) {
  return (
    <h2 id={id} className={`t-display ${className}`} data-reveal="mask">
      <span className="mask">
        <span>
          <Rich text={text} />
        </span>
      </span>
    </h2>
  )
}

export const delay = (s: number) => ({ '--d': `${s}s` }) as CSSProperties
