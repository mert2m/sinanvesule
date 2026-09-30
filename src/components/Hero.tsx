import type { CSSProperties } from 'react'
import { invitation } from '@/content/invitation'
import { clock, dotted, longDate, weekday } from '@/lib/format'
import { CengelWord, Monogram } from './marks'

const delay = (s: number) => ({ '--d': `${s}s` }) as CSSProperties

/** Kapak: perde açıldığında görünen ilk "sayfa". Dev Ş monogramı + künye. */
export function Hero() {
  const { couple, event, venue, copy } = invitation
  return (
    <header id="kapak" className="hero">
      <div className="flex items-baseline justify-between gap-6" data-hero style={delay(0.1)}>
        <span className="t-label muted">{copy.hero.eyebrow}</span>
        <span className="t-label muted">
          <time dateTime={event.start}>{dotted(event.start)}</time>
        </span>
      </div>

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="grid place-items-center lg:place-items-end" data-hero="mono">
          <Monogram className="hero__mono" title={`${couple.first} ve ${couple.second} monogramı`} />
        </div>

        <div className="max-w-[34rem]">
          <h1 className="t-display" data-hero style={delay(0.45)}>
            {couple.first} <em>&amp;</em> <CengelWord word={couple.second} serif />
          </h1>
          <p className="t-lead mt-4" data-hero style={delay(0.6)}>
            <em>{copy.hero.lead}</em>
          </p>
          <p className="muted mt-3 max-w-[31ch] text-[1.0625rem] leading-[1.5]" data-hero style={delay(0.7)}>
            {copy.hero.note}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-[var(--rule)] pt-5" data-hero style={delay(0.8)}>
            <div>
              <dt className="t-label muted">Tarih</dt>
              <dd className="t-ui mt-2 text-[1rem] leading-[1.45]">
                {longDate(event.start)}
                <br />
                {weekday(event.start)} · {clock(event.start)}
              </dd>
            </div>
            <div>
              <dt className="t-label muted">Yer</dt>
              <dd className="t-ui mt-2 text-[1rem] leading-[1.45]">
                {venue.name}
                <br />
                {venue.area}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <a href="#davet" className="t-label muted inline-flex items-center gap-3 justify-self-start py-2" data-hero style={delay(1)}>
        {copy.hero.scroll}
        <span aria-hidden="true" className="inline-block animate-bounce [animation-duration:2.4s]">
          ↓
        </span>
      </a>
    </header>
  )
}
