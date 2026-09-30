import { invitation } from '@/content/invitation'
import { appleMapsUrl, googleCalendarUrl } from '@/lib/calendar'
import { clock, coordinates, dayMonth, dotted, fill, localParts, monthName, upperTr, weekday } from '@/lib/format'
import { siteUrl } from '@/lib/site'
import { CengelMark, CengelWord, Rich } from './marks'
import { Section, Title, delay } from './Section'
import { CopyButton } from './client/CopyButton'
import { Countdown } from './client/Countdown'
import { Guestbook } from './client/Guestbook'
import { RsvpForm } from './client/RsvpForm'

const { couple, event, venue, program, copy } = invitation

/* 01 — Davet */
export function InvitationSection() {
  const c = copy.invitation
  return (
    <Section id="davet" index={1} kicker={c.kicker}>
      <Title id="davet-baslik" text={c.title} />
      <div className="mt-9 grid max-w-[34rem] gap-5">
        {c.paragraphs.map((p, i) => (
          <p key={i} className="t-lead" data-reveal style={delay(i * 0.08)}>
            <Rich text={p} />
          </p>
        ))}
      </div>
      <p className="t-body mt-10" data-reveal>
        <em>
          — {couple.first} &amp; <CengelWord word={couple.second} serif />
        </em>
      </p>
      {couple.hosts ? (
        <p className="t-label muted mt-3" data-reveal>
          {couple.hosts}
        </p>
      ) : null}
    </Section>
  )
}

/* 02 — Tarih */
export function DateSection() {
  const c = copy.date
  const { day, year } = localParts(event.start)
  return (
    <Section id="tarih" index={2} kicker={c.kicker}>
      <h2 id="tarih-baslik" className="flex flex-wrap items-end gap-x-5 gap-y-2" data-reveal>
        <span className="t-titling text-[clamp(9.5rem,50vw,17rem)] leading-[0.78]" aria-hidden="true">
          {day}
        </span>
        <span className="grid gap-2 pb-[0.35rem]">
          <span className="t-display text-[clamp(2.4rem,10vw,3.75rem)]">
            {monthName(event.start)} <span className="muted">{year}</span>
          </span>
          <span className="t-ui text-[1.0625rem]">
            {weekday(event.start)} · {clock(event.start)}
          </span>
        </span>
        <span className="sr-only">{`${day} ${monthName(event.start)} ${year}, ${weekday(event.start)}, saat ${clock(event.start)}`}</span>
      </h2>

      <div className="mt-14 max-w-[40rem]" data-reveal>
        <p className="t-label muted mb-4">{c.countdownLabel}</p>
        <Countdown />
      </div>

      <div className="mt-9" data-reveal>
        <p className="t-label muted">{c.calendar}</p>
        <p className="t-ui mt-3 flex flex-wrap gap-x-7 gap-y-3 text-[1rem]">
          <a href="/nisan.ics" className="link">
            {c.calendarApple} ↓
          </a>
          <a href={googleCalendarUrl(siteUrl().href)} className="link" target="_blank" rel="noopener noreferrer">
            {c.calendarGoogle} ↗
          </a>
        </p>
      </div>
    </Section>
  )
}

/* 03 — Mekan */
export function VenueSection() {
  const c = copy.venue
  return (
    <Section id="mekan" index={3} kicker={c.kicker}>
      <Title id="mekan-baslik" text={venue.name} />
      <p className="t-lead muted mt-3" data-reveal>
        <em>{venue.area}</em>
      </p>

      <address className="t-body mt-9 not-italic" data-reveal>
        {venue.addressLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>
      <p className="t-label muted mt-4" data-reveal>
        {coordinates(venue.coordinates.lat, venue.coordinates.lng)}
      </p>

      <div className="mt-10 grid max-w-[26rem] gap-4" data-reveal>
        <a href={venue.googleMapsUrl} className="btn btn--solid" target="_blank" rel="noopener noreferrer">
          <span>{c.cta}</span>
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <p className="t-ui muted -mt-1 text-[0.8125rem]">{c.ctaHint}</p>
        <p className="t-ui flex flex-wrap gap-x-6 gap-y-2">
          <a href={appleMapsUrl()} className="link" target="_blank" rel="noopener noreferrer">
            {c.appleMaps} ↗
          </a>
          <CopyButton text={venue.address} label={c.copy} done={c.copied} />
        </p>
      </div>
    </Section>
  )
}

/* 04 — Akış */
export function ProgramSection() {
  const c = copy.program
  return (
    <Section id="akis" index={4} kicker={c.kicker}>
      <Title id="akis-baslik" text={c.title} />
      <ol className="mt-12 max-w-[40rem] border-b border-[var(--rule)]">
        {program.map((item, i) => (
          <li
            key={`${item.time}-${item.title}`}
            className="grid grid-cols-[6.25rem_minmax(0,1fr)] gap-x-5 border-t border-[var(--rule)] py-6 sm:grid-cols-[8.5rem_minmax(0,1fr)]"
            data-reveal
            style={delay(i * 0.07)}
          >
            <span className="t-titling pt-1 text-[clamp(2.4rem,11vw,3.4rem)] leading-[0.85]">{item.time}</span>
            <div>
              <p className="t-ui flex items-center gap-2.5 text-[1.0625rem] font-medium">
                {item.highlight ? <CengelMark className="w-2.5 flex-none translate-y-[0.1em] text-[var(--accent)]" /> : null}
                {item.title}
              </p>
              {item.text ? <p className="t-body muted mt-1.5">{item.text}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/* 05 — Katılım */
export function RsvpSection() {
  const c = copy.rsvp
  if (!invitation.rsvp.enabled) return null
  return (
    <Section id="katilim" index={5} kicker={c.kicker}>
      <Title id="katilim-baslik" text={c.title} />
      <p className="t-body muted mt-5 max-w-[34rem]" data-reveal>
        {fill(c.intro, { deadline: dayMonth(invitation.rsvp.deadline) })}
      </p>
      <RsvpForm />
    </Section>
  )
}

/* 06 — Notlar */
export function NotesSection() {
  const c = copy.guestbook
  if (!invitation.guestbook.enabled) return null
  return (
    <Section id="notlar" index={6} kicker={c.kicker}>
      <Title id="notlar-baslik" text={c.title} />
      <p className="t-body muted mt-5 max-w-[34rem]" data-reveal>
        {c.intro}
      </p>
      <Guestbook />
    </Section>
  )
}

/* Kapanış */
export function Closing() {
  const c = copy.closing
  return (
    <footer
      id="kapanis"
      className="tone-night grain relative px-[var(--gutter)] pt-28 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.5rem))] md:pt-40"
    >
      <div className="mx-auto grid max-w-[74rem] justify-items-center text-center">
        <p className="t-titling flex flex-col items-center text-[clamp(5rem,33vw,11.5rem)] leading-[0.82]" data-reveal>
          <span>{upperTr(couple.first)}</span>
          <span className="t-italic my-[0.18em] font-serif text-[0.26em] leading-none text-[var(--color-bone-2)]">&amp;</span>
          <span>
            <CengelWord word={upperTr(couple.second)} />
          </span>
        </p>
        <p className="t-label mt-9 tracking-[0.42em]" data-reveal>
          <time dateTime={event.start}>{dotted(event.start)}</time>
        </p>
        <p className="t-lead mt-5 max-w-[20ch]" data-reveal>
          <em>{c.line}</em>
        </p>

        <hr className="rule mt-20 w-full" />
        <div className="flex w-full flex-col items-center justify-between gap-5 pt-6 text-center sm:flex-row sm:text-left">
          <p className="t-ui muted max-w-[34ch] text-[0.875rem]">{c.colophon}</p>
          <a href="#kapak" className="t-label muted inline-flex items-center gap-2 py-2">
            {c.backToTop} <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
